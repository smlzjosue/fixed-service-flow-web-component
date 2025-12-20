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
        return (h(Host, { key: 'f3078779259454151b63caefbeebeb148f5732a8' }, h("div", { key: 'a09063862b6280f45f2d5d305ddcd640012bd4b1', class: "step-order-summary" }, h("header", { key: 'f0ca8385aa82fdda838145443541d7e65f6e4c1f', class: "header" }, h("button", { key: 'c3558e8d2c0db9f9af21e711ac6f428a4a49acd6', class: "btn-back", onClick: this.onBack }, h("svg", { key: '28558bb462310b7a6a23608c7467a9e8ce2ea3b2', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'd645c1e278c6cbab619f67818675df71827ac33d', d: "M19 12H5M12 19l-7-7 7-7" })), h("span", { key: 'af0c12aaec5c0221556e2b3b094a82741540417c' }, "Regresar")), h("div", { key: 'e6802e1f9159a00dd01c547d958bb5279838bc78', class: "header__title-group" }, h("h1", { key: '0ab7ef82ad47d7664b31cf24a945a88fd4cbdedf', class: "title" }, "Resumen de tu orden"), hasItems && (h("span", { key: '57bcf4371865e75eabce8a4da2f4bc5598a1cf43', class: "item-count" }, itemCount, " ", itemCount === 1 ? 'artículo' : 'artículos')))), this.isLoading && (h("div", { key: 'e8ec7673aa7331762e22728e12987534ee0b3f37', class: "state-container" }, h("div", { key: '976f03187aeb44f5f3eae498c8df312f477069c7', class: "spinner" }), h("p", { key: '5a06e8d94acabbcf0833472cd8cb37a1617e8db6' }, "Cargando tu carrito..."))), this.error && !this.isLoading && (h("div", { key: 'bc0914b1ab30fc1f57b2045467b3dcac859c0300', class: "state-container state-container--error" }, h("svg", { key: '8b855cfe9c88ee6b8fc2dd84a8f4c07664115022', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("circle", { key: 'f6356ee719d4c1f3c06c05dbf2b7205fde228b0b', cx: "12", cy: "12", r: "10" }), h("line", { key: '5e5aedc072e5199916363ada43e233ae9b85f015', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: '6c03cd384b149c328b299d589ef78afdb360a403', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("p", { key: '9a0f64eda564cc5ff6fd67d1aa5261704e30f2e2' }, this.error), h("button", { key: '9256deb1eb125209c379b3049da7cc608dcbf9a8', class: "btn-retry", onClick: () => this.loadCart() }, "Reintentar"))), !this.isLoading && !this.error && !hasItems && (h("div", { key: '6956c7ac65ace723f08e25acba5f9dc8367f8656', class: "state-container state-container--empty" }, h("svg", { key: '15a42e13d01378aa83d52fff595b95608ee86960', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("circle", { key: '9b6f07f084390e8cbefdbca9d864d0395d192025', cx: "9", cy: "21", r: "1" }), h("circle", { key: '6db62811ec31fd409b01506226fa69419d01d1d5', cx: "20", cy: "21", r: "1" }), h("path", { key: 'c68a17a366dd168222b0e22b0d13e24ddc7c7a6d', d: "M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" })), h("h3", { key: 'f32baa1ad21d0726fe5142cb94c0e3814310ad90' }, "Tu carrito est\u00E1 vac\u00EDo"), h("p", { key: '3aa024bce7c2236936f10f81ffcefa23fca6fdca' }, "Agrega productos para continuar con tu compra"), h("button", { key: '6e9d8620d8b5c871102931f64da36ccb0854ef16', class: "btn-back-catalog", onClick: this.onBack }, "Ir al cat\u00E1logo"))), !this.isLoading && !this.error && hasItems && (h("div", { key: '40c508f97742927150f8b5b3d5119d2eb9d033bc', class: "content-layout" }, h("div", { key: 'abcdc24817a266417a2860d1d4e55d2d7171567b', class: "products-column" }, equipmentItems.map((item, index) => this.renderEquipmentItem(item, index)), standalonePlans.map(plan => this.renderStandalonePlan(plan))), h("div", { key: '6aa4ab795217930bdd493fec770503f4eba7fe5b', class: "summary-column" }, this.renderPromoCode(), this.renderPaymentSummary(), this.renderTermsCheckbox(), h("button", { key: 'a55359ecc577a012268835e3813ebcd5f76ba925', class: {
                'btn-proceed': true,
                'disabled': !canProceed,
            }, onClick: this.handleProceed, disabled: !canProceed }, h("span", { key: '28a482c024ac541c6e6925586a0ce2071b4adeea' }, "Procesar orden"), h("svg", { key: '5c28b25c13af19eac07b61a4ac3d62aa1db177cd', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: '4bdd38dee0876c05542c2b23ddd8c0e7125d6add', d: "M5 12h14M12 5l7 7-7 7" })))))))));
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
