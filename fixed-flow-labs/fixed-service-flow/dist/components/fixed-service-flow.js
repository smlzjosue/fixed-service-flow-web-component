import { t as transformTag, p as proxyCustomElement, H, c as createEvent, h, d as Host } from './p-BTqKKAHI.js';
import { f as flowActions, s as state } from './p-1rCYjdXc.js';
import { h as httpService, t as tokenService } from './p-De3C6PL0.js';
import { d as defineCustomElement$e } from './p-DCDxWAtB.js';
import { d as defineCustomElement$d } from './p-8yK5Fwj7.js';
import { d as defineCustomElement$c } from './p-CeumRbnP.js';
import { d as defineCustomElement$b } from './p-fbNVo5rD.js';
import { d as defineCustomElement$a } from './p-irO0rYQm.js';
import { d as defineCustomElement$9 } from './p-BKZPLXRT.js';
import { d as defineCustomElement$8 } from './p-BYqHZtCN.js';
import { d as defineCustomElement$7 } from './p-CBSJbTR7.js';
import { d as defineCustomElement$6 } from './p-BD1RYLUu.js';
import { d as defineCustomElement$5 } from './p-BuVoDvJ6.js';
import { d as defineCustomElement$4 } from './p-DL5swzyr.js';
import { d as defineCustomElement$3 } from './p-BaH52zdS.js';
import { d as defineCustomElement$2 } from './p-BvJldjx0.js';

const fixedServiceFlowCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;color:#333333;line-height:1.5}.fsf-container{width:100%;max-width:1200px;margin:0 auto;padding:1rem}@media (min-width: 768px){.fsf-container{padding:1.5rem}}.fsf-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:2rem}.fsf-loading__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.fsf-loading__text{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.fsf-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:2rem;text-align:center}.fsf-error__icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;font-size:1.75rem;font-weight:700;color:#FFFFFF;background-color:#DA291C;border-radius:50%}.fsf-error__title{margin-top:1rem;font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333}.fsf-error__message{margin-top:0.5rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666;max-width:400px}.fsf-error__button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.fsf-error__button:disabled{opacity:0.5;cursor:not-allowed}.fsf-error__button{height:48px;background-color:#DA291C;color:#FFFFFF}.fsf-error__button:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.fsf-error__button:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.fsf-error__button{margin-top:1.5rem}.step-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:2rem;text-align:center;background:#FFFFFF;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);margin:1rem}.step-placeholder h2{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333;margin-bottom:1rem}.step-placeholder p{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-placeholder button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-placeholder button:disabled{opacity:0.5;cursor:not-allowed}.step-placeholder button{height:48px;background-color:#DA291C;color:#FFFFFF}.step-placeholder button:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-placeholder button:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-placeholder button{margin:0.5rem}.step-placeholder button:last-child{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-placeholder button:last-child:disabled{opacity:0.5;cursor:not-allowed}.step-placeholder button:last-child{height:48px;background-color:#0097A9;color:#FFFFFF}.step-placeholder button:last-child:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-placeholder button:last-child:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;

/**
 * CLARO HOGAR step names for clarity
 */
