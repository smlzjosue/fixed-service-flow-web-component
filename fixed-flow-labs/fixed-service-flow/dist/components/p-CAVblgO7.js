import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import { f as flowActions, s as state } from './p-1rCYjdXc.js';
import { p as plansService } from './p-BnwnDOjS.js';
import { t as tokenService, h as httpService } from './p-De3C6PL0.js';
import { E as ERROR_MESSAGES, S as SUCCESS_MESSAGES } from './p-yvVRTe7W.js';
import { c as cartService } from './p-TkjnQ7KS.js';
import { p as productService } from './p-CDUi1inA.js';
import { s as shippingService } from './p-Wsxu9H2a.js';
import { p as paymentService } from './p-Dyr6R7kX.js';

// ============================================
// REQUEST SERVICE - Service Request Submission
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// REQUEST SERVICE CLASS
// ------------------------------------------
class RequestService {
    // ------------------------------------------
    // SUBMIT REQUEST
    // ------------------------------------------
    /**
     * Submits the service request
     * Endpoint: POST api/Orders/internetServiceRequest
     */
    async submitRequest(payload) {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        // Build FormData
        const formData = new FormData();
        // Add all fields to FormData
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        const response = await httpService.postFormData('api/Orders/internetServiceRequest', formData);
        return response;
    }
    // ------------------------------------------
    // GET ORDER DETAILS
    // ------------------------------------------
    /**
     * Gets order details after successful submission
     * Endpoint: GET api/Orders/getOrder?orderId={orderId}
     * Source: TEL - frontend/src/app/internet/services/plans.service.ts
     */
    async getOrder(orderId) {
        await tokenService.ensureToken();
        const response = await httpService.get(`api/Orders/getOrder?orderId=${encodeURIComponent(orderId)}`);
        return response;
    }
    // ------------------------------------------
    // SEND CONFIRMATION EMAIL
    // ------------------------------------------
    /**
     * Sends confirmation email to customer
     * Endpoint: POST api/Orders/sendConfirmation
     * Source: TEL - frontend/src/app/internet/services/plans.service.ts
     */
    async sendConfirmation(orderId, email) {
        await tokenService.ensureToken();
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('email', email);
        const response = await httpService.postFormData('api/Orders/sendConfirmation', formData);
        return response;
    }
    // ------------------------------------------
    // BUILD PAYLOAD
    // ------------------------------------------
    /**
     * Builds the request payload from flow data
     */
    buildPayload(formData, contract, plan, location) {
        return {
            // Contract type
            type: contract.typeId,
            // Personal data
            name: formData.personal.firstName,
            second_name: formData.personal.secondName || '',
            last_name: formData.personal.lastName,
            second_surname: formData.personal.secondLastName,
            // date_birth: Campo requerido por el backend pero no recolectado en el formulario empresarial.
            // Se envía fecha por defecto. TODO: Discutir con backend si es necesario para flujo empresarial.
            date_birth: formData.personal.birthDate || '1990-01-01',
            email: formData.personal.email,
            telephone1: formData.personal.phone1,
            telephone2: formData.personal.phone2 || '',
            // Address
            zipCode: formData.address.zipCode,
            address: formData.address.address,
            city: formData.address.city,
            // Identification
            id_type: formData.personal.identificationType === 'license' ? '1' : '2',
            id: formData.personal.identificationNumber,
            identification_expiration: formData.personal.identificationExpiration,
            // Flow tracking
            frontFlowId: this.generateFlowId(),
            // Plan details
            plan_id: String(plan.planId),
            plan_name: plan.planName,
            // Contract details
            deadlines: String(contract.deadlines),
            installation: String(contract.installation),
            activation: String(contract.activation),
            moden: String(contract.modem),
            // Customer status - Backend espera booleano, no string
            claro_customer: formData.isExistingCustomer,
            // Location
            latitud: String(location.latitude),
            longitud: String(location.longitude),
            // Business data (optional)
            business_name: formData.business.businessName,
            business_position: formData.business.position,
        };
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Generates a unique flow ID for tracking
     */
    generateFlowId() {
        return `FSF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Validates that all required data is present before submission
     */
    validateSubmissionData(formData, contract, plan, location) {
        const missingFields = [];
        if (!location) {
            missingFields.push('location');
        }
        if (!plan) {
            missingFields.push('plan');
        }
        if (!contract) {
            missingFields.push('contract');
        }
        if (!formData) {
            missingFields.push('formData');
        }
        else {
            // Validate personal data
            if (!formData.personal.firstName)
                missingFields.push('firstName');
            if (!formData.personal.lastName)
                missingFields.push('lastName');
            if (!formData.personal.secondLastName)
                missingFields.push('secondLastName');
            if (!formData.personal.identificationNumber)
                missingFields.push('identificationNumber');
            if (!formData.personal.identificationExpiration)
                missingFields.push('identificationExpiration');
            if (!formData.personal.phone1)
                missingFields.push('phone1');
            if (!formData.personal.email)
                missingFields.push('email');
            // Validate business data
            if (!formData.business.businessName)
                missingFields.push('businessName');
            if (!formData.business.position)
                missingFields.push('position');
            // Validate address
            if (!formData.address.address)
                missingFields.push('address');
            if (!formData.address.city)
                missingFields.push('city');
            if (!formData.address.zipCode)
                missingFields.push('zipCode');
        }
        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const requestService = new RequestService();

const stepConfirmationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-confirmation{width:100%}.step-confirmation__header{margin-bottom:1.5rem;padding-bottom:1rem;position:relative}.step-confirmation__header::after{content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:100vw;height:1px;background:#E5E5E5}.step-confirmation__header-title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-confirmation__content{background-color:#FFFFFF;border:1px solid #E5E5E5;border-radius:0.75rem;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);transition:box-shadow 150ms ease, border-color 150ms ease;padding:3rem 2rem;text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading{display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading p{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.step-confirmation__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-confirmation__result{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:500px}.step-confirmation__icon{display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.step-confirmation__icon img{width:48px;height:48px}.step-confirmation__icon svg{width:40px;height:40px}.step-confirmation__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;margin-bottom:0.5rem}.step-confirmation__title--success{color:#15A045}.step-confirmation__title--error{color:#E00814}.step-confirmation__message{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-confirmation__order-id{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0.5rem 1rem;background:#FAFAFA;border-radius:0.5rem}.step-confirmation__actions{margin-top:1.5rem;text-align:center}.step-confirmation__btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-confirmation__btn:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-confirmation__btn:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-confirmation__btn{min-width:180px}.step-confirmation__btn--error{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn--error:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn--error{height:48px;background-color:#DA291C;color:#FFFFFF}.step-confirmation__btn--error:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-confirmation__btn--error:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepConfirmation = /*@__PURE__*/ proxyCustomElement(class StepConfirmation extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
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
        const hasContract = !!state.selectedContract;
        const hasFormData = !!state.formData;
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
                plan: state.selectedPlan,
                contract: null, // Not applicable for catalogue flow
                customer: null, // Customer data came from shipping form
                location: state.location,
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
                location: state.location,
                plan: state.selectedPlan,
                contract: state.selectedContract,
                formData: state.formData,
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
        return (h(Host, { key: '449778ed0f375ee034a3df3b8b6e8f533f8cb0db' }, h("div", { key: 'a1bdb548476effe70f6f35b72fe1b6e5b8d1baf3', class: "step-confirmation" }, h("header", { key: '45ea030ea6ed2731d6c4b9e6f5da0f6396a77740', class: "step-confirmation__header" }, h("h1", { key: '1c79e21c0f27fc6bdd26f107a6f8a40956804b68', class: "step-confirmation__header-title" }, "Confirmaci\u00F3n de Solicitud")), h("div", { key: 'd772325d6bb91350a9004def2044985a9c222ca9', class: "step-confirmation__content" }, this.status === 'loading' && this.renderLoading(), this.status === 'success' && this.renderSuccess(), this.status === 'error' && this.renderError()), this.status === 'success' && (h("div", { key: '723bb7a27e30753b5b886630094e0bc9524d69fa', class: "step-confirmation__actions" }, h("button", { key: '49ddcbb3a848dc86c575bc58f16570fede2dd478', class: "step-confirmation__btn", onClick: this.handleClose }, "Cerrar"))), this.status === 'error' && (h("div", { key: '8660a2a85187276b0b530844bf96d03c3b6e6414', class: "step-confirmation__actions" }, h("button", { key: '633987a833750a44047650b84c47168cfbad0a04', class: "step-confirmation__btn step-confirmation__btn--error", onClick: this.handleRetry }, "Volver a intentar"))))));
    }
    static get style() { return stepConfirmationCss(); }
}, [769, "step-confirmation", {
        "onComplete": [16],
        "onCancel": [16],
        "onBack": [16],
        "status": [32],
        "orderId": [32],
        "orderNumber": [32],
        "confirmationSent": [32],
        "errorMessage": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-confirmation"];
    components.forEach(tagName => { switch (tagName) {
        case "step-confirmation":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepConfirmation);
            }
            break;
    } });
}
defineCustomElement();

export { StepConfirmation as S, defineCustomElement as d };
//# sourceMappingURL=p-CAVblgO7.js.map

//# sourceMappingURL=p-CAVblgO7.js.map