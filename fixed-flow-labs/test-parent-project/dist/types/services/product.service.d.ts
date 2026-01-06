import { ProductDetail, ProductDetailResponse, CatalogueProduct } from '../store/interfaces';
declare class ProductService {
    /**
     * Extracts stock quantity and images from TEL's colors[].storages[].products[] structure
     * Following TEL product.service.ts indexCalculations() and searchStock() pattern
     *
     * @param colors - The colors array from API response
     * @returns Object with stock, images array, and childrenId
     */
    private extractStockAndImagesFromColors;
    /**
     * Fetches detailed product/equipment information
     * Endpoint: POST api/Catalogue/equipmentDetail
     *
     * @param productId - The product ID to fetch details for
     * @returns ProductDetailResponse with full product info
     */
    getEquipmentDetail(productId: number): Promise<ProductDetailResponse>;
    /**
     * Stores the main product ID (mainId) in sessionStorage
     * Used for cart operations and tracking
     */
    storeMainId(productId: number): void;
    /**
     * Gets the stored main product ID
     */
    getMainId(): number | null;
    /**
     * Stores selected product from catalogue in session
     * @param product - Product to store
     * @param subcatalogId - Optional subcatalog ID for CLARO HOGAR plans API
     */
    storeSelectedProduct(product: CatalogueProduct | ProductDetail, subcatalogId?: number): void;
    /**
     * Stores the subcatalog ID for CLARO HOGAR plans API
     */
    storeSubcatalogId(subcatalogId: number): void;
    /**
     * Gets the stored subcatalog ID
     */
    getSubcatalogId(): number;
    /**
     * Gets the stored selected product
     */
    getSelectedProduct(): CatalogueProduct | ProductDetail | null;
    /**
     * Gets the stored product ID
     */
    getProductId(): number | null;
    /**
     * Stores selected color for the product
     */
    storeSelectedColor(colorId: number, colorName: string, webColor: string): void;
    /**
     * Gets the stored selected color
     */
    getSelectedColor(): {
        colorId: number;
        colorName: string;
        webColor: string;
    } | null;
    /**
     * Stores selected storage option
     */
    storeSelectedStorage(storageId: number, storageName: string): void;
    /**
     * Gets the stored selected storage
     */
    getSelectedStorage(): {
        storageId: number;
        storageName: string;
    } | null;
    /**
     * Stores children product ID (for variants)
     */
    storeChildrenId(childrenId: number): void;
    /**
     * Gets stored children product ID
     */
    getChildrenId(): number | null;
    /**
     * Stores parent product ID
     */
    storeParentId(parentId: number): void;
    /**
     * Gets stored parent product ID
     */
    getParentId(): number | null;
    /**
     * Stores device type
     */
    storeDeviceType(deviceType: string): void;
    /**
     * Gets stored device type
     */
    getDeviceType(): string | null;
    /**
     * Clears all product-related session data
     */
    clearProductSession(): void;
    /**
     * Formats price for display
     */
    formatPrice(price: number): string;
    /**
     * Formats monthly installment price
     */
    formatInstallmentPrice(price: number): string;
    /**
     * Calculates monthly installment
     */
    calculateInstallment(totalPrice: number, installments: number): number;
    /**
     * Cleans HTML from description
     */
    cleanDescription(html: string): string;
    /**
     * Checks if product is a CLARO HOGAR product
     */
    isHomeProduct(product: ProductDetail | CatalogueProduct): boolean;
}
export declare const productService: ProductService;
export default productService;
