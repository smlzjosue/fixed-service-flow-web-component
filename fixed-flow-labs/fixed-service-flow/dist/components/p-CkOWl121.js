import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { p as productService } from './p-1Ac0e39s.js';
import { c as cartService } from './p-Do8sEIsu.js';
import './p-Dom6fCh6.js';
import { c as catalogueService } from './p-Bovy52tu.js';
import { d as defineCustomElement$1 } from './p-DIS67kJr.js';

const stepProductDetailCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-product-detail{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.loading-container,.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;padding:2rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:0.25rem;vertical-align:middle}@keyframes spin{to{transform:rotate(360deg)}}.error-container p{color:#DA291C;margin-bottom:1rem;font-size:1.25rem}.error-container button{margin:0.25rem}.btn-retry{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.breadcrumb{display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;font-size:0.875rem;color:#666666}.breadcrumb-item{cursor:pointer;transition:color 0.2s}.breadcrumb-item:hover{color:#0097A9}.breadcrumb-item.active{color:#1A1A1A;font-weight:500;cursor:default}.breadcrumb-item.active:hover{color:#1A1A1A}.breadcrumb-separator{color:#999999}.product-container{background:white;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:2rem}.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem}@media (max-width: 768px){.product-grid{grid-template-columns:1fr}}.product-image-section{display:flex;align-items:flex-start;justify-content:center;width:100%;max-width:450px;margin:0 auto}.product-image-section ui-image-carousel{width:100%}.image-container{width:100%;max-width:400px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#FAFAFA;border-radius:0.5rem;padding:1rem}.product-image{max-width:100%;max-height:100%;object-fit:contain}.product-details-section{display:flex;flex-direction:column;gap:1rem}.brand-name{font-size:0.875rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px}.product-name{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;line-height:1.2}.product-description{font-size:1rem;color:#666666;line-height:1.6;margin:0}.selector-section{padding:1rem 0;border-top:1px solid #F5F5F5}.selector-section:first-of-type{border-top:none}.selector-title{font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 0.5rem 0;text-transform:uppercase;letter-spacing:0.5px}.color-options{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem}.color-circle{width:40px;height:40px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0}.color-circle:hover{transform:scale(1.1)}.color-circle.selected{border-color:#0097A9;box-shadow:0 0 0 2px white, 0 0 0 4px #0097A9}.color-circle .check-icon{width:18px;height:18px}.selected-label{font-size:0.875rem;color:#666666}.storage-options{display:flex;gap:0.5rem;flex-wrap:wrap}.storage-button{padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;font-size:0.875rem;font-weight:500;color:#4D4D4D;transition:all 0.2s}.storage-button:hover{border-color:#0097A9;color:#0097A9}.storage-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1);color:#0097A9}.installment-options{display:flex;gap:0.5rem;flex-wrap:wrap}.installment-button{display:flex;flex-direction:column;align-items:center;padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;transition:all 0.2s;min-width:100px}.installment-button:hover{border-color:#0097A9}.installment-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1)}.installment-button.selected .months,.installment-button.selected .price{color:#0097A9}.installment-button .months{font-size:0.875rem;font-weight:600;color:#4D4D4D}.installment-button .price{font-size:0.75rem;color:#808080;margin-top:2px}.quantity-selector{display:flex;align-items:center;gap:1rem}.qty-button{width:36px;height:36px;border:2px solid #CCCCCC;border-radius:0.5rem;background:white;cursor:pointer;font-size:1.25rem;font-weight:600;color:#4D4D4D;display:flex;align-items:center;justify-content:center;transition:all 0.2s}.qty-button:hover:not(:disabled){border-color:#0097A9;color:#0097A9}.qty-button:disabled{opacity:0.4;cursor:not-allowed}.qty-value{font-size:1.25rem;font-weight:600;color:#1A1A1A;min-width:30px;text-align:center}.price-section{background:#FAFAFA;border-radius:0.5rem;padding:1rem;margin-top:0.5rem}.price-row{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0}.price-row.monthly .value{font-size:1.5rem;font-weight:700;color:#DA291C}.price-row.total{border-top:1px solid #E5E5E5;padding-top:0.5rem;margin-top:0.25rem}.price-row.total .value{font-weight:600}.price-row .label{font-size:0.875rem;color:#666666}.price-row .value{font-size:1rem;color:#1A1A1A}.btn-add-to-cart{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:1rem}.btn-add-to-cart:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-add-to-cart:disabled{opacity:0.7;cursor:not-allowed}.btn-add-to-cart.loading{background:#808080}.btn-add-to-cart .loading-text{display:flex;align-items:center;justify-content:center}.btn-back-link{background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.5rem;margin-top:0.25rem;transition:color 0.2s}.btn-back-link:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.btn-back{background:#E5E5E5;color:#4D4D4D;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:500}.btn-back:hover{background:#CCCCCC}.features-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.features-title,.specs-title{font-size:1.25rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.features-list{margin:0;padding:0 0 0 1.5rem}.features-list .feature-item{padding:0.25rem 0;color:#4D4D4D;line-height:1.5}.specs-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.specs-grid{display:grid;grid-template-columns:repeat(2, 1fr);gap:0.5rem}@media (max-width: 576px){.specs-grid{grid-template-columns:1fr}}.spec-item{display:flex;justify-content:space-between;padding:0.5rem;background:#FAFAFA;border-radius:0.25rem}.spec-item .spec-label{font-size:0.875rem;color:#666666}.spec-item .spec-value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.availability-status{display:flex;align-items:center;gap:0.25rem;padding:0.5rem 0}.availability-status--available{display:flex;align-items:center;gap:0.25rem;color:#44AF69;font-weight:500;font-size:0.875rem}.availability-status--unavailable{display:flex;align-items:center;gap:0.25rem;color:#DA291C;font-weight:500;font-size:0.875rem}.availability-icon{width:18px;height:18px}.unavailable-alert-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem}.unavailable-alert{background:white;border-radius:0.75rem;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);animation:alertSlideIn 0.3s ease-out}.unavailable-alert__icon{width:64px;height:64px;margin:0 auto 1rem;background:rgba(218, 41, 28, 0.1);border-radius:50%;display:flex;align-items:center;justify-content:center}.unavailable-alert__icon svg{width:32px;height:32px;color:#DA291C}.unavailable-alert__title{font-size:1.5rem;font-weight:700;color:#1A1A1A;margin:0 0 0.5rem 0}.unavailable-alert__message{font-size:1rem;color:#666666;line-height:1.6;margin:0 0 1.5rem 0}.unavailable-alert__btn{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.unavailable-alert__btn:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}@keyframes alertSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}.btn-add-to-cart.disabled{background:#999999;cursor:not-allowed}.btn-add-to-cart.disabled:hover{background:#999999}`;

const StepProductDetail = /*@__PURE__*/ proxyCustomElement(class StepProductDetail extends H {
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
    static get style() { return stepProductDetailCss(); }
}, [769, "step-product-detail", {
        "onNext": [16],
        "onBack": [16],
        "product": [32],
        "catalogueProduct": [32],
        "isLoading": [32],
        "error": [32],
        "isAddingToCart": [32],
        "selectedColorIndex": [32],
        "selectedStorageIndex": [32],
        "selectedInstallments": [32],
        "quantity": [32],
        "isAvailable": [32],
        "showUnavailableAlert": [32],
        "colorOptions": [32],
        "storageOptions": [32],
        "installmentOptions": [32],
        "productImages": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-product-detail", "ui-image-carousel"];
    components.forEach(tagName => { switch (tagName) {
        case "step-product-detail":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepProductDetail);
            }
            break;
        case "ui-image-carousel":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$1();
            }
            break;
    } });
}
defineCustomElement();

export { StepProductDetail as S, defineCustomElement as d };
//# sourceMappingURL=p-CkOWl121.js.map

//# sourceMappingURL=p-CkOWl121.js.map