const CLARO_HOGAR_STEPS = {
    LOCATION: 1, // Ubicación/Cobertura
    CATALOGUE: 2, // Catálogo de productos
    PRODUCT_DETAIL: 3, // Detalle del producto
    PLANS: 4, // Planes de internet
    ORDER_SUMMARY: 5, // Resumen de orden
    SHIPPING: 6, // Dirección de envío
    PAYMENT: 7, // Pago
    CONFIRMATION: 8, // Confirmación
};
// Max step per flow type
const MAX_STEP_STANDARD = 5;
const MAX_STEP_CLARO_HOGAR = 8;
const FixedServiceFlow$1 = /*@__PURE__*/ proxyCustomElement(class FixedServiceFlow extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.flowComplete = createEvent(this, "flowComplete");
        this.flowError = createEvent(this, "flowError");
        this.flowCancel = createEvent(this, "flowCancel");
        this.stepChange = createEvent(this, "stepChange");
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Base URL for the API
     */
    apiUrl;
    /**
     * Google Maps API Key
     */
    googleMapsKey;
    /**
     * Optional correlation ID for tracking
     */
    correlationId;
    /**
     * Initial step (default: 1)
     */
    initialStep = 1;
    /**
     * Debug mode
     */
    debug = false;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    currentStep = 1;
    isLoading = true;
    error = null;
    isInitialized = false;
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when the flow completes successfully
     */
    flowComplete;
    /**
     * Emitted when an error occurs
     */
    flowError;
    /**
     * Emitted when user cancels the flow
     */
    flowCancel;
    /**
     * Emitted when step changes
     */
    stepChange;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
    handleApiUrlChange(newValue) {
        if (newValue) {
            httpService.setBaseUrl(newValue);
        }
    }
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentWillLoad() {
        // Set debug mode
        if (this.debug) {
            window.__FSF_DEBUG__ = true;
        }
        // Configure HTTP service
        if (this.apiUrl) {
            httpService.setBaseUrl(this.apiUrl);
        }
        // Set initial step
        if (this.initialStep) {
            this.currentStep = this.initialStep;
            flowActions.setStep(this.initialStep);
        }
        // Initialize token
        await this.initializeToken();
    }
    componentDidLoad() {
        this.log('Component loaded');
    }
    disconnectedCallback() {
        this.log('Component disconnected');
        // Cleanup if needed
    }
    // ------------------------------------------
    // INITIALIZATION
    // ------------------------------------------
    async initializeToken() {
        this.isLoading = true;
        this.error = null;
        try {
            const success = await tokenService.initialize();
            if (!success) {
                this.error = 'Error al inicializar la sesión';
                this.emitError(new Error(this.error), false);
            }
            this.isInitialized = true;
        }
        catch (err) {
            this.error = err.message || 'Error de inicialización';
            this.emitError(err, false);
        }
        finally {
            this.isLoading = false;
        }
    }
    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    handleStepChange = (direction) => {
        const from = this.currentStep;
        const maxStep = this.isClaroHogar() ? MAX_STEP_CLARO_HOGAR : MAX_STEP_STANDARD;
        let to;
        if (direction === 'forward') {
            to = Math.min(this.currentStep + 1, maxStep);
            flowActions.nextStep();
        }
        else {
            to = Math.max(this.currentStep - 1, 1);
            flowActions.prevStep();
        }
        this.currentStep = to;
        flowActions.setStep(to);
        this.stepChange.emit({ from, to, direction });
        this.log(`Step changed: ${from} -> ${to}`);
    };
    // @ts-ignore: goToStep reserved for future use (direct step navigation)
    _goToStep = (step) => {
        const from = this.currentStep;
        const direction = step > from ? 'forward' : 'backward';
        flowActions.setStep(step);
        this.currentStep = step;
        this.stepChange.emit({ from, to: step, direction });
        this.log(`Step changed: ${from} -> ${step}`);
    };
    // ------------------------------------------
    // EVENT HANDLERS
    // ------------------------------------------
    handleFlowComplete = (event) => {
        this.log('Flow completed', event);
        this.flowComplete.emit(event);
    };
    handleFlowCancel = () => {
        this.log('Flow cancelled');
        flowActions.resetFlow();
        this.currentStep = 1;
        flowActions.setStep(1);
        this.flowCancel.emit();
    };
    emitError(error, recoverable = true) {
        this.flowError.emit({
            step: this.currentStep,
            error,
            recoverable,
        });
    }
    // ------------------------------------------
    // HELPERS
    // ------------------------------------------
    log(...args) {
        if (this.debug) {
            console.log('[FixedServiceFlow]', ...args);
        }
    }
    /**
     * Checks if the current flow is for CLARO HOGAR (wireless internet)
     */
    isClaroHogar() {
        const serviceType = state.location?.serviceType?.toUpperCase();
        return serviceType === 'CLARO HOGAR';
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    renderStep() {
        const stepProps = {
            onNext: () => this.handleStepChange('forward'),
            onBack: () => this.handleStepChange('backward'),
            onComplete: this.handleFlowComplete,
            googleMapsKey: this.googleMapsKey,
        };
        // CLARO HOGAR Flow (e-commerce)
        if (this.isClaroHogar()) {
            this.log('CLARO HOGAR flow - step:', this.currentStep);
            return this.renderClaroHogarStep(stepProps);
        }
        // Standard Flow (GPON/VRAD - internet service request)
        return this.renderStandardStep(stepProps);
    }
    /**
     * Renders steps for Standard Flow (GPON/VRAD)
     * Steps: 1.Location -> 2.Plans -> 3.Contract -> 4.Form -> 5.Confirmation
     */
    renderStandardStep(stepProps) {
        switch (this.currentStep) {
            case 1:
                return h("step-location", { ...stepProps });
            case 2:
                return h("step-plans", { ...stepProps });
            case 3:
                return h("step-contract", { ...stepProps });
            case 4:
                return h("step-form", { ...stepProps });
            case 5:
                return h("step-confirmation", { ...stepProps, onCancel: this.handleFlowCancel });
            default:
                return null;
        }
    }
    /**
     * Renders steps for CLARO HOGAR Flow (e-commerce)
     * Steps: 1.Location -> 2.Catalogue -> 3.ProductDetail -> 4.Plans ->
     *        5.OrderSummary -> 6.Shipping -> 7.Payment -> 8.Confirmation
     */
    renderClaroHogarStep(stepProps) {
        switch (this.currentStep) {
            case CLARO_HOGAR_STEPS.LOCATION:
                return h("step-location", { ...stepProps });
            case CLARO_HOGAR_STEPS.CATALOGUE:
                return h("step-catalogue", { ...stepProps });
            case CLARO_HOGAR_STEPS.PRODUCT_DETAIL:
                return h("step-product-detail", { ...stepProps });
            case CLARO_HOGAR_STEPS.PLANS:
                // Plans for the selected product
                return h("step-plans", { ...stepProps });
            case CLARO_HOGAR_STEPS.ORDER_SUMMARY:
                return h("step-order-summary", { ...stepProps });
            case CLARO_HOGAR_STEPS.SHIPPING:
                return h("step-shipping", { ...stepProps });
            case CLARO_HOGAR_STEPS.PAYMENT:
                return h("step-payment", { ...stepProps });
            case CLARO_HOGAR_STEPS.CONFIRMATION:
                return h("step-confirmation", { ...stepProps, onCancel: this.handleFlowCancel });
            default:
                return null;
        }
    }
    renderLoading() {
        return (h("div", { class: "fsf-loading" }, h("div", { class: "fsf-loading__spinner" }), h("p", { class: "fsf-loading__text" }, "Cargando...")));
    }
    renderError() {
        return (h("div", { class: "fsf-error" }, h("div", { class: "fsf-error__icon" }, "!"), h("h3", { class: "fsf-error__title" }, "Error"), h("p", { class: "fsf-error__message" }, this.error), h("button", { class: "fsf-error__button", onClick: () => this.initializeToken() }, "Reintentar")));
    }
    render() {
        // Show loading state
        if (this.isLoading) {
            return (h(Host, null, this.renderLoading()));
        }
        // Show error state
        if (this.error && !this.isInitialized) {
            return (h(Host, null, this.renderError()));
        }
        // Render flow
        return (h(Host, null, h("div", { class: "fsf-container" }, this.renderStep())));
    }
    static get watchers() { return {
        "apiUrl": ["handleApiUrlChange"]
    }; }
    static get style() { return fixedServiceFlowCss(); }
}, [769, "fixed-service-flow", {
        "apiUrl": [1, "api-url"],
        "googleMapsKey": [1, "google-maps-key"],
        "correlationId": [1, "correlation-id"],
        "initialStep": [2, "initial-step"],
        "debug": [4],
        "currentStep": [32],
        "isLoading": [32],
        "error": [32],
        "isInitialized": [32]
    }, undefined, {
        "apiUrl": ["handleApiUrlChange"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["fixed-service-flow", "step-catalogue", "step-confirmation", "step-contract", "step-form", "step-location", "step-order-summary", "step-payment", "step-plans", "step-product-detail", "step-shipping", "ui-carousel", "ui-image-carousel", "ui-stepper"];
    components.forEach(tagName => { switch (tagName) {
        case "fixed-service-flow":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), FixedServiceFlow$1);
            }
            break;
        case "step-catalogue":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$e();
            }
            break;
        case "step-confirmation":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$d();
            }
            break;
        case "step-contract":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$c();
            }
            break;
        case "step-form":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$b();
            }
            break;
        case "step-location":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$a();
            }
            break;
        case "step-order-summary":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$9();
            }
            break;
        case "step-payment":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$8();
            }
            break;
        case "step-plans":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$7();
            }
            break;
        case "step-product-detail":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$6();
            }
            break;
        case "step-shipping":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$5();
            }
            break;
        case "ui-carousel":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$4();
            }
            break;
        case "ui-image-carousel":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$3();
            }
            break;
        case "ui-stepper":
            if (!customElements.get(transformTag(tagName))) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const FixedServiceFlow = FixedServiceFlow$1;
const defineCustomElement = defineCustomElement$1;

export { FixedServiceFlow, defineCustomElement };
//# sourceMappingURL=fixed-service-flow.js.map

//# sourceMappingURL=fixed-service-flow.js.map