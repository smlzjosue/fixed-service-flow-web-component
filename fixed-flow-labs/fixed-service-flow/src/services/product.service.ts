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
  shortDescription?: string;
  longDescription?: string;
  regular_price?: number;
  update_price?: number;
  installments?: number;
  decDownPayment?: number;
  decDeposit?: number;
  creditClass?: string;
  colors?: any[];
  storages?: any[];
  specifications?: any[];
  features?: string[];
  catalogId?: number;
  home?: boolean;
}

// ------------------------------------------
// PRODUCT SERVICE CLASS
// ------------------------------------------

class ProductService {
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

      // Map API response to ProductDetail
      const product: ProductDetail = {
        productId: response.productId || productId,
        productName: response.productName || '',
        brandName: response.brandName,
        imgUrl: response.imgUrl || '',
        detailImage: response.detailImage,
        shortDescription: response.shortDescription,
        longDescription: response.longDescription,
        regular_price: response.regular_price || 0,
        update_price: response.update_price || 0,
        installments: response.installments || 0,
        decDownPayment: response.decDownPayment,
        decDeposit: response.decDeposit,
        creditClass: response.creditClass,
        colors: response.colors,
        storages: response.storages,
        specifications: response.specifications,
        features: response.features,
        catalogId: response.catalogId,
        home: response.home,
      };

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
   */
  storeSelectedProduct(product: CatalogueProduct | ProductDetail): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_PRODUCT, JSON.stringify(product));
      sessionStorage.setItem(STORAGE_KEYS.PRODUCT_ID, String(product.productId));
      console.log('[ProductService] Stored selected product:', product.productName);
    } catch (e) {
      console.error('[ProductService] Error storing product:', e);
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
