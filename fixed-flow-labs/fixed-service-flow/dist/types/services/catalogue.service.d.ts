import { CatalogueResponse, CatalogueProduct, CatalogueFilter } from '../store/interfaces';
declare class CatalogueService {
    private readonly HOGAR_CATALOGUE_ID;
    private readonly DEFAULT_PAGE_ITEMS;
    readonly FILTER_INTERNET_TELEFONIA = "39";
    readonly FILTER_INTERNET_INALAMBRICO = "23";
    /**
     * Fetches product catalogue for CLARO HOGAR (wireless internet devices)
     * Endpoint: POST api/Catalogue/listCatalogue
     *
     * Response structure from API:
     * {
     *   hasError: false,
     *   catalogs: [
     *     { catalogId: 23, catalog: [{ catalogId: 1, products: [...] }, ...] }
     *   ]
     * }
     */
    listCatalogue(subcatalogId?: string, pageNo?: number, searchText?: string, brand?: string, price?: string): Promise<CatalogueResponse>;
    /**
     * Extracts products from a specific subcatalog within the Hogar catalog
     * Structure: catalogs[] -> find Hogar (6) -> catalog[] -> find subcatalog (23 or 39) -> products
     */
    private extractProductsFromSubcatalog;
    /**
     * BFS search for catalog by ID (matches TEL's findCatalogById)
     * Reserved for future use with nested catalog navigation
     */
    private _findCatalogById;
    /**
     * Returns the available product type filters
     */
    getProductTypeFilters(): CatalogueFilter[];
    /**
     * Formats price for display (monthly installment)
     */
    formatInstallmentPrice(price: number): string;
    /**
     * Formats regular price
     */
    formatRegularPrice(price: number): string;
    /**
     * Calculates monthly installment from total price
     */
    calculateInstallment(totalPrice: number, installments: number): number;
    /**
     * Cleans HTML from product description
     */
    cleanDescription(html: string): string;
    /**
     * Truncates text to max length with ellipsis
     */
    truncateText(text: string, maxLength?: number): string;
    /**
     * Parses product colors from API response
     */
    parseColors(colors: Array<{
        webColor: string;
    }> | undefined): string[];
    /**
     * Stores selected product in sessionStorage
     */
    storeProductInSession(product: CatalogueProduct): void;
    /**
     * Gets stored product from sessionStorage
     */
    getStoredProduct(): CatalogueProduct | null;
    /**
     * Clears product from session
     */
    clearProduct(): void;
}
export declare const catalogueService: CatalogueService;
export default catalogueService;
