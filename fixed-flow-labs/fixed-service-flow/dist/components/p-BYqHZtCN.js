import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import { p as paymentService } from './p-Dyr6R7kX.js';
import { c as cartService } from './p-TkjnQ7KS.js';
import { s as shippingService } from './p-Wsxu9H2a.js';

const stepPaymentCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-payment{width:100%;max-width:800px;margin:0 auto;padding:1.5rem;min-height:100vh}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back-nav{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem}.header .btn-back-nav svg{width:20px;height:20px}.header .btn-back-nav:hover{text-decoration:underline}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;flex:1}.content{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.loading-container h3{font-size:1.5rem;color:#1A1A1A;margin:1rem 0 0.5rem 0}.loading-container p{color:#666666;margin:0 0 0.5rem 0}.loading-container .warning{color:#DA291C;font-weight:500;font-size:0.875rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.payment-container{display:flex;flex-direction:column;gap:1.5rem}.payment-summary{background:#FAFAFA;border-radius:0.5rem;padding:1rem}.payment-summary h3{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.amount-display{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #E5E5E5}.amount-display .label{font-size:1rem;color:#666666}.amount-display .value{font-size:1.5rem;font-weight:700;color:#DA291C}.payment-items{margin-top:1rem}.payment-items .payment-item{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0;font-size:0.875rem}.payment-items .payment-item .item-type{color:#666666}.payment-items .payment-item .item-amount{color:#1A1A1A;font-weight:500}.iframe-container{border:1px solid #E5E5E5;border-radius:0.5rem;overflow:hidden;min-height:400px}.iframe-container iframe{display:block;border:none;width:100%}.iframe-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;background:#FAFAFA}.iframe-placeholder p{color:#666666;margin-top:1rem}.success-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.success-container .success-icon{width:80px;height:80px;background:rgb(209.6296296296, 237.3703703704, 219.2222222222);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.success-container .success-icon svg{width:48px;height:48px;color:#44AF69}.success-container h3{font-size:1.5rem;color:#44AF69;margin:0 0 0.5rem 0}.success-container p{color:#666666;margin:0 0 0.5rem 0}.success-container .redirect-note{font-size:0.875rem;color:#808080}.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.error-container .error-icon{width:80px;height:80px;background:rgb(245.2682926829, 183.75, 179.2317073171);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.error-container .error-icon svg{width:48px;height:48px;color:#DA291C}.error-container h3{font-size:1.5rem;color:#DA291C;margin:0 0 0.5rem 0}.error-container p{color:#666666;margin:0 0 1.5rem 0;max-width:400px}.error-actions{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}.btn-retry{height:44px;padding:0 1.5rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back{height:44px;padding:0 1.5rem;background:white;color:#4D4D4D;border:1px solid #CCCCCC;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#FAFAFA;border-color:#999999}.btn-cancel{align-self:center;height:44px;padding:0 1.5rem;background:white;color:#666666;border:1px solid #CCCCCC;border-radius:9999px;font-size:0.875rem;cursor:pointer;transition:all 0.2s}.btn-cancel:hover{background:#FAFAFA;border-color:#999999}`;

const StepPayment = /*@__PURE__*/ proxyCustomElement(class StepPayment extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // Optional: External payment iframe URL
    paymentIframeUrl;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    screen = 'loading';
    error = null;
    cart = null;
    orderBan = '';
    totalAmount = 0;
    paymentItems = [];
    iframeUrl = '';
    iframeHeight = '500px';
    paymentResult = null;
    // User info for payment
    userName = '';
    userLastName = '';
    userEmail = '';
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadCartAndPreparePayment();
    }
    componentDidLoad() {
        // Listen for payment iframe messages
        window.addEventListener('message', this.handleIframeMessage);
    }
    disconnectedCallback() {
        window.removeEventListener('message', this.handleIframeMessage);
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadCartAndPreparePayment() {
        this.screen = 'loading';
        this.error = null;
        try {
            // Get cart data
            const cartResponse = await cartService.getCart();
            if (cartResponse.hasError) {
                this.error = cartResponse.message || 'Error al cargar el carrito';
                this.screen = 'error';
                return;
            }
            if (!cartResponse.products || cartResponse.products.length === 0) {
                this.error = 'El carrito está vacío';
                this.screen = 'error';
                return;
            }
            this.cart = cartResponse;
            // Build payment items
            this.paymentItems = paymentService.buildPaymentItems({
                depositAmount: cartResponse.depositAmount,
                totalDownPayment: cartResponse.totalDownPayment,
                totalTax: cartResponse.totalTax,
                totalPrice: cartResponse.totalPrice,
                installmentAmount: cartResponse.installmentAmount,
                cartUpdateResponse: cartResponse.cartUpdateResponse,
            });
            // Calculate total
            this.totalAmount = this.paymentItems.length > 0
                ? paymentService.calculateTotalAmount(this.paymentItems)
                : cartResponse.totalPrice || 0;
            // Get user info from shipping
            const shippingAddress = shippingService.getStoredShippingAddress();
            if (shippingAddress) {
                const nameParts = shippingAddress.name.split(' ');
                this.userName = nameParts[0] || '';
                this.userLastName = nameParts.slice(1).join(' ') || '';
                this.userEmail = shippingAddress.email;
            }
            // Create the order
            await this.createOrder();
        }
        catch (err) {
            console.error('[StepPayment] Error:', err);
            this.error = 'Error de conexión';
            this.screen = 'error';
        }
    }
    async createOrder() {
        this.screen = 'creating-order';
        try {
            const zipCode = shippingService.getZipCode();
            const response = await paymentService.createOrder({
                flowId: '5', // CLARO HOGAR flow
                frontFlowId: '1',
                frontFlowName: 'CLARO HOGAR Purchase',
                amount: this.totalAmount.toString(),
                email: this.userEmail,
                zipCode: zipCode,
                deposit: (this.cart?.totalDownPayment || 0).toString(),
            });
            if (response.hasError) {
                this.error = response.errorDisplay || response.message || 'Error al crear la orden';
                this.screen = 'error';
                return;
            }
            this.orderBan = response.ban || '';
            // Now get the payment iframe
            await this.initializePaymentIframe();
        }
        catch (err) {
            console.error('[StepPayment] Create order error:', err);
            this.error = 'Error al crear la orden';
            this.screen = 'error';
        }
    }
    async initializePaymentIframe() {
        if (this.totalAmount <= 0) {
            // Free purchase - no payment needed
            await this.handleFreePayment();
            return;
        }
        try {
            const iframeRequest = {
                firstName: this.userName,
                lastName: this.userLastName,
                email: this.userEmail,
                amount: this.totalAmount,
                transactionType: this.paymentItems.length > 0 ? 'MULTIPLE' : 'payment',
                selectBan: this.orderBan,
                permissions: {
                    provision: true,
                    displayConfirmation: true,
                    emailNotification: true,
                    showInstrument: true,
                    stroeInstrument: true,
                    useBanZipCode: true,
                },
                paymentItems: this.paymentItems.length > 0 ? this.paymentItems : undefined,
            };
            const response = await paymentService.getPaymentIframe(iframeRequest);
            if (response.errorInfo?.hasError || !response.url) {
                this.error = response.errorInfo?.errorDisplay || 'Error al inicializar el pago';
                this.screen = 'error';
                return;
            }
            this.iframeUrl = response.url;
            this.screen = 'payment';
        }
        catch (err) {
            console.error('[StepPayment] Init iframe error:', err);
            this.error = 'Error al inicializar el formulario de pago';
            this.screen = 'error';
        }
    }
    handleIframeMessage = (event) => {
        if (typeof event.data !== 'string')
            return;
        try {
            const data = JSON.parse(atob(event.data));
            if (data.state === 'dimensions') {
                this.iframeHeight = data.data.height;
            }
            if (data.state === 'canceled') {
                this.handlePaymentCancel();
            }
            if (data.state === 'paymentResult') {
                if (data.data) {
                    const resultString = data.data;
                    const result = JSON.parse(resultString).paymentResult;
                    const paymentResult = JSON.parse(atob(result));
                    if (paymentResult.success) {
                        this.handlePaymentSuccess(paymentResult);
                    }
                    else {
                        this.handlePaymentError(paymentResult);
                    }
                }
            }
        }
        catch {
            // Ignore non-payment messages
        }
    };
    async handlePaymentSuccess(result) {
        this.screen = 'processing';
        this.paymentResult = result;
        try {
            const recordResponse = await paymentService.recordPayment({
                ban: this.orderBan,
                cardNumber: result.paymentCard || '',
                cardType: result.paymentMethod || '',
                authorizationNumber: result.authorizationNumber || '',
                referenceNumber: result.provisioning?.referenceNumber || '',
                description: result.description || '',
                operationId: result.operationId || '',
                amount: this.totalAmount.toString(),
                deposit: (this.cart?.totalDownPayment || 0).toString(),
            });
            if (recordResponse.hasError) {
                this.error = recordResponse.errorDisplay || 'Error al registrar el pago';
                this.screen = 'error';
                return;
            }
            // Store payment result and proceed
            paymentService.storePaymentResult(result);
            this.screen = 'success';
            // Auto-proceed after short delay
            setTimeout(() => {
                this.onNext?.();
            }, 2000);
        }
        catch (err) {
            console.error('[StepPayment] Record payment error:', err);
            this.error = 'Error al registrar el pago';
            this.screen = 'error';
        }
    }
    async handlePaymentError(result) {
        await paymentService.recordPaymentError(this.orderBan, '', result.description || 'Payment failed', result.operationId || '', (this.cart?.totalDownPayment || 0).toString(), result.paymentMethod || '', result.paymentCard || '', this.totalAmount.toString());
        this.error = result.description || 'El pago no pudo ser procesado';
        this.screen = 'error';
    }
    handlePaymentCancel() {
        this.onBack?.();
    }
    async handleFreePayment() {
        this.screen = 'processing';
        try {
            const operationId = Math.floor(Math.random() * 900000 + 100000).toString();
            const recordResponse = await paymentService.recordPayment({
                ban: this.orderBan,
                cardNumber: '1111',
                cardType: 'V',
                authorizationNumber: 'FREEPR',
                referenceNumber: 'FREEPROMO',
                description: 'Free promotion',
                operationId: operationId,
                amount: '0',
                deposit: '0',
            });
            if (recordResponse.hasError) {
                this.error = recordResponse.errorDisplay || 'Error al procesar';
                this.screen = 'error';
                return;
            }
            this.screen = 'success';
            setTimeout(() => {
                this.onNext?.();
            }, 2000);
        }
        catch (err) {
            console.error('[StepPayment] Free payment error:', err);
            this.error = 'Error al procesar';
            this.screen = 'error';
        }
    }
    handleRetry = () => {
        this.loadCartAndPreparePayment();
    };
    formatPrice(price) {
        return `$${(price || 0).toFixed(2)}`;
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    renderLoading() {
        return (h("div", { class: "loading-container" }, h("div", { class: "spinner" }), h("p", null, "Cargando informaci\u00F3n del pago...")));
    }
    renderCreatingOrder() {
        return (h("div", { class: "loading-container" }, h("div", { class: "spinner" }), h("h3", null, "Preparando tu orden"), h("p", null, "Por favor espera mientras procesamos tu solicitud..."), h("p", { class: "warning" }, "No cierres esta ventana ni navegues a otra p\u00E1gina.")));
    }
    renderPaymentForm() {
        return (h("div", { class: "payment-container" }, h("div", { class: "payment-summary" }, h("h3", null, "Resumen del pago"), h("div", { class: "amount-display" }, h("span", { class: "label" }, "Total a pagar:"), h("span", { class: "value" }, this.formatPrice(this.totalAmount))), this.paymentItems.length > 0 && (h("div", { class: "payment-items" }, this.paymentItems.map((item) => (h("div", { class: "payment-item" }, h("span", { class: "item-type" }, this.getPaymentTypeLabel(item.paymentType)), h("span", { class: "item-amount" }, this.formatPrice(item.amount)))))))), h("div", { class: "iframe-container" }, this.iframeUrl ? (h("iframe", { src: this.iframeUrl, width: "100%", height: this.iframeHeight, frameBorder: "0", title: "Payment Form" })) : (h("div", { class: "iframe-placeholder" }, h("div", { class: "spinner" }), h("p", null, "Cargando formulario de pago...")))), h("button", { class: "btn-cancel", onClick: () => this.handlePaymentCancel() }, "Cancelar")));
    }
    renderProcessing() {
        return (h("div", { class: "loading-container" }, h("div", { class: "spinner" }), h("h3", null, "Procesando pago"), h("p", null, "Por favor espera mientras confirmamos tu pago...")));
    }
    renderSuccess() {
        return (h("div", { class: "success-container" }, h("div", { class: "success-icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), h("polyline", { points: "22 4 12 14.01 9 11.01" }))), h("h3", null, "Pago exitoso"), h("p", null, "Tu pago ha sido procesado correctamente."), h("p", { class: "redirect-note" }, "Redirigiendo a la confirmaci\u00F3n...")));
    }
    renderError() {
        return (h("div", { class: "error-container" }, h("div", { class: "error-icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), h("line", { x1: "9", y1: "9", x2: "15", y2: "15" }))), h("h3", null, "Error en el pago"), h("p", null, this.error), h("div", { class: "error-actions" }, h("button", { class: "btn-retry", onClick: this.handleRetry }, "Intentar nuevamente"), h("button", { class: "btn-back", onClick: () => this.onBack?.() }, "Volver"))));
    }
    getPaymentTypeLabel(type) {
        const labels = {
            DEPOSIT: 'Depósito',
            DOWNPAYMENT: 'Pago inicial',
            TAXES: 'Impuestos',
            INSTALLMENT: 'Cuotas',
            PASTDUEONLY: 'Balance pendiente',
        };
        return labels[type] || type;
    }
    render() {
        return (h(Host, { key: '244b9d9cfebdceabf3d3a3bdf632c909587dc300' }, h("div", { key: 'fe4eb660c01f29c76bba4d0e0fb3bf70093f9f48', class: "step-payment" }, h("div", { key: '6539d4c6899c638f8b7c1d752116746891995a0c', class: "header" }, this.screen !== 'processing' && this.screen !== 'success' && (h("button", { key: '7c544aef3f7fbfaaeda24e705a2e01b20fe91bcc', class: "btn-back-nav", onClick: () => this.onBack?.() }, h("svg", { key: '85e53558ee358a157bb99693e64ce1e9fbc4aae8', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: '5783eb28e66f54e2fd54d0c3e716265b23a57662', d: "M19 12H5M12 19l-7-7 7-7" })), "Regresar")), h("h1", { key: '4aa590ba3bb6c7dadc0669e82b357fcdbb824fe2', class: "title" }, "Pago")), h("div", { key: '8f4705155f8b553de4bc31e712041f91adebcbfd', class: "content" }, this.screen === 'loading' && this.renderLoading(), this.screen === 'creating-order' && this.renderCreatingOrder(), this.screen === 'payment' && this.renderPaymentForm(), this.screen === 'processing' && this.renderProcessing(), this.screen === 'success' && this.renderSuccess(), this.screen === 'error' && this.renderError()))));
    }
    static get style() { return stepPaymentCss(); }
}, [769, "step-payment", {
        "onNext": [16],
        "onBack": [16],
        "paymentIframeUrl": [1, "payment-iframe-url"],
        "screen": [32],
        "error": [32],
        "cart": [32],
        "orderBan": [32],
        "totalAmount": [32],
        "paymentItems": [32],
        "iframeUrl": [32],
        "iframeHeight": [32],
        "paymentResult": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-payment"];
    components.forEach(tagName => { switch (tagName) {
        case "step-payment":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepPayment);
            }
            break;
    } });
}
defineCustomElement();

export { StepPayment as S, defineCustomElement as d };
//# sourceMappingURL=p-BYqHZtCN.js.map

//# sourceMappingURL=p-BYqHZtCN.js.map