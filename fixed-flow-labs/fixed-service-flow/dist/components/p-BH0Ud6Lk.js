import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { f as flowActions, s as state } from './p-Dom6fCh6.js';
import { p as plansService } from './p-C4oZsJNC.js';
import { p as productService } from './p-1Ac0e39s.js';
import { f as formatPrice } from './p-C5fd-Qsk.js';
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
        return (h(Host, { key: '34415fdf7adb297e19ec23088ff3a18c0dad752d' }, h("div", { key: '01a17e6dfdf182be2e91948dd41cc7e8cdebdbed', class: "step-plans" }, h("header", { key: '1b2878eced9e68c6e4bdfe41b62f23d18af32ed6', class: "step-plans__header" }, h("h1", { key: '43fcc4ec973e63948086d8df50bc0e4375d942d0', class: "step-plans__title" }, "Elige tu plan"), h("button", { key: 'cdf623d6c3fa87308e953a11633ff824c17787d6', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (h("div", { key: '1063f032dace3e9a201c924026e58a0721fa3bff', class: "step-plans__loading" }, h("div", { key: '8ec36dd95782b585185d6aab76a0aea0a3d395b4', class: "step-plans__spinner" }), h("p", { key: 'b69b09cd82b4b1553b2f53e7b1e4dcfdb0425dab' }, "Cargando planes..."))), this.error && (h("div", { key: '5c9f07f02dd42c73db057def4696fc5e7094f892', class: "step-plans__error" }, h("p", { key: '297ce470626c998458513731f8e7f886e7b4c07b' }, this.error), h("button", { key: '8eeb4f9e22d9cccde344af09444c3e60c81161d8', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: 'eb7511e871ba573950643455f98d98537383018a', class: "step-plans__carousel-container" }, h("ui-carousel", { key: 'd0125b09b6926ac69eda3bbb2891b4aee5634bc2', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: '8964acaed4e35d38baed0e8e7382221278086493', class: "step-plans__empty" }, h("p", { key: 'efaadbf685e9dfb551848bc6ddcd8110fb451740' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'f9148a21e40798c573876ca0a1eb4277d837bc53', class: "step-plans__footer" }, h("div", { key: 'df04a8b4b6e39c1e960fc972d05961c62a7391e4', class: "step-plans__footer-left" }, h("div", { key: 'e83bdfd77bd8c242d903d29009962c2fd9db2cb7', class: "step-plans__footer-info" }, h("div", { key: 'd7d9dc8fab38bba5b3012157df8cb2382744e6bf', class: "step-plans__footer-item" }, h("span", { key: '6a254189a1ff389fe15110480bf7d0eae6745a99', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: '625152a0ad5524c43e8e4822de708d3f78a2261b', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '4581b080ffffb7a263b5c9c09b35c71d8f210030', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '66081e71fd0eb8682645a6df58010b3ebd194c53', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '471b0051747f3e1955441684c3e4cd6b14ddf175', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: 'f33f49cd46ae1a496212c1ea03454d84d3d0e82e', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: '1d165145af48d1646d397e837171ca6196d3344e', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
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
//# sourceMappingURL=p-BH0Ud6Lk.js.map

//# sourceMappingURL=p-BH0Ud6Lk.js.map