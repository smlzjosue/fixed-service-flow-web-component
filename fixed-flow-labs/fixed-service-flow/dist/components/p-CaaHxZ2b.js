import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { f as flowActions, s as state } from './p-Dom6fCh6.js';
import { p as plansService } from './p-C4oZsJNC.js';
import { p as productService } from './p-1Ac0e39s.js';
import { a as formatPrice } from './p-jNHbU7wj.js';
import { d as defineCustomElement$1 } from './p-CW1IeDyw.js';

const stepPlansCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-plans{width:100%;min-height:100vh;padding:1.5rem;padding-bottom:180px}@media (min-width: 768px){.step-plans{padding:2rem;padding-bottom:140px}}.step-plans__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}.step-plans__title{font-size:1.5rem;font-weight:700;color:#333333;margin:0}@media (min-width: 768px){.step-plans__title{font-size:1.75rem}}.step-plans__btn-back{background:#FFFFFF;border:2px solid #0097A9;color:#0097A9;padding:0.5rem 1.5rem;border-radius:9999px;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.2s ease}.step-plans__btn-back:hover{background:#0097A9;color:#FFFFFF}.step-plans__loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__spinner{width:40px;height:40px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.step-plans__error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#DA291C}.step-plans__error button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__error button:disabled{opacity:0.5;cursor:not-allowed}.step-plans__error button{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-plans__error button:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-plans__error button:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-plans__error button{margin-top:1rem}.step-plans__carousel-container{padding:1rem 0 3rem}.step-plans__empty{display:flex;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__footer{position:fixed;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;padding:0.75rem 1.5rem;z-index:200;box-shadow:0 -4px 12px rgba(0, 0, 0, 0.1);display:flex;align-items:center;justify-content:space-between}@media (max-width: 767px){.step-plans__footer{flex-direction:column;gap:0.75rem;padding:1rem}}.step-plans__footer-left{display:flex;flex-direction:column}@media (max-width: 767px){.step-plans__footer-left{width:100%}}.step-plans__footer-info{display:flex;gap:1.5rem}.step-plans__footer-item{display:flex;flex-direction:column}.step-plans__footer-item--separator{padding-left:1.5rem;border-left:1px solid #E5E5E5}.step-plans__footer-label{font-size:0.75rem;color:#666666}.step-plans__footer-value{font-size:1.25rem;font-weight:700;color:#333333}.step-plans__footer-value--highlight{color:#DA291C}.step-plans__footer-note{font-size:0.75rem;color:#808080;margin:0.25rem 0 0}.step-plans__footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__footer-btn:disabled{opacity:0.5;cursor:not-allowed}.step-plans__footer-btn{height:48px;background-color:#DA291C;color:#FFFFFF}.step-plans__footer-btn:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-plans__footer-btn:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-plans__footer-btn{min-width:160px}@media (max-width: 767px){.step-plans__footer-btn{width:100%}}.plan-card{background:#FFFFFF;border-radius:16px;border:2px solid #0097A9;box-shadow:0 2px 12px rgba(0, 0, 0, 0.1);overflow:hidden;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;height:100%;min-height:340px}.plan-card:hover{box-shadow:0 6px 20px rgba(0, 151, 169, 0.25);transform:translateY(-2px)}.plan-card--selected{border-color:#0097A9;box-shadow:0 6px 24px rgba(0, 151, 169, 0.3)}.plan-card--processing{pointer-events:none;opacity:0.8}.plan-card__header{display:flex;justify-content:center;padding-top:0}.plan-card__name{background:#1a1a1a;color:#FFFFFF;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;padding:0.75rem 1rem;width:70%;text-align:center;border-radius:0 0 12px 12px}.plan-card__body{flex:1;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column}.plan-card__includes-label{font-size:1rem;color:#666666;margin:0 0 0.75rem;font-weight:500}.plan-card__features{list-style:none;padding:0;margin:0 0 1rem;text-align:center;flex:1}.plan-card__feature{margin-bottom:0.5rem;font-size:0.875rem;color:#333333;font-weight:600}.plan-card__feature:last-child{margin-bottom:0}.plan-card__price{font-size:1.75rem;font-weight:700;color:#0097A9;margin:1rem 0 0}.plan-card__footer{padding:1rem}.plan-card__btn{width:100%;padding:0.75rem 1rem;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;background:#0097A9;color:#FFFFFF;border:2px solid #0097A9}.plan-card__btn:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--selected{background:#0097A9;color:#FFFFFF;border-color:#0097A9}.plan-card__btn--selected:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--loading{cursor:wait;opacity:0.8}.plan-card__btn:disabled{cursor:not-allowed;opacity:0.6}.plan-card__btn-loading{display:inline-flex;align-items:center;gap:0.5rem}.plan-card__btn-spinner{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepPlans = /*@__PURE__*/ proxyCustomElement(class StepPlans extends H {
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
    plans = [];
    selectedPlan = null;
    isLoading = true;
    error = null;
    isAddingToCart = false;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentWillLoad() {
        await this.loadPlans();
        // Check if there's a previously selected plan in session
        const storedPlanId = plansService.getStoredPlanId();
        if (storedPlanId > 0) {
            const storedPlan = this.plans.find(p => p.planId === storedPlanId);
            if (storedPlan) {
                this.selectedPlan = storedPlan;
                flowActions.selectPlan(storedPlan);
            }
        }
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadPlans() {
        this.isLoading = true;
        this.error = null;
        try {
            const serviceType = state.location?.serviceType || 'GPON';
            // For CLARO HOGAR, get subcatalogId from productService (stored when product was selected)
            let catalogId = 0;
            if (serviceType === 'CLARO HOGAR') {
                // Use subcatalogId from session (set in step-catalogue when product was selected)
                catalogId = productService.getSubcatalogId();
                console.log('[StepPlans] CLARO HOGAR - using subcatalogId:', catalogId);
            }
            this.plans = await plansService.getPlans(serviceType, catalogId);
            this.plans = plansService.sortByPrice(this.plans);
        }
        catch (err) {
            this.error = 'Error al cargar los planes';
            console.error(err);
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Handles plan selection - following TEL's flow:
     * 1. Check if there's an existing different plan -> delete it
     * 2. Store plan in session
     * 3. Call addToCart API
     */
    handleSelectPlan = async (plan) => {
        // If clicking the same plan, do nothing
        if (this.selectedPlan?.planId === plan.planId) {
            return;
        }
        this.isAddingToCart = true;
        this.error = null;
        try {
            // Step 1: If there's a different plan already in cart, delete it first (TEL pattern)
            const currentPlanId = plansService.getStoredPlanId();
            const currentCartId = plansService.getCartId();
            if (currentPlanId > 0 && currentPlanId !== plan.planId && currentCartId > 0) {
                console.log('[StepPlans] Removing previous plan from cart:', currentPlanId);
                await plansService.deleteFromCart(currentCartId);
            }
            // Step 2: Add new plan to cart
            console.log('[StepPlans] Adding plan to cart:', plan.planId, plan.planName);
            await plansService.addToCart(plan);
            // Step 3: Update local state
            this.selectedPlan = plan;
            flowActions.selectPlan(plan);
            console.log('[StepPlans] Plan added successfully');
        }
        catch (err) {
            console.error('[StepPlans] Error adding plan to cart:', err);
            this.error = 'Error al agregar el plan. Por favor intente de nuevo.';
            // Still allow selection locally even if cart API fails
            // This way the user can continue the flow
            this.selectedPlan = plan;
            flowActions.selectPlan(plan);
        }
        finally {
            this.isAddingToCart = false;
        }
    };
    handleContinue = () => {
        if (this.selectedPlan && !this.isAddingToCart) {
            this.onNext?.();
        }
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderPlanCard(plan) {
        const isSelected = this.selectedPlan?.planId === plan.planId;
        const isProcessing = this.isAddingToCart && isSelected;
        const features = plansService.parsePlanFeatures(plan.planDesc || '');
        // Default features if none parsed
        const displayFeatures = features.length > 0 ? features : [
            'Internet fibra 1',
            'Internet 2',
            'Internet 3'
        ];
        return (h("div", { class: {
                'plan-card': true,
                'plan-card--selected': isSelected,
                'plan-card--processing': isProcessing,
            }, onClick: () => !this.isAddingToCart && this.handleSelectPlan(plan) }, h("div", { class: "plan-card__header" }, h("span", { class: "plan-card__name" }, plan.planName)), h("div", { class: "plan-card__body" }, h("p", { class: "plan-card__includes-label" }, "Plan incluye"), h("ul", { class: "plan-card__features" }, displayFeatures.slice(0, 4).map((feature) => (h("li", { class: "plan-card__feature" }, feature)))), h("p", { class: "plan-card__price" }, formatPrice(plan.decPrice))), h("div", { class: "plan-card__footer" }, h("button", { class: {
                'plan-card__btn': true,
                'plan-card__btn--selected': isSelected,
                'plan-card__btn--loading': isProcessing,
            }, disabled: this.isAddingToCart }, isProcessing ? (h("span", { class: "plan-card__btn-loading" }, h("span", { class: "plan-card__btn-spinner" }), "Agregando...")) : isSelected ? ('Plan seleccionado') : ('Solicitar plan')))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const monthlyPayment = this.selectedPlan ? this.selectedPlan.decPrice : 0;
        const totalToday = 0;
        return (h(Host, { key: 'f90e6ba5821a28e4e5f983615adc5a3218868956' }, h("div", { key: '79a0c14ab238617c59f1ff5436dc6af44f3f0683', class: "step-plans" }, h("header", { key: 'b71d68973c440c41cd4592513d5d1bd6dae9c41b', class: "step-plans__header" }, h("h1", { key: '4770b64ac2afb94ca2b7b21337c55cd86bf6be7f', class: "step-plans__title" }, "Elige tu plan"), h("button", { key: '0ba38403d199f066c0944b6af089c2c51d42309e', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (h("div", { key: '5d7e90e2419441027e3d4f0fa03cc2793c79730a', class: "step-plans__loading" }, h("div", { key: 'e48d4c41ee85dece546dd6740e639070bec33753', class: "step-plans__spinner" }), h("p", { key: 'a94f566bbdade38082f07ad8e2be62b22c09935f' }, "Cargando planes..."))), this.error && (h("div", { key: '1e4324ae465f14197fdfad41df685bb5eb12e457', class: "step-plans__error" }, h("p", { key: 'b5f8f80c34c2e79ed39c306c47b768ce5620a1d3' }, this.error), h("button", { key: '64dc9be6815138ce73bdb7b3b0f7cdc4191e48e2', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: '934396bfe8daaf91fd8058b091c7213deadbfca4', class: "step-plans__carousel-container" }, h("ui-carousel", { key: '4efad9d0371be107f6e4cc53a606b3302385746e', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: 'ef83deed8110a1e7813e3519f4be6c3e71503dd7', class: "step-plans__empty" }, h("p", { key: '5e59e9a93fc9183924c55562bec1a82cf470f627' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'bb02536a909fbc93b517289a0081b4c58eb04e77', class: "step-plans__footer" }, h("div", { key: 'f07704ad52b838b02dd1aad4bd4c49790c5037ff', class: "step-plans__footer-left" }, h("div", { key: '14c7fda022c35e387cf64a7d4e9929d61c32a780', class: "step-plans__footer-info" }, h("div", { key: 'dc512c9cb011ea940939b18574ca9e7c127595be', class: "step-plans__footer-item" }, h("span", { key: '052b07f383750d4702c8afad52c261a95e2834ad', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: 'a423f3beb6240da1231f0655cf5a292ea5a94a77', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '492dbd86cb3bb898b6de245a8ceb432577b14693', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '24e67f197823f76b8c5e63b406597c52fb3c3ef3', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: 'd24c732928300a3171b5aec04aa8918c6c15d13f', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: 'c15325575b62b2019afcbe8d3725668e8cf7cf40', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: 'c448e3ec1492120118234e259513a92b981d49e0', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
    }
    static get style() { return stepPlansCss(); }
}, [769, "step-plans", {
        "onNext": [16],
        "onBack": [16],
        "plans": [32],
        "selectedPlan": [32],
        "isLoading": [32],
        "error": [32],
        "isAddingToCart": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-plans", "ui-carousel"];
    components.forEach(tagName => { switch (tagName) {
        case "step-plans":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepPlans);
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

export { StepPlans as S, defineCustomElement as d };
//# sourceMappingURL=p-CaaHxZ2b.js.map

//# sourceMappingURL=p-CaaHxZ2b.js.map