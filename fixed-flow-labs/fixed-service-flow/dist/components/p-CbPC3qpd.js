import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import { f as flowActions, s as state } from './p-1rCYjdXc.js';
import { p as plansService } from './p-BnwnDOjS.js';
import { p as productService } from './p-CDUi1inA.js';
import { f as formatPrice } from './p-C5fd-Qsk.js';
import { d as defineCustomElement$1 } from './p-DGspzOV2.js';

const stepPlansCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-plans{width:100%;min-height:100vh;padding:1.5rem;padding-bottom:180px}@media (min-width: 768px){.step-plans{padding:2rem;padding-bottom:140px}}.step-plans__header{width:100%;background:#FFFFFF;padding:1rem 0;box-sizing:border-box}@media (max-width: 767px){.step-plans__header{padding:0.75rem 0}}.step-plans__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-plans__back-link svg{width:20px;height:20px}.step-plans__back-link:hover{opacity:0.8}.step-plans__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-plans__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-plans__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-plans__divider{margin:0 -1rem}}.step-plans__loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__spinner{width:40px;height:40px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.step-plans__error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#DA291C}.step-plans__error button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__error button:disabled{opacity:0.5;cursor:not-allowed}.step-plans__error button{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-plans__error button:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-plans__error button:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-plans__error button{margin-top:1rem}.step-plans__carousel-container{padding:1rem 0 3rem}.step-plans__empty{display:flex;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__footer{position:fixed;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;padding:0.75rem 1.5rem;z-index:200;box-shadow:0 -4px 12px rgba(0, 0, 0, 0.1);display:flex;align-items:center;justify-content:space-between}@media (max-width: 767px){.step-plans__footer{flex-direction:column;gap:0.75rem;padding:1rem}}.step-plans__footer-left{display:flex;flex-direction:column}@media (max-width: 767px){.step-plans__footer-left{width:100%}}.step-plans__footer-info{display:flex;gap:1.5rem}.step-plans__footer-item{display:flex;flex-direction:column}.step-plans__footer-item--separator{padding-left:1.5rem;border-left:1px solid #E5E5E5}.step-plans__footer-label{font-size:0.75rem;color:#666666}.step-plans__footer-value{font-size:1.25rem;font-weight:700;color:#333333}.step-plans__footer-value--highlight{color:#DA291C}.step-plans__footer-note{font-size:0.75rem;color:#808080;margin:0.25rem 0 0}.step-plans__footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__footer-btn:disabled{opacity:0.5;cursor:not-allowed}.step-plans__footer-btn{height:48px;background-color:#DA291C;color:#FFFFFF}.step-plans__footer-btn:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-plans__footer-btn:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-plans__footer-btn{min-width:160px}@media (max-width: 767px){.step-plans__footer-btn{width:100%}}.plan-card{background:#FFFFFF;border-radius:16px;border:2px solid transparent;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);overflow:hidden;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;min-height:340px}.plan-card:hover{box-shadow:0 4px 16px rgba(0, 0, 0, 0.12);transform:translateY(-2px)}.plan-card--selected{border-color:#0097A9;box-shadow:0 6px 24px rgba(0, 151, 169, 0.25)}.plan-card--processing{pointer-events:none;opacity:0.8}.plan-card__header{display:flex;justify-content:center;padding-top:0}.plan-card__name{background:#1a1a1a;color:#FFFFFF;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;padding:0.75rem 1rem;width:70%;text-align:center;border-radius:0 0 12px 12px}.plan-card__body{flex:1;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column}.plan-card__includes-label{font-size:1rem;color:#666666;margin:0 0 0.75rem;font-weight:500}.plan-card__features{list-style:none;padding:0;margin:0 0 1rem;text-align:center;flex:1}.plan-card__feature{margin-bottom:0.5rem;font-size:0.875rem;color:#333333;font-weight:600}.plan-card__feature:last-child{margin-bottom:0}.plan-card__price{font-size:1.75rem;font-weight:700;color:#0097A9;margin:1rem 0 0}.plan-card__footer{padding:1rem}.plan-card__btn{width:100%;padding:0.75rem 1rem;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;background:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.plan-card__btn:hover{background:rgba(0, 151, 169, 0.1)}.plan-card__btn--selected{background:#0097A9;color:#FFFFFF;border-color:#0097A9}.plan-card__btn--selected:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--loading{cursor:wait;opacity:0.8}.plan-card__btn:disabled{cursor:not-allowed;opacity:0.6}.plan-card__btn-loading{display:inline-flex;align-items:center;gap:0.5rem}.plan-card__btn-spinner{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

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
    /**
     * Sync lifecycle - No async operations here
     * This allows the first render to happen immediately with isLoading = true
     * showing the loader to the user
     */
    componentWillLoad() {
        // El loader ya se muestra porque isLoading = true por defecto
        // No hacer operaciones async aqui para que el render ocurra inmediatamente
    }
    /**
     * Called after first render - Safe to do async operations
     * The loader is already visible at this point
     */
    componentDidLoad() {
        // Ahora que el componente esta montado y el loader visible,
        // iniciar la carga de datos
        this.initializePlans();
    }
    /**
     * Initialize plans data - async operations after component is mounted
     */
    async initializePlans() {
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
    /**
     * Gets the service type label for display in header
     * Shows (GPON) or (VRAD) for standard flows
     */
    getServiceTypeLabel() {
        const serviceType = state.location?.serviceType?.toUpperCase();
        if (serviceType === 'GPON' || serviceType === 'VRAD') {
            return ` (${serviceType})`;
        }
        return '';
    }
    render() {
        const monthlyPayment = this.selectedPlan ? this.selectedPlan.decPrice : 0;
        const totalToday = 0;
        const serviceTypeLabel = this.getServiceTypeLabel();
        return (h(Host, { key: 'ecf1db1ef3f9e81483495c3b9586de14f222d94a' }, h("div", { key: '560163fc6f813e3147089c3bdfd288f731ab14c7', class: "step-plans" }, h("header", { key: '1384894370294a3da5ff3acac72ec92f852f318c', class: "step-plans__header" }, h("button", { key: '247577020dd526f44fd70333500847d336dc9345', class: "step-plans__back-link", onClick: this.onBack }, h("svg", { key: '0cea3cb99542bd6e2de88b42c0b5addeb1399110', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '0b8e1b8328600521193fb20d77a81c85a3aba7ee', points: "15 18 9 12 15 6" })), h("span", { key: '0aa9cf6a73d66fd469ce5e29d0fcf38cff649a6d' }, "Regresar")), h("h1", { key: 'd6a5dcc67d70e97944649e7ad420aedec00cf3f2', class: "step-plans__title" }, "Elige tu plan", serviceTypeLabel), h("div", { key: 'd3e74037bc3014ed6b86c266a203bdf17e2a127a', class: "step-plans__divider" })), this.isLoading && (h("div", { key: 'f8edc947d6635d4af2e743da6a7c963edd187b1e', class: "step-plans__loading" }, h("div", { key: '5997bcd4384af0b61953c8fd9332e99d884f4687', class: "step-plans__spinner" }), h("p", { key: '779b7f43edd0df3f701742469c6ba837072cac5d' }, "Cargando planes..."))), this.error && (h("div", { key: 'ce1f9b224afaca66c1b88c5607962f78872c391c', class: "step-plans__error" }, h("p", { key: '399d3b32d21951f8610efa22de9fe1216b6cda1e' }, this.error), h("button", { key: 'c4d64e3869742b9acf717d803c8fa430d0359bf1', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: '2876b099529efb6ca0d43e8c5152d9e126f7616e', class: "step-plans__carousel-container" }, h("ui-carousel", { key: '3c26ef5d1ea9803471dfa789583ab1e7a386c3a9', totalItems: this.plans.length, gap: 24, showNavigation: false, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: 'c21ad5352e2e72c48c45417119448485fade5805', class: "step-plans__empty" }, h("p", { key: 'e01ee7e722da8f17b698a207233ff266655aa71e' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: '88ea2f234ae81f589a8a65b66cc38cb37b702958', class: "step-plans__footer" }, h("div", { key: '21ac08d1ab7404d1e1addb7f699eb89398b49ad8', class: "step-plans__footer-left" }, h("div", { key: 'de693a69cbb99c1bae6529706ed1ce4f5cdd443d', class: "step-plans__footer-info" }, h("div", { key: 'd397c01d84893b21cbd4e880ce22101ee7528367', class: "step-plans__footer-item" }, h("span", { key: '9f18194ace853d93f3df83cdb3188b0f68d3fbf4', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: 'b76fafaf7757922d9ee12ddddfce63d5a8ec3e4b', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '862fd05d830e166d049f53ea9be07245f9ea63c7', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: 'b349c8b75b287a3ed30ac0a26293b744107e30de', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '3f195a59422154fb605d8d45b5ddcc47c071762d', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: 'f91b9b15bbba0adadbeed0a6e4c0c23222f4a10f', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: '0411a1ddc40dfbf1d9f08aa3bb4aad1bdd973e38', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
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
//# sourceMappingURL=p-CbPC3qpd.js.map

//# sourceMappingURL=p-CbPC3qpd.js.map