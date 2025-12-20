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
        return (h(Host, { key: 'ec599c85df9634685dcbeca3bfb60545f3bbc818' }, h("div", { key: '0d3e46d8eb5b2100f52a4ada26c878bded73692f', class: "step-product-detail" }, this.renderUnavailableAlert(), this.isLoading && (h("div", { key: 'dab10545bbcc2adb16a87159398769f6b151cfd7', class: "loading-container" }, h("div", { key: '710724344c26776082e119b4de4be42e2c5260a8', class: "spinner" }), h("p", { key: '26e4b4161af289c2f0c91420283a68c05ed658da' }, "Cargando producto..."))), this.error && !this.isLoading && (h("div", { key: 'bfc3ba31d341423b392a0afafa8538574a591bed', class: "error-container" }, h("p", { key: 'd5cc0e1b010d142ef85014a40c23d2bd4ed5bb12' }, this.error), h("button", { key: '880499a8c6558ff4db1823e3baf0cad854929ac4', class: "btn-retry", onClick: () => this.loadProductDetail() }, "Reintentar"), h("button", { key: 'f865760a6a78223722efa6c731b7def3a3bc9e9d', class: "btn-back", onClick: this.onBack }, "Volver al cat\u00E1logo"))), !this.isLoading && !this.error && this.product && (h("div", { key: '4d9c73442ef5d090f535f34a941572cc78f742f2', class: "product-container" }, this.renderBreadcrumb(), h("div", { key: '6077f2a11b1c3ce8aa1c373e9b6d110be625fd09', class: "product-grid" }, h("div", { key: '463d15927e22751496d953176ce00a7eed06b6f0', class: "product-image-section" }, h("ui-image-carousel", { key: 'b0e7a63596a0499fc4dc193bc6e0c8aa27a8063d', images: this.productImages, loop: true, showNavigation: this.productImages.length > 1, showIndicators: this.productImages.length > 1, autoplayInterval: 0 })), h("div", { key: '91a693a7018965300fd066a3ff9d8d62426752c2', class: "product-details-section" }, this.product.brandName && (h("span", { key: 'afc011f6349fcebeba4a7228fd90546917b0aea1', class: "brand-name" }, this.product.brandName)), h("h1", { key: 'aead2118444e7f6e754378b17876d61cfb0b8105', class: "product-name" }, this.product.productName), this.product.shortDescription && (h("p", { key: 'dc329466d7b221a50512f97fe188e223ce9b2ca1', class: "product-description" }, productService.cleanDescription(this.product.shortDescription))), this.renderAvailabilityStatus(), this.renderColorSelector(), this.renderStorageSelector(), this.renderInstallmentSelector(), this.renderQuantitySelector(), this.renderPriceSection(), h("button", { key: 'd02a2be36a1880adba4e268acb9334f5c6b93baa', class: {
                'btn-add-to-cart': true,
                'loading': this.isAddingToCart,
                'disabled': !this.isAvailable,
            }, onClick: this.handleAddToCart, disabled: this.isAddingToCart || !this.isAvailable }, this.isAddingToCart ? (h("span", { class: "loading-text" }, h("span", { class: "spinner-small" }), "Agregando...")) : !this.isAvailable ? ('No disponible') : ('Continuar')), h("button", { key: '9a01af609867e908bd78542a3cdcfd19fb8b8ccd', class: "btn-back-link", onClick: this.onBack }, "\u2190 Volver al cat\u00E1logo"))), this.product.features && this.product.features.length > 0 && (h("div", { key: '8c45755e5f98347f38ce98a80922de8a525a7736', class: "features-section" }, h("h3", { key: '23a3da0edf2e5552b89d3c82d4ece5c9b9ccc075', class: "features-title" }, "Caracter\u00EDsticas"), h("ul", { key: 'ba70146cb1c6cdf4535b9fc741c88de5a528c1f8', class: "features-list" }, this.product.features.map(feature => (h("li", { class: "feature-item" }, feature)))))), this.product.specifications && this.product.specifications.length > 0 && (h("div", { key: '01be8aca98cd2d1b2083f2c23258033b06fb81e1', class: "specs-section" }, h("h3", { key: '191bcae475f50149aa2f0bd6277d2d0f04177347', class: "specs-title" }, "Especificaciones"), h("div", { key: '1064b960367de26d496fc82b2a24e8ffba345352', class: "specs-grid" }, this.product.specifications.map((spec) => (h("div", { class: "spec-item" }, h("span", { class: "spec-label" }, spec.name), h("span", { class: "spec-value" }, spec.value))))))))))));
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
