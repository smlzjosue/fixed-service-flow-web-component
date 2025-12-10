// ============================================
// STEP PLANS - Plan Selection Step Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { flowState, flowActions } from '../../../store/flow.store';
import { plansService } from '../../../services';
import { Plan } from '../../../store/interfaces';
import { formatPrice } from '../../../utils/formatters';

@Component({
  tag: 'step-plans',
  styleUrl: 'step-plans.scss',
  shadow: true,
})
export class StepPlans {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() plans: Plan[] = [];
  @State() selectedPlan: Plan | null = null;
  @State() isLoading: boolean = true;
  @State() error: string | null = null;

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  async componentWillLoad() {
    await this.loadPlans();
  }

  // ------------------------------------------
  // METHODS
  // ------------------------------------------

  private async loadPlans() {
    this.isLoading = true;
    this.error = null;

    try {
      const serviceType = flowState.location?.serviceType || 'GPON';
      this.plans = await plansService.getPlans(serviceType);
      this.plans = plansService.sortByPrice(this.plans);
    } catch (err) {
      this.error = 'Error al cargar los planes';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  private handleSelectPlan = (plan: Plan) => {
    this.selectedPlan = plan;
    flowActions.selectPlan(plan);
  };

  private handleContinue = () => {
    if (this.selectedPlan) {
      this.onNext?.();
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const totalToday = this.selectedPlan ? 0 : 0;

    return (
      <Host>
        <div class="step-plans">
          {/* Header */}
          <header class="step-plans__header">
            <h1 class="step-plans__title">Elige tu plan</h1>
            <button class="step-plans__btn-back" onClick={this.onBack}>
              Regresar
            </button>
          </header>

          {/* Loading */}
          {this.isLoading && (
            <div class="step-plans__loading">
              <div class="step-plans__spinner"></div>
              <p>Cargando planes...</p>
            </div>
          )}

          {/* Error */}
          {this.error && (
            <div class="step-plans__error">
              <p>{this.error}</p>
              <button onClick={() => this.loadPlans()}>Reintentar</button>
            </div>
          )}

          {/* Plans Grid */}
          {!this.isLoading && !this.error && (
            <div class="step-plans__grid">
              {this.plans.map((plan) => (
                <div
                  class={{
                    'step-plans__card': true,
                    'step-plans__card--selected': this.selectedPlan?.planId === plan.planId,
                  }}
                  onClick={() => this.handleSelectPlan(plan)}
                >
                  <h3 class="step-plans__card-title">{plan.planName}</h3>
                  <p class="step-plans__card-subtitle">Plan incluye</p>
                  <ul class="step-plans__card-features">
                    {plansService.parsePlanFeatures(plan.planDesc || '').map((feature) => (
                      <li>{feature}</li>
                    ))}
                    {!plan.planDesc && (
                      <>
                        <li>Internet fibra 1</li>
                        <li>Internet 2</li>
                        <li>Internet 3</li>
                      </>
                    )}
                  </ul>
                  <p class="step-plans__card-price">{formatPrice(plan.decPrice)}</p>
                  <button class="step-plans__card-btn">
                    Solicitar plan
                  </button>
                </div>
              ))}

              {/* Empty state if no plans */}
              {this.plans.length === 0 && (
                <div class="step-plans__empty">
                  <p>No hay planes disponibles para tu área.</p>
                </div>
              )}
            </div>
          )}

          {/* Sticky Footer */}
          <footer class="step-plans__footer">
            <div class="step-plans__footer-info">
              <div class="step-plans__footer-item">
                <span class="step-plans__footer-label">Pago mensual</span>
                <span class="step-plans__footer-value">
                  {this.selectedPlan ? formatPrice(this.selectedPlan.decPrice) : '$0.00'}
                </span>
              </div>
              <div class="step-plans__footer-item">
                <span class="step-plans__footer-label">Paga hoy</span>
                <span class="step-plans__footer-value">{formatPrice(totalToday)}</span>
              </div>
            </div>
            <button
              class="step-plans__footer-btn"
              onClick={this.handleContinue}
              disabled={!this.selectedPlan}
            >
              Continuar
            </button>
          </footer>
        </div>
      </Host>
    );
  }
}
