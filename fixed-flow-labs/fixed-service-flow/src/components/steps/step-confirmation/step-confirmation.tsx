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
          <svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.4237 2C12.0492 2 2 11.8441 2 23.9661C2 36.0881 12.0492 45.9322 24.4237 45.9322C36.7983 45.9322 46.8475 36.0881 46.8475 23.9661" stroke="#0EA651" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M44.5225 4.19666L21.1852 30.8L12.3818 22.2577" stroke="#0EA651" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
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
          <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.5 0C38.0096 9.05167e-07 49 10.9899 49 24.5C49 38.0101 38.0096 49 24.5 49C10.9904 49 0 38.0101 0 24.5C0 10.9899 10.99 0 24.5 0ZM24.5 3.78516C13.0775 3.78516 3.78418 13.0774 3.78418 24.5C3.78418 35.9215 13.0774 45.2148 24.5 45.2148C35.9225 45.2148 45.2158 35.922 45.2158 24.5C45.2158 13.078 35.9225 3.78516 24.5 3.78516ZM24.5 31.8809C25.5449 31.8809 26.3915 32.7276 26.3916 33.7725V35.3486C26.3916 36.3936 25.5449 37.2412 24.5 37.2412C23.4551 37.2412 22.6084 36.3936 22.6084 35.3486V33.7725C22.6085 32.7276 23.4551 31.8809 24.5 31.8809ZM24.5 11.7588C25.5449 11.7588 26.3915 12.6055 26.3916 13.6504V27.7725C26.3916 28.8174 25.5449 29.6641 24.5 29.6641C23.4551 29.6641 22.6084 28.8174 22.6084 27.7725V13.6504C22.6085 12.6055 23.4551 11.7588 24.5 11.7588Z" fill="#B41E13"/>
          </svg>
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
