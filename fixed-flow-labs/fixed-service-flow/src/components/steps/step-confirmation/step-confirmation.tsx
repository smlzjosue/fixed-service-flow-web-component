// ============================================
// STEP CONFIRMATION - Confirmation/Result Step
// Fixed Service Flow Web Component
// Supports both Internet and CLARO HOGAR catalogue flows
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { flowState, flowActions } from '../../../store/flow.store';
import { requestService, paymentService, cartService, productService, shippingService, plansService } from '../../../services';
import { FlowCompleteEvent } from '../../../store/interfaces';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../utils/constants';

@Component({
  tag: 'step-confirmation',
  styleUrl: 'step-confirmation.scss',
  shadow: true,
})
export class StepConfirmation {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onComplete: (event: FlowCompleteEvent) => void;
  @Prop() onCancel: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() status: 'loading' | 'success' | 'error' = 'loading';
  @State() orderId: string | null = null;
  @State() orderNumber: string | null = null;
  @State() confirmationSent: boolean = false;
  @State() errorMessage: string = '';

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
    } else {
      await this.submitRequest();
    }
  }

  /**
   * Determines if this is a catalogue/equipment flow (CLARO HOGAR)
   * vs an internet service flow
   */
  private isCatalogueFlow(): boolean {
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
  private async handleCatalogueFlowConfirmation() {
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
        orderId: this.orderId!,
        plan: flowState.selectedPlan!,
        contract: null as any, // Not applicable for catalogue flow
        customer: null as any, // Customer data came from shipping form
        location: flowState.location!,
      });

    } catch (error) {
      console.error('[StepConfirmation] Catalogue flow error:', error);
      this.status = 'error';
      this.errorMessage = error.message || ERROR_MESSAGES.REQUEST_ERROR;
      flowActions.setOrderResult(null, this.errorMessage);
    }
  }

  // ------------------------------------------
  // METHODS
  // ------------------------------------------

  private async submitRequest() {
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
      const payload = requestService.buildPayload(formData!, contract!, plan!, location!);
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
        this.sendConfirmationEmail(this.orderId, formData!.personal.email);
      }

      // Mark as success
      this.status = 'success';

      // Store result
      flowActions.setOrderResult(this.orderId, null);

      // Emit complete event
      this.onComplete?.({
        orderId: this.orderId!,
        plan: plan!,
        contract: contract!,
        customer: formData!,
        location: location!,
      });

    } catch (error) {
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
  private async fetchOrderDetails(orderId: string) {
    try {
      const orderDetails = await requestService.getOrder(orderId);
      if (!orderDetails.hasError && orderDetails.orderNumber) {
        this.orderNumber = orderDetails.orderNumber;
      }
    } catch (error) {
      // Non-critical - just log the error
      console.warn('Could not fetch order details:', error);
    }
  }

  /**
   * Sends confirmation email to customer
   * Non-blocking - errors are logged but don't affect UI
   */
  private async sendConfirmationEmail(orderId: string, email: string) {
    try {
      const confirmationResult = await requestService.sendConfirmation(orderId, email);
      if (!confirmationResult.hasError && confirmationResult.sent) {
        this.confirmationSent = true;
      }
    } catch (error) {
      // Non-critical - just log the error
      console.warn('Could not send confirmation email:', error);
    }
  }

  private handleRetry = () => {
    this.submitRequest();
  };

  private handleClose = () => {
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
  private clearSessionStorage() {
    console.log('[StepConfirmation] Clearing all sessionStorage data');

    // Clear using service methods (they handle their own keys)
    try {
      cartService.clearCartSession();
      productService.clearProductSession();
      shippingService.clearShippingData();
      paymentService.clearPaymentData();
      plansService.clearPlan();
      flowActions.clearToken();
    } catch (e) {
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

  private renderLoading() {
    return (
      <div class="step-confirmation__loading">
        <div class="step-confirmation__spinner"></div>
        <p>Procesando tu solicitud...</p>
      </div>
    );
  }

  private renderSuccess() {
    // Prefer orderNumber from getOrder API, fallback to orderId from submit response
    const displayOrderId = this.orderNumber || this.orderId;

    return (
      <div class="step-confirmation__result step-confirmation__result--success">
        <div class="step-confirmation__icon step-confirmation__icon--success">
          <img src="/assets/images/ok-check.svg" alt="Éxito" />
        </div>
        <h2 class="step-confirmation__title step-confirmation__title--success">{SUCCESS_MESSAGES.REQUEST_SUCCESS}</h2>
        <p class="step-confirmation__message">{SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE}</p>
        {displayOrderId && (
          <p class="step-confirmation__order-id">Número de orden: {displayOrderId}</p>
        )}
        {this.confirmationSent && (
          <p class="step-confirmation__email-sent">
            Se ha enviado un correo de confirmación a tu email.
          </p>
        )}
      </div>
    );
  }

  private renderError() {
    return (
      <div class="step-confirmation__result step-confirmation__result--error">
        <div class="step-confirmation__icon step-confirmation__icon--error">
          <img src="/assets/images/error-check.svg" alt="Error" />
        </div>
        <h2 class="step-confirmation__title step-confirmation__title--error">
          ¡Lo sentimos, ha ocurrido un error en el proceso de solicitud!
        </h2>
        <p class="step-confirmation__message">
          En este momento estamos presentando inconvenientes en nuestro sistema.
          <br />
          Por favor, inténtalo nuevamente.
        </p>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div class="step-confirmation">
          <header class="step-confirmation__header">
            <h1 class="step-confirmation__header-title">Confirmación de Solicitud</h1>
          </header>

          <div class="step-confirmation__content">
            {this.status === 'loading' && this.renderLoading()}
            {this.status === 'success' && this.renderSuccess()}
            {this.status === 'error' && this.renderError()}
          </div>

          {this.status === 'success' && (
            <div class="step-confirmation__actions">
              <button class="step-confirmation__btn" onClick={this.handleClose}>
                Cerrar
              </button>
            </div>
          )}

          {this.status === 'error' && (
            <div class="step-confirmation__actions">
              <button class="step-confirmation__btn step-confirmation__btn--error" onClick={this.handleRetry}>
                Volver a intentar
              </button>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
