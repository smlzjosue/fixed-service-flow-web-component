import { t as tokenService, h as httpService } from './p-CTTmtcOx.js';

// ============================================
// CATALOGUE SERVICE - Product Catalogue for CLARO HOGAR
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// CATALOGUE SERVICE CLASS
// ------------------------------------------
class CatalogueService {
    // Catalog IDs (from TEL API structure)
    // catalogId 6 = Hogar (parent category)
    // Subcategory 39 = Internet + Telefonía
    // Subcategory 23 = Internet Inalámbrico
    HOGAR_CATALOGUE_ID = 6;
    DEFAULT_PAGE_ITEMS = 300;
    // Filter values for selecting subcategory (used in our component)
    // These are subcatalog IDs as strings for the filter component
    FILTER_INTERNET_TELEFONIA = '39'; // Subcatalog ID
    FILTER_INTERNET_INALAMBRICO = '23'; // Subcatalog ID
    // ------------------------------------------
    // LIST CATALOGUE
    // ------------------------------------------
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
    async listCatalogue(subcatalogId = this.FILTER_INTERNET_INALAMBRICO, pageNo = 1, searchText = '', brand = '', price = '') {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        // Use parent catalog ID (Hogar = 6) and categoryID = "0" to get all subcategories
        const request = {
            catalogId: this.HOGAR_CATALOGUE_ID, // Use Hogar (6) as parent
            pageNo: pageNo,
            pageItems: this.DEFAULT_PAGE_ITEMS,
            creditClass: 'C',
            orderBy: 7,
            news: 0,
            offers: '0',
            categoryID: '0', // Get all subcategories
            brand: brand,
            filter: searchText,
            price: price,
            labels: [],
        };
        console.log('[CatalogueService] Request:', JSON.stringify(request));
        const apiResponse = await httpService.post('api/Catalogue/listCatalogue', request);
        console.log('[CatalogueService] API Response keys:', Object.keys(apiResponse || {}));
        if (apiResponse.hasError) {
            throw new Error(apiResponse.message || 'Failed to fetch catalogue');
        }
        // Parse products from the nested structure
        // First find Hogar catalog, then find the requested subcatalog
        const targetSubcatalogId = parseInt(subcatalogId, 10);
        const products = this.extractProductsFromSubcatalog(apiResponse, this.HOGAR_CATALOGUE_ID, targetSubcatalogId);
        console.log('[CatalogueService] Extracted products:', products.length);
        return {
            hasError: false,
            products: products,
            totalItems: products.length,
        };
    }
    /**
     * Extracts products from a specific subcatalog within the Hogar catalog
     * Structure: catalogs[] -> find Hogar (6) -> catalog[] -> find subcatalog (23 or 39) -> products
     */
    extractProductsFromSubcatalog(response, parentCatalogId, subcatalogId) {
        if (!response.catalogs || !Array.isArray(response.catalogs)) {
            console.log('[CatalogueService] No catalogs in response');
            return [];
        }
        // Find the parent catalog (Hogar = 6)
        const parentCatalog = response.catalogs.find(c => c.catalogId === parentCatalogId);
        if (!parentCatalog) {
            console.log('[CatalogueService] Parent catalog not found:', parentCatalogId);
            // Try to find subcatalog directly in catalogs array
            for (const catalog of response.catalogs) {
                if (catalog.catalog) {
                    const subcatalog = catalog.catalog.find(sc => sc.catalogId === subcatalogId);
                    if (subcatalog) {
                        console.log('[CatalogueService] Found subcatalog in:', catalog.catalogId);
                        return subcatalog.products || [];
                    }
                }
            }
            return [];
        }
        console.log('[CatalogueService] Found parent catalog:', parentCatalog.catalogId, parentCatalog.catalogName);
        // Find the subcatalog within the parent
        if (!parentCatalog.catalog || !Array.isArray(parentCatalog.catalog)) {
            console.log('[CatalogueService] No subcatalogs in parent');
            return parentCatalog.products || [];
        }
        const subcatalog = parentCatalog.catalog.find(sc => sc.catalogId === subcatalogId);
        if (!subcatalog) {
            console.log('[CatalogueService] Subcatalog not found:', subcatalogId);
            console.log('[CatalogueService] Available subcatalogs:', parentCatalog.catalog.map(sc => ({ id: sc.catalogId, name: sc.catalogName })));
            // Return first subcatalog's products as fallback
            return parentCatalog.catalog[0]?.products || [];
        }
        console.log('[CatalogueService] Found subcatalog:', subcatalog.catalogId, subcatalog.catalogName);
        return subcatalog.products || [];
    }
    /**
     * BFS search for catalog by ID (matches TEL's findCatalogById)
     * Reserved for future use with nested catalog navigation
     */
    // @ts-ignore: Reserved for future use
    _findCatalogById(catalogs, catalogId) {
        const queue = [...catalogs];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current.catalogId === catalogId) {
                return current;
            }
            if (current.catalog && current.catalog.length > 0) {
                queue.push(...current.catalog);
            }
        }
        return null;
    }
    // ------------------------------------------
    // GET FILTERS
    // ------------------------------------------
    /**
     * Returns the available product type filters
     */
    getProductTypeFilters() {
        return [
            {
                value: this.FILTER_INTERNET_TELEFONIA,
                label: 'Internet + Telefonía',
            },
            {
                value: this.FILTER_INTERNET_INALAMBRICO,
                label: 'Internet Inalámbrico',
            },
        ];
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Formats price for display (monthly installment)
     */
    formatInstallmentPrice(price) {
        return `$${price.toFixed(2)}/mes`;
    }
    /**
     * Formats regular price
     */
    formatRegularPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    /**
     * Calculates monthly installment from total price
     */
    calculateInstallment(totalPrice, installments) {
        if (installments <= 0)
            return totalPrice;
        return Number((totalPrice / installments).toFixed(2));
    }
    /**
     * Cleans HTML from product description
     */
    cleanDescription(html) {
        if (!html)
            return '';
        // Remove HTML tags
        return html.replace(/<[^>]*>/g, '').trim();
    }
    /**
     * Truncates text to max length with ellipsis
     */
    truncateText(text, maxLength = 80) {
        if (!text || text.length <= maxLength)
            return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    /**
     * Parses product colors from API response
     */
    parseColors(colors) {
        if (!colors || !Array.isArray(colors))
            return [];
        return colors.map(c => c.webColor).filter(Boolean);
    }
    /**
     * Stores selected product in sessionStorage
     */
    storeProductInSession(product) {
        try {
            sessionStorage.setItem('selectedProduct', JSON.stringify(product));
            sessionStorage.setItem('productId', String(product.productId));
        }
        catch (e) {
            console.error('[CatalogueService] Error storing product in session:', e);
        }
    }
    /**
     * Gets stored product from sessionStorage
     */
    getStoredProduct() {
        try {
            const data = sessionStorage.getItem('selectedProduct');
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Clears product from session
     */
    clearProduct() {
        sessionStorage.removeItem('selectedProduct');
        sessionStorage.removeItem('productId');
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const catalogueService = new CatalogueService();

export { catalogueService as c };
//# sourceMappingURL=p-Bovy52tu.js.map

//# sourceMappingURL=p-Bovy52tu.js.map