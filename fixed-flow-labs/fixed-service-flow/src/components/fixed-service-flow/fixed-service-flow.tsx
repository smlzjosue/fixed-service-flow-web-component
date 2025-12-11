// ============================================
// FIXED SERVICE FLOW - Main Orchestrator Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, Event, EventEmitter, h, Host, Watch } from '@stencil/core';
import { flowState, flowActions } from '../../store/flow.store';
import { httpService, tokenService } from '../../services';
import {
  FlowStep,
  FlowCompleteEvent,
  FlowErrorEvent,
  StepChangeEvent,
} from '../../store/interfaces';
// @ts-ignore: STEP_TITLES reserved for future use (step header rendering)
import { STEP_TITLES as _STEP_TITLES } from '../../utils/constants';

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
    let to: FlowStep;

    if (direction === 'forward') {
      to = Math.min(this.currentStep + 1, 5) as FlowStep;
      flowActions.nextStep();
    } else {
      to = Math.max(this.currentStep - 1, 1) as FlowStep;
      flowActions.prevStep();
    }

    this.currentStep = flowState.currentStep;

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

    switch (this.currentStep) {
      case 1:
        return <step-location {...stepProps} />;
      case 2:
        // CLARO HOGAR uses catalogue (devices), others use plans (internet)
        if (this.isClaroHogar()) {
          this.log('CLARO HOGAR detected - showing catalogue');
          return <step-catalogue {...stepProps} />;
        }
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
