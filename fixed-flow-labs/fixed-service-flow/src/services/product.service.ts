// ============================================
// PRODUCT SERVICE - Equipment Detail for CLARO HOGAR
// Fixed Service Flow Web Component
// Based on TEL: product.service.ts
// ============================================

import { httpService } from './http.service';
import { tokenService } from './token.service';
import {
  ProductDetail,
  ProductDetailResponse,
  CatalogueProduct,
} from '../store/interfaces';

// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------

const STORAGE_KEYS = {
  SELECTED_PRODUCT: 'selectedProduct',
  PRODUCT_ID: 'productId',
  MAIN_ID: 'mainId',
  CHILDREN_ID: 'childrenId',
  PARENT_ID: 'parentId',
  DEVICE_TYPE: 'deviceType',
  SELECTED_COLOR: 'selectedColor',
  SELECTED_STORAGE: 'selectedStorage',
  SUBCATALOG_ID: 'subcatalogId', // For CLARO HOGAR plans API
} as const;

// ------------------------------------------
// INTERFACES
// ------------------------------------------

interface EquipmentDetailRequest {
  productId: number;
  userID: number;
  token: string;
}

interface EquipmentDetailApiResponse {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  // Product detail fields from API
  productId?: number;
  productName?: string;
  brandName?: string;
  imgUrl?: string;
  detailImage?: string;
  images?: string[]; // Array of product images for carousel
  shortDescription?: string;
  longDescription?: string;
  regular_price?: number;
  update_price?: number;
  installments?: number;
  decDownPayment?: number;
  decDeposit?: number;
  creditClass?: string;
  colors?: ApiColor[]; // TEL structure: colors[].storages[].products[].stock
  storages?: any[];
  specifications?: any[];
  features?: string[];
  catalogId?: number;
  catalogName?: string;
  home?: boolean;
  stock?: number; // Stock quantity for availability check (may also be in colors structure)
}

// TEL API structure for colors
interface ApiColor {
  colorId?: number;
  color?: string;
  colorName?: string;
  webColor?: string;
  defaultColor?: boolean;
  storages?: ApiStorage[];
}

interface ApiStorage {
  storage?: string;
  storageId?: number;
  defaultStorage?: boolean;
  products?: ApiStorageProduct[];
}

interface ApiStorageProduct {
  productId: number;
  stock: number;
  imgUrl?: string;
  side_image?: string;
  back_image?: string;
  brand?: string;
  shortDescription?: string;
  regular_price?: number;
  salePrice?: number;
  planAllowed?: boolean;
  downPayment?: number;
  prices?: any[];
  offerData?: any;
  chvLegalTerms?: string;
}

// ------------------------------------------
// CONSTANTS (following TEL pattern)
// ------------------------------------------

// TEL uses entryBarrier = 1 to determine if product is in stock
const ENTRY_BARRIER = 1;

// ------------------------------------------
// PRODUCT SERVICE CLASS
// ------------------------------------------

class ProductService {
  // ------------------------------------------
  // TEL PATTERN: Extract stock and images from nested colors structure
  // ------------------------------------------

  /**
   * Extracts stock quantity and images from TEL's colors[].storages[].products[] structure
   * Following TEL product.service.ts indexCalculations() and searchStock() pattern
   *
   * @param colors - The colors array from API response
   * @returns Object with stock, images array, and childrenId
   */
  private extractStockAndImagesFromColors(
    colors: ApiColor[] | undefined
  ): { stock: number | undefined; images: string[]; childrenId: number | undefined } {
    const images: string[] = [];
    let stock: number | undefined = undefined;
    let childrenId: number | undefined = undefined;
    let hasStock = false;

    if (!colors || colors.length === 0) {
      console.log('[ProductService] No colors array in response, stock will be undefined');
      return { stock, images, childrenId };
    }

    // TEL Pattern: First try to find default color and storage with stock
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      if (!color.storages || color.storages.length === 0) continue;

      for (let j = 0; j < color.storages.length; j++) {
        const storage = color.storages[j];
        if (!storage.products || storage.products.length === 0) continue;

        const product = storage.products[0];

        // Check if this is the default color/storage with stock
        if (color.defaultColor && storage.defaultStorage) {
          if (product.stock !== undefined && product.stock > ENTRY_BARRIER) {
            stock = product.stock;
            childrenId = product.productId;
            hasStock = true;

            // Extract images (TEL pattern: imgUrl, side_image, back_image)
            if (product.imgUrl) images.push(product.imgUrl);
            if (product.side_image) images.push(product.side_image);
            if (product.back_image) images.push(product.back_image);

            console.log('[ProductService] Found default with stock:', stock, 'childrenId:', childrenId);
            break;
          }
        }
      }
      if (hasStock) break;
    }

