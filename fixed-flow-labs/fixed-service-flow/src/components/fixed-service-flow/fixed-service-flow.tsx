// ============================================
// FIXED SERVICE FLOW - Main Orchestrator Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, Event, EventEmitter, h, Host, Watch } from '@stencil/core';
import { flowState, flowActions } from '../../store/flow.store';
import { httpService, tokenService } from '../../services';
import {
  FlowCompleteEvent,
  FlowErrorEvent,
  StepChangeEvent,
} from '../../store/interfaces';
// @ts-ignore: STEP_TITLES reserved for future use (step header rendering)
import { STEP_TITLES as _STEP_TITLES } from '../../utils/constants';

/**
 * Flow step definitions
 * Standard Flow (GPON/VRAD): 1-5
 * CLARO HOGAR Flow: 1-8
 */
type FlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * CLARO HOGAR step names for clarity
 */
const CLARO_HOGAR_STEPS = {
  LOCATION: 1,        // Ubicación/Cobertura
  CATALOGUE: 2,       // Catálogo de productos
  PRODUCT_DETAIL: 3,  // Detalle del producto
  PLANS: 4,           // Planes de internet
  ORDER_SUMMARY: 5,   // Resumen de orden
  SHIPPING: 6,        // Dirección de envío
  PAYMENT: 7,         // Pago
  CONFIRMATION: 8,    // Confirmación
} as const;

// Max step per flow type
const MAX_STEP_STANDARD = 5;
const MAX_STEP_CLARO_HOGAR = 8;

@Component({
  tag: 'fixed-service-flow',
  styleUrl: 'fixed-service-flow.scss',
  shadow: true,
})
export class FixedServiceFlow {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Base URL for the API
   */
  @Prop() apiUrl!: string;

  /**
   * Google Maps API Key
   */
  @Prop() googleMapsKey!: string;

  /**
   * Optional correlation ID for tracking
   */
  @Prop() correlationId?: string;

  /**
   * Initial step (default: 1)
   */
  @Prop() initialStep?: FlowStep = 1;

  /**
   * Debug mode
   */
  @Prop() debug?: boolean = false;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() currentStep: FlowStep = 1;
  @State() isLoading: boolean = true;
  @State() error: string | null = null;
  @State() isInitialized: boolean = false;

  // ------------------------------------------
  // EVENTS
  // ------------------------------------------

  /**
   * Emitted when the flow completes successfully
   */
  @Event() flowComplete: EventEmitter<FlowCompleteEvent>;

  /**
   * Emitted when an error occurs
   */
  @Event() flowError: EventEmitter<FlowErrorEvent>;

  /**
   * Emitted when user cancels the flow
   */
  @Event() flowCancel: EventEmitter<void>;

  /**
   * Emitted when step changes
   */
  @Event() stepChange: EventEmitter<StepChangeEvent>;

  // ------------------------------------------
  // WATCHERS
  // ------------------------------------------

  @Watch('apiUrl')
  handleApiUrlChange(newValue: string) {
    if (newValue) {
      httpService.setBaseUrl(newValue);
    }
  }

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  async componentWillLoad() {
    // Set debug mode
    if (this.debug) {
      (window as any).__FSF_DEBUG__ = true;
    }

    // Configure HTTP service
    if (this.apiUrl) {
      httpService.setBaseUrl(this.apiUrl);
    }

    // Set initial step
    if (this.initialStep) {
      this.currentStep = this.initialStep;
      flowActions.setStep(this.initialStep);
    }

    // Initialize token
    await this.initializeToken();
  }

  componentDidLoad() {
    this.log('Component loaded');
  }

  disconnectedCallback() {
    this.log('Component disconnected');
    // Cleanup if needed
  }

  // ------------------------------------------
  // INITIALIZATION
  // ------------------------------------------

