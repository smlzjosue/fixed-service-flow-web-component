import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import './p-1rCYjdXc.js';
import { c as catalogueService } from './p-B9Yx6F-e.js';
import { c as cartService } from './p-TkjnQ7KS.js';
import { p as productService } from './p-CDUi1inA.js';
import { f as formatPrice } from './p-C5fd-Qsk.js';
import { d as defineCustomElement$1 } from './p-DGspzOV2.js';

const stepCatalogueCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-catalogue{width:100%;min-height:100vh;display:flex;flex-direction:column;background:#FFFFFF}.step-catalogue__header{width:100%;background:#FFFFFF;padding:1rem 1.5rem;box-sizing:border-box}@media (max-width: 767px){.step-catalogue__header{padding:0.75rem 1rem}}.step-catalogue__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-catalogue__back-link svg{width:20px;height:20px}.step-catalogue__back-link:hover{opacity:0.8}.step-catalogue__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-catalogue__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-catalogue__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-catalogue__divider{margin:0 -1rem}}.step-catalogue__loading,.step-catalogue__error,.step-catalogue__empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}.step-catalogue__loading p,.step-catalogue__error p,.step-catalogue__empty p{margin-top:1rem;font-size:1rem;color:#666666}.step-catalogue__loading button,.step-catalogue__error button,.step-catalogue__empty button{margin-top:1rem;padding:0.5rem 1.5rem;background:#0097A9;color:#FFFFFF;border:none;border-radius:20px;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background 150ms ease}.step-catalogue__loading button:hover,.step-catalogue__error button:hover,.step-catalogue__empty button:hover{background:rgb(0, 114.5455621302, 128.2)}.step-catalogue__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-catalogue__carousel-container{flex:1;padding:1.5rem;overflow:hidden}@media (max-width: 767px){.step-catalogue__carousel-container{padding:1rem}}.step-catalogue__summary-bar{width:100%;position:sticky;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;box-shadow:0 -4px 16px rgba(0, 0, 0, 0.08);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;z-index:10;box-sizing:border-box}@media (max-width: 1199px){.step-catalogue__summary-bar{flex-direction:column;gap:1rem}}@media (max-width: 767px){.step-catalogue__summary-bar{padding:0.75rem 1rem}}.step-catalogue__summary-content{display:grid;grid-template-columns:repeat(5, 1fr);gap:1rem;flex:1}@media (max-width: 1199px){.step-catalogue__summary-content{width:100%;grid-template-columns:repeat(3, 1fr)}}@media (max-width: 767px){.step-catalogue__summary-content{grid-template-columns:repeat(2, 1fr);gap:0.5rem}}.step-catalogue__summary-item{display:flex;flex-direction:column;gap:0.25rem}.step-catalogue__summary-item--highlight .step-catalogue__summary-label{color:#333333;font-weight:700}.step-catalogue__summary-label{font-size:0.75rem;font-weight:500;color:#666666;text-transform:uppercase;letter-spacing:0.5px}.step-catalogue__summary-value{font-size:0.875rem;font-weight:600;color:#333333}.step-catalogue__summary-value--red{color:#DA291C;font-weight:700}.step-catalogue__continue-btn{padding:0.75rem 2rem;background:#DA291C;color:#FFFFFF;border:none;border-radius:30px;font-size:1rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:all 150ms ease;min-width:160px}.step-catalogue__continue-btn:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-catalogue__continue-btn:disabled,.step-catalogue__continue-btn--disabled{background:#999999;cursor:not-allowed}@media (max-width: 1199px){.step-catalogue__continue-btn{width:100%;padding:1rem}}.product-card{background:#FFFFFF;border:2px solid #E5E5E5;border-radius:12px;overflow:hidden;cursor:pointer;transition:all 150ms ease;position:relative;height:100%;min-height:220px;display:flex;flex-direction:column}.product-card:hover{border-color:#CCCCCC;box-shadow:0 4px 16px rgba(0, 0, 0, 0.1);transform:translateY(-2px)}.product-card--selected{border-color:#0097A9;box-shadow:0 4px 16px rgba(0, 151, 169, 0.2)}.product-card--selected:hover{border-color:#0097A9}.product-card--loading{opacity:0.7;pointer-events:none}.product-card__content{display:grid;grid-template-columns:120px 1fr;gap:1rem;padding:1rem;flex:1}@media (max-width: 767px){.product-card__content{grid-template-columns:100px 1fr;gap:0.75rem;padding:0.75rem}}.product-card__image{display:flex;align-items:center;justify-content:center;background:#FFFFFF;border-radius:8px;padding:0.5rem}.product-card__image img{max-width:100%;max-height:100px;object-fit:contain}.product-card__info{display:flex;flex-direction:column;gap:0.5rem}.product-card__name{margin:0;font-size:1rem;font-weight:700;color:#333333;line-height:1.3}@media (max-width: 767px){.product-card__name{font-size:0.875rem}}.product-card__financed{display:flex;flex-direction:column;gap:2px}.product-card__financed-label{font-size:0.75rem;font-weight:600;color:#333333}.product-card__financed-price{font-size:1.25rem;font-weight:700;color:#DA291C}.product-card__installments{font-size:0.75rem;color:#666666}.product-card__regular-price{margin:0;font-size:0.75rem;color:#666666}.product-card__description{margin:0.5rem 0 0;font-size:0.75rem;color:#666666;line-height:1.4}@media (max-width: 767px){.product-card__description{display:none}}.product-card__processing{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.8);display:flex;align-items:center;justify-content:center}.product-card__spinner{width:32px;height:32px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.product-card__footer{border-top:1px solid #E5E5E5;padding:0.75rem 1rem;margin-top:auto}.product-card__footer-text{margin:0;font-size:0.75rem;color:#666666;text-align:left;line-height:1.4}.unavailable-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;animation:fadeIn 0.2s ease-out}.unavailable-modal{background:#FFFFFF;border-radius:16px;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0, 0, 0, 0.2);animation:modalSlideIn 0.3s ease-out}.unavailable-modal__icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;margin:0 auto 1rem;background:#FFF3CD;border-radius:50%}.unavailable-modal__icon svg{width:32px;height:32px;color:#856404}.unavailable-modal__title{margin:0 0 0.75rem;font-size:20px;font-weight:700;color:#333333}.unavailable-modal__message{margin:0 0 1.5rem;font-size:1rem;color:#666666;line-height:1.5}.unavailable-modal__button{padding:0.75rem 2rem;background:#DA291C;color:#FFFFFF;border:none;border-radius:30px;font-size:1rem;font-weight:700;cursor:pointer;transition:background 150ms ease;min-width:160px}.unavailable-modal__button:hover{background:rgb(181.843902439, 34.2, 23.356097561)}@keyframes spin{to{transform:rotate(360deg)}}@keyframes modalSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`;

const StepCatalogue = /*@__PURE__*/ proxyCustomElement(class StepCatalogue extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
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
    static get style() { return stepCatalogueCss(); }
}, [769, "step-catalogue", {
        "onNext": [16],
        "onBack": [16],
        "products": [32],
        "isLoading": [32],
        "error": [32],
        "productsWithDetails": [32],
        "loadingDetails": [32],
        "selectedProduct": [32],
        "selectedProductDetail": [32],
        "isAddingToCart": [32],
        "showUnavailableModal": [32],
        "summaryData": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-catalogue", "ui-carousel"];
    components.forEach(tagName => { switch (tagName) {
        case "step-catalogue":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepCatalogue);
            }
            break;
        case "ui-carousel":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$1();
            }
            break;
    } });
}
defineCustomElement();

export { StepCatalogue as S, defineCustomElement as d };
//# sourceMappingURL=p-DMGv_13C.js.map

//# sourceMappingURL=p-DMGv_13C.js.map