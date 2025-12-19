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
        return (h(Host, { key: '34415fdf7adb297e19ec23088ff3a18c0dad752d' }, h("div", { key: '01a17e6dfdf182be2e91948dd41cc7e8cdebdbed', class: "step-plans" }, h("header", { key: '1b2878eced9e68c6e4bdfe41b62f23d18af32ed6', class: "step-plans__header" }, h("h1", { key: '43fcc4ec973e63948086d8df50bc0e4375d942d0', class: "step-plans__title" }, "Elige tu plan"), h("button", { key: 'cdf623d6c3fa87308e953a11633ff824c17787d6', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (h("div", { key: '1063f032dace3e9a201c924026e58a0721fa3bff', class: "step-plans__loading" }, h("div", { key: '8ec36dd95782b585185d6aab76a0aea0a3d395b4', class: "step-plans__spinner" }), h("p", { key: 'b69b09cd82b4b1553b2f53e7b1e4dcfdb0425dab' }, "Cargando planes..."))), this.error && (h("div", { key: '5c9f07f02dd42c73db057def4696fc5e7094f892', class: "step-plans__error" }, h("p", { key: '297ce470626c998458513731f8e7f886e7b4c07b' }, this.error), h("button", { key: '8eeb4f9e22d9cccde344af09444c3e60c81161d8', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: 'eb7511e871ba573950643455f98d98537383018a', class: "step-plans__carousel-container" }, h("ui-carousel", { key: 'd0125b09b6926ac69eda3bbb2891b4aee5634bc2', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: '8964acaed4e35d38baed0e8e7382221278086493', class: "step-plans__empty" }, h("p", { key: 'efaadbf685e9dfb551848bc6ddcd8110fb451740' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'f9148a21e40798c573876ca0a1eb4277d837bc53', class: "step-plans__footer" }, h("div", { key: 'df04a8b4b6e39c1e960fc972d05961c62a7391e4', class: "step-plans__footer-left" }, h("div", { key: 'e83bdfd77bd8c242d903d29009962c2fd9db2cb7', class: "step-plans__footer-info" }, h("div", { key: 'd7d9dc8fab38bba5b3012157df8cb2382744e6bf', class: "step-plans__footer-item" }, h("span", { key: '6a254189a1ff389fe15110480bf7d0eae6745a99', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: '625152a0ad5524c43e8e4822de708d3f78a2261b', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '4581b080ffffb7a263b5c9c09b35c71d8f210030', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '66081e71fd0eb8682645a6df58010b3ebd194c53', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '471b0051747f3e1955441684c3e4cd6b14ddf175', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: 'f33f49cd46ae1a496212c1ea03454d84d3d0e82e', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: '1d165145af48d1646d397e837171ca6196d3344e', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
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
