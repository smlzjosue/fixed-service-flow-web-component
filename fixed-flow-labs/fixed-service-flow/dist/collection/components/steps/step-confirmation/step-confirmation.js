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
        return (h("div", { class: "step-confirmation__result step-confirmation__result--success" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--success" }, h("svg", { width: "49", height: "48", viewBox: "0 0 49 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M24.4237 2C12.0492 2 2 11.8441 2 23.9661C2 36.0881 12.0492 45.9322 24.4237 45.9322C36.7983 45.9322 46.8475 36.0881 46.8475 23.9661", stroke: "#0EA651", "stroke-width": "4", "stroke-miterlimit": "10", "stroke-linecap": "round", "stroke-linejoin": "round" }), h("path", { d: "M44.5225 4.19666L21.1852 30.8L12.3818 22.2577", stroke: "#0EA651", "stroke-width": "4", "stroke-miterlimit": "10", "stroke-linecap": "round", "stroke-linejoin": "round" }))), h("h2", { class: "step-confirmation__title step-confirmation__title--success" }, SUCCESS_MESSAGES.REQUEST_SUCCESS), h("p", { class: "step-confirmation__message" }, SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE), displayOrderId && (h("p", { class: "step-confirmation__order-id" }, "N\u00FAmero de orden: ", displayOrderId)), this.confirmationSent && (h("p", { class: "step-confirmation__email-sent" }, "Se ha enviado un correo de confirmaci\u00F3n a tu email."))));
    }
    renderError() {
        return (h("div", { class: "step-confirmation__result step-confirmation__result--error" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--error" }, h("svg", { width: "49", height: "49", viewBox: "0 0 49 49", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M24.5 0C38.0096 9.05167e-07 49 10.9899 49 24.5C49 38.0101 38.0096 49 24.5 49C10.9904 49 0 38.0101 0 24.5C0 10.9899 10.99 0 24.5 0ZM24.5 3.78516C13.0775 3.78516 3.78418 13.0774 3.78418 24.5C3.78418 35.9215 13.0774 45.2148 24.5 45.2148C35.9225 45.2148 45.2158 35.922 45.2158 24.5C45.2158 13.078 35.9225 3.78516 24.5 3.78516ZM24.5 31.8809C25.5449 31.8809 26.3915 32.7276 26.3916 33.7725V35.3486C26.3916 36.3936 25.5449 37.2412 24.5 37.2412C23.4551 37.2412 22.6084 36.3936 22.6084 35.3486V33.7725C22.6085 32.7276 23.4551 31.8809 24.5 31.8809ZM24.5 11.7588C25.5449 11.7588 26.3915 12.6055 26.3916 13.6504V27.7725C26.3916 28.8174 25.5449 29.6641 24.5 29.6641C23.4551 29.6641 22.6084 28.8174 22.6084 27.7725V13.6504C22.6085 12.6055 23.4551 11.7588 24.5 11.7588Z", fill: "#B41E13" }))), h("h2", { class: "step-confirmation__title step-confirmation__title--error" }, "\u00A1Lo sentimos, ha ocurrido un error en el proceso de solicitud!"), h("p", { class: "step-confirmation__message" }, "En este momento estamos presentando inconvenientes en nuestro sistema.", h("br", null), "Por favor, int\u00E9ntalo nuevamente.")));
    }
    render() {
        return (h(Host, { key: 'e0eceafd99b97d025bd5f35e3df9f4ee4230e464' }, h("div", { key: '5eee1e9849c360af57aedf8c814f08f4ebc7dfef', class: "step-confirmation" }, h("header", { key: 'ba063cc7fe7b1ce5415c728fd545db9c7285888e', class: "step-confirmation__header" }, h("h1", { key: '9774de7b3e8a2676ac166dc37b41c8e38fe078a5', class: "step-confirmation__header-title" }, "Confirmaci\u00F3n de Solicitud")), h("div", { key: 'b09c1a71dc5d00c76dbbb53607614ddf662b792a', class: "step-confirmation__content" }, this.status === 'loading' && this.renderLoading(), this.status === 'success' && this.renderSuccess(), this.status === 'error' && this.renderError()), this.status === 'success' && (h("div", { key: 'de5c20cbb95532044a47037c1b99c4fa3687d0af', class: "step-confirmation__actions" }, h("button", { key: '6613d3fd9a74882ca546b41480d0d62f4a9b061a', class: "step-confirmation__btn", onClick: this.handleClose }, "Cerrar"))), this.status === 'error' && (h("div", { key: '09f4a1fd41e742b70b66d2ba33dcd5aec6ad4390', class: "step-confirmation__actions" }, h("button", { key: '4cf91fa8b9b99c6c7c5944e20f76e2ab95695abc', class: "step-confirmation__btn step-confirmation__btn--error", onClick: this.handleRetry }, "Volver a intentar"))))));
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
