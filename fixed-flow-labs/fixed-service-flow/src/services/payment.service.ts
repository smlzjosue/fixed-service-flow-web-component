// ============================================
// PAYMENT SERVICE - Payment Processing
// Fixed Service Flow Web Component
// Based on TEL PaymentService & PaymentIframeService
// ============================================

import { httpService } from './http.service';
import { tokenService } from './token.service';
import { storageUtils } from '../utils/storage.utils';

// ------------------------------------------
// INTERFACES
// ------------------------------------------

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

export class PaymentService {
  private paymentIframeUrl: string = '';

  /**
   * Set the payment iframe URL (from environment config)
   */
  setPaymentIframeUrl(url: string): void {
    this.paymentIframeUrl = url;
  }

  /**
   * Get the payment iframe URL
   */
  getPaymentIframeUrl(): string {
    return this.paymentIframeUrl;
  }

  // ------------------------------------------
  // API METHODS
  // ------------------------------------------

  /**
   * Create order before payment
   */
  async createOrder(request: OrderCreationRequest): Promise<OrderCreationResponse> {
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
      const response = await httpService.postFormData<OrderCreationResponse>(
        'api/Orders/creationOfOrder',
        formData
      );

      if (!response.hasError && response.ban) {
        this.storeOrderBan(response.ban);
      }

      return response;
    } catch (error) {
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
  async recordPayment(request: PaymentRecordRequest): Promise<PaymentRecordResponse> {
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
      const response = await httpService.postFormData<PaymentRecordResponse>(
        'api/Payment/record',
        formData
      );
      return response;
    } catch (error) {
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
  async recordPaymentError(
    ban: string,
    subscriber: string,
    description: string,
    operationId: string,
    deposit: string,
    cardType: string,
    cardNumber: string,
    amount: string
  ): Promise<any> {
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
      return await httpService.postFormData<any>('api/Payment/error', formData);
    } catch (error) {
      console.error('[PaymentService] Record error error:', error);
      return { hasError: true };
    }
  }

  /**
   * Get payment iframe URL
   * TEL uses: api/Payment/getPaymentIframe (NOT getIframe)
   */
  async getPaymentIframe(request: PaymentIframeRequest): Promise<PaymentIframeResponse> {
    try {
      const response = await httpService.post<PaymentIframeResponse>(
        'api/Payment/getPaymentIframe',
        request
      );
      return response;
    } catch (error) {
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

  storeOrderBan(ban: string): void {
    storageUtils.set(STORAGE_KEYS.ORDER_BAN, ban);
  }

  getOrderBan(): string {
    return storageUtils.get(STORAGE_KEYS.ORDER_BAN) || '';
  }

  storePaymentResult(result: PaymentResult): void {
    storageUtils.setJSON(STORAGE_KEYS.PAYMENT_RESULT, result);
  }

  getPaymentResult(): PaymentResult | null {
    return storageUtils.getJSON<PaymentResult>(STORAGE_KEYS.PAYMENT_RESULT);
  }

  clearPaymentData(): void {
    storageUtils.remove(STORAGE_KEYS.ORDER_BAN);
    storageUtils.remove(STORAGE_KEYS.PAYMENT_RESULT);
  }

  // ------------------------------------------
  // PAYMENT ITEMS HELPERS
  // ------------------------------------------

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
  }): PaymentItem[] {
    const items: PaymentItem[] = [];

    if (cartData.depositAmount && cartData.depositAmount > 0) {
      items.push({ paymentType: 'DEPOSIT', amount: cartData.depositAmount });
    }

    if (cartData.totalDownPayment && cartData.totalDownPayment > 0) {
      items.push({ paymentType: 'DOWNPAYMENT', amount: cartData.totalDownPayment });
    }

    if (cartData.totalTax && cartData.totalTax > 0) {
      // Calculate tax portion
      const taxAmount =
        (cartData.totalPrice || 0) -
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
  calculateTotalAmount(items: PaymentItem[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
