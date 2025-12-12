import { t as tokenService, h as httpService } from './p-CTTmtcOx.js';
import { a as storageUtils } from './p-Bw04z7HQ.js';

// ============================================
// PAYMENT SERVICE - Payment Processing
// Fixed Service Flow Web Component
// Based on TEL PaymentService & PaymentIframeService
// ============================================
// ------------------------------------------
// STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS = {
    ORDER_BAN: 'orderBan',
    PAYMENT_RESULT: 'paymentResult',
};
// ------------------------------------------
// PAYMENT SERVICE CLASS
// ------------------------------------------
class PaymentService {
    paymentIframeUrl = '';
    /**
     * Set the payment iframe URL (from environment config)
     */
    setPaymentIframeUrl(url) {
        this.paymentIframeUrl = url;
    }
    /**
     * Get the payment iframe URL
     */
    getPaymentIframeUrl() {
        return this.paymentIframeUrl;
    }
    // ------------------------------------------
    // API METHODS
    // ------------------------------------------
    /**
     * Create order before payment
     */
    async createOrder(request) {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('flowId', request.flowId);
        formData.append('frontFlowId', request.frontFlowId);
        formData.append('frontFlowName', request.frontFlowName);
        formData.append('banExisting', request.banExisting || '');
        formData.append('subscriberExisting', request.subscriberExisting || '');
        formData.append('amount', request.amount);
        formData.append('email', request.email);
        formData.append('zipCode', request.zipCode);
        formData.append('deposit', request.deposit);
        formData.append('pastDueAmount', request.pastDueAmount || '0');
        try {
            const response = await httpService.postFormData('api/Orders/creationOfOrder', formData);
            if (!response.hasError && response.ban) {
                this.storeOrderBan(response.ban);
            }
            return response;
        }
        catch (error) {
            console.error('[PaymentService] Create order error:', error);
            return {
                hasError: true,
                errorDisplay: 'Error al crear la orden',
            };
        }
    }
    /**
     * Record successful payment
     */
    async recordPayment(request) {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('ban', request.ban);
        formData.append('cardNumber', request.cardNumber);
        formData.append('cardType', request.cardType);
        formData.append('authorizationNumber', request.authorizationNumber);
        formData.append('referenceNumber', request.referenceNumber);
        formData.append('description', request.description);
        formData.append('operationId', request.operationId);
        formData.append('amount', request.amount);
        formData.append('deposit', request.deposit);
        try {
            const response = await httpService.postFormData('api/Payment/record', formData);
            return response;
        }
        catch (error) {
            console.error('[PaymentService] Record payment error:', error);
            return {
                hasError: true,
                errorDisplay: 'Error al registrar el pago',
            };
        }
    }
    /**
     * Record payment error
     */
    async recordPaymentError(ban, subscriber, description, operationId, deposit, cardType, cardNumber, amount) {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('ban', ban);
        formData.append('subscriber', subscriber);
        formData.append('description', description);
        formData.append('operationId', operationId);
        formData.append('deposit', deposit);
        formData.append('cardType', cardType);
        formData.append('cardNumber', cardNumber);
        formData.append('amount', amount);
        try {
            return await httpService.postFormData('api/Payment/error', formData);
        }
        catch (error) {
            console.error('[PaymentService] Record error error:', error);
            return { hasError: true };
        }
    }
    /**
     * Get payment iframe URL
     * TEL uses: api/Payment/getPaymentIframe (NOT getIframe)
     */
    async getPaymentIframe(request) {
        try {
            const response = await httpService.post('api/Payment/getPaymentIframe', request);
            return response;
        }
        catch (error) {
            console.error('[PaymentService] Get iframe error:', error);
            return {
                errorInfo: {
                    hasError: true,
                    errorDisplay: 'Error al obtener el iframe de pago',
                },
            };
        }
    }
    // ------------------------------------------
    // STORAGE METHODS
    // ------------------------------------------
    storeOrderBan(ban) {
        storageUtils.set(STORAGE_KEYS.ORDER_BAN, ban);
    }
    getOrderBan() {
        return storageUtils.get(STORAGE_KEYS.ORDER_BAN) || '';
    }
    storePaymentResult(result) {
        storageUtils.setJSON(STORAGE_KEYS.PAYMENT_RESULT, result);
    }
    getPaymentResult() {
        return storageUtils.getJSON(STORAGE_KEYS.PAYMENT_RESULT);
    }
    clearPaymentData() {
        storageUtils.remove(STORAGE_KEYS.ORDER_BAN);
        storageUtils.remove(STORAGE_KEYS.PAYMENT_RESULT);
    }
    // ------------------------------------------
    // PAYMENT ITEMS HELPERS
    // ------------------------------------------
    /**
     * Build payment items array from cart data
     */
    buildPaymentItems(cartData) {
        const items = [];
        if (cartData.depositAmount && cartData.depositAmount > 0) {
            items.push({ paymentType: 'DEPOSIT', amount: cartData.depositAmount });
        }
        if (cartData.totalDownPayment && cartData.totalDownPayment > 0) {
            items.push({ paymentType: 'DOWNPAYMENT', amount: cartData.totalDownPayment });
        }
        if (cartData.totalTax && cartData.totalTax > 0) {
            // Calculate tax portion
            const taxAmount = (cartData.totalPrice || 0) -
                (cartData.depositAmount || 0) -
                (cartData.totalDownPayment || 0) -
                (cartData.installmentAmount || 0);
            if (taxAmount > 0) {
                items.push({ paymentType: 'TAXES', amount: Number(taxAmount.toFixed(2)) });
            }
        }
        if (cartData.cartUpdateResponse?.acceletartedAmount) {
            items.push({
                paymentType: 'INSTALLMENT',
                amount: cartData.cartUpdateResponse.acceletartedAmount,
            });
        }
        return items;
    }
    /**
     * Calculate total amount from payment items
     */
    calculateTotalAmount(items) {
        return items.reduce((sum, item) => sum + item.amount, 0);
    }
}
// Export singleton instance
const paymentService = new PaymentService();

export { paymentService as p };
//# sourceMappingURL=p-BkWfZYuz.js.map

//# sourceMappingURL=p-BkWfZYuz.js.map