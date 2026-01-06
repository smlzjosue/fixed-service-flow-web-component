// ============================================
// STEP PLANS - Plan Selection Step Component
// Fixed Service Flow Web Component
// Design based on docs/capturas/4.png + Carousel
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../../store/flow.store";
import { plansService, productService } from "../../../services";
import { formatPrice } from "../../../utils/formatters";
export class StepPlans {
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
            const serviceType = flowState.location?.serviceType || 'GPON';
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
    static get is() { return "step-plans"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-plans.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-plans.css"]
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
            "plans": {},
            "selectedPlan": {},
            "isLoading": {},
            "error": {},
            "isAddingToCart": {}
        };
    }
}
//# sourceMappingURL=step-plans.js.map
