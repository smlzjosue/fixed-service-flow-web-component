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
    /**
     * Gets the service type label for display in header
     * Shows (GPON) or (VRAD) for standard flows
     */
    getServiceTypeLabel() {
        const serviceType = flowState.location?.serviceType?.toUpperCase();
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
