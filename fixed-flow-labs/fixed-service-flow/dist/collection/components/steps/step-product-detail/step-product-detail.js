// ============================================
// STEP PRODUCT DETAIL - Equipment Detail for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on TEL product-web.component
// ============================================
import { h, Host } from "@stencil/core";
import { productService } from "../../../services/product.service";
import { cartService } from "../../../services/cart.service";
import { catalogueService } from "../../../services";
export class StepProductDetail {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    product = null;
    catalogueProduct = null;
    isLoading = true;
    error = null;
    isAddingToCart = false;
    // Selection states
    selectedColorIndex = 0;
    selectedStorageIndex = 0;
    selectedInstallments = 36;
    quantity = 1;
    // Availability state
    isAvailable = true;
    showUnavailableAlert = false;
    // Parsed options
    colorOptions = [];
    storageOptions = [];
    installmentOptions = [];
    // Product images for carousel
    productImages = [];
    // Stock threshold (TEL uses entryBarrier = 1, so stock > 1 means available)
    ENTRY_BARRIER = 1;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadProductDetail();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadProductDetail() {
        this.isLoading = true;
        this.error = null;
        try {
            // Get product from session (stored by step-catalogue)
            const storedProduct = catalogueService.getStoredProduct();
            if (!storedProduct) {
                this.error = 'No se encontró el producto seleccionado';
                this.isLoading = false;
                return;
            }
            this.catalogueProduct = storedProduct;
            // Fetch detailed product info from API
            const response = await productService.getEquipmentDetail(storedProduct.productId);
            if (response.hasError || !response.product) {
                // If API fails, use catalogue data as fallback
                console.warn('[StepProductDetail] API failed, using catalogue data');
                this.product = this.mapCatalogueToDetail(storedProduct);
            }
            else {
                this.product = response.product;
            }
            // Parse options
            this.parseColorOptions();
            this.parseStorageOptions();
            this.parseInstallmentOptions();
            // Build images array for carousel
            this.buildProductImages();
            // Check product availability (TEL pattern: stock > entryBarrier)
            this.checkAvailability();
            // Store in session
            productService.storeSelectedProduct(this.product);
            productService.storeDeviceType('home');
        }
        catch (err) {
            console.error('[StepProductDetail] Error:', err);
            this.error = 'Error al cargar el detalle del producto';
        }
        finally {
            this.isLoading = false;
        }
    }
    mapCatalogueToDetail(cat) {
        return {
            productId: cat.productId,
            productName: cat.productName,
            imgUrl: cat.imgUrl,
            regular_price: cat.regular_price,
            update_price: cat.update_price,
            installments: cat.installments,
            shortDescription: cat.shortDescription,
            colors: cat.colors?.map((c, i) => ({
                colorId: i,
                colorName: `Color ${i + 1}`,
                webColor: c.webColor,
            })),
            home: true,
            catalogId: 6,
        };
    }
    parseColorOptions() {
        if (!this.product?.colors || this.product.colors.length === 0) {
            // Default single color if none specified
            this.colorOptions = [{
                    colorId: 0,
                    colorName: 'Default',
                    webColor: '#333333',
                }];
            return;
        }
        this.colorOptions = this.product.colors.map((color, index) => ({
            colorId: color.colorId || index,
            colorName: color.colorName || `Color ${index + 1}`,
            webColor: color.webColor || '#333333',
            productId: color.productId,
            imgUrl: color.imgUrl,
        }));
    }
    parseStorageOptions() {
        if (!this.product?.storages || this.product.storages.length === 0) {
            // No storage options for this product
            this.storageOptions = [];
            return;
        }
        this.storageOptions = this.product.storages.map((storage, index) => ({
            storageId: storage.storageId || index,
            storageName: storage.storageName || storage.name || `${storage.size}GB`,
            productId: storage.productId,
            price: storage.price,
        }));
    }
    parseInstallmentOptions() {
        const totalPrice = this.product?.regular_price || 0;
        const defaultInstallments = this.product?.installments || 36;
        // Common installment options
        const options = [12, 24, 36];
        this.installmentOptions = options.map(months => ({
            months,
            monthlyPrice: Number((totalPrice / months).toFixed(2)),
            totalPrice,
        }));
        // Set default selection
        this.selectedInstallments = defaultInstallments;
    }
    /**
     * Builds the product images array for the carousel
     * Following TEL pattern: combines main image, detail image, and any additional images
     */
    buildProductImages() {
        if (!this.product) {
            this.productImages = [];
            return;
        }
        const images = [];
        // Add images from product.images if available (already processed by service)
        if (this.product.images?.length) {
            images.push(...this.product.images);
        }
        // Fallback: use single imgUrl if no images array
        else if (this.product.imgUrl) {
            images.push(this.product.imgUrl);
        }
        // Add color-specific images if available
        if (this.colorOptions?.length > 0) {
            this.colorOptions.forEach(color => {
                if (color.imgUrl && !images.includes(color.imgUrl)) {
                    images.push(color.imgUrl);
                }
            });
        }
        this.productImages = images;
        console.log('[StepProductDetail] Product images:', this.productImages.length);
    }
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
    checkAvailability() {
        if (!this.product) {
            this.isAvailable = false;
            this.showUnavailableAlert = true;
            return;
        }
        // TEL Pattern: stock > entryBarrier (where entryBarrier = 1)
        // If stock is undefined, it means the colors structure wasn't present or no products found
        // In that case, we check if product has valid basic data and assume available
        if (this.product.stock === undefined || this.product.stock === null) {
            // No stock info from nested structure - assume available if product has basic data
            this.isAvailable = true;
            console.log('[StepProductDetail] Availability check - stock undefined (no colors structure), assuming available');
        }
        else {
            // TEL Pattern: hasStock = stock > entryBarrier (1)
            this.isAvailable = this.product.stock > this.ENTRY_BARRIER;
            console.log('[StepProductDetail] Availability check (TEL pattern) - stock:', this.product.stock, '> entryBarrier:', this.ENTRY_BARRIER, '=', this.isAvailable);
            if (!this.isAvailable) {
                this.showUnavailableAlert = true;
            }
        }
    }
    /**
     * Handles dismissing the unavailable alert and going back
     */
    handleGoBackFromAlert = () => {
        this.showUnavailableAlert = false;
        this.onBack?.();
    };
    handleColorSelect = (index) => {
        this.selectedColorIndex = index;
        const color = this.colorOptions[index];
        // Store selected color
        productService.storeSelectedColor(color.colorId, color.colorName, color.webColor);
        // Update product image if color has specific image
        if (color.imgUrl && this.product) {
            this.product = { ...this.product, imgUrl: color.imgUrl };
        }
    };
    handleStorageSelect = (index) => {
        this.selectedStorageIndex = index;
        const storage = this.storageOptions[index];
        // Store selected storage
        productService.storeSelectedStorage(storage.storageId, storage.storageName);
        // Update children ID if storage has specific product
        if (storage.productId) {
            productService.storeChildrenId(storage.productId);
        }
    };
    handleInstallmentSelect = (months) => {
        this.selectedInstallments = months;
    };
    // Quantity selector commented out - keeping function for future use
    // private handleQuantityChange = (delta: number) => {
    //   const newQty = this.quantity + delta;
    //   if (newQty >= 1 && newQty <= 5) {
    //     this.quantity = newQty;
    //   }
    // };
    handleAddToCart = async () => {
        if (!this.product || this.isAddingToCart)
            return;
        this.isAddingToCart = true;
        try {
            const response = await cartService.addToCart(this.product, this.selectedInstallments, this.quantity);
            if (response.hasError) {
                console.error('[StepProductDetail] Add to cart failed:', response.message);
                this.error = response.message || 'Error al agregar al carrito';
                return;
            }
            // Store mainId for next steps
            if (response.code) {
                cartService.storeMainId(response.code);
                productService.storeMainId(response.code);
            }
            console.log('[StepProductDetail] Added to cart, proceeding to plans');
            // Navigate to next step (plans selection)
            this.onNext?.();
        }
        catch (err) {
            console.error('[StepProductDetail] Error:', err);
            this.error = 'Error al agregar el producto al carrito';
        }
        finally {
            this.isAddingToCart = false;
        }
    };
    getCurrentMonthlyPrice() {
        const option = this.installmentOptions.find(o => o.months === this.selectedInstallments);
        return option?.monthlyPrice || this.product?.update_price || 0;
    }
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderBreadcrumb() {
        return (h("div", { class: "breadcrumb" }, h("span", { class: "breadcrumb-item", onClick: this.onBack }, "Cat\u00E1logo"), h("span", { class: "breadcrumb-separator" }, ">"), h("span", { class: "breadcrumb-item active" }, this.product?.productName || 'Detalle')));
    }
    renderColorSelector() {
        if (this.colorOptions.length <= 1)
            return null;
        return (h("div", { class: "selector-section" }, h("h4", { class: "selector-title" }, "Color"), h("div", { class: "color-options" }, this.colorOptions.map((color, index) => (h("button", { class: {
                'color-circle': true,
                'selected': this.selectedColorIndex === index,
            }, style: { backgroundColor: color.webColor }, onClick: () => this.handleColorSelect(index), title: color.colorName }, this.selectedColorIndex === index && (h("svg", { class: "check-icon", viewBox: "0 0 24 24", fill: "none", stroke: "white", "stroke-width": "3" }, h("polyline", { points: "20 6 9 17 4 12" }))))))), h("span", { class: "selected-label" }, this.colorOptions[this.selectedColorIndex]?.colorName)));
    }
    renderStorageSelector() {
        if (this.storageOptions.length === 0)
            return null;
        return (h("div", { class: "selector-section" }, h("h4", { class: "selector-title" }, "Almacenamiento"), h("div", { class: "storage-options" }, this.storageOptions.map((storage, index) => (h("button", { class: {
                'storage-button': true,
                'selected': this.selectedStorageIndex === index,
            }, onClick: () => this.handleStorageSelect(index) }, storage.storageName))))));
    }
    renderInstallmentSelector() {
        return (h("div", { class: "selector-section" }, h("h4", { class: "selector-title" }, "Plazos de pago"), h("div", { class: "installment-options" }, this.installmentOptions.map(option => (h("button", { class: {
                'installment-button': true,
                'selected': this.selectedInstallments === option.months,
            }, onClick: () => this.handleInstallmentSelect(option.months) }, h("span", { class: "months" }, option.months, " meses"), h("span", { class: "price" }, this.formatPrice(option.monthlyPrice), "/mes")))))));
    }
    renderQuantitySelector() {
        return (h("div", { class: "selector-section" }));
    }
    renderPriceSection() {
        const monthlyPrice = this.getCurrentMonthlyPrice();
        const totalPrice = this.product?.regular_price || 0;
        return (h("div", { class: "price-section" }, h("div", { class: "price-row monthly" }, h("span", { class: "label" }, "Pago mensual"), h("span", { class: "value" }, this.formatPrice(monthlyPrice))), h("div", { class: "price-row total" }, h("span", { class: "label" }, "Precio total"), h("span", { class: "value" }, this.formatPrice(totalPrice))), h("div", { class: "price-row installments" }, h("span", { class: "label" }, "Financiado a"), h("span", { class: "value" }, this.selectedInstallments, " meses"))));
    }
    /**
     * Renders the availability status indicator (TEL pattern)
     */
    renderAvailabilityStatus() {
        return (h("div", { class: "availability-status" }, this.isAvailable ? (h("div", { class: "availability-status--available" }, h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), h("polyline", { points: "22 4 12 14.01 9 11.01" })), h("span", null, "Disponible"))) : (h("div", { class: "availability-status--unavailable" }, h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })), h("span", null, "No disponible")))));
    }
    /**
     * Renders the unavailable product alert modal
     */
    renderUnavailableAlert() {
        if (!this.showUnavailableAlert)
            return null;
        return (h("div", { class: "unavailable-alert-overlay" }, h("div", { class: "unavailable-alert" }, h("div", { class: "unavailable-alert__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))), h("h3", { class: "unavailable-alert__title" }, "Producto no disponible"), h("p", { class: "unavailable-alert__message" }, "Lo sentimos, este equipo no est\u00E1 disponible actualmente. Por favor seleccione otro equipo del cat\u00E1logo."), h("button", { class: "unavailable-alert__btn", onClick: this.handleGoBackFromAlert }, "Volver al cat\u00E1logo"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: 'f6f5da2204bacc3f2e22e166e904a942a34b49a1' }, h("div", { key: 'fb8e8a53343364958196cc8fdb35ec6da995431e', class: "step-product-detail" }, this.renderUnavailableAlert(), this.isLoading && (h("div", { key: 'cec8da757327a32af784b3fa4690d0aae8d275b8', class: "loading-container" }, h("div", { key: 'd9345339f269a0cae7b7c98235bd46c679a5173a', class: "spinner" }), h("p", { key: '5a5a3e5a9d7498a61acfa8705141f939e64678ac' }, "Cargando producto..."))), this.error && !this.isLoading && (h("div", { key: 'cfabad9e3e962e180d25b56211a6e2b3a02b6952', class: "error-container" }, h("p", { key: '2310f44a366658042f5f73b960680257d8c6f6c8' }, this.error), h("button", { key: '5936dacf538439957fd959094025563e535d13d4', class: "btn-retry", onClick: () => this.loadProductDetail() }, "Reintentar"), h("button", { key: 'e79e30d0eb8fbe794b84006c022da93c1cbb9e19', class: "btn-back", onClick: this.onBack }, "Volver al cat\u00E1logo"))), !this.isLoading && !this.error && this.product && (h("div", { key: 'ad4dff462c0c38b35d57ee7fc61baeb54e09f3fb', class: "product-container" }, this.renderBreadcrumb(), h("div", { key: 'f15d19d5700a7b7f7877535189d529fe82201f80', class: "product-grid" }, h("div", { key: 'a79b4402d66696c05fc1a77003d5964889868861', class: "product-image-section" }, h("ui-image-carousel", { key: '2574169af64849beae90eb982b0ba1b13a63d6a7', images: this.productImages, loop: true, showNavigation: this.productImages.length > 1, showIndicators: this.productImages.length > 1, autoplayInterval: 0 })), h("div", { key: 'ce58350892cc2d0c595ad56f1a6b3ae986ee892f', class: "product-details-section" }, this.product.brandName && (h("span", { key: 'c9dbc2ae620998d47c1b46645690868c336d7102', class: "brand-name" }, this.product.brandName)), h("h1", { key: '4447a1888895e7846bd64dae3259a26e7558b8ee', class: "product-name" }, this.product.productName), this.product.shortDescription && (h("p", { key: 'f99de4112c2104e652c62fce0f47f3f2c6290d99', class: "product-description" }, productService.cleanDescription(this.product.shortDescription))), this.renderAvailabilityStatus(), this.renderColorSelector(), this.renderStorageSelector(), this.renderInstallmentSelector(), this.renderQuantitySelector(), this.renderPriceSection(), h("button", { key: '2a0fb17ffb42e9e23bfdb7a2440abb2d7046c530', class: {
                'btn-add-to-cart': true,
                'loading': this.isAddingToCart,
                'disabled': !this.isAvailable,
            }, onClick: this.handleAddToCart, disabled: this.isAddingToCart || !this.isAvailable }, this.isAddingToCart ? (h("span", { class: "loading-text" }, h("span", { class: "spinner-small" }), "Agregando...")) : !this.isAvailable ? ('No disponible') : ('Continuar')), h("button", { key: 'e4d48537e4eff5d7fb4fbd537360335b7f96f392', class: "btn-back-link", onClick: this.onBack }, "\u2190 Volver al cat\u00E1logo"))), this.product.features && this.product.features.length > 0 && (h("div", { key: '4068563e46d85763eea9b0722728a1be6cc67975', class: "features-section" }, h("h3", { key: '610bcb5243c5b59f99ae8dc49267c981421e9dda', class: "features-title" }, "Caracter\u00EDsticas"), h("ul", { key: '7c205b947fabb39342fae99bf635dc4610158718', class: "features-list" }, this.product.features.map(feature => (h("li", { class: "feature-item" }, feature)))))), this.product.specifications && this.product.specifications.length > 0 && (h("div", { key: '2dc48d0f8ddd2daa8558a905103f1fd80ab9206c', class: "specs-section" }, h("h3", { key: 'b7168f6107e3eb1c01921df3b052905cad91beec', class: "specs-title" }, "Especificaciones"), h("div", { key: 'd3f4fb10926e83262f18632db967086e0c12b31f', class: "specs-grid" }, this.product.specifications.map((spec) => (h("div", { class: "spec-item" }, h("span", { class: "spec-label" }, spec.name), h("span", { class: "spec-value" }, spec.value))))))))))));
    }
    static get is() { return "step-product-detail"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-product-detail.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-product-detail.css"]
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
            "product": {},
            "catalogueProduct": {},
            "isLoading": {},
            "error": {},
            "isAddingToCart": {},
            "selectedColorIndex": {},
            "selectedStorageIndex": {},
            "selectedInstallments": {},
            "quantity": {},
            "isAvailable": {},
            "showUnavailableAlert": {},
            "colorOptions": {},
            "storageOptions": {},
            "installmentOptions": {},
            "productImages": {}
        };
    }
}
//# sourceMappingURL=step-product-detail.js.map
