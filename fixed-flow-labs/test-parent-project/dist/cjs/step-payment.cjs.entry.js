'use strict';

var index = require('./index-BAqxGv-h.js');
var payment_service = require('./payment.service-D1hKs96P.js');
var cart_service = require('./cart.service-TK_wN9_5.js');
var shipping_service = require('./shipping.service-CxeHNzaD.js');
require('./token.service-B-RtLk56.js');

const stepPaymentCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-payment{width:100%;max-width:800px;margin:0 auto;padding:1.5rem;min-height:100vh}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back-nav{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem}.header .btn-back-nav svg{width:20px;height:20px}.header .btn-back-nav:hover{text-decoration:underline}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;flex:1}.content{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.loading-container h3{font-size:1.5rem;color:#1A1A1A;margin:1rem 0 0.5rem 0}.loading-container p{color:#666666;margin:0 0 0.5rem 0}.loading-container .warning{color:#DA291C;font-weight:500;font-size:0.875rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.payment-container{display:flex;flex-direction:column;gap:1.5rem}.payment-summary{background:#FAFAFA;border-radius:0.5rem;padding:1rem}.payment-summary h3{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.amount-display{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #E5E5E5}.amount-display .label{font-size:1rem;color:#666666}.amount-display .value{font-size:1.5rem;font-weight:700;color:#DA291C}.payment-items{margin-top:1rem}.payment-items .payment-item{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0;font-size:0.875rem}.payment-items .payment-item .item-type{color:#666666}.payment-items .payment-item .item-amount{color:#1A1A1A;font-weight:500}.iframe-container{border:1px solid #E5E5E5;border-radius:0.5rem;overflow:hidden;min-height:400px}.iframe-container iframe{display:block;border:none;width:100%}.iframe-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;background:#FAFAFA}.iframe-placeholder p{color:#666666;margin-top:1rem}.success-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.success-container .success-icon{width:80px;height:80px;background:rgb(209.6296296296, 237.3703703704, 219.2222222222);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.success-container .success-icon svg{width:48px;height:48px;color:#44AF69}.success-container h3{font-size:1.5rem;color:#44AF69;margin:0 0 0.5rem 0}.success-container p{color:#666666;margin:0 0 0.5rem 0}.success-container .redirect-note{font-size:0.875rem;color:#808080}.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.error-container .error-icon{width:80px;height:80px;background:rgb(245.2682926829, 183.75, 179.2317073171);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.error-container .error-icon svg{width:48px;height:48px;color:#DA291C}.error-container h3{font-size:1.5rem;color:#DA291C;margin:0 0 0.5rem 0}.error-container p{color:#666666;margin:0 0 1.5rem 0;max-width:400px}.error-actions{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}.btn-retry{height:44px;padding:0 1.5rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back{height:44px;padding:0 1.5rem;background:white;color:#4D4D4D;border:1px solid #CCCCCC;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#FAFAFA;border-color:#999999}.btn-cancel{align-self:center;height:44px;padding:0 1.5rem;background:white;color:#666666;border:1px solid #CCCCCC;border-radius:9999px;font-size:0.875rem;cursor:pointer;transition:all 0.2s}.btn-cancel:hover{background:#FAFAFA;border-color:#999999}`;

const StepPayment = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    get el() { return index.getElement(this); }
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
            const cartResponse = await cart_service.cartService.getCart();
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
            this.paymentItems = payment_service.paymentService.buildPaymentItems({
                depositAmount: cartResponse.depositAmount,
                totalDownPayment: cartResponse.totalDownPayment,
                totalTax: cartResponse.totalTax,
                totalPrice: cartResponse.totalPrice,
                installmentAmount: cartResponse.installmentAmount,
                cartUpdateResponse: cartResponse.cartUpdateResponse,
            });
            // Calculate total
            this.totalAmount = this.paymentItems.length > 0
                ? payment_service.paymentService.calculateTotalAmount(this.paymentItems)
                : cartResponse.totalPrice || 0;
            // Get user info from shipping
            const shippingAddress = shipping_service.shippingService.getStoredShippingAddress();
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
            const zipCode = shipping_service.shippingService.getZipCode();
            const response = await payment_service.paymentService.createOrder({
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
            const response = await payment_service.paymentService.getPaymentIframe(iframeRequest);
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
            const recordResponse = await payment_service.paymentService.recordPayment({
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
            payment_service.paymentService.storePaymentResult(result);
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
        await payment_service.paymentService.recordPaymentError(this.orderBan, '', result.description || 'Payment failed', result.operationId || '', (this.cart?.totalDownPayment || 0).toString(), result.paymentMethod || '', result.paymentCard || '', this.totalAmount.toString());
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
            const recordResponse = await payment_service.paymentService.recordPayment({
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
        return (index.h("div", { class: "loading-container" }, index.h("div", { class: "spinner" }), index.h("p", null, "Cargando informaci\u00F3n del pago...")));
    }
    renderCreatingOrder() {
        return (index.h("div", { class: "loading-container" }, index.h("div", { class: "spinner" }), index.h("h3", null, "Preparando tu orden"), index.h("p", null, "Por favor espera mientras procesamos tu solicitud..."), index.h("p", { class: "warning" }, "No cierres esta ventana ni navegues a otra p\u00E1gina.")));
    }
    renderPaymentForm() {
        return (index.h("div", { class: "payment-container" }, index.h("div", { class: "payment-summary" }, index.h("h3", null, "Resumen del pago"), index.h("div", { class: "amount-display" }, index.h("span", { class: "label" }, "Total a pagar:"), index.h("span", { class: "value" }, this.formatPrice(this.totalAmount))), this.paymentItems.length > 0 && (index.h("div", { class: "payment-items" }, this.paymentItems.map((item) => (index.h("div", { class: "payment-item" }, index.h("span", { class: "item-type" }, this.getPaymentTypeLabel(item.paymentType)), index.h("span", { class: "item-amount" }, this.formatPrice(item.amount)))))))), index.h("div", { class: "iframe-container" }, this.iframeUrl ? (index.h("iframe", { src: this.iframeUrl, width: "100%", height: this.iframeHeight, frameBorder: "0", title: "Payment Form" })) : (index.h("div", { class: "iframe-placeholder" }, index.h("div", { class: "spinner" }), index.h("p", null, "Cargando formulario de pago...")))), index.h("button", { class: "btn-cancel", onClick: () => this.handlePaymentCancel() }, "Cancelar")));
    }
    renderProcessing() {
        return (index.h("div", { class: "loading-container" }, index.h("div", { class: "spinner" }), index.h("h3", null, "Procesando pago"), index.h("p", null, "Por favor espera mientras confirmamos tu pago...")));
    }
    renderSuccess() {
        return (index.h("div", { class: "success-container" }, index.h("div", { class: "success-icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), index.h("polyline", { points: "22 4 12 14.01 9 11.01" }))), index.h("h3", null, "Pago exitoso"), index.h("p", null, "Tu pago ha sido procesado correctamente."), index.h("p", { class: "redirect-note" }, "Redirigiendo a la confirmaci\u00F3n...")));
    }
    renderError() {
        return (index.h("div", { class: "error-container" }, index.h("div", { class: "error-icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("circle", { cx: "12", cy: "12", r: "10" }), index.h("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), index.h("line", { x1: "9", y1: "9", x2: "15", y2: "15" }))), index.h("h3", null, "Error en el pago"), index.h("p", null, this.error), index.h("div", { class: "error-actions" }, index.h("button", { class: "btn-retry", onClick: this.handleRetry }, "Intentar nuevamente"), index.h("button", { class: "btn-back", onClick: () => this.onBack?.() }, "Volver"))));
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
        return (index.h(index.Host, { key: '81447a21d44b94f3ac37562b5c13a1ef803ebf22' }, index.h("div", { key: '52cc1c6b59084e47a5fc7e4bad1ae0d5cc40317c', class: "step-payment" }, index.h("div", { key: 'e69b6562354faebebb5e2ca2bca419643d345ccc', class: "header" }, this.screen !== 'processing' && this.screen !== 'success' && (index.h("button", { key: '22e833ea4d38ee57900c1e1255f58471d2fbb024', class: "btn-back-nav", onClick: () => this.onBack?.() }, index.h("svg", { key: 'c48e1058be956101408f42cc044ceb128c2b7a30', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { key: '682a4f2d7c613330a925ba790a1bdd1f8079b901', d: "M19 12H5M12 19l-7-7 7-7" })), "Regresar")), index.h("h1", { key: 'e02d9349bb86dba37f45c6411b95781220141833', class: "title" }, "Pago")), index.h("div", { key: 'e504235a4d0a65fb5dbec45da1865f16d3ae83ad', class: "content" }, this.screen === 'loading' && this.renderLoading(), this.screen === 'creating-order' && this.renderCreatingOrder(), this.screen === 'payment' && this.renderPaymentForm(), this.screen === 'processing' && this.renderProcessing(), this.screen === 'success' && this.renderSuccess(), this.screen === 'error' && this.renderError()))));
    }
};
StepPayment.style = stepPaymentCss();

exports.step_payment = StepPayment;
//# sourceMappingURL=step-payment.entry.cjs.js.map
