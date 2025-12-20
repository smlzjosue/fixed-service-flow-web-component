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
        return (h(Host, { key: '3b5f35cdfc65071e8812f2fed7ee34235d79f286' }, h("div", { key: '965c768228db89a86b0750530448f181e4c2df2c', class: "step-plans" }, h("header", { key: 'd25edd634609f7b234b7fae6eb240d296b015593', class: "step-plans__header" }, h("h1", { key: 'b1a105e2c2bbb544b4daab329c6912087cf62704', class: "step-plans__title" }, "Elige tu plan"), h("button", { key: '6ef1b13c36060d6fdb88a9cb58b723d99dc369f5', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (h("div", { key: '15df9d2b0979776f1a4b955fc24c6ea0d104dc62', class: "step-plans__loading" }, h("div", { key: 'da32e48865d242ac96eb417c9ca73c62c8d553fc', class: "step-plans__spinner" }), h("p", { key: '65718e3a2daf46185c69beb8904daf5738fbd271' }, "Cargando planes..."))), this.error && (h("div", { key: 'caaeda8da6c56994f58bb9ffe6330ea90ba8dd98', class: "step-plans__error" }, h("p", { key: '53dc7b6ebef2312749c01822d0a6fbfe800b0674' }, this.error), h("button", { key: '1aed81ca60266a511e186b474a373e5ba8ab551b', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: 'aa59736d6519793c9d996640e983f2d506faf44c', class: "step-plans__carousel-container" }, h("ui-carousel", { key: '773cd7419cdc06d666b4758a9646937f536a6c23', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: 'dfa93f76c6c720dba90390847c289252d9b1a5d0', class: "step-plans__empty" }, h("p", { key: 'df6e96c8d5569bb09dc5953488b648c4d425e862' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: '8585e64071fbc151e90f9a383c66ba7c3f12a336', class: "step-plans__footer" }, h("div", { key: 'e105849c2d79c498031df5288a333be5a41f952c', class: "step-plans__footer-left" }, h("div", { key: 'eddebc80cd3fd9e7f15c2aa805d754ef1a17a5f9', class: "step-plans__footer-info" }, h("div", { key: 'f328fe8e1cdd693d62c9163abe19cd324bcd38af', class: "step-plans__footer-item" }, h("span", { key: 'e4b50fde1732f99b35223798c7c74a8942546269', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: '69c4b91dfbe16817d57b7e426a1ea232a646e70b', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '3828030feced42fb91ea1fb0b58f0487c0a8fa7a', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '2290f459bf81380569c371108abc6f3b32f6e5ff', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '32965be558fb02cef1fc19f583ca69c8641d3a74', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: '8c5f8fcb67526111c82893455f4d39965e1baeee', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: '545ccea3208a4968bb8ab903e880262407202612', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
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
