// ============================================
// STEP PAYMENT - Payment Processing
// Fixed Service Flow Web Component
// Design based on TEL payment-web.component
// ============================================

import { Component, Prop, State, h, Host, Element } from '@stencil/core';
import { paymentService, PaymentItem, PaymentResult } from '../../../services/payment.service';
import { cartService } from '../../../services/cart.service';
import { shippingService } from '../../../services/shipping.service';
import { CartResponse } from '../../../store/interfaces';

type PaymentScreen = 'loading' | 'creating-order' | 'payment' | 'processing' | 'error' | 'success';

@Component({
  tag: 'step-payment',
  styleUrl: 'step-payment.scss',
  shadow: true,
})
export class StepPayment {
  @Element() el: HTMLElement;

  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // Optional: External payment iframe URL
  @Prop() paymentIframeUrl?: string;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() screen: PaymentScreen = 'loading';
  @State() error: string | null = null;
  @State() cart: CartResponse | null = null;
  @State() orderBan: string = '';
  @State() totalAmount: number = 0;
  @State() paymentItems: PaymentItem[] = [];
  @State() iframeUrl: string = '';
  @State() iframeHeight: string = '500px';
  @State() paymentResult: PaymentResult | null = null;

  // User info for payment
  private userName: string = '';
  private userLastName: string = '';
  private userEmail: string = '';

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

  private async loadCartAndPreparePayment() {
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

    } catch (err) {
      console.error('[StepPayment] Error:', err);
      this.error = 'Error de conexión';
      this.screen = 'error';
    }
  }

  private async createOrder() {
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

    } catch (err) {
      console.error('[StepPayment] Create order error:', err);
      this.error = 'Error al crear la orden';
      this.screen = 'error';
    }
  }

  private async initializePaymentIframe() {
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

    } catch (err) {
      console.error('[StepPayment] Init iframe error:', err);
      this.error = 'Error al inicializar el formulario de pago';
      this.screen = 'error';
    }
  }

  private handleIframeMessage = (event: MessageEvent) => {
    if (typeof event.data !== 'string') return;

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
          const paymentResult = JSON.parse(atob(result)) as PaymentResult;

          if (paymentResult.success) {
            this.handlePaymentSuccess(paymentResult);
          } else {
            this.handlePaymentError(paymentResult);
          }
        }
      }
    } catch {
      // Ignore non-payment messages
    }
  };

  private async handlePaymentSuccess(result: PaymentResult) {
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

    } catch (err) {
      console.error('[StepPayment] Record payment error:', err);
      this.error = 'Error al registrar el pago';
      this.screen = 'error';
    }
  }

  private async handlePaymentError(result: PaymentResult) {
    await paymentService.recordPaymentError(
      this.orderBan,
      '',
      result.description || 'Payment failed',
      result.operationId || '',
      (this.cart?.totalDownPayment || 0).toString(),
      result.paymentMethod || '',
      result.paymentCard || '',
      this.totalAmount.toString()
    );

    this.error = result.description || 'El pago no pudo ser procesado';
    this.screen = 'error';
  }

  private handlePaymentCancel() {
    this.onBack?.();
  }

  private async handleFreePayment() {
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

    } catch (err) {
      console.error('[StepPayment] Free payment error:', err);
      this.error = 'Error al procesar';
      this.screen = 'error';
    }
  }

  private handleRetry = () => {
    this.loadCartAndPreparePayment();
  };

  private formatPrice(price: number): string {
    return `$${(price || 0).toFixed(2)}`;
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  private renderLoading() {
    return (
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Cargando información del pago...</p>
      </div>
    );
  }

  private renderCreatingOrder() {
    return (
      <div class="loading-container">
        <div class="spinner"></div>
        <h3>Preparando tu orden</h3>
        <p>Por favor espera mientras procesamos tu solicitud...</p>
        <p class="warning">No cierres esta ventana ni navegues a otra página.</p>
      </div>
    );
  }

  private renderPaymentForm() {
    return (
      <div class="payment-container">
        <div class="payment-summary">
          <h3>Resumen del pago</h3>
          <div class="amount-display">
            <span class="label">Total a pagar:</span>
            <span class="value">{this.formatPrice(this.totalAmount)}</span>
          </div>
          {this.paymentItems.length > 0 && (
            <div class="payment-items">
              {this.paymentItems.map((item) => (
                <div class="payment-item">
                  <span class="item-type">{this.getPaymentTypeLabel(item.paymentType)}</span>
                  <span class="item-amount">{this.formatPrice(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div class="iframe-container">
          {this.iframeUrl ? (
            <iframe
              src={this.iframeUrl}
              width="100%"
              height={this.iframeHeight}
              frameBorder="0"
              title="Payment Form"
            ></iframe>
          ) : (
            <div class="iframe-placeholder">
              <div class="spinner"></div>
              <p>Cargando formulario de pago...</p>
            </div>
          )}
        </div>

        <button class="btn-cancel" onClick={() => this.handlePaymentCancel()}>
          Cancelar
        </button>
      </div>
    );
  }

  private renderProcessing() {
    return (
      <div class="loading-container">
        <div class="spinner"></div>
        <h3>Procesando pago</h3>
        <p>Por favor espera mientras confirmamos tu pago...</p>
      </div>
    );
  }

  private renderSuccess() {
    return (
      <div class="success-container">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3>Pago exitoso</h3>
        <p>Tu pago ha sido procesado correctamente.</p>
        <p class="redirect-note">Redirigiendo a la confirmación...</p>
      </div>
    );
  }

  private renderError() {
    return (
      <div class="error-container">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>Error en el pago</h3>
        <p>{this.error}</p>
        <div class="error-actions">
          <button class="btn-retry" onClick={this.handleRetry}>
            Intentar nuevamente
          </button>
          <button class="btn-back" onClick={() => this.onBack?.()}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  private getPaymentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      DEPOSIT: 'Depósito',
      DOWNPAYMENT: 'Pago inicial',
      TAXES: 'Impuestos',
      INSTALLMENT: 'Cuotas',
      PASTDUEONLY: 'Balance pendiente',
    };
    return labels[type] || type;
  }

  render() {
    return (
      <Host>
        <div class="step-payment">
          {/* Header */}
          <div class="header">
            {this.screen !== 'processing' && this.screen !== 'success' && (
              <button class="btn-back-nav" onClick={() => this.onBack?.()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                Regresar
              </button>
            )}
            <h1 class="title">Pago</h1>
          </div>

          {/* Content based on screen */}
          <div class="content">
            {this.screen === 'loading' && this.renderLoading()}
            {this.screen === 'creating-order' && this.renderCreatingOrder()}
            {this.screen === 'payment' && this.renderPaymentForm()}
            {this.screen === 'processing' && this.renderProcessing()}
            {this.screen === 'success' && this.renderSuccess()}
            {this.screen === 'error' && this.renderError()}
          </div>
        </div>
      </Host>
    );
  }
}
