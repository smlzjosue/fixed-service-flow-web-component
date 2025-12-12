import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { c as cartService } from './p-Do8sEIsu.js';

const stepOrderSummaryCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-order-summary{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem;transition:color 0.2s}.header .btn-back svg{width:20px;height:20px}.header .btn-back:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.header__title-group{display:flex;align-items:center;gap:1rem;flex:1}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0}.header .item-count{font-size:0.875rem;color:#666666;background:#E5E5E5;padding:0.25rem 0.5rem;border-radius:9999px;font-weight:500}.state-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;background:white;border-radius:0.75rem;padding:2rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.state-container .state-icon{width:80px;height:80px;color:#999999;margin-bottom:1rem}.state-container h3{font-size:1.5rem;color:#4D4D4D;margin:0 0 0.5rem 0}.state-container p{color:#808080;margin:0 0 1.5rem 0}.state-container--error .state-icon{color:#DA291C}.state-container--error p{color:#DA291C}.state-container--empty .state-icon{color:#CCCCCC}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:currentColor;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.btn-retry,.btn-back-catalog{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600;transition:background 0.2s}.btn-retry:hover,.btn-back-catalog:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back-catalog{background:#0097A9}.btn-back-catalog:hover{background:rgb(0, 105.4319526627, 118)}.content-layout{display:grid;grid-template-columns:1fr 380px;gap:1.5rem}@media (max-width: 992px){.content-layout{grid-template-columns:1fr}}.products-column{display:flex;flex-direction:column;gap:1rem}.summary-column{display:flex;flex-direction:column;gap:1rem}@media (max-width: 992px){.summary-column{order:-1}}.product-card{background:white;border-radius:0.75rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);overflow:hidden}.product-card__badge{display:flex;gap:0.25rem;padding:0.5rem 1rem;background:#FAFAFA;border-bottom:1px solid #F5F5F5}.product-card__main{display:grid;grid-template-columns:100px 1fr auto auto;gap:1rem;padding:1rem;align-items:center}@media (max-width: 768px){.product-card__main{grid-template-columns:80px 1fr auto;grid-template-rows:auto auto}}.product-card__main--plan{grid-template-columns:60px 1fr auto auto}@media (max-width: 768px){.product-card__main--plan{grid-template-columns:60px 1fr auto}}.product-card__image{width:100px;height:100px;background:#FAFAFA;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;overflow:hidden}@media (max-width: 768px){.product-card__image{width:80px;height:80px}}.product-card__image img{max-width:90%;max-height:90%;object-fit:contain}.product-card__image--plan{width:60px;height:60px;background:linear-gradient(135deg, #DA291C 0%, rgb(150.2073170732, 28.25, 19.2926829268) 100%);border-radius:0.5rem}.product-card__image--plan img{filter:brightness(0) invert(1);width:40px;height:40px}.product-card__details{display:flex;flex-direction:column;gap:0.25rem}.product-card__pricing{display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem}@media (max-width: 768px){.product-card__pricing{grid-column:2/-1;flex-direction:row;justify-content:space-between;align-items:center;width:100%}}.product-card__actions{display:flex;align-items:center}.product-card--plan .product-card__main{grid-template-columns:60px 1fr auto auto}.section-header{display:flex;align-items:center;gap:0.5rem;padding:1rem 1.5rem;border-bottom:1px solid #F5F5F5}.section-header__icon{width:36px;height:36px;border-radius:0.5rem;display:flex;align-items:center;justify-content:center}.section-header__icon svg{width:20px;height:20px}.section-header__text{display:flex;align-items:center;gap:0.5rem;flex:1}.section-header__label{font-size:0.875rem;font-weight:700;letter-spacing:0.5px}.section-header__badge{font-size:0.75rem;font-weight:600;padding:2px 0.5rem;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px}.section-header--equipment{background:linear-gradient(135deg, rgba(0, 151, 169, 0.08) 0%, rgba(0, 151, 169, 0.02) 100%);border-left:4px solid #0097A9}.section-header--equipment .section-header__icon{background:#0097A9;color:white}.section-header--equipment .section-header__label{color:#0097A9}.section-header--equipment .section-header__badge{background:rgba(218, 41, 28, 0.15);color:#DA291C}.section-header--plan{background:linear-gradient(135deg, rgba(218, 41, 28, 0.08) 0%, rgba(218, 41, 28, 0.02) 100%);border-left:4px solid #DA291C}.section-header--plan .section-header__icon{background:#DA291C;color:white}.section-header--plan .section-header__label{color:#DA291C}.badge{display:inline-flex;align-items:center;padding:2px 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}.badge--equipment{background:rgba(0, 151, 169, 0.15);color:#0097A9}.badge--main{background:rgba(218, 41, 28, 0.15);color:#DA291C}.badge--plan{background:rgba(68, 175, 105, 0.15);color:#44AF69}.product-name{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0;line-height:1.3}.product-specs{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}.spec-item{display:flex;align-items:center;gap:4px}.spec-label{font-size:0.875rem;color:#666666}.plan-type{font-size:0.875rem;color:#808080}.financing-info{display:flex;flex-direction:column;gap:2px;margin-top:0.25rem;padding-top:0.25rem;border-top:1px dashed #E5E5E5}.financing-label{font-size:0.75rem;font-weight:600;color:#4D4D4D}.financing-detail{font-size:0.75rem;color:#808080}.color-circle{display:inline-block;width:16px;height:16px;border-radius:50%;border:2px solid #E5E5E5;box-shadow:inset 0 0 0 1px rgba(0, 0, 0, 0.1)}.storage-badge{display:inline-flex;align-items:center;padding:2px 0.25rem;background:#F5F5F5;border-radius:0.25rem;font-size:0.75rem;font-weight:600;color:#4D4D4D}.qty-label{font-size:0.875rem;color:#808080}.price-financing,.price-single{text-align:right}@media (max-width: 768px){.price-financing,.price-single{text-align:left}}.price-monthly{font-size:1.25rem;font-weight:700;color:#DA291C}.price-period{font-size:0.875rem;color:#808080}.price-installments{display:block;font-size:0.75rem;color:#808080;margin-top:2px}.price-total{font-size:1.25rem;font-weight:700;color:#1A1A1A}.price-full{display:flex;gap:0.25rem;font-size:0.875rem}.price-full .label{color:#808080}.price-full .value{font-weight:600;color:#4D4D4D}.btn-action{background:none;border:none;cursor:pointer;padding:0.25rem;transition:all 0.2s;display:flex;align-items:center;justify-content:center}.btn-action svg{width:20px;height:20px}.btn-action--delete{color:#999999;border-radius:0.5rem}.btn-action--delete:hover:not(:disabled){color:#DA291C;background:rgba(218, 41, 28, 0.1)}.btn-action--delete:disabled{opacity:0.5;cursor:not-allowed}.btn-action--delete-small{color:#999999}.btn-action--delete-small svg{width:16px;height:16px}.btn-action--delete-small:hover:not(:disabled){color:#DA291C}.btn-action--delete-small:disabled{opacity:0.5;cursor:not-allowed}.plan-section{border-top:none}.plan-section .section-header--plan{margin:0;border-radius:0;border-left-width:0;padding-left:calc(1.5rem + 4px);border-top:1px dashed #E5E5E5}.plan-section__content{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:linear-gradient(to right, rgba(218, 41, 28, 0.03), white)}.plan-section .plan-label{font-size:0.75rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px;font-weight:600}.plan-section .plan-info{flex:1;display:flex;flex-direction:column;gap:2px}.plan-section .plan-name{font-size:0.875rem;font-weight:600;color:#333333}.plan-section .plan-type{font-size:0.75rem;color:#808080}.plan-section .plan-price{display:flex;align-items:baseline;gap:2px}.plan-section .plan-price .price{font-size:1.25rem;font-weight:700;color:#DA291C}.plan-section .plan-price .period{font-size:0.875rem;color:#808080}.summary-card{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.summary-card__title{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px}.summary-card__title svg{width:18px;height:18px;color:#999999}.promo-section .promo-input-group{display:flex;gap:0.5rem}.promo-section .promo-input{flex:1;height:44px;border:1px solid #CCCCCC;border-radius:0.5rem;padding:0 1rem;font-size:0.875rem;transition:border-color 0.2s}.promo-section .promo-input:focus{outline:none;border-color:#0097A9}.promo-section .promo-input.error{border-color:#DA291C}.promo-section .promo-input.success{border-color:#44AF69}.promo-section .promo-input:disabled{background:#F5F5F5;cursor:not-allowed}.promo-section .promo-button{height:44px;padding:0 1.5rem;background:#E5E5E5;color:#4D4D4D;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;min-width:90px;display:flex;align-items:center;justify-content:center}.promo-section .promo-button:hover:not(:disabled){background:#CCCCCC}.promo-section .promo-button:disabled{opacity:0.5;cursor:not-allowed}.promo-section .promo-message{display:flex;align-items:center;gap:0.25rem;font-size:0.875rem;margin-top:0.5rem}.promo-section .promo-message svg{width:14px;height:14px;flex-shrink:0}.promo-section .promo-message.error{color:#DA291C}.promo-section .promo-message.success{color:#44AF69}.payment-summary{padding:0;overflow:hidden}.rent-section{background:linear-gradient(135deg, #DA291C 0%, rgb(172.8048780488, 32.5, 22.1951219512) 100%);padding:1.5rem;color:white}.rent-section .rent-row{display:flex;justify-content:space-between;align-items:center}.rent-section .rent-label{font-size:1rem;font-weight:500}.rent-section .rent-value{font-size:1.75rem;font-weight:700}.rent-section .rent-note{font-size:0.75rem;opacity:0.8;margin:0.25rem 0 0 0}.payment-breakdown{padding:1.5rem}.payment-breakdown .detail-rows{margin-bottom:1rem}.detail-row{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #F5F5F5}.detail-row:last-child{border-bottom:none}.detail-row .label{font-size:0.875rem;color:#666666}.detail-row .value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.detail-row .value--free{color:#44AF69;font-weight:700;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px}.detail-row--discount .label{color:#44AF69}.detail-row--discount .value{color:#44AF69;font-weight:600}.detail-row--shipping{background:rgba(68, 175, 105, 0.05);margin:0 -1.5rem;padding:0.5rem 1.5rem;border-bottom:none}.total-section{background:#FAFAFA;margin:0 -1.5rem -1.5rem;padding:1.5rem;border-top:2px solid #E5E5E5}.total-row{display:flex;justify-content:space-between;align-items:center}.total-label{font-size:1rem;font-weight:600;color:#1A1A1A}.total-value{font-size:1.75rem;font-weight:700;color:#DA291C}.terms-section{background:white;border-radius:0.75rem;padding:1rem 1.5rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.terms-checkbox{display:flex;align-items:flex-start;gap:0.5rem;cursor:pointer}.terms-checkbox input[type=checkbox]{display:none}.terms-checkbox .checkmark{width:22px;height:22px;border:2px solid #CCCCCC;border-radius:0.25rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;background:white}.terms-checkbox .checkmark svg{width:14px;height:14px;stroke:white;opacity:0;transition:opacity 0.2s}.terms-checkbox input[type=checkbox]:checked+.checkmark{background:#0097A9;border-color:#0097A9}.terms-checkbox input[type=checkbox]:checked+.checkmark svg{opacity:1}.terms-checkbox .terms-text{font-size:0.875rem;color:#666666;line-height:1.5}.terms-checkbox .terms-text a{color:#0097A9;text-decoration:none;font-weight:500}.terms-checkbox .terms-text a:hover{text-decoration:underline}.btn-proceed{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;height:56px;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(218, 41, 28, 0.3)}.btn-proceed svg{width:20px;height:20px;transition:transform 0.2s}.btn-proceed:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512);box-shadow:0 6px 16px rgba(218, 41, 28, 0.4)}.btn-proceed:hover:not(:disabled) svg{transform:translateX(4px)}.btn-proceed:disabled,.btn-proceed.disabled{background:#CCCCCC;box-shadow:none;cursor:not-allowed}.btn-proceed:disabled svg,.btn-proceed.disabled svg{transform:none}`;

const StepOrderSummary = /*@__PURE__*/ proxyCustomElement(class StepOrderSummary extends H {
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
        return (h("div", { class: "summary-card payment-summary" }, monthlyRent > 0 && (h("div", { class: "rent-section" }, h("div", { class: "rent-row" }, h("span", { class: "rent-label" }, "Renta mensual"), h("span", { class: "rent-value" }, this.formatPrice(monthlyRent))), h("p", { class: "rent-note" }, "*No incluye cargos estatales y federales"))), h("div", { class: "payment-breakdown" }, h("h4", { class: "summary-card__title" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { x: "1", y: "4", width: "22", height: "16", rx: "2", ry: "2" }), h("line", { x1: "1", y1: "10", x2: "23", y2: "10" })), "Detalle del pago"), h("div", { class: "detail-rows" }, subtotal > 0 && (h("div", { class: "detail-row" }, h("span", { class: "label" }, "Subtotal equipos"), h("span", { class: "value" }, this.formatPrice(subtotal)))), downPayment > 0 && (h("div", { class: "detail-row" }, h("span", { class: "label" }, "Pago inicial"), h("span", { class: "value" }, this.formatPrice(downPayment)))), discount > 0, h("div", { class: "detail-row" }, h("span", { class: "label" }, "Cargos estatales y federales"), h("span", { class: "value" }, this.formatPrice(tax))), h("div", { class: "detail-row detail-row--shipping" }, h("span", { class: "label" }, "Costo de env\u00EDo"), h("span", { class: "value value--free" }, "GRATIS"))), h("div", { class: "total-section" }, h("div", { class: "total-row" }, h("span", { class: "total-label" }, "Paga hoy"), h("span", { class: "total-value" }, this.formatPrice(total)))))));
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
    static get style() { return stepOrderSummaryCss(); }
}, [769, "step-order-summary", {
        "onNext": [16],
        "onBack": [16],
        "cart": [32],
        "isLoading": [32],
        "error": [32],
        "promoCode": [32],
        "isApplyingPromo": [32],
        "promoError": [32],
        "promoSuccess": [32],
        "termsAccepted": [32],
        "deletingItemId": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-order-summary"];
    components.forEach(tagName => { switch (tagName) {
        case "step-order-summary":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepOrderSummary);
            }
            break;
    } });
}
defineCustomElement();

export { StepOrderSummary as S, defineCustomElement as d };
//# sourceMappingURL=p-BomJLsFL.js.map

//# sourceMappingURL=p-BomJLsFL.js.map