import { CatalogueProduct, ProductDetail } from '../../../store/interfaces';
interface SummaryData {
    productName: string;
    planPrice: number;
    svaPrice: number;
    equipmentPrice: number;
    payToday: number;
}
export declare class StepCatalogue {
    onNext: () => void;
    onBack: () => void;
    products: CatalogueProduct[];
    isLoading: boolean;
    error: string | null;
    productsWithDetails: Map<number, ProductDetail>;
    loadingDetails: Set<number>;
    selectedProduct: CatalogueProduct | null;
    selectedProductDetail: ProductDetail | null;
    isAddingToCart: boolean;
    showUnavailableModal: boolean;
    summaryData: SummaryData | null;
    componentWillLoad(): void;
    componentDidLoad(): void;
    /**
     * Loads products from catalogue API
     * Uses "Internet Inalámbrico" filter by default
     */
    private loadProducts;
    /**
     * Loads product details in parallel for faster UX
     * @param products - Products to load details for
     */
    private loadProductsDetails;
    /**
     * Handles product selection
     * - Loads details if not cached
     * - Updates summary bar
     * - Calls addToCart API
     */
    private handleSelectProduct;
    /**
     * Updates the summary bar data based on selected product
     */
    private updateSummaryData;
    /**
     * Handles continue button click
     * Proceeds to step-plans
     */
    private handleContinue;
    /**
     * Closes the unavailable product modal
     */
    private handleCloseUnavailableModal;
    /**
     * Renders the unavailable product modal
     */
    private renderUnavailableModal;
    /**
     * Renders a product card for the carousel
     */
    private renderProductCard;
    /**
     * Renders the summary bar footer
     */
    private renderSummaryBar;
    render(): any;
}
export {};
