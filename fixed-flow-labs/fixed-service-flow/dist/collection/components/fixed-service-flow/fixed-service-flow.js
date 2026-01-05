// ============================================
// FIXED SERVICE FLOW - Main Orchestrator Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../store/flow.store";
import { httpService, tokenService } from "../../services";
/**
 * CLARO HOGAR step names for clarity
 * New simplified flow: Location → Catalogue → Plans → Contract → Form → Confirmation
 * (step-product-detail eliminated - products shown in carousel with summary bar)
 */
const CLARO_HOGAR_STEPS = {
    LOCATION: 1, // Ubicación/Cobertura
    CATALOGUE: 2, // Catálogo de productos (carrusel + summary bar)
    PLANS: 3, // Planes de internet
    CONTRACT: 4, // Tipo de contrato
    FORM: 5, // Formulario de datos
    CONFIRMATION: 6, // Confirmación
};
// Max step per flow type
const MAX_STEP_STANDARD = 5;
const MAX_STEP_CLARO_HOGAR = 6;
export class FixedServiceFlow {
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
        const serviceType = flowState.location?.serviceType?.toUpperCase();
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
     * Renders steps for CLARO HOGAR Flow (simplified)
     * Steps: 1.Location -> 2.Catalogue (carousel+summary) -> 3.Plans ->
     *        4.Contract -> 5.Form -> 6.Confirmation
     * Note: step-product-detail was eliminated - products now in carousel with inline selection
     */
    renderClaroHogarStep(stepProps) {
        switch (this.currentStep) {
            case CLARO_HOGAR_STEPS.LOCATION:
                return h("step-location", { ...stepProps });
            case CLARO_HOGAR_STEPS.CATALOGUE:
                // Carousel with product cards + summary bar (new design)
                return h("step-catalogue", { ...stepProps });
            case CLARO_HOGAR_STEPS.PLANS:
                // Plans for the selected modem/product
                return h("step-plans", { ...stepProps });
            case CLARO_HOGAR_STEPS.CONTRACT:
                return h("step-contract", { ...stepProps });
            case CLARO_HOGAR_STEPS.FORM:
                return h("step-form", { ...stepProps });
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
    static get is() { return "fixed-service-flow"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["fixed-service-flow.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["fixed-service-flow.css"]
        };
    }
    static get properties() {
        return {
            "apiUrl": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Base URL for the API"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "api-url"
            },
            "googleMapsKey": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Google Maps API Key"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "google-maps-key"
            },
            "correlationId": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Optional correlation ID for tracking"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "correlation-id"
            },
            "initialStep": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "FlowStep",
                    "resolved": "1 | 2 | 3 | 4 | 5 | 6 | 7 | 8",
                    "references": {
                        "FlowStep": {
                            "location": "import",
                            "path": "../../store/interfaces",
                            "id": "src/store/interfaces.ts::FlowStep"
                        }
                    }
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Initial step (default: 1)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "initial-step",
                "defaultValue": "1"
            },
            "debug": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Debug mode"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "debug",
                "defaultValue": "false"
            }
        };
    }
    static get states() {
        return {
            "currentStep": {},
            "isLoading": {},
            "error": {},
            "isInitialized": {}
        };
    }
    static get events() {
        return [{
                "method": "flowComplete",
                "name": "flowComplete",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when the flow completes successfully"
                },
                "complexType": {
                    "original": "FlowCompleteEvent",
                    "resolved": "FlowCompleteEvent",
                    "references": {
                        "FlowCompleteEvent": {
                            "location": "import",
                            "path": "../../store/interfaces",
                            "id": "src/store/interfaces.ts::FlowCompleteEvent"
                        }
                    }
                }
            }, {
                "method": "flowError",
                "name": "flowError",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when an error occurs"
                },
                "complexType": {
                    "original": "FlowErrorEvent",
                    "resolved": "FlowErrorEvent",
                    "references": {
                        "FlowErrorEvent": {
                            "location": "import",
                            "path": "../../store/interfaces",
                            "id": "src/store/interfaces.ts::FlowErrorEvent"
                        }
                    }
                }
            }, {
                "method": "flowCancel",
                "name": "flowCancel",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when user cancels the flow"
                },
                "complexType": {
                    "original": "void",
                    "resolved": "void",
                    "references": {}
                }
            }, {
                "method": "stepChange",
                "name": "stepChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when step changes"
                },
                "complexType": {
                    "original": "StepChangeEvent",
                    "resolved": "StepChangeEvent",
                    "references": {
                        "StepChangeEvent": {
                            "location": "import",
                            "path": "../../store/interfaces",
                            "id": "src/store/interfaces.ts::StepChangeEvent"
                        }
                    }
                }
            }];
    }
    static get watchers() {
        return [{
                "propName": "apiUrl",
                "methodName": "handleApiUrlChange"
            }];
    }
}
//# sourceMappingURL=fixed-service-flow.js.map
