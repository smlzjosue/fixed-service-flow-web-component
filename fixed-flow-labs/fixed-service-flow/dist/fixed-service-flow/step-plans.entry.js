import { r as registerInstance, h, d as Host } from './index-zT41ZBSk.js';
import { f as flowActions, s as state } from './flow.store-BVgy_Tq5.js';
import { a as plansService, p as productService } from './index-2VcInuuj.js';
import { f as formatPrice } from './formatters-m-uuGiOI.js';
import './token.service-RvrPTISp.js';
import './interfaces-DIJ391iV.js';
import './cart.service-C3FR8Gpo.js';
import './shipping.service-Cs5hFbUT.js';
import './payment.service-BjkEFOi4.js';

const stepPlansCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-plans{width:100%;min-height:100vh;padding:1.5rem;padding-bottom:180px}@media (min-width: 768px){.step-plans{padding:2rem;padding-bottom:140px}}.step-plans__header{width:100%;background:#FFFFFF;padding:1rem 0;box-sizing:border-box}@media (max-width: 767px){.step-plans__header{padding:0.75rem 0}}.step-plans__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-plans__back-link svg{width:20px;height:20px}.step-plans__back-link:hover{opacity:0.8}.step-plans__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-plans__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-plans__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-plans__divider{margin:0 -1rem}}.step-plans__loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__spinner{width:40px;height:40px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.step-plans__error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#DA291C}.step-plans__error button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__error button:disabled{opacity:0.5;cursor:not-allowed}.step-plans__error button{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-plans__error button:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-plans__error button:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-plans__error button{margin-top:1rem}.step-plans__carousel-container{padding:1rem 0 3rem}.step-plans__empty{display:flex;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__footer{position:fixed;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;padding:0.75rem 1.5rem;z-index:200;box-shadow:0 -4px 12px rgba(0, 0, 0, 0.1);display:flex;align-items:center;justify-content:space-between}@media (max-width: 767px){.step-plans__footer{flex-direction:column;gap:0.75rem;padding:1rem}}.step-plans__footer-left{display:flex;flex-direction:column}@media (max-width: 767px){.step-plans__footer-left{width:100%}}.step-plans__footer-info{display:flex;gap:1.5rem}.step-plans__footer-item{display:flex;flex-direction:column}.step-plans__footer-item--separator{padding-left:1.5rem;border-left:1px solid #E5E5E5}.step-plans__footer-label{font-size:0.75rem;color:#666666}.step-plans__footer-value{font-size:1.25rem;font-weight:700;color:#333333}.step-plans__footer-value--highlight{color:#DA291C}.step-plans__footer-note{font-size:0.75rem;color:#808080;margin:0.25rem 0 0}.step-plans__footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__footer-btn:disabled{opacity:0.5;cursor:not-allowed}.step-plans__footer-btn{height:48px;background-color:#DA291C;color:#FFFFFF}.step-plans__footer-btn:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-plans__footer-btn:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-plans__footer-btn{min-width:160px}@media (max-width: 767px){.step-plans__footer-btn{width:100%}}.plan-card{background:#FFFFFF;border-radius:16px;border:2px solid transparent;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);overflow:hidden;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;min-height:340px}.plan-card:hover{box-shadow:0 4px 16px rgba(0, 0, 0, 0.12);transform:translateY(-2px)}.plan-card--selected{border-color:#0097A9;box-shadow:0 6px 24px rgba(0, 151, 169, 0.25)}.plan-card--processing{pointer-events:none;opacity:0.8}.plan-card__header{display:flex;justify-content:center;padding-top:0}.plan-card__name{background:#1a1a1a;color:#FFFFFF;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;padding:0.75rem 1rem;width:70%;text-align:center;border-radius:0 0 12px 12px}.plan-card__body{flex:1;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column}.plan-card__includes-label{font-size:1rem;color:#666666;margin:0 0 0.75rem;font-weight:500}.plan-card__features{list-style:none;padding:0;margin:0 0 1rem;text-align:center;flex:1}.plan-card__feature{margin-bottom:0.5rem;font-size:0.875rem;color:#333333;font-weight:600}.plan-card__feature:last-child{margin-bottom:0}.plan-card__price{font-size:1.75rem;font-weight:700;color:#0097A9;margin:1rem 0 0}.plan-card__footer{padding:1rem}.plan-card__btn{width:100%;padding:0.75rem 1rem;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;background:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.plan-card__btn:hover{background:rgba(0, 151, 169, 0.1)}.plan-card__btn--selected{background:#0097A9;color:#FFFFFF;border-color:#0097A9}.plan-card__btn--selected:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--loading{cursor:wait;opacity:0.8}.plan-card__btn:disabled{cursor:not-allowed;opacity:0.6}.plan-card__btn-loading{display:inline-flex;align-items:center;gap:0.5rem}.plan-card__btn-spinner{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepPlans = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h(Host, { key: '71c916044e88e63578e0093f15ddcbe0287a0449' }, h("div", { key: 'b451804ab60176a01dbe351e61a4d6699936ffba', class: "step-plans" }, h("header", { key: '3a9885fb7071d80ee8f6f60cce18c3bd67dc6fef', class: "step-plans__header" }, h("button", { key: 'ddfa2321981cd0a4468d1a5a7fa7345139ec342c', class: "step-plans__back-link", onClick: this.onBack }, h("svg", { key: 'd7b8ef58798169dea02f7ffa16085761713d60c6', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'fecc51fcec60640d6d0133cd6511a85420290544', points: "15 18 9 12 15 6" })), h("span", { key: '71e56cec810389d4c8dc6020ef018f15d9082696' }, "Regresar")), h("h1", { key: 'ff70c76faf831a80dce5e844e556614d00d8f720', class: "step-plans__title" }, "Elige tu plan"), h("div", { key: '89c8c48112081ae1cfdc1b7ac38ad08bef23ec91', class: "step-plans__divider" })), this.isLoading && (h("div", { key: 'dd3ee1883c99148424a4afb47b186d5f0c26a9cd', class: "step-plans__loading" }, h("div", { key: '1b85359c971e156c68c6ae6a26a2a0e7af96e901', class: "step-plans__spinner" }), h("p", { key: 'ed08b8a31592da0bcdf3ae373373d4c7b44977f2' }, "Cargando planes..."))), this.error && (h("div", { key: '860ef48d0c1b48b8be08565c3d3c3e166fe17bc8', class: "step-plans__error" }, h("p", { key: 'd4819934b6a45838e8112c1bcd20496554b247a4' }, this.error), h("button", { key: '85f71600e4dab0a8e29514360867aee5395a8a79', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: '92528629d3d40596f32e9c0099e7ce26f1723cb9', class: "step-plans__carousel-container" }, h("ui-carousel", { key: 'd3f02d81bd4faa661ef52ec4f098e9ed1db82775', totalItems: this.plans.length, gap: 24, showNavigation: false, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: '2e0947419e26a6d5b662fa234e1874df48a75120', class: "step-plans__empty" }, h("p", { key: 'bbe9e5d84363c6ae3ab81dc34d43d1b82b34a46b' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'b14a72d1ac25fee9325801f2019f05a5c370dd63', class: "step-plans__footer" }, h("div", { key: '1aa9e2de4ccff26772475de2478772f759b48558', class: "step-plans__footer-left" }, h("div", { key: 'b317441bffd781f7bb2ce96598615f9b2def1c44', class: "step-plans__footer-info" }, h("div", { key: 'c2bd471a1c366ea382ada43b342963c0ce226302', class: "step-plans__footer-item" }, h("span", { key: '8131b6c6794d88b03e9b18811bae54fe1d1043b1', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: 'f2a7817042d267aba146d281d871123939506e84', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '679047174259006b71821fcc208521224ef0127e', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '32deed61a01762e549679834564a3d3baafc18ae', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '5a5a62b56fc9bedacb36865cb3a4a169b2ca4415', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: '7c10e8cbcbcc334d8ae9ede73b00d9cb47212b45', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: 'd772ec9082de9536b94c7609f04e7299d2d87a17', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
    }
};
StepPlans.style = stepPlansCss();

export { StepPlans as step_plans };
//# sourceMappingURL=step-plans.entry.esm.js.map
