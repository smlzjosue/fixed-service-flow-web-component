// ============================================
// STEP CONFIRMATION - Confirmation/Result Step
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { flowState, flowActions } from '../../../store/flow.store';
import { requestService } from '../../../services';
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
  @State() errorMessage: string = '';

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  async componentWillLoad() {
    await this.submitRequest();
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

      // Success
      this.status = 'success';
      this.orderId = response.orderId || null;

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

  private handleRetry = () => {
    this.submitRequest();
  };

  private handleClose = () => {
    flowActions.resetFlow();
    this.onCancel?.();
  };

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
    return (
      <div class="step-confirmation__result step-confirmation__result--success">
        <div class="step-confirmation__icon step-confirmation__icon--success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 class="step-confirmation__title">{SUCCESS_MESSAGES.REQUEST_SUCCESS}</h2>
        <p class="step-confirmation__message">{SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE}</p>
        {this.orderId && (
          <p class="step-confirmation__order-id">Número de orden: {this.orderId}</p>
        )}
        <button class="step-confirmation__btn" onClick={this.handleClose}>
          Cerrar
        </button>
      </div>
    );
  }

  private renderError() {
    return (
      <div class="step-confirmation__result step-confirmation__result--error">
        <div class="step-confirmation__icon step-confirmation__icon--error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
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
        <button class="step-confirmation__btn step-confirmation__btn--error" onClick={this.handleRetry}>
          Volver a intentar
        </button>
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
        </div>
      </Host>
    );
  }
}
