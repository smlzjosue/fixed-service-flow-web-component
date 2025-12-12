export interface PaymentItem {
    paymentType: 'DEPOSIT' | 'DOWNPAYMENT' | 'TAXES' | 'INSTALLMENT' | 'PASTDUEONLY';
    amount: number;
}
export interface OrderCreationRequest {
    flowId: string;
    frontFlowId: string;
    frontFlowName: string;
    banExisting?: string;
    subscriberExisting?: string;
    amount: string;
    email: string;
    zipCode: string;
    deposit: string;
    pastDueAmount?: string;
}
export interface OrderCreationResponse {
    hasError: boolean;
    ban?: string;
    errorDisplay?: string;
    message?: string;
}
export interface PaymentRecordRequest {
    ban: string;
    cardNumber: string;
    cardType: string;
    authorizationNumber: string;
    referenceNumber: string;
    description: string;
    operationId: string;
    amount: string;
    deposit: string;
}
export interface PaymentRecordResponse {
    hasError: boolean;
    ban?: string;
    errorDisplay?: string;
    message?: string;
}
export interface PaymentIframeRequest {
    ssoToken?: string;
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    transactionType: string;
    selectBan: string;
    currentSubscriber?: string;
    permissions: {
        provision: boolean;
        displayConfirmation: boolean;
        emailNotification: boolean;
        showInstrument: boolean;
        stroeInstrument: boolean;
        useBanZipCode: boolean;
    };
    paymentItems?: PaymentItem[];
    installments?: {
        locationId: string;
        invoiceNumber: string;
        installmentCount: number;
    };
}
export interface PaymentIframeResponse {
    errorInfo: {
        hasError: boolean;
        errorDisplay?: string;
    };
    url?: string;
}
export interface PaymentResult {
    success: boolean;
    authorizationNumber?: string;
    code?: string;
    date?: string;
    description?: string;
    operationId?: string;
    operationType?: string;
    paymentMethod?: string;
    paymentCard?: string;
    provisioning?: {
        referenceNumber: string;
    };
    storedInstrument?: any;
}
export declare class PaymentService {
    private paymentIframeUrl;
    /**
     * Set the payment iframe URL (from environment config)
     */
    setPaymentIframeUrl(url: string): void;
    /**
     * Get the payment iframe URL
     */
    getPaymentIframeUrl(): string;
    /**
     * Create order before payment
     */
    createOrder(request: OrderCreationRequest): Promise<OrderCreationResponse>;
    /**
     * Record successful payment
     */
    recordPayment(request: PaymentRecordRequest): Promise<PaymentRecordResponse>;
    /**
     * Record payment error
     */
    recordPaymentError(ban: string, subscriber: string, description: string, operationId: string, deposit: string, cardType: string, cardNumber: string, amount: string): Promise<any>;
    /**
     * Get payment iframe URL
     * TEL uses: api/Payment/getPaymentIframe (NOT getIframe)
     */
    getPaymentIframe(request: PaymentIframeRequest): Promise<PaymentIframeResponse>;
    storeOrderBan(ban: string): void;
    getOrderBan(): string;
    storePaymentResult(result: PaymentResult): void;
    getPaymentResult(): PaymentResult | null;
    clearPaymentData(): void;
    /**
     * Build payment items array from cart data
     */
    buildPaymentItems(cartData: {
        depositAmount?: number;
        totalDownPayment?: number;
        totalTax?: number;
        totalPrice?: number;
        installmentAmount?: number;
        cartUpdateResponse?: {
            acceletartedAmount?: number;
        };
    }): PaymentItem[];
    /**
     * Calculate total amount from payment items
     */
    calculateTotalAmount(items: PaymentItem[]): number;
}
export declare const paymentService: PaymentService;