    // If no default found with stock, search all colors/storages for any with stock
    if (!hasStock) {
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        if (!color.storages || color.storages.length === 0) continue;

        for (let j = 0; j < color.storages.length; j++) {
          const storage = color.storages[j];
          if (!storage.products || storage.products.length === 0) continue;

          const product = storage.products[0];

          if (product.stock !== undefined && product.stock > ENTRY_BARRIER) {
            stock = product.stock;
            childrenId = product.productId;
            hasStock = true;

            // Extract images
            if (product.imgUrl) images.push(product.imgUrl);
            if (product.side_image) images.push(product.side_image);
            if (product.back_image) images.push(product.back_image);

            console.log('[ProductService] Found any with stock:', stock, 'childrenId:', childrenId);
            break;
          }
        }
        if (hasStock) break;
      }
    }

    // If still no stock found, check first available product's stock (might be 0 or undefined)
    if (stock === undefined && colors.length > 0) {
      const firstColor = colors[0];
      if (firstColor.storages && firstColor.storages.length > 0) {
        const firstStorage = firstColor.storages[0];
        if (firstStorage.products && firstStorage.products.length > 0) {
          const firstProduct = firstStorage.products[0];
          stock = firstProduct.stock;
          childrenId = firstProduct.productId;

          // Still extract images even if no stock
          if (firstProduct.imgUrl) images.push(firstProduct.imgUrl);
          if (firstProduct.side_image) images.push(firstProduct.side_image);
          if (firstProduct.back_image) images.push(firstProduct.back_image);

          console.log('[ProductService] Using first product stock:', stock, 'childrenId:', childrenId);
        }
      }
    }

    return { stock, images, childrenId };
  }

  // ------------------------------------------
  // GET EQUIPMENT DETAIL
  // ------------------------------------------

  /**
   * Fetches detailed product/equipment information
   * Endpoint: POST api/Catalogue/equipmentDetail
   *
   * @param productId - The product ID to fetch details for
   * @returns ProductDetailResponse with full product info
   */
  async getEquipmentDetail(productId: number): Promise<ProductDetailResponse> {
    try {
      // Ensure token exists
      await tokenService.ensureToken();
      const token = tokenService.getToken() || '';

      const request: EquipmentDetailRequest = {
        productId: productId,
        userID: 0, // Guest user
        token: token,
      };

      console.log('[ProductService] Fetching equipment detail:', productId);

      const response = await httpService.post<EquipmentDetailApiResponse>(
        'api/Catalogue/equipmentDetail',
        request
      );

      if (response.hasError) {
        console.error('[ProductService] API error:', response.message);
        return {
          hasError: true,
          message: response.message || 'Error al cargar el detalle del producto',
          errorDisplay: response.errorDisplay,
        };
      }

      // TEL Pattern: Extract stock and images from colors[].storages[].products[] structure
      // This is the canonical way TEL retrieves product availability
      const { stock, images: nestedImages, childrenId } = this.extractStockAndImagesFromColors(
        response.colors
      );

      // Build images array: start with main image, then add detail image and images from colors structure
      const productImages: string[] = [];
      if (response.imgUrl) productImages.push(response.imgUrl);
      if (response.detailImage && response.detailImage !== response.imgUrl) {
        productImages.push(response.detailImage);
      }
      // Add images from nested structure (side_image, back_image from colors)
      nestedImages.forEach(img => {
        if (img && !productImages.includes(img)) {
          productImages.push(img);
        }
      });
      // Add any additional images from response
      if (response.images?.length) {
        response.images.forEach(img => {
          if (img && !productImages.includes(img)) {
            productImages.push(img);
          }
        });
      }

      // Determine final stock: use nested stock if available, otherwise fallback to root stock
      const finalStock = stock !== undefined ? stock : response.stock;

      const product: ProductDetail = {
        productId: response.productId || productId,
        productName: response.productName || '',
        brandName: response.brandName,
        imgUrl: response.imgUrl || '',
        detailImage: response.detailImage,
        images: productImages.length > 0 ? productImages : undefined,
        shortDescription: response.shortDescription,
        longDescription: response.longDescription,
        regular_price: response.regular_price || 0,
        update_price: response.update_price || 0,
        installments: response.installments || 0,
        decDownPayment: response.decDownPayment,
        decDeposit: response.decDeposit,
        creditClass: response.creditClass,
        colors: response.colors as any, // API returns TEL structure, may differ from ProductColorDetail
        storages: response.storages,
        specifications: response.specifications,
        features: response.features,
        catalogId: response.catalogId,
        home: response.home,
        stock: finalStock,
      };

      console.log('[ProductService] Product stock from nested structure:', stock, 'root:', response.stock, 'final:', finalStock);

      // Store childrenId if found from nested structure
      if (childrenId) {
        this.storeChildrenId(childrenId);
        console.log('[ProductService] Stored childrenId from colors:', childrenId);
      }

      // Store product ID in session
      this.storeMainId(productId);

      return {
        hasError: false,
        product: product,
      };
    } catch (error) {
      console.error('[ProductService] Exception:', error);
      return {
        hasError: true,
        message: 'Error de conexión al cargar el detalle del producto',
      };
    }
  }

  // ------------------------------------------
  // SESSION STORAGE METHODS
  // ------------------------------------------

  /**
   * Stores the main product ID (mainId) in sessionStorage
   * Used for cart operations and tracking
   */
  storeMainId(productId: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.MAIN_ID, String(productId));
      console.log('[ProductService] Stored mainId:', productId);
    } catch (e) {
      console.error('[ProductService] Error storing mainId:', e);
    }
  }

  /**
   * Gets the stored main product ID
   */
  getMainId(): number | null {
    try {
      const value = sessionStorage.getItem(STORAGE_KEYS.MAIN_ID);
      return value ? parseInt(value, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores selected product from catalogue in session
   * @param product - Product to store
   * @param subcatalogId - Optional subcatalog ID for CLARO HOGAR plans API
   */
  storeSelectedProduct(product: CatalogueProduct | ProductDetail, subcatalogId?: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_PRODUCT, JSON.stringify(product));
      sessionStorage.setItem(STORAGE_KEYS.PRODUCT_ID, String(product.productId));
      if (subcatalogId) {
        sessionStorage.setItem(STORAGE_KEYS.SUBCATALOG_ID, String(subcatalogId));
        console.log('[ProductService] Stored subcatalogId:', subcatalogId);
      }
      console.log('[ProductService] Stored selected product:', product.productName);
    } catch (e) {
      console.error('[ProductService] Error storing product:', e);
    }
  }

  /**
   * Stores the subcatalog ID for CLARO HOGAR plans API
   */
  storeSubcatalogId(subcatalogId: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SUBCATALOG_ID, String(subcatalogId));
      console.log('[ProductService] Stored subcatalogId:', subcatalogId);
    } catch (e) {
      console.error('[ProductService] Error storing subcatalogId:', e);
    }
  }

  /**
   * Gets the stored subcatalog ID
   */
  getSubcatalogId(): number {
    try {
      const value = sessionStorage.getItem(STORAGE_KEYS.SUBCATALOG_ID);
      return value ? parseInt(value, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Gets the stored selected product
   */
  getSelectedProduct(): CatalogueProduct | ProductDetail | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_PRODUCT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Gets the stored product ID
   */
  getProductId(): number | null {
    try {
      const value = sessionStorage.getItem(STORAGE_KEYS.PRODUCT_ID);
      return value ? parseInt(value, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores selected color for the product
   */
  storeSelectedColor(colorId: number, colorName: string, webColor: string): void {
    try {
      const colorData = { colorId, colorName, webColor };
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_COLOR, JSON.stringify(colorData));
    } catch (e) {
      console.error('[ProductService] Error storing color:', e);
    }
  }

  /**
   * Gets the stored selected color
   */
  getSelectedColor(): { colorId: number; colorName: string; webColor: string } | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_COLOR);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores selected storage option
   */
  storeSelectedStorage(storageId: number, storageName: string): void {
    try {
      const storageData = { storageId, storageName };
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_STORAGE, JSON.stringify(storageData));
    } catch (e) {
      console.error('[ProductService] Error storing storage:', e);
    }
  }

  /**
   * Gets the stored selected storage
   */
  getSelectedStorage(): { storageId: number; storageName: string } | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_STORAGE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores children product ID (for variants)
   */
  storeChildrenId(childrenId: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.CHILDREN_ID, String(childrenId));
    } catch (e) {
      console.error('[ProductService] Error storing childrenId:', e);
    }
  }

  /**
   * Gets stored children product ID
   */
  getChildrenId(): number | null {
    try {
      const value = sessionStorage.getItem(STORAGE_KEYS.CHILDREN_ID);
      return value ? parseInt(value, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores parent product ID
   */
  storeParentId(parentId: number): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.PARENT_ID, String(parentId));
    } catch (e) {
      console.error('[ProductService] Error storing parentId:', e);
    }
  }

  /**
   * Gets stored parent product ID
   */
  getParentId(): number | null {
    try {
      const value = sessionStorage.getItem(STORAGE_KEYS.PARENT_ID);
      return value ? parseInt(value, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Stores device type
   */
  storeDeviceType(deviceType: string): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
    } catch (e) {
      console.error('[ProductService] Error storing deviceType:', e);
    }
  }

  /**
   * Gets stored device type
   */
  getDeviceType(): string | null {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.DEVICE_TYPE);
    } catch {
      return null;
    }
  }

  /**
   * Clears all product-related session data
   */
  clearProductSession(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
      console.log('[ProductService] Cleared product session');
    } catch (e) {
      console.error('[ProductService] Error clearing session:', e);
    }
  }

  // ------------------------------------------
  // HELPER METHODS
  // ------------------------------------------

  /**
   * Formats price for display
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  /**
   * Formats monthly installment price
   */
  formatInstallmentPrice(price: number): string {
    return `$${price.toFixed(2)}/mes`;
  }

  /**
   * Calculates monthly installment
   */
  calculateInstallment(totalPrice: number, installments: number): number {
    if (installments <= 0) return totalPrice;
    return Number((totalPrice / installments).toFixed(2));
  }

  /**
   * Cleans HTML from description
   */
  cleanDescription(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Checks if product is a CLARO HOGAR product
   */
  isHomeProduct(product: ProductDetail | CatalogueProduct): boolean {
    return (product as ProductDetail).home === true ||
           (product as ProductDetail).catalogId === 6;
  }
}

// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------

export const productService = new ProductService();
export default productService;
