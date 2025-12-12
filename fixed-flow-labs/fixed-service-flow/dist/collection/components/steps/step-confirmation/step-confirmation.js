// ============================================
// STEP CONFIRMATION - Confirmation/Result Step
// Fixed Service Flow Web Component
// Supports both Internet and CLARO HOGAR catalogue flows
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../../store/flow.store";
import { requestService, paymentService, cartService, productService, shippingService, plansService } from "../../../services";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../../utils/constants";
export class StepConfirmation {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onComplete;
    onCancel;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    status = 'loading';
    orderId = null;
    orderNumber = null;
    confirmationSent = false;
    errorMessage = '';
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentWillLoad() {
        // Check if this is a catalogue flow (CLARO HOGAR) or internet flow
        // Catalogue flow: has payment result but no contract/formData
        // Internet flow: has contract and formData
        const isCatalogueFlow = this.isCatalogueFlow();
        if (isCatalogueFlow) {
            await this.handleCatalogueFlowConfirmation();
        }
        else {
            await this.submitRequest();
        }
    }
    /**
     * Determines if this is a catalogue/equipment flow (CLARO HOGAR)
     * vs an internet service flow
     */
    isCatalogueFlow() {
        // Catalogue flow has payment result stored but no contract/formData
        const paymentResult = paymentService.getPaymentResult();
        const hasContract = !!flowState.selectedContract;
        const hasFormData = !!flowState.formData;
        // If we have payment result but no contract/formData, it's catalogue flow
        return !!paymentResult && !hasContract && !hasFormData;
    }
    /**
     * Handles confirmation for catalogue/equipment flow (CLARO HOGAR)
     * The purchase is already complete after payment - just show success
     */
    async handleCatalogueFlowConfirmation() {
        this.status = 'loading';
        try {
            const paymentResult = paymentService.getPaymentResult();
            if (!paymentResult || !paymentResult.success) {
                throw new Error('No se encontró información del pago');
            }
            // Get order BAN from payment service
            const orderBan = paymentService.getOrderBan();
            // For catalogue flow, the orderId comes from the payment process
            this.orderId = orderBan || paymentResult.operationId || null;
            console.log('[StepConfirmation] Catalogue flow - payment success:', {
                orderId: this.orderId,
                operationId: paymentResult.operationId,
                authorizationNumber: paymentResult.authorizationNumber,
            });
            // Mark as success
            this.status = 'success';
            // Store result
            flowActions.setOrderResult(this.orderId, null);
            // Emit complete event with available data
            this.onComplete?.({
                orderId: this.orderId,
                plan: flowState.selectedPlan,
                contract: null, // Not applicable for catalogue flow
                customer: null, // Customer data came from shipping form
                location: flowState.location,
            });
        }
        catch (error) {
            console.error('[StepConfirmation] Catalogue flow error:', error);
            this.status = 'error';
            this.errorMessage = error.message || ERROR_MESSAGES.REQUEST_ERROR;
            flowActions.setOrderResult(null, this.errorMessage);
        }
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async submitRequest() {
        this.status = 'loading';
        try {
            const { location, plan, contract, formData } = {
                location: flowState.location,
                plan: flowState.selectedPlan,
                contract: flowState.selectedContract,
                formData: flowState.formData,
            };
            // Validate all data exists
            const validation = requestService.validateSubmissionData(formData, contract, plan, location);
            if (!validation.isValid) {
                throw new Error(`Datos incompletos: ${validation.missingFields.join(', ')}`);
            }
            // Build and submit payload
            const payload = requestService.buildPayload(formData, contract, plan, location);
            const response = await requestService.submitRequest(payload);
            if (response.hasError) {
                throw new Error(response.errorDisplay || response.message || ERROR_MESSAGES.REQUEST_ERROR);
            }
            // Success - store orderId
            this.orderId = response.orderId || null;
            // Get order details (async, don't block on failure)
            if (this.orderId) {
                this.fetchOrderDetails(this.orderId);
                // Send confirmation email (async, don't block on failure)
                this.sendConfirmationEmail(this.orderId, formData.personal.email);
            }
            // Mark as success
            this.status = 'success';
            // Store result
            flowActions.setOrderResult(this.orderId, null);
            // Emit complete event
            this.onComplete?.({
                orderId: this.orderId,
                plan: plan,
                contract: contract,
                customer: formData,
                location: location,
            });
        }
        catch (error) {
            console.error('Request submission failed:', error);
            this.status = 'error';
            this.errorMessage = error.message || ERROR_MESSAGES.REQUEST_ERROR;
            flowActions.setOrderResult(null, this.errorMessage);
        }
    }
    /**
     * Fetches order details after successful submission
     * Non-blocking - errors are logged but don't affect UI
     */
    async fetchOrderDetails(orderId) {
        try {
            const orderDetails = await requestService.getOrder(orderId);
            if (!orderDetails.hasError && orderDetails.orderNumber) {
                this.orderNumber = orderDetails.orderNumber;
            }
        }
        catch (error) {
            // Non-critical - just log the error
            console.warn('Could not fetch order details:', error);
        }
    }
    /**
     * Sends confirmation email to customer
     * Non-blocking - errors are logged but don't affect UI
     */
    async sendConfirmationEmail(orderId, email) {
        try {
            const confirmationResult = await requestService.sendConfirmation(orderId, email);
            if (!confirmationResult.hasError && confirmationResult.sent) {
                this.confirmationSent = true;
            }
        }
        catch (error) {
            // Non-critical - just log the error
            console.warn('Could not send confirmation email:', error);
        }
    }
    handleRetry = () => {
        this.submitRequest();
    };
    handleClose = () => {
        // Clear all sessionStorage data (following TEL pattern)
        this.clearSessionStorage();
        // Reset flow state
        flowActions.resetFlow();
        // Notify parent
        this.onCancel?.();
    };
    /**
     * Clears all flow-related sessionStorage keys
     * Calls clear methods from all services and removes all known keys
     */
    clearSessionStorage() {
        console.log('[StepConfirmation] Clearing all sessionStorage data');
        // Clear using service methods (they handle their own keys)
        try {
            cartService.clearCartSession();
            productService.clearProductSession();
            shippingService.clearShippingData();
            paymentService.clearPaymentData();
            plansService.clearPlan();
            flowActions.clearToken();
        }
        catch (e) {
            console.warn('[StepConfirmation] Error clearing service data:', e);
        }
        // Also clear all known keys directly to ensure complete cleanup
        const keysToRemove = [
            // Token/Auth
            'token',
            'correlationId',
            // Location data (Base64 encoded)
            'latitud',
            'longitud',
            'planCodeInternet',
            // Plan data
            'plan',
            'planId',
            'planPrice',
            // Contract data
            'typeContractId',
            'contractInstallment',
            'contractInstallation',
            'contractActivation',
            'contractModen',
            // Cart data
            'cart',
            'cartId',
            'cartTotal',
            'cartProducts',
            'mainId',
            'discountCoupon',
            // Product data
            'selectedProduct',
            'productId',
            'subcatalogId',
            'selectedColor',
            'selectedStorage',
            'childrenId',
            'parentId',
            'deviceType',
            // Shipping data
            'shipmentId',
            'zipCode',
            'shippingAddress',
            'deliveryMethod',
            // Payment data
            'orderBan',
            'paymentResult',
            // Legacy keys (TEL pattern)
            'serviceLatitude',
            'serviceLongitude',
            'serviceAddress',
            'serviceCity',
            'serviceZipCode',
            'serviceType',
            'serviceMessage',
            'planName',
            'planSoc',
            'planFeatures',
            'customerFirstName',
            'customerSecondName',
            'customerLastName',
            'customerSecondLastName',
            'customerIdType',
            'customerIdNumber',
            'customerIdExpiration',
            'customerPhone1',
            'customerPhone2',
            'customerEmail',
            'customerBirthDate',
            'businessName',
            'businessPosition',
            'isExistingCustomer',
            'shoppingCart',
        ];
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
        });
        console.log('[StepConfirmation] SessionStorage cleared successfully');
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    renderLoading() {
        return (h("div", { class: "step-confirmation__loading" }, h("div", { class: "step-confirmation__spinner" }), h("p", null, "Procesando tu solicitud...")));
    }
    renderSuccess() {
        // Prefer orderNumber from getOrder API, fallback to orderId from submit response
        const displayOrderId = this.orderNumber || this.orderId;
        return (h("div", { class: "step-confirmation__result step-confirmation__result--success" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--success" }, h("img", { src: "/assets/images/ok-check.svg", alt: "\u00C9xito" })), h("h2", { class: "step-confirmation__title step-confirmation__title--success" }, SUCCESS_MESSAGES.REQUEST_SUCCESS), h("p", { class: "step-confirmation__message" }, SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE), displayOrderId && (h("p", { class: "step-confirmation__order-id" }, "N\u00FAmero de orden: ", displayOrderId)), this.confirmationSent && (h("p", { class: "step-confirmation__email-sent" }, "Se ha enviado un correo de confirmaci\u00F3n a tu email."))));
    }
    renderError() {
        return (h("div", { class: "step-confirmation__result step-confirmation__result--error" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--error" }, h("img", { src: "/assets/images/error-check.svg", alt: "Error" })), h("h2", { class: "step-confirmation__title step-confirmation__title--error" }, "\u00A1Lo sentimos, ha ocurrido un error en el proceso de solicitud!"), h("p", { class: "step-confirmation__message" }, "En este momento estamos presentando inconvenientes en nuestro sistema.", h("br", null), "Por favor, int\u00E9ntalo nuevamente.")));
    }
    render() {
        return (h(Host, { key: '5215f0878f1df6b712acc38537e948ce3425b759' }, h("div", { key: '9e12c496833250df2608be2b17d6281df49b4a81', class: "step-confirmation" }, h("header", { key: '59751a8125cfa08dbffe6ede377909dee0dc36b9', class: "step-confirmation__header" }, h("h1", { key: 'e3dcbfa01d585cb8a927e5f65d3f3c3be7882e5e', class: "step-confirmation__header-title" }, "Confirmaci\u00F3n de Solicitud")), h("div", { key: '8c19786bfe36d066a46185738e4d23ca2ffc205b', class: "step-confirmation__content" }, this.status === 'loading' && this.renderLoading(), this.status === 'success' && this.renderSuccess(), this.status === 'error' && this.renderError()), this.status === 'success' && (h("div", { key: '82a95ae0d94faf62ce1274059cc34bd0343e299c', class: "step-confirmation__actions" }, h("button", { key: '1a3e1d2a74e0ad18f5934ab9a872c1d8975708ed', class: "step-confirmation__btn", onClick: this.handleClose }, "Cerrar"))), this.status === 'error' && (h("div", { key: '32cbebb3bbd7de33beb7ab6f956032e77232443d', class: "step-confirmation__actions" }, h("button", { key: '1e2a9b4e0919322310e234db3222a023eb46a3c4', class: "step-confirmation__btn step-confirmation__btn--error", onClick: this.handleRetry }, "Volver a intentar"))))));
    }
    static get is() { return "step-confirmation"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-confirmation.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-confirmation.css"]
        };
    }
    static get properties() {
        return {
            "onComplete": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "(event: FlowCompleteEvent) => void",
                    "resolved": "(event: FlowCompleteEvent) => void",
                    "references": {
                        "FlowCompleteEvent": {
                            "location": "import",
                            "path": "../../../store/interfaces",
                            "id": "src/store/interfaces.ts::FlowCompleteEvent"
                        }
                    }
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
            "onCancel": {
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
            "status": {},
            "orderId": {},
            "orderNumber": {},
            "confirmationSent": {},
            "errorMessage": {}
        };
    }
}
//# sourceMappingURL=step-confirmation.js.map
