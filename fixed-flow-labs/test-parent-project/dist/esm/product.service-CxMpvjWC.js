import { t as tokenService, h as httpService } from './token.service-B9M544XN.js';

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

// ============================================
// PRODUCT SERVICE - Equipment Detail for CLARO HOGAR
// Fixed Service Flow Web Component
// Based on TEL: product.service.ts
// ============================================
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
};
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
    extractStockAndImagesFromColors(colors) {
        const images = [];
        let stock = undefined;
        let childrenId = undefined;
        let hasStock = false;
        if (!colors || colors.length === 0) {
            console.log('[ProductService] No colors array in response, stock will be undefined');
            return { stock, images, childrenId };
        }
        // TEL Pattern: First try to find default color and storage with stock
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            if (!color.storages || color.storages.length === 0)
                continue;
            for (let j = 0; j < color.storages.length; j++) {
                const storage = color.storages[j];
                if (!storage.products || storage.products.length === 0)
                    continue;
                const product = storage.products[0];
                // Check if this is the default color/storage with stock
                if (color.defaultColor && storage.defaultStorage) {
                    if (product.stock !== undefined && product.stock > ENTRY_BARRIER) {
                        stock = product.stock;
                        childrenId = product.productId;
                        hasStock = true;
                        // Extract images (TEL pattern: imgUrl, side_image, back_image)
                        if (product.imgUrl)
                            images.push(product.imgUrl);
                        if (product.side_image)
                            images.push(product.side_image);
                        if (product.back_image)
                            images.push(product.back_image);
                        console.log('[ProductService] Found default with stock:', stock, 'childrenId:', childrenId);
                        break;
                    }
                }
            }
            if (hasStock)
                break;
        }
        // If no default found with stock, search all colors/storages for any with stock
        if (!hasStock) {
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                if (!color.storages || color.storages.length === 0)
                    continue;
                for (let j = 0; j < color.storages.length; j++) {
                    const storage = color.storages[j];
                    if (!storage.products || storage.products.length === 0)
                        continue;
                    const product = storage.products[0];
                    if (product.stock !== undefined && product.stock > ENTRY_BARRIER) {
                        stock = product.stock;
                        childrenId = product.productId;
                        hasStock = true;
                        // Extract images
                        if (product.imgUrl)
                            images.push(product.imgUrl);
                        if (product.side_image)
                            images.push(product.side_image);
                        if (product.back_image)
                            images.push(product.back_image);
                        console.log('[ProductService] Found any with stock:', stock, 'childrenId:', childrenId);
                        break;
                    }
                }
                if (hasStock)
                    break;
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
                    if (firstProduct.imgUrl)
                        images.push(firstProduct.imgUrl);
                    if (firstProduct.side_image)
                        images.push(firstProduct.side_image);
                    if (firstProduct.back_image)
                        images.push(firstProduct.back_image);
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
    async getEquipmentDetail(productId) {
        try {
            // Ensure token exists
            await tokenService.ensureToken();
            const token = tokenService.getToken() || '';
            const request = {
                productId: productId,
                userID: 0, // Guest user
                token: token,
            };
            console.log('[ProductService] Fetching equipment detail:', productId);
            const response = await httpService.post('api/Catalogue/equipmentDetail', request);
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
            const { stock, images: nestedImages, childrenId } = this.extractStockAndImagesFromColors(response.colors);
            // Build images array: start with main image, then add detail image and images from colors structure
            const productImages = [];
            if (response.imgUrl)
                productImages.push(response.imgUrl);
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
            const product = {
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
                colors: response.colors, // API returns TEL structure, may differ from ProductColorDetail
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
        }
        catch (error) {
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
    storeMainId(productId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.MAIN_ID, String(productId));
            console.log('[ProductService] Stored mainId:', productId);
        }
        catch (e) {
            console.error('[ProductService] Error storing mainId:', e);
        }
    }
    /**
     * Gets the stored main product ID
     */
    getMainId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS.MAIN_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores selected product from catalogue in session
     * @param product - Product to store
     * @param subcatalogId - Optional subcatalog ID for CLARO HOGAR plans API
     */
    storeSelectedProduct(product, subcatalogId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_PRODUCT, JSON.stringify(product));
            sessionStorage.setItem(STORAGE_KEYS.PRODUCT_ID, String(product.productId));
            if (subcatalogId) {
                sessionStorage.setItem(STORAGE_KEYS.SUBCATALOG_ID, String(subcatalogId));
                console.log('[ProductService] Stored subcatalogId:', subcatalogId);
            }
            console.log('[ProductService] Stored selected product:', product.productName);
        }
        catch (e) {
            console.error('[ProductService] Error storing product:', e);
        }
    }
    /**
     * Stores the subcatalog ID for CLARO HOGAR plans API
     */
    storeSubcatalogId(subcatalogId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.SUBCATALOG_ID, String(subcatalogId));
            console.log('[ProductService] Stored subcatalogId:', subcatalogId);
        }
        catch (e) {
            console.error('[ProductService] Error storing subcatalogId:', e);
        }
    }
    /**
     * Gets the stored subcatalog ID
     */
    getSubcatalogId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS.SUBCATALOG_ID);
            return value ? parseInt(value, 10) : 0;
        }
        catch {
            return 0;
        }
    }
    /**
     * Gets the stored selected product
     */
    getSelectedProduct() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_PRODUCT);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Gets the stored product ID
     */
    getProductId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS.PRODUCT_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores selected color for the product
     */
    storeSelectedColor(colorId, colorName, webColor) {
        try {
            const colorData = { colorId, colorName, webColor };
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_COLOR, JSON.stringify(colorData));
        }
        catch (e) {
            console.error('[ProductService] Error storing color:', e);
        }
    }
    /**
     * Gets the stored selected color
     */
    getSelectedColor() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_COLOR);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores selected storage option
     */
    storeSelectedStorage(storageId, storageName) {
        try {
            const storageData = { storageId, storageName };
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_STORAGE, JSON.stringify(storageData));
        }
        catch (e) {
            console.error('[ProductService] Error storing storage:', e);
        }
    }
    /**
     * Gets the stored selected storage
     */
    getSelectedStorage() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_STORAGE);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores children product ID (for variants)
     */
    storeChildrenId(childrenId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.CHILDREN_ID, String(childrenId));
        }
        catch (e) {
            console.error('[ProductService] Error storing childrenId:', e);
        }
    }
    /**
     * Gets stored children product ID
     */
    getChildrenId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS.CHILDREN_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores parent product ID
     */
    storeParentId(parentId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.PARENT_ID, String(parentId));
        }
        catch (e) {
            console.error('[ProductService] Error storing parentId:', e);
        }
    }
    /**
     * Gets stored parent product ID
     */
    getParentId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS.PARENT_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores device type
     */
    storeDeviceType(deviceType) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
        }
        catch (e) {
            console.error('[ProductService] Error storing deviceType:', e);
        }
    }
    /**
     * Gets stored device type
     */
    getDeviceType() {
        try {
            return sessionStorage.getItem(STORAGE_KEYS.DEVICE_TYPE);
        }
        catch {
            return null;
        }
    }
    /**
     * Clears all product-related session data
     */
    clearProductSession() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                sessionStorage.removeItem(key);
            });
            console.log('[ProductService] Cleared product session');
        }
        catch (e) {
            console.error('[ProductService] Error clearing session:', e);
        }
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Formats price for display
     */
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    /**
     * Formats monthly installment price
     */
    formatInstallmentPrice(price) {
        return `$${price.toFixed(2)}/mes`;
    }
    /**
     * Calculates monthly installment
     */
    calculateInstallment(totalPrice, installments) {
        if (installments <= 0)
            return totalPrice;
        return Number((totalPrice / installments).toFixed(2));
    }
    /**
     * Cleans HTML from description
     */
    cleanDescription(html) {
        if (!html)
            return '';
        return html.replace(/<[^>]*>/g, '').trim();
    }
    /**
     * Checks if product is a CLARO HOGAR product
     */
    isHomeProduct(product) {
        return product.home === true ||
            product.catalogId === 6;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const productService = new ProductService();

export { catalogueService as c, productService as p };
//# sourceMappingURL=product.service-CxMpvjWC.js.map

//# sourceMappingURL=product.service-CxMpvjWC.js.map