// ============================================
// STEP PLANS - Plan Selection Step Component
// Fixed Service Flow Web Component
// Design based on docs/capturas/4.png + Carousel
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
  @State() isAddingToCart: boolean = false;

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  async componentWillLoad() {
    await this.loadPlans();

    // Check if there's a previously selected plan in session
    const storedPlanId = plansService.getStoredPlanId();
    if (storedPlanId > 0) {
      const storedPlan = this.plans.find(p => p.planId === storedPlanId);
      if (storedPlan) {
        this.selectedPlan = storedPlan;
        flowActions.selectPlan(storedPlan);
      }
    }
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

  /**
   * Handles plan selection - following TEL's flow:
   * 1. Check if there's an existing different plan -> delete it
   * 2. Store plan in session
   * 3. Call addToCart API
   */
  private handleSelectPlan = async (plan: Plan) => {
    // If clicking the same plan, do nothing
    if (this.selectedPlan?.planId === plan.planId) {
      return;
    }

    this.isAddingToCart = true;
    this.error = null;

    try {
      // Step 1: If there's a different plan already in cart, delete it first (TEL pattern)
      const currentPlanId = plansService.getStoredPlanId();
      const currentCartId = plansService.getCartId();

      if (currentPlanId > 0 && currentPlanId !== plan.planId && currentCartId > 0) {
        console.log('[StepPlans] Removing previous plan from cart:', currentPlanId);
        await plansService.deleteFromCart(currentCartId);
      }

      // Step 2: Add new plan to cart
      console.log('[StepPlans] Adding plan to cart:', plan.planId, plan.planName);
      await plansService.addToCart(plan);

      // Step 3: Update local state
      this.selectedPlan = plan;
      flowActions.selectPlan(plan);

      console.log('[StepPlans] Plan added successfully');
    } catch (err) {
      console.error('[StepPlans] Error adding plan to cart:', err);
      this.error = 'Error al agregar el plan. Por favor intente de nuevo.';

      // Still allow selection locally even if cart API fails
      // This way the user can continue the flow
      this.selectedPlan = plan;
      flowActions.selectPlan(plan);
    } finally {
      this.isAddingToCart = false;
    }
  };

  private handleContinue = () => {
    if (this.selectedPlan && !this.isAddingToCart) {
      this.onNext?.();
    }
  };

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  private renderPlanCard(plan: Plan) {
    const isSelected = this.selectedPlan?.planId === plan.planId;
    const isProcessing = this.isAddingToCart && isSelected;
    const features = plansService.parsePlanFeatures(plan.planDesc || '');

    // Default features if none parsed
    const displayFeatures = features.length > 0 ? features : [
      'Internet fibra 1',
      'Internet 2',
      'Internet 3'
    ];

    return (
      <div
        class={{
          'plan-card': true,
          'plan-card--selected': isSelected,
          'plan-card--processing': isProcessing,
        }}
        onClick={() => !this.isAddingToCart && this.handleSelectPlan(plan)}
      >
        {/* Card Header - Cyan bar with plan name */}
        <div class="plan-card__header">
          <span class="plan-card__name">{plan.planName}</span>
        </div>

        {/* Card Body */}
        <div class="plan-card__body">
          {/* Plan includes label */}
          <p class="plan-card__includes-label">Plan incluye</p>

          {/* Features list */}
          <ul class="plan-card__features">
            {displayFeatures.slice(0, 4).map((feature) => (
              <li class="plan-card__feature">{feature}</li>
            ))}
          </ul>

          {/* Price */}
          <p class="plan-card__price">{formatPrice(plan.decPrice)}</p>
        </div>

        {/* Card Footer with button */}
        <div class="plan-card__footer">
          <button
            class={{
              'plan-card__btn': true,
              'plan-card__btn--selected': isSelected,
              'plan-card__btn--loading': isProcessing,
            }}
            disabled={this.isAddingToCart}
          >
            {isProcessing ? (
              <span class="plan-card__btn-loading">
                <span class="plan-card__btn-spinner"></span>
                Agregando...
              </span>
            ) : isSelected ? (
              'Plan seleccionado'
            ) : (
              'Solicitar plan'
            )}
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const monthlyPayment = this.selectedPlan ? this.selectedPlan.decPrice : 0;
    const totalToday = 0;

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

          {/* Plans Carousel - Single row with navigation */}
          {!this.isLoading && !this.error && this.plans.length > 0 && (
            <div class="step-plans__carousel-container">
              <ui-carousel
                totalItems={this.plans.length}
                gap={24}
                showNavigation={true}
                showPagination={true}
                breakpoints={[
                  { minWidth: 0, slidesPerView: 1 },
                  { minWidth: 500, slidesPerView: 2 },
                  { minWidth: 800, slidesPerView: 3 },
                  { minWidth: 1100, slidesPerView: 4 },
                ]}
              >
                {this.plans.map((plan) => this.renderPlanCard(plan))}
              </ui-carousel>
            </div>
          )}

          {/* Empty state if no plans */}
          {!this.isLoading && !this.error && this.plans.length === 0 && (
            <div class="step-plans__empty">
              <p>No hay planes disponibles para tu área.</p>
            </div>
          )}

          {/* Sticky Footer */}
          <footer class="step-plans__footer">
            <div class="step-plans__footer-info">
              <div class="step-plans__footer-item">
                <span class="step-plans__footer-label">Pago mensual</span>
                <span class="step-plans__footer-value">{formatPrice(monthlyPayment)}</span>
              </div>
              <div class="step-plans__footer-item">
                <span class="step-plans__footer-label">Paga hoy</span>
                <span class="step-plans__footer-value step-plans__footer-value--highlight">
                  {formatPrice(totalToday)}
                </span>
              </div>
            </div>
            <p class="step-plans__footer-note">
              Precio mensual aproximado no incluye cargos estatales, federales, ni otros impuestos.
            </p>
            <button
              class="step-plans__footer-btn"
              onClick={this.handleContinue}
              disabled={!this.selectedPlan || this.isAddingToCart}
            >
              {this.isAddingToCart ? 'Procesando...' : 'Continuar'}
            </button>
          </footer>
        </div>
      </Host>
    );
  }
}
