import { ProductDetail, CatalogueProduct } from '../../../store/interfaces';
interface ColorOption {
    colorId: number;
    colorName: string;
    webColor: string;
    productId?: number;
    imgUrl?: string;
}
interface StorageOption {
    storageId: number;
    storageName: string;
    productId?: number;
    price?: number;
}
interface InstallmentOption {
    months: number;
    monthlyPrice: number;
    totalPrice: number;
}
export declare class StepProductDetail {
    onNext: () => void;
    onBack: () => void;
    product: ProductDetail | null;
    catalogueProduct: CatalogueProduct | null;
    isLoading: boolean;
    error: string | null;
    isAddingToCart: boolean;
    selectedColorIndex: number;
    selectedStorageIndex: number;
    selectedInstallments: number;
    quantity: number;
    isAvailable: boolean;
    showUnavailableAlert: boolean;
    colorOptions: ColorOption[];
    storageOptions: StorageOption[];
    installmentOptions: InstallmentOption[];
    productImages: string[];
    private readonly ENTRY_BARRIER;
    componentWillLoad(): void;
    private loadProductDetail;
    private mapCatalogueToDetail;
    private parseColorOptions;
    private parseStorageOptions;
    private parseInstallmentOptions;
    /**
     * Builds the product images array for the carousel
     * Following TEL pattern: combines main image, detail image, and any additional images
     */
    private buildProductImages;
    /**
     * Checks product availability based on stock quantity
     * Following TEL pattern: hasStock = stock > entryBarrier
     *
     * TEL's product.service.ts uses:
     *   - entryBarrier = 1
     *   - hasStock = (stock > entryBarrier)
     *
     * The stock value comes from colors[].storages[].products[0].stock in the API response
     * which is now extracted by productService.getEquipmentDetail()
     */
    private checkAvailability;
    /**
     * Handles dismissing the unavailable alert and going back
     */
    private handleGoBackFromAlert;
    private handleColorSelect;
    private handleStorageSelect;
    private handleInstallmentSelect;
    private handleAddToCart;
    private getCurrentMonthlyPrice;
    private formatPrice;
    private renderBreadcrumb;
    private renderColorSelector;
    private renderStorageSelector;
    private renderInstallmentSelector;
    private renderQuantitySelector;
    private renderPriceSection;
    /**
     * Renders the availability status indicator (TEL pattern)
     */
    private renderAvailabilityStatus;
    /**
     * Renders the unavailable product alert modal
     */
    private renderUnavailableAlert;
    render(): any;
}
export {};