  private async initializeToken(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const success = await tokenService.initialize();

      if (!success) {
        this.error = 'Error al inicializar la sesión';
        this.emitError(new Error(this.error), false);
      }

      this.isInitialized = true;
    } catch (err) {
      this.error = err.message || 'Error de inicialización';
      this.emitError(err, false);
    } finally {
      this.isLoading = false;
    }
  }

  // ------------------------------------------
  // NAVIGATION
  // ------------------------------------------

  private handleStepChange = (direction: 'forward' | 'backward') => {
    const from = this.currentStep;
    const maxStep = this.isClaroHogar() ? MAX_STEP_CLARO_HOGAR : MAX_STEP_STANDARD;
    let to: FlowStep;

    if (direction === 'forward') {
      to = Math.min(this.currentStep + 1, maxStep) as FlowStep;
      flowActions.nextStep();
    } else {
      to = Math.max(this.currentStep - 1, 1) as FlowStep;
      flowActions.prevStep();
    }

    this.currentStep = to;
    flowActions.setStep(to);

    this.stepChange.emit({ from, to, direction });
    this.log(`Step changed: ${from} -> ${to}`);
  };

  // @ts-ignore: goToStep reserved for future use (direct step navigation)
  private _goToStep = (step: FlowStep) => {
    const from = this.currentStep;
    const direction = step > from ? 'forward' : 'backward';

    flowActions.setStep(step);
    this.currentStep = step;

    this.stepChange.emit({ from, to: step, direction });
    this.log(`Step changed: ${from} -> ${step}`);
  };

  // ------------------------------------------
  // EVENT HANDLERS
  // ------------------------------------------

  private handleFlowComplete = (event: FlowCompleteEvent) => {
    this.log('Flow completed', event);
    this.flowComplete.emit(event);
  };

  private handleFlowCancel = () => {
    this.log('Flow cancelled');
    flowActions.resetFlow();
    this.currentStep = 1;
    flowActions.setStep(1);
    this.flowCancel.emit();
  };

  private emitError(error: Error | string, recoverable: boolean = true) {
    this.flowError.emit({
      step: this.currentStep,
      error,
      recoverable,
    });
  }

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[FixedServiceFlow]', ...args);
    }
  }

  /**
   * Checks if the current flow is for CLARO HOGAR (wireless internet)
   */
  private isClaroHogar(): boolean {
    const serviceType = flowState.location?.serviceType?.toUpperCase();
    return serviceType === 'CLARO HOGAR';
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  private renderStep() {
    const stepProps = {
      onNext: () => this.handleStepChange('forward'),
      onBack: () => this.handleStepChange('backward'),
      onComplete: this.handleFlowComplete,
      googleMapsKey: this.googleMapsKey,
    };

    // CLARO HOGAR Flow (e-commerce)
    if (this.isClaroHogar()) {
      this.log('CLARO HOGAR flow - step:', this.currentStep);
      return this.renderClaroHogarStep(stepProps);
    }

    // Standard Flow (GPON/VRAD - internet service request)
    return this.renderStandardStep(stepProps);
  }

  /**
   * Renders steps for Standard Flow (GPON/VRAD)
   * Steps: 1.Location -> 2.Plans -> 3.Contract -> 4.Form -> 5.Confirmation
   */
  private renderStandardStep(stepProps: any) {
    switch (this.currentStep) {
      case 1:
        return <step-location {...stepProps} />;
      case 2:
        return <step-plans {...stepProps} />;
      case 3:
        return <step-contract {...stepProps} />;
      case 4:
        return <step-form {...stepProps} />;
      case 5:
        return <step-confirmation {...stepProps} onCancel={this.handleFlowCancel} />;
      default:
        return null;
    }
  }

  /**
   * Renders steps for CLARO HOGAR Flow (e-commerce)
   * Steps: 1.Location -> 2.Catalogue -> 3.ProductDetail -> 4.Plans ->
   *        5.OrderSummary -> 6.Shipping -> 7.Payment -> 8.Confirmation
   */
  private renderClaroHogarStep(stepProps: any) {
    switch (this.currentStep) {
      case CLARO_HOGAR_STEPS.LOCATION:
        return <step-location {...stepProps} />;

      case CLARO_HOGAR_STEPS.CATALOGUE:
        return <step-catalogue {...stepProps} />;

      case CLARO_HOGAR_STEPS.PRODUCT_DETAIL:
        return <step-product-detail {...stepProps} />;

      case CLARO_HOGAR_STEPS.PLANS:
        // Plans for the selected product
        return <step-plans {...stepProps} />;

      case CLARO_HOGAR_STEPS.ORDER_SUMMARY:
        // TODO: Create step-order-summary component
        // For now, skip to shipping
        this.log('Order Summary step - TODO');
        return (
          <div class="step-placeholder">
            <h2>Resumen de Orden</h2>
            <p>Este paso está en desarrollo</p>
            <button onClick={stepProps.onNext}>Continuar</button>
            <button onClick={stepProps.onBack}>Regresar</button>
          </div>
        );

      case CLARO_HOGAR_STEPS.SHIPPING:
        // TODO: Create step-shipping component
        // For now, use step-form
        return <step-form {...stepProps} />;

      case CLARO_HOGAR_STEPS.PAYMENT:
        // TODO: Create step-payment component
        this.log('Payment step - TODO');
        return (
          <div class="step-placeholder">
            <h2>Pago</h2>
            <p>Este paso está en desarrollo</p>
            <button onClick={stepProps.onNext}>Continuar</button>
            <button onClick={stepProps.onBack}>Regresar</button>
          </div>
        );

      case CLARO_HOGAR_STEPS.CONFIRMATION:
        return <step-confirmation {...stepProps} onCancel={this.handleFlowCancel} />;

      default:
        return null;
    }
  }

  private renderLoading() {
    return (
      <div class="fsf-loading">
        <div class="fsf-loading__spinner"></div>
        <p class="fsf-loading__text">Cargando...</p>
      </div>
    );
  }

  private renderError() {
    return (
      <div class="fsf-error">
        <div class="fsf-error__icon">!</div>
        <h3 class="fsf-error__title">Error</h3>
        <p class="fsf-error__message">{this.error}</p>
        <button class="fsf-error__button" onClick={() => this.initializeToken()}>
          Reintentar
        </button>
      </div>
    );
  }

  render() {
    // Show loading state
    if (this.isLoading) {
      return (
        <Host>
          {this.renderLoading()}
        </Host>
      );
    }

    // Show error state
    if (this.error && !this.isInitialized) {
      return (
        <Host>
          {this.renderError()}
        </Host>
      );
    }

    // Render flow
    return (
      <Host>
        <div class="fsf-container">
          {this.renderStep()}
        </div>
      </Host>
    );
  }
}
