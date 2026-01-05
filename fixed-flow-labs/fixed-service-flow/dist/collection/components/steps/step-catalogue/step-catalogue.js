// ============================================
// STEP CATALOGUE - Modem Selection for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on docs/capturas/3.png - Carousel + Summary Bar
// ============================================
import { h, Host } from "@stencil/core";
import { catalogueService, productService, cartService } from "../../../services";
import { formatPrice } from "../../../utils/formatters";
export class StepCatalogue {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    // Products from catalogue
    products = [];
    isLoading = true;
    error = null;
    // Product details cache (loaded in parallel)
    productsWithDetails = new Map();
    loadingDetails = new Set();
    // Selection state
    selectedProduct = null;
    selectedProductDetail = null;
    isAddingToCart = false;
    // Unavailable modal
    showUnavailableModal = false;
    // Summary bar data
    summaryData = null;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        // isLoading is already true by default, so loader will show immediately
    }
    componentDidLoad() {
        // Load products after component renders
        this.loadProducts();
    }
    // ------------------------------------------
    // DATA LOADING METHODS
    // ------------------------------------------
    /**
     * Loads products from catalogue API
     * Uses "Internet Inalámbrico" filter by default
     */
    async loadProducts() {
        this.isLoading = true;
        this.error = null;
        try {
            // Default to "Internet Inalámbrico" subcatalog
            const subcatalogId = catalogueService.FILTER_INTERNET_INALAMBRICO;
            const response = await catalogueService.listCatalogue(subcatalogId, 1, '');
            this.products = response.products || [];
            // After loading products, load details for visible ones
            if (this.products.length > 0) {
                await this.loadProductsDetails(this.products);
            }
        }
        catch (err) {
            console.error('[StepCatalogue] Error loading products:', err);
            this.error = 'Error al cargar el catálogo de productos';
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Loads product details in parallel for faster UX
     * @param products - Products to load details for
     */
    async loadProductsDetails(products) {
        // Load details for first 6 products in parallel
        const productsToLoad = products.slice(0, 6);
        const detailPromises = productsToLoad.map(async (product) => {
            // Skip if already loaded
            if (this.productsWithDetails.has(product.productId)) {
                return;
            }
            // Mark as loading
            this.loadingDetails = new Set([...this.loadingDetails, product.productId]);
            try {
                const response = await productService.getEquipmentDetail(product.productId);
                if (!response.hasError && response.product) {
                    const newMap = new Map(this.productsWithDetails);
                    newMap.set(product.productId, response.product);
                    this.productsWithDetails = newMap;
                }
            }
            catch (err) {
                console.error(`[StepCatalogue] Error loading details for ${product.productId}:`, err);
            }
            finally {
                const newSet = new Set(this.loadingDetails);
                newSet.delete(product.productId);
                this.loadingDetails = newSet;
            }
        });
        await Promise.allSettled(detailPromises);
    }
    // ------------------------------------------
    // SELECTION & CART METHODS
    // ------------------------------------------
    /**
     * Handles product selection
     * - Loads details if not cached
     * - Updates summary bar
     * - Calls addToCart API
     */
    handleSelectProduct = async (product) => {
        // If clicking the same product, do nothing
        if (this.selectedProduct?.productId === product.productId) {
            return;
        }
        this.isAddingToCart = true;
        this.error = null;
        try {
            // Get product detail (from cache or API)
            let productDetail = this.productsWithDetails.get(product.productId);
            if (!productDetail) {
                // Load detail on demand
                console.log('[StepCatalogue] Loading detail for:', product.productId);
                const response = await productService.getEquipmentDetail(product.productId);
                if (response.hasError || !response.product) {
                    throw new Error('Error al cargar detalles del producto');
                }
                productDetail = response.product;
                // Cache it
                const newMap = new Map(this.productsWithDetails);
                newMap.set(product.productId, productDetail);
                this.productsWithDetails = newMap;
            }
            // Check availability BEFORE proceeding (stock must be > 1)
            const ENTRY_BARRIER = 1;
            if (productDetail.stock === undefined || productDetail.stock <= ENTRY_BARRIER) {
                console.log('[StepCatalogue] Product unavailable, stock:', productDetail.stock);
                this.showUnavailableModal = true;
                this.isAddingToCart = false;
                return;
            }
            // Update selection
            this.selectedProduct = product;
            this.selectedProductDetail = productDetail;
            // Update summary bar
            this.updateSummaryData(product, productDetail);
            // Store product in session for next steps
            const subcatalogId = parseInt(catalogueService.FILTER_INTERNET_INALAMBRICO, 10);
            catalogueService.storeProductInSession(product);
            productService.storeSelectedProduct(product, subcatalogId);
            // Add to cart
            console.log('[StepCatalogue] Adding to cart:', product.productName);
            const cartResponse = await cartService.addToCart(productDetail, product.installments || 24, 1);
            if (cartResponse.hasError) {
                console.error('[StepCatalogue] Cart error:', cartResponse.message);
                // Still allow selection even if cart fails
            }
            else {
                console.log('[StepCatalogue] Added to cart, mainId:', cartResponse.code);
            }
        }
        catch (err) {
            console.error('[StepCatalogue] Selection error:', err);
            this.error = 'Error al seleccionar el producto. Por favor intente de nuevo.';
        }
        finally {
            this.isAddingToCart = false;
        }
    };
    /**
     * Updates the summary bar data based on selected product
     */
    updateSummaryData(product, detail) {
        // Calculate "Paga hoy" = regular_price (down payment + any initial costs)
        const payToday = product.regular_price || detail.decDownPayment || 0;
        this.summaryData = {
            productName: product.productName,
            planPrice: 0, // Will be set in step-plans
            svaPrice: 0, // No SVA at this point
            equipmentPrice: product.update_price || 0, // Monthly equipment payment
            payToday: payToday,
        };
    }
    /**
     * Handles continue button click
     * Proceeds to step-plans
     */
    handleContinue = () => {
        if (this.selectedProduct && !this.isAddingToCart) {
            this.onNext?.();
        }
    };
    /**
     * Closes the unavailable product modal
     */
    handleCloseUnavailableModal = () => {
        this.showUnavailableModal = false;
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    /**
     * Renders the unavailable product modal
     */
    renderUnavailableModal() {
        if (!this.showUnavailableModal) {
            return null;
        }
        return (h("div", { class: "unavailable-modal-overlay", onClick: this.handleCloseUnavailableModal }, h("div", { class: "unavailable-modal", onClick: (e) => e.stopPropagation() }, h("div", { class: "unavailable-modal__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }))), h("h3", { class: "unavailable-modal__title" }, "Producto no disponible"), h("p", { class: "unavailable-modal__message" }, "Lo sentimos, este producto no est\u00E1 disponible en este momento. Por favor, seleccione otro equipo."), h("button", { class: "unavailable-modal__button", onClick: this.handleCloseUnavailableModal }, "Entendido"))));
    }
    /**
     * Renders a product card for the carousel
     */
    renderProductCard(product) {
        const isSelected = this.selectedProduct?.productId === product.productId;
        const isLoadingDetail = this.loadingDetails.has(product.productId);
        const isProcessing = this.isAddingToCart && isSelected;
        return (h("div", { class: {
                'product-card': true,
                'product-card--selected': isSelected,
                'product-card--loading': isLoadingDetail,
            }, onClick: () => !this.isAddingToCart && this.handleSelectProduct(product) }, h("div", { class: "product-card__content" }, h("div", { class: "product-card__image" }, h("img", { src: product.imgUrl, alt: product.productName, loading: "lazy" })), h("div", { class: "product-card__info" }, h("h3", { class: "product-card__name" }, product.productName), product.installments > 0 && (h("div", { class: "product-card__financed" }, h("span", { class: "product-card__financed-label" }, "Financiado"), h("span", { class: "product-card__financed-price" }, formatPrice(product.update_price || 0), "/mes"), h("span", { class: "product-card__installments" }, product.installments, " plazos"))), h("p", { class: "product-card__regular-price" }, "Precio regular: ", formatPrice(product.regular_price || 0)))), h("div", { class: "product-card__footer" }, h("p", { class: "product-card__footer-text" }, "\u00A1Mantente conectado en todo momento!")), isProcessing && (h("div", { class: "product-card__processing" }, h("div", { class: "product-card__spinner" })))));
    }
    /**
     * Renders the summary bar footer
     */
    renderSummaryBar() {
        const productName = this.summaryData?.productName || '-';
        const planPrice = this.summaryData?.planPrice || 0;
        const svaPrice = this.summaryData?.svaPrice || 0;
        const equipmentPrice = this.summaryData?.equipmentPrice || 0;
        const payToday = this.summaryData?.payToday || 0;
        return (h("footer", { class: "step-catalogue__summary-bar" }, h("div", { class: "step-catalogue__summary-content" }, h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "PCD"), h("span", { class: "step-catalogue__summary-value" }, productName)), h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "Plan"), h("span", { class: "step-catalogue__summary-value" }, formatPrice(planPrice), " / mes")), h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "SVA"), h("span", { class: "step-catalogue__summary-value" }, formatPrice(svaPrice), " / mes")), h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "Equipo / Accesorio"), h("span", { class: "step-catalogue__summary-value" }, formatPrice(equipmentPrice), " / mes")), h("div", { class: "step-catalogue__summary-item step-catalogue__summary-item--highlight" }, h("span", { class: "step-catalogue__summary-label" }, "Paga hoy"), h("span", { class: "step-catalogue__summary-value step-catalogue__summary-value--red" }, formatPrice(payToday), " + IVU"))), h("button", { class: {
                'step-catalogue__continue-btn': true,
                'step-catalogue__continue-btn--disabled': !this.selectedProduct || this.isAddingToCart,
            }, onClick: this.handleContinue, disabled: !this.selectedProduct || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: '2b2178714bf18ddc2ba4f740f02a497f0fc48cd3' }, h("div", { key: '4f0911c50ecf8ca8ddc684bc929b6e060ffee845', class: "step-catalogue" }, h("header", { key: 'b07d68d064922ec0865b0979bdc6d5089f99a32c', class: "step-catalogue__header" }, h("button", { key: 'f25d525aad09fc9a035eb392a15b0daf93660933', class: "step-catalogue__back-link", onClick: this.onBack }, h("svg", { key: 'b70e76e40ad960548eacc463843c74c691c8f83b', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '9dd0933e00919947e9ff88a3a357b44a9c84df21', points: "15 18 9 12 15 6" })), h("span", { key: 'bfbed9c9e07a1af489b32b1f879c72658ea06aa3' }, "Regresar")), h("h1", { key: 'b34ef77b46519546c79805005bb993d603611f1f', class: "step-catalogue__title" }, "Escoger modem para servicio fijo"), h("div", { key: 'efa87d6abfee8c5bdf9c9e6939cd780c9e361d9c', class: "step-catalogue__divider" })), this.isLoading && (h("div", { key: '0b1f7eae78137f06b40c9a21963966609228163f', class: "step-catalogue__loading" }, h("div", { key: '3ee83aee91e59f653df07a6cf7a6bc4c2204b8bc', class: "step-catalogue__spinner" }), h("p", { key: 'c2f831a70c458d6fbbc42f8c3d53e9ca31fa7639' }, "Cargando productos..."))), this.error && !this.isLoading && (h("div", { key: '07542ca156af5ff975beeb2442e6e8bf89d4ebeb', class: "step-catalogue__error" }, h("p", { key: '0900d3a0bef57fe7a15c7a44eefa9313e72b1d8a' }, this.error), h("button", { key: 'c4a2fd0a2f495364206eb770d6124a017246abca', onClick: () => this.loadProducts() }, "Reintentar"))), !this.isLoading && !this.error && this.products.length > 0 && (h("div", { key: 'daddeff0755c68c6770e39e1aeb021d1c453cd2a', class: "step-catalogue__carousel-container" }, h("ui-carousel", { key: '4cc8bb014d046c04722ae0d9afb36db54d4a0047', totalItems: this.products.length, gap: 24, showNavigation: false, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 600, slidesPerView: 2 },
                { minWidth: 900, slidesPerView: 3 },
            ] }, this.products.map((product) => this.renderProductCard(product))))), !this.isLoading && !this.error && this.products.length === 0 && (h("div", { key: '1c3584c9a7aeb3604e8dfb97aebf4dd76a12db8c', class: "step-catalogue__empty" }, h("p", { key: 'fe9abd7e12b80df5d3eecf6ab423faca88c01664' }, "No hay productos disponibles en este momento."))), this.renderSummaryBar(), this.renderUnavailableModal())));
    }
    static get is() { return "step-catalogue"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-catalogue.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-catalogue.css"]
        };
    }
    static get properties() {
        return {
            "onNext": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "onBack": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            }
        };
    }
    static get states() {
        return {
            "products": {},
            "isLoading": {},
            "error": {},
            "productsWithDetails": {},
            "loadingDetails": {},
            "selectedProduct": {},
            "selectedProductDetail": {},
            "isAddingToCart": {},
            "showUnavailableModal": {},
            "summaryData": {}
        };
    }
}
//# sourceMappingURL=step-catalogue.js.map
