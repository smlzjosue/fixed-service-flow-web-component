'use strict';

var index = require('./index-BAqxGv-h.js');
var product_service = require('./product.service-BxQFhbbS.js');
var cart_service = require('./cart.service-TK_wN9_5.js');
require('./token.service-B-RtLk56.js');

const stepProductDetailCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-product-detail{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.loading-container,.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;padding:2rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:0.25rem;vertical-align:middle}@keyframes spin{to{transform:rotate(360deg)}}.error-container p{color:#DA291C;margin-bottom:1rem;font-size:1.25rem}.error-container button{margin:0.25rem}.btn-retry{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.breadcrumb{display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;font-size:0.875rem;color:#666666}.breadcrumb-item{cursor:pointer;transition:color 0.2s}.breadcrumb-item:hover{color:#0097A9}.breadcrumb-item.active{color:#1A1A1A;font-weight:500;cursor:default}.breadcrumb-item.active:hover{color:#1A1A1A}.breadcrumb-separator{color:#999999}.product-container{background:white;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:2rem}.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem}@media (max-width: 768px){.product-grid{grid-template-columns:1fr}}.product-image-section{display:flex;align-items:flex-start;justify-content:center;width:100%;max-width:450px;margin:0 auto}.product-image-section ui-image-carousel{width:100%}.image-container{width:100%;max-width:400px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#FAFAFA;border-radius:0.5rem;padding:1rem}.product-image{max-width:100%;max-height:100%;object-fit:contain}.product-details-section{display:flex;flex-direction:column;gap:1rem}.brand-name{font-size:0.875rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px}.product-name{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;line-height:1.2}.product-description{font-size:1rem;color:#666666;line-height:1.6;margin:0}.selector-section{padding:1rem 0;border-top:1px solid #F5F5F5}.selector-section:first-of-type{border-top:none}.selector-title{font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 0.5rem 0;text-transform:uppercase;letter-spacing:0.5px}.color-options{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem}.color-circle{width:40px;height:40px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0}.color-circle:hover{transform:scale(1.1)}.color-circle.selected{border-color:#0097A9;box-shadow:0 0 0 2px white, 0 0 0 4px #0097A9}.color-circle .check-icon{width:18px;height:18px}.selected-label{font-size:0.875rem;color:#666666}.storage-options{display:flex;gap:0.5rem;flex-wrap:wrap}.storage-button{padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;font-size:0.875rem;font-weight:500;color:#4D4D4D;transition:all 0.2s}.storage-button:hover{border-color:#0097A9;color:#0097A9}.storage-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1);color:#0097A9}.installment-options{display:flex;gap:0.5rem;flex-wrap:wrap}.installment-button{display:flex;flex-direction:column;align-items:center;padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;transition:all 0.2s;min-width:100px}.installment-button:hover{border-color:#0097A9}.installment-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1)}.installment-button.selected .months,.installment-button.selected .price{color:#0097A9}.installment-button .months{font-size:0.875rem;font-weight:600;color:#4D4D4D}.installment-button .price{font-size:0.75rem;color:#808080;margin-top:2px}.quantity-selector{display:flex;align-items:center;gap:1rem}.qty-button{width:36px;height:36px;border:2px solid #CCCCCC;border-radius:0.5rem;background:white;cursor:pointer;font-size:1.25rem;font-weight:600;color:#4D4D4D;display:flex;align-items:center;justify-content:center;transition:all 0.2s}.qty-button:hover:not(:disabled){border-color:#0097A9;color:#0097A9}.qty-button:disabled{opacity:0.4;cursor:not-allowed}.qty-value{font-size:1.25rem;font-weight:600;color:#1A1A1A;min-width:30px;text-align:center}.price-section{background:#FAFAFA;border-radius:0.5rem;padding:1rem;margin-top:0.5rem}.price-row{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0}.price-row.monthly .value{font-size:1.5rem;font-weight:700;color:#DA291C}.price-row.total{border-top:1px solid #E5E5E5;padding-top:0.5rem;margin-top:0.25rem}.price-row.total .value{font-weight:600}.price-row .label{font-size:0.875rem;color:#666666}.price-row .value{font-size:1rem;color:#1A1A1A}.btn-add-to-cart{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:1rem}.btn-add-to-cart:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-add-to-cart:disabled{opacity:0.7;cursor:not-allowed}.btn-add-to-cart.loading{background:#808080}.btn-add-to-cart .loading-text{display:flex;align-items:center;justify-content:center}.btn-back-link{background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.5rem;margin-top:0.25rem;transition:color 0.2s}.btn-back-link:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.btn-back{background:#E5E5E5;color:#4D4D4D;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:500}.btn-back:hover{background:#CCCCCC}.features-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.features-title,.specs-title{font-size:1.25rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.features-list{margin:0;padding:0 0 0 1.5rem}.features-list .feature-item{padding:0.25rem 0;color:#4D4D4D;line-height:1.5}.specs-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.specs-grid{display:grid;grid-template-columns:repeat(2, 1fr);gap:0.5rem}@media (max-width: 576px){.specs-grid{grid-template-columns:1fr}}.spec-item{display:flex;justify-content:space-between;padding:0.5rem;background:#FAFAFA;border-radius:0.25rem}.spec-item .spec-label{font-size:0.875rem;color:#666666}.spec-item .spec-value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.availability-status{display:flex;align-items:center;gap:0.25rem;padding:0.5rem 0}.availability-status--available{display:flex;align-items:center;gap:0.25rem;color:#44AF69;font-weight:500;font-size:0.875rem}.availability-status--unavailable{display:flex;align-items:center;gap:0.25rem;color:#DA291C;font-weight:500;font-size:0.875rem}.availability-icon{width:18px;height:18px}.unavailable-alert-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem}.unavailable-alert{background:white;border-radius:0.75rem;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);animation:alertSlideIn 0.3s ease-out}.unavailable-alert__icon{width:64px;height:64px;margin:0 auto 1rem;background:rgba(218, 41, 28, 0.1);border-radius:50%;display:flex;align-items:center;justify-content:center}.unavailable-alert__icon svg{width:32px;height:32px;color:#DA291C}.unavailable-alert__title{font-size:1.5rem;font-weight:700;color:#1A1A1A;margin:0 0 0.5rem 0}.unavailable-alert__message{font-size:1rem;color:#666666;line-height:1.6;margin:0 0 1.5rem 0}.unavailable-alert__btn{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.unavailable-alert__btn:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}@keyframes alertSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}.btn-add-to-cart.disabled{background:#999999;cursor:not-allowed}.btn-add-to-cart.disabled:hover{background:#999999}`;

const StepProductDetail = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
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
            const storedProduct = product_service.catalogueService.getStoredProduct();
            if (!storedProduct) {
                this.error = 'No se encontró el producto seleccionado';
                this.isLoading = false;
                return;
            }
            this.catalogueProduct = storedProduct;
            // Fetch detailed product info from API
            const response = await product_service.productService.getEquipmentDetail(storedProduct.productId);
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
            product_service.productService.storeSelectedProduct(this.product);
            product_service.productService.storeDeviceType('home');
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
        product_service.productService.storeSelectedColor(color.colorId, color.colorName, color.webColor);
        // Update product image if color has specific image
        if (color.imgUrl && this.product) {
            this.product = { ...this.product, imgUrl: color.imgUrl };
        }
    };
    handleStorageSelect = (index) => {
        this.selectedStorageIndex = index;
        const storage = this.storageOptions[index];
        // Store selected storage
        product_service.productService.storeSelectedStorage(storage.storageId, storage.storageName);
        // Update children ID if storage has specific product
        if (storage.productId) {
            product_service.productService.storeChildrenId(storage.productId);
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
            const response = await cart_service.cartService.addToCart(this.product, this.selectedInstallments, this.quantity);
            if (response.hasError) {
                console.error('[StepProductDetail] Add to cart failed:', response.message);
                this.error = response.message || 'Error al agregar al carrito';
                return;
            }
            // Store mainId for next steps
            if (response.code) {
                cart_service.cartService.storeMainId(response.code);
                product_service.productService.storeMainId(response.code);
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
        return (index.h("div", { class: "breadcrumb" }, index.h("span", { class: "breadcrumb-item", onClick: this.onBack }, "Cat\u00E1logo"), index.h("span", { class: "breadcrumb-separator" }, ">"), index.h("span", { class: "breadcrumb-item active" }, this.product?.productName || 'Detalle')));
    }
    renderColorSelector() {
        if (this.colorOptions.length <= 1)
            return null;
        return (index.h("div", { class: "selector-section" }, index.h("h4", { class: "selector-title" }, "Color"), index.h("div", { class: "color-options" }, this.colorOptions.map((color, index$1) => (index.h("button", { class: {
                'color-circle': true,
                'selected': this.selectedColorIndex === index$1,
            }, style: { backgroundColor: color.webColor }, onClick: () => this.handleColorSelect(index$1), title: color.colorName }, this.selectedColorIndex === index$1 && (index.h("svg", { class: "check-icon", viewBox: "0 0 24 24", fill: "none", stroke: "white", "stroke-width": "3" }, index.h("polyline", { points: "20 6 9 17 4 12" }))))))), index.h("span", { class: "selected-label" }, this.colorOptions[this.selectedColorIndex]?.colorName)));
    }
    renderStorageSelector() {
        if (this.storageOptions.length === 0)
            return null;
        return (index.h("div", { class: "selector-section" }, index.h("h4", { class: "selector-title" }, "Almacenamiento"), index.h("div", { class: "storage-options" }, this.storageOptions.map((storage, index$1) => (index.h("button", { class: {
                'storage-button': true,
                'selected': this.selectedStorageIndex === index$1,
            }, onClick: () => this.handleStorageSelect(index$1) }, storage.storageName))))));
    }
    renderInstallmentSelector() {
        return (index.h("div", { class: "selector-section" }, index.h("h4", { class: "selector-title" }, "Plazos de pago"), index.h("div", { class: "installment-options" }, this.installmentOptions.map(option => (index.h("button", { class: {
                'installment-button': true,
                'selected': this.selectedInstallments === option.months,
            }, onClick: () => this.handleInstallmentSelect(option.months) }, index.h("span", { class: "months" }, option.months, " meses"), index.h("span", { class: "price" }, this.formatPrice(option.monthlyPrice), "/mes")))))));
    }
    renderQuantitySelector() {
        return (index.h("div", { class: "selector-section" }));
    }
    renderPriceSection() {
        const monthlyPrice = this.getCurrentMonthlyPrice();
        const totalPrice = this.product?.regular_price || 0;
        return (index.h("div", { class: "price-section" }, index.h("div", { class: "price-row monthly" }, index.h("span", { class: "label" }, "Pago mensual"), index.h("span", { class: "value" }, this.formatPrice(monthlyPrice))), index.h("div", { class: "price-row total" }, index.h("span", { class: "label" }, "Precio total"), index.h("span", { class: "value" }, this.formatPrice(totalPrice))), index.h("div", { class: "price-row installments" }, index.h("span", { class: "label" }, "Financiado a"), index.h("span", { class: "value" }, this.selectedInstallments, " meses"))));
    }
    /**
     * Renders the availability status indicator (TEL pattern)
     */
    renderAvailabilityStatus() {
        return (index.h("div", { class: "availability-status" }, this.isAvailable ? (index.h("div", { class: "availability-status--available" }, index.h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), index.h("polyline", { points: "22 4 12 14.01 9 11.01" })), index.h("span", null, "Disponible"))) : (index.h("div", { class: "availability-status--unavailable" }, index.h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), index.h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), index.h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })), index.h("span", null, "No disponible")))));
    }
    /**
     * Renders the unavailable product alert modal
     */
    renderUnavailableAlert() {
        if (!this.showUnavailableAlert)
            return null;
        return (index.h("div", { class: "unavailable-alert-overlay" }, index.h("div", { class: "unavailable-alert" }, index.h("div", { class: "unavailable-alert__icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), index.h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), index.h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))), index.h("h3", { class: "unavailable-alert__title" }, "Producto no disponible"), index.h("p", { class: "unavailable-alert__message" }, "Lo sentimos, este equipo no est\u00E1 disponible actualmente. Por favor seleccione otro equipo del cat\u00E1logo."), index.h("button", { class: "unavailable-alert__btn", onClick: this.handleGoBackFromAlert }, "Volver al cat\u00E1logo"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (index.h(index.Host, { key: 'a448cf5392003a14812ac33028caabd59a4fad25' }, index.h("div", { key: 'e97f6adbfe1e888df01a5aa4044813ed63254a34', class: "step-product-detail" }, this.renderUnavailableAlert(), this.isLoading && (index.h("div", { key: 'acd10d1ca5d2cd32ec2658a68e9f1c7fa38a8073', class: "loading-container" }, index.h("div", { key: 'e4715b2bca39e232420fcf4a607554e1e5d84eca', class: "spinner" }), index.h("p", { key: 'dd86779545a8d8ef2c05eba40df456bf4fbfd2ac' }, "Cargando producto..."))), this.error && !this.isLoading && (index.h("div", { key: 'e72e720e372140d6022014402aa4fe6d3d5cf9b5', class: "error-container" }, index.h("p", { key: '5595b9fdffcb3be92f1f72e94896ed3f4c2300f9' }, this.error), index.h("button", { key: 'a002e91efc3e04516f88c0d1bf5a4fc27d012a5c', class: "btn-retry", onClick: () => this.loadProductDetail() }, "Reintentar"), index.h("button", { key: 'b1ac1878161e080899f32e0220249f110b5fe152', class: "btn-back", onClick: this.onBack }, "Volver al cat\u00E1logo"))), !this.isLoading && !this.error && this.product && (index.h("div", { key: 'f6867216549a19d5022c9ad8b5a2808ba8b14078', class: "product-container" }, this.renderBreadcrumb(), index.h("div", { key: 'ea01d34aa41a8b8cd7a5025cefb4264bbe251f1d', class: "product-grid" }, index.h("div", { key: '77ecbd357dcd1508440a189d1a6b50a02c7127b9', class: "product-image-section" }, index.h("ui-image-carousel", { key: '36c32a9e91525eb6bd57c85777f5f7b21e930a4a', images: this.productImages, loop: true, showNavigation: this.productImages.length > 1, showIndicators: this.productImages.length > 1, autoplayInterval: 0 })), index.h("div", { key: '9c37dad63658ad336c419d37a6b06d4435e260c3', class: "product-details-section" }, this.product.brandName && (index.h("span", { key: '25d5a79b3d327f06ad114f3cc78be1451ec21daa', class: "brand-name" }, this.product.brandName)), index.h("h1", { key: 'b2199ec13a366a503889dbddb53103cb3a496219', class: "product-name" }, this.product.productName), this.product.shortDescription && (index.h("p", { key: '576ecd16f0e7bf0b6e81e1479e5b7d2e5c683376', class: "product-description" }, product_service.productService.cleanDescription(this.product.shortDescription))), this.renderAvailabilityStatus(), this.renderColorSelector(), this.renderStorageSelector(), this.renderInstallmentSelector(), this.renderQuantitySelector(), this.renderPriceSection(), index.h("button", { key: '56861f841e02e64b1114904dfde16ab6fb9e93f6', class: {
                'btn-add-to-cart': true,
                'loading': this.isAddingToCart,
                'disabled': !this.isAvailable,
            }, onClick: this.handleAddToCart, disabled: this.isAddingToCart || !this.isAvailable }, this.isAddingToCart ? (index.h("span", { class: "loading-text" }, index.h("span", { class: "spinner-small" }), "Agregando...")) : !this.isAvailable ? ('No disponible') : ('Continuar')), index.h("button", { key: 'be00a3edab85ab112a01a4cd666ebe8734f0acf0', class: "btn-back-link", onClick: this.onBack }, "\u2190 Volver al cat\u00E1logo"))), this.product.features && this.product.features.length > 0 && (index.h("div", { key: 'b69502c45bff8afc44e33b98ce63831de88f85d6', class: "features-section" }, index.h("h3", { key: 'dd449a7c281d2d06c1375615a10cef83fe94ffff', class: "features-title" }, "Caracter\u00EDsticas"), index.h("ul", { key: '485cb3b91f06c81d58bd9da3658995ad38c74474', class: "features-list" }, this.product.features.map(feature => (index.h("li", { class: "feature-item" }, feature)))))), this.product.specifications && this.product.specifications.length > 0 && (index.h("div", { key: '7460ba5445fed1e5c4d2ffeae70334b96502259f', class: "specs-section" }, index.h("h3", { key: '3b59a830d396492fb5afe5d6078788ad453e5325', class: "specs-title" }, "Especificaciones"), index.h("div", { key: 'd1f09035e530060a4015844e05aeb317c89b97bc', class: "specs-grid" }, this.product.specifications.map((spec) => (index.h("div", { class: "spec-item" }, index.h("span", { class: "spec-label" }, spec.name), index.h("span", { class: "spec-value" }, spec.value))))))))))));
    }
};
StepProductDetail.style = stepProductDetailCss();

exports.step_product_detail = StepProductDetail;
//# sourceMappingURL=step-product-detail.entry.cjs.js.map
