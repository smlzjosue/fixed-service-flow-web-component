// ============================================
// STEP ORDER SUMMARY - Cart Review for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on TEL order-summary-web.component
// ============================================
import { h, Host } from "@stencil/core";
import { cartService } from "../../../services/cart.service";
export class StepOrderSummary {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    cart = null;
    isLoading = true;
    error = null;
    promoCode = '';
    isApplyingPromo = false;
    promoError = null;
    promoSuccess = false;
    termsAccepted = false;
    deletingItemId = null;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadCart();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadCart() {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await cartService.getCart();
            if (response.hasError) {
                this.error = response.message || 'Error al cargar el carrito';
                return;
            }
            this.cart = response;
            console.log('[StepOrderSummary] Cart loaded:', this.cart);
            console.log('[StepOrderSummary] Products:', this.cart.products?.map(p => ({
                cartId: p.cartId,
                name: p.productName,
                equipment: p.equipment,
                home: p.home,
                plan: p.plan,
                parentCartId: p.parentCartId,
                installments: p.installments,
                price: p.decPrice,
            })));
        }
        catch (err) {
            console.error('[StepOrderSummary] Error:', err);
            this.error = 'Error de conexión al cargar el carrito';
        }
        finally {
            this.isLoading = false;
        }
    }
    handlePromoCodeChange = (e) => {
        this.promoCode = e.target.value.toUpperCase();
        this.promoError = null;
        this.promoSuccess = false;
    };
    handleApplyPromo = async () => {
        if (!this.promoCode.trim()) {
            this.promoError = 'Ingresa un código promocional';
            return;
        }
        this.isApplyingPromo = true;
        this.promoError = null;
        this.promoSuccess = false;
        try {
            cartService.storeDiscountCoupon(this.promoCode);
            const response = await cartService.getCart(this.promoCode);
            if (response.hasError) {
                this.promoError = 'Código promocional inválido';
                cartService.clearDiscountCoupon();
                return;
            }
            this.cart = response;
            this.promoSuccess = true;
            console.log('[StepOrderSummary] Promo applied successfully');
        }
        catch (err) {
            console.error('[StepOrderSummary] Promo error:', err);
            this.promoError = 'Error al aplicar el código';
            cartService.clearDiscountCoupon();
        }
        finally {
            this.isApplyingPromo = false;
        }
    };
    handleRemoveItem = async (item) => {
        this.deletingItemId = item.cartId;
        try {
            const result = await cartService.deleteItem(item.cartId, item.productId);
            if (result.hasError) {
                console.error('[StepOrderSummary] Delete error:', result.message);
                return;
            }
            await this.loadCart();
        }
        catch (err) {
            console.error('[StepOrderSummary] Error removing item:', err);
        }
        finally {
            this.deletingItemId = null;
        }
    };
    handleTermsChange = (e) => {
        this.termsAccepted = e.target.checked;
    };
    handleProceed = () => {
        if (!this.termsAccepted) {
            return;
        }
        this.onNext?.();
    };
    formatPrice(price) {
        return `$${(price || 0).toFixed(2)}`;
    }
    getItemCount() {
        return this.cart?.products?.reduce((sum, item) => sum + item.qty, 0) || 0;
    }
    // Separate equipment from plans
    // Classification logic for CLARO HOGAR flow:
    // - The API returns both equipment and plan with same flags and catalogName
    // - Key differentiators:
    //   1. catalogName === "Catalogo de Planes Fijos" (for some flows)
    //   2. installments: Equipment has > 0 (financed), Plan has === 0 (monthly service)
    //   3. plan flag or parentCartId > 0
    getEquipmentItems() {
        if (!this.cart?.products)
            return [];
        console.log('[StepOrderSummary] Classifying products...');
        return this.cart.products.filter(item => {
            // Log each item for debugging
            console.log('[StepOrderSummary] Item:', item.productName, {
                catalogName: item.catalogName,
                equipment: item.equipment,
                home: item.home,
                plan: item.plan,
                parentCartId: item.parentCartId,
                installments: item.installments,
            });
            // Check catalogName for fixed plans catalog
            if (item.catalogName === 'Catalogo de Planes Fijos') {
                console.log('[StepOrderSummary] -> PLAN (catalogName: Catalogo de Planes Fijos)');
                return false;
            }
            // If explicitly marked as plan, it's not equipment
            if (item.plan) {
                console.log('[StepOrderSummary] -> PLAN (explicit plan flag)');
                return false;
            }
            // If it has a parentCartId > 0, it's a plan linked to equipment
            if (item.parentCartId && item.parentCartId > 0) {
                console.log('[StepOrderSummary] -> PLAN (has parentCartId)');
                return false;
            }
            // TEL Logic: If home === true && internet === true, it's an internet PLAN
            if (item.home && item.internet) {
                console.log('[StepOrderSummary] -> PLAN (home + internet flags)');
                return false;
            }
            // CLARO HOGAR heuristic: Equipment has financing (installments > 0)
            if (item.home && item.installments > 0) {
                console.log('[StepOrderSummary] -> EQUIPMENT (home with installments)');
                return true;
            }
            // CLARO HOGAR heuristic: No installments = monthly plan (not equipment)
            if (item.home && (!item.installments || item.installments === 0)) {
                console.log('[StepOrderSummary] -> PLAN (home without installments = monthly plan)');
                return false;
            }
            // Regular equipment (phones, accessories, etc.)
            if (item.equipment || item.accesory) {
                console.log('[StepOrderSummary] -> EQUIPMENT');
                return true;
            }
            console.log('[StepOrderSummary] -> UNKNOWN (not classified)');
            return false;
        });
    }
    getPlanItems() {
        if (!this.cart?.products)
            return [];
        return this.cart.products.filter(item => {
            // Check catalogName for fixed plans catalog
            if (item.catalogName === 'Catalogo de Planes Fijos')
                return true;
            // Explicit plan flag
            if (item.plan)
                return true;
            // If it has a parentCartId > 0, it's a plan linked to equipment
            if (item.parentCartId && item.parentCartId > 0)
                return true;
            // TEL Logic: If home === true && internet === true, it's an internet PLAN
            if (item.home && item.internet)
                return true;
            // CLARO HOGAR heuristic: home=true without installments = monthly internet plan
            if (item.home && (!item.installments || item.installments === 0))
                return true;
            return false;
        });
    }
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderEquipmentItem(item, index) {
        const isDeleting = this.deletingItemId === item.cartId;
        const planItem = this.getPlanItems().find(p => p.parentCartId === item.cartId);
        return (h("div", { class: "product-card", key: `equip-${item.cartId}` }, h("div", { class: "section-header section-header--equipment" }, h("div", { class: "section-header__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" }), h("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" }))), h("div", { class: "section-header__text" }, h("span", { class: "section-header__label" }, "EQUIPO"), index === 0 && h("span", { class: "section-header__badge" }, "Principal"))), h("div", { class: "product-card__main" }, h("div", { class: "product-card__image" }, h("img", { src: item.imgUrl || item.detailImage || '/assets/placeholder.png', alt: item.productName, onError: (e) => e.target.src = '/assets/placeholder.png' })), h("div", { class: "product-card__details" }, h("h3", { class: "product-name" }, item.productName), h("div", { class: "product-specs" }, item.colorName && (h("div", { class: "spec-item" }, h("span", { class: "color-circle", style: { backgroundColor: item.webColor || '#ccc' } }), h("span", { class: "spec-label" }, item.colorName))), item.storageName && item.storage && (h("div", { class: "spec-item" }, h("span", { class: "storage-badge" }, item.storage, "GB"))), h("div", { class: "spec-item" }, h("span", { class: "qty-label" }, "Cant: ", item.qty))), item.installments > 1 && (h("div", { class: "financing-info" }, h("span", { class: "financing-label" }, "Financiamiento de Equipo:"), h("span", { class: "financing-detail" }, "T\u00E9rmino de pago (", item.installments, " meses)")))), h("div", { class: "product-card__pricing" }, item.installments > 1 ? (h("div", { class: "price-financing" }, h("span", { class: "price-monthly" }, this.formatPrice(item.decTotalPerMonth || item.decPrice)), h("span", { class: "price-period" }, "/mes"))) : (h("div", { class: "price-single" }, h("span", { class: "price-total" }, this.formatPrice(item.decTotalPrice || item.decPrice))))), h("div", { class: "product-card__actions" }, h("button", { class: "btn-action btn-action--delete", onClick: () => this.handleRemoveItem(item), disabled: isDeleting, title: "Eliminar" }, isDeleting ? (h("span", { class: "spinner-small" })) : (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" }), h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), h("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))))), planItem && this.renderAssociatedPlan(planItem)));
    }
    renderAssociatedPlan(plan) {
        const isDeleting = this.deletingItemId === plan.cartId;
        return (h("div", { class: "plan-section" }, h("div", { class: "section-header section-header--plan" }, h("div", { class: "section-header__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }))), h("div", { class: "section-header__text" }, h("span", { class: "section-header__label" }, "TU PLAN"))), h("div", { class: "plan-section__content" }, h("div", { class: "plan-info" }, h("span", { class: "plan-name" }, plan.productName), h("span", { class: "plan-type" }, "Plan de Internet")), h("div", { class: "plan-price" }, h("span", { class: "price" }, this.formatPrice(plan.decPrice || plan.decTotalPerMonth)), h("span", { class: "period" }, "/mes")), h("button", { class: "btn-action btn-action--delete-small", onClick: () => this.handleRemoveItem(plan), disabled: isDeleting, title: "Eliminar plan" }, isDeleting ? (h("span", { class: "spinner-small" })) : (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })))))));
    }
    renderStandalonePlan(plan) {
        const isDeleting = this.deletingItemId === plan.cartId;
        return (h("div", { class: "product-card product-card--plan", key: `plan-${plan.cartId}` }, h("div", { class: "section-header section-header--plan" }, h("div", { class: "section-header__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }))), h("div", { class: "section-header__text" }, h("span", { class: "section-header__label" }, "PLAN DE INTERNET"))), h("div", { class: "product-card__main product-card__main--plan" }, h("div", { class: "product-card__image product-card__image--plan" }, h("img", { src: plan.imgUrl || plan.detailImage || '/assets/placeholder.png', alt: plan.productName, onError: (e) => e.target.src = '/assets/placeholder.png' })), h("div", { class: "product-card__details" }, h("h3", { class: "product-name" }, plan.productName), h("span", { class: "plan-type" }, "Renta mensual")), h("div", { class: "product-card__pricing" }, h("div", { class: "price-financing" }, h("span", { class: "price-monthly" }, this.formatPrice(plan.decPrice || plan.decTotalPerMonth)), h("span", { class: "price-period" }, "/mes"))), h("div", { class: "product-card__actions" }, h("button", { class: "btn-action btn-action--delete", onClick: () => this.handleRemoveItem(plan), disabled: isDeleting, title: "Eliminar" }, isDeleting ? (h("span", { class: "spinner-small" })) : (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" }))))))));
    }
    renderPromoCode() {
        return (h("div", { class: "summary-card promo-section" }, h("h4", { class: "summary-card__title" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" }), h("line", { x1: "7", y1: "7", x2: "7.01", y2: "7" })), "Cup\u00F3n de descuento"), h("div", { class: "promo-input-group" }, h("input", { type: "text", class: {
                'promo-input': true,
                'error': !!this.promoError,
                'success': this.promoSuccess,
            }, placeholder: "Ingresa tu c\u00F3digo", value: this.promoCode, onInput: this.handlePromoCodeChange, disabled: this.isApplyingPromo }), h("button", { class: "promo-button", onClick: this.handleApplyPromo, disabled: this.isApplyingPromo || !this.promoCode.trim() }, this.isApplyingPromo ? (h("span", { class: "spinner-small" })) : ('Aplicar'))), this.promoError && (h("span", { class: "promo-message error" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("line", { x1: "12", y1: "8", x2: "12", y2: "12", stroke: "white", "stroke-width": "2" }), h("line", { x1: "12", y1: "16", x2: "12.01", y2: "16", stroke: "white", "stroke-width": "2" })), this.promoError)), this.promoSuccess && (h("span", { class: "promo-message success" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("polyline", { points: "9 12 11 14 15 10", fill: "none", stroke: "white", "stroke-width": "2" })), "\u00A1Cup\u00F3n aplicado!"))));
    }
    renderPaymentSummary() {
        if (!this.cart)
            return null;
        const monthlyRent = this.cart.subTotalPerMonth || 0;
        const subtotal = this.cart.subTotalPrice || 0;
        const tax = this.cart.totalTax || 0;
        const total = this.cart.totalPrice || 0;
        const downPayment = this.cart.totalDownPayment || 0;
        // Discount is calculated from promo code application (stored locally if applied)
        const discount = 0; // Will be calculated when promo system is fully integrated
        return (h("div", { class: "summary-card payment-summary" }, monthlyRent > 0 && (h("div", { class: "rent-section" }, h("div", { class: "rent-row" }, h("span", { class: "rent-label" }, "Renta mensual"), h("span", { class: "rent-value" }, this.formatPrice(monthlyRent))), h("p", { class: "rent-note" }, "*No incluye cargos estatales y federales"))), h("div", { class: "payment-breakdown" }, h("h4", { class: "summary-card__title" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { x: "1", y: "4", width: "22", height: "16", rx: "2", ry: "2" }), h("line", { x1: "1", y1: "10", x2: "23", y2: "10" })), "Detalle del pago"), h("div", { class: "detail-rows" }, subtotal > 0 && (h("div", { class: "detail-row" }, h("span", { class: "label" }, "Subtotal equipos"), h("span", { class: "value" }, this.formatPrice(subtotal)))), downPayment > 0 && (h("div", { class: "detail-row" }, h("span", { class: "label" }, "Pago inicial"), h("span", { class: "value" }, this.formatPrice(downPayment)))), discount > 0 && (h("div", { class: "detail-row detail-row--discount" }, h("span", { class: "label" }, "Descuento aplicado"), h("span", { class: "value" }, "-", this.formatPrice(discount)))), h("div", { class: "detail-row" }, h("span", { class: "label" }, "Cargos estatales y federales"), h("span", { class: "value" }, this.formatPrice(tax))), h("div", { class: "detail-row detail-row--shipping" }, h("span", { class: "label" }, "Costo de env\u00EDo"), h("span", { class: "value value--free" }, "GRATIS"))), h("div", { class: "total-section" }, h("div", { class: "total-row" }, h("span", { class: "total-label" }, "Paga hoy"), h("span", { class: "total-value" }, this.formatPrice(total)))))));
    }
    renderTermsCheckbox() {
        return (h("div", { class: "terms-section" }, h("label", { class: "terms-checkbox" }, h("input", { type: "checkbox", checked: this.termsAccepted, onChange: this.handleTermsChange }), h("span", { class: "checkmark" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3" }, h("polyline", { points: "20 6 9 17 4 12" }))), h("span", { class: "terms-text" }, "Acepto los ", h("a", { href: "#", onClick: (e) => e.preventDefault() }, "t\u00E9rminos y condiciones"), " de Claro Puerto Rico"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const itemCount = this.getItemCount();
        const hasItems = itemCount > 0;
        const canProceed = hasItems && this.termsAccepted;
        const equipmentItems = this.getEquipmentItems();
        const standalonePlans = this.getPlanItems().filter(p => !p.parentCartId);
        return (h(Host, { key: 'b2ec1785f21c9c35b36fa6d31fbdeb11b464e65e' }, h("div", { key: 'cb552177b74f1d602fa93bc610a13ce6af52805c', class: "step-order-summary" }, h("header", { key: 'b5a697e1f6808e66f3760e9299f84f2801430d78', class: "header" }, h("button", { key: 'e84200d29c18faa843ff384f221109d64bbc060c', class: "btn-back", onClick: this.onBack }, h("svg", { key: '2e28625d7070d769288d746b61b97a2e17cb7ec0', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: '1968e8385d820f5df38b704fc2abab5a01e96aff', d: "M19 12H5M12 19l-7-7 7-7" })), h("span", { key: 'fedeeef4a8b1b5b6927204312fa8625a239aafe1' }, "Regresar")), h("div", { key: '2917ed4718750946ff43203dadfd9961cf5b1a4a', class: "header__title-group" }, h("h1", { key: '93acee9959cb3b1a7bd946f33652cbaed97443b6', class: "title" }, "Resumen de tu orden"), hasItems && (h("span", { key: 'de58f045d7e22dc3502a648ebb6ca656c87e7140', class: "item-count" }, itemCount, " ", itemCount === 1 ? 'artículo' : 'artículos')))), this.isLoading && (h("div", { key: 'b9d96c48dd5107970a60042eff947178972e5934', class: "state-container" }, h("div", { key: '1438994b11f2b9c7713d73919fc989fd676eece0', class: "spinner" }), h("p", { key: '37d9e18591aa01629b3786a3ebd1d78f2f81e844' }, "Cargando tu carrito..."))), this.error && !this.isLoading && (h("div", { key: 'd221c3774f1b8cc8481234e54121204ef7f6adfc', class: "state-container state-container--error" }, h("svg", { key: 'bbd743f12e5598ab679be1b627cea45c4c03e005', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("circle", { key: '51afad1d3b42c205b80682c33f03e177ccf09e5d', cx: "12", cy: "12", r: "10" }), h("line", { key: '70d5483837636b118c28a3b6256cf0bd53ea6b88', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: 'c8c297af492a18cc059ef5c52b20afb40c3db396', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("p", { key: '11e2a19b976f00746334045d6dd079cb92d97361' }, this.error), h("button", { key: '84d00069547fc6f0e1c772258d857a8a70c0a5e3', class: "btn-retry", onClick: () => this.loadCart() }, "Reintentar"))), !this.isLoading && !this.error && !hasItems && (h("div", { key: 'bb41c96c5d54c70e0f1c92523bef00850623a2e5', class: "state-container state-container--empty" }, h("svg", { key: '25aa0769197935f67437e699d9144813cb58bbd3', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("circle", { key: '786409612f5171f0cd305e024b489cf9bbb2b3ec', cx: "9", cy: "21", r: "1" }), h("circle", { key: 'be250ebcd4c603e36e0e3cc239442447dccc9261', cx: "20", cy: "21", r: "1" }), h("path", { key: '258da867de0fb9195c37c68a7a0ea626560e68a9', d: "M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" })), h("h3", { key: '17d340458d0ed2a1de566a9fe82096c989d61724' }, "Tu carrito est\u00E1 vac\u00EDo"), h("p", { key: 'fa0891a2a328e4b6454369c4117028a7f69ef6b5' }, "Agrega productos para continuar con tu compra"), h("button", { key: '50e70ea224a3fbb8b7ea69ce724f32de3409652c', class: "btn-back-catalog", onClick: this.onBack }, "Ir al cat\u00E1logo"))), !this.isLoading && !this.error && hasItems && (h("div", { key: '32a5153e90bfab74638ff32a0eeea5a13d156245', class: "content-layout" }, h("div", { key: 'b32b4be6317516469e68afeb2a9cd9c988c8dd23', class: "products-column" }, equipmentItems.map((item, index) => this.renderEquipmentItem(item, index)), standalonePlans.map(plan => this.renderStandalonePlan(plan))), h("div", { key: '5a008f064bf26b937d616d2e33c612f75c91a953', class: "summary-column" }, this.renderPromoCode(), this.renderPaymentSummary(), this.renderTermsCheckbox(), h("button", { key: '1c95698ad466dd20c8099bd8e300716be4210266', class: {
                'btn-proceed': true,
                'disabled': !canProceed,
            }, onClick: this.handleProceed, disabled: !canProceed }, h("span", { key: '07865808884448a3309c11e038fe73e8db8bd800' }, "Procesar orden"), h("svg", { key: '0b892573558db7582e4892774feefce1ac757cd5', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: '753d264532f2ceecc53707e40a1c5edd9c72f08e', d: "M5 12h14M12 5l7 7-7 7" })))))))));
    }
    static get is() { return "step-order-summary"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-order-summary.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-order-summary.css"]
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
            "cart": {},
            "isLoading": {},
            "error": {},
            "promoCode": {},
            "isApplyingPromo": {},
            "promoError": {},
            "promoSuccess": {},
            "termsAccepted": {},
            "deletingItemId": {}
        };
    }
}
//# sourceMappingURL=step-order-summary.js.map
