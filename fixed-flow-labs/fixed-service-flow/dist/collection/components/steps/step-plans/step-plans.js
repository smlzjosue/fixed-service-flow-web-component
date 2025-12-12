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
        return (h(Host, { key: 'f90e6ba5821a28e4e5f983615adc5a3218868956' }, h("div", { key: '79a0c14ab238617c59f1ff5436dc6af44f3f0683', class: "step-plans" }, h("header", { key: 'b71d68973c440c41cd4592513d5d1bd6dae9c41b', class: "step-plans__header" }, h("h1", { key: '4770b64ac2afb94ca2b7b21337c55cd86bf6be7f', class: "step-plans__title" }, "Elige tu plan"), h("button", { key: '0ba38403d199f066c0944b6af089c2c51d42309e', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (h("div", { key: '5d7e90e2419441027e3d4f0fa03cc2793c79730a', class: "step-plans__loading" }, h("div", { key: 'e48d4c41ee85dece546dd6740e639070bec33753', class: "step-plans__spinner" }), h("p", { key: 'a94f566bbdade38082f07ad8e2be62b22c09935f' }, "Cargando planes..."))), this.error && (h("div", { key: '1e4324ae465f14197fdfad41df685bb5eb12e457', class: "step-plans__error" }, h("p", { key: 'b5f8f80c34c2e79ed39c306c47b768ce5620a1d3' }, this.error), h("button", { key: '64dc9be6815138ce73bdb7b3b0f7cdc4191e48e2', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: '934396bfe8daaf91fd8058b091c7213deadbfca4', class: "step-plans__carousel-container" }, h("ui-carousel", { key: '4efad9d0371be107f6e4cc53a606b3302385746e', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: 'ef83deed8110a1e7813e3519f4be6c3e71503dd7', class: "step-plans__empty" }, h("p", { key: '5e59e9a93fc9183924c55562bec1a82cf470f627' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'bb02536a909fbc93b517289a0081b4c58eb04e77', class: "step-plans__footer" }, h("div", { key: 'f07704ad52b838b02dd1aad4bd4c49790c5037ff', class: "step-plans__footer-left" }, h("div", { key: '14c7fda022c35e387cf64a7d4e9929d61c32a780', class: "step-plans__footer-info" }, h("div", { key: 'dc512c9cb011ea940939b18574ca9e7c127595be', class: "step-plans__footer-item" }, h("span", { key: '052b07f383750d4702c8afad52c261a95e2834ad', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: 'a423f3beb6240da1231f0655cf5a292ea5a94a77', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '492dbd86cb3bb898b6de245a8ceb432577b14693', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '24e67f197823f76b8c5e63b406597c52fb3c3ef3', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: 'd24c732928300a3171b5aec04aa8918c6c15d13f', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: 'c15325575b62b2019afcbe8d3725668e8cf7cf40', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: 'c448e3ec1492120118234e259513a92b981d49e0', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
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
