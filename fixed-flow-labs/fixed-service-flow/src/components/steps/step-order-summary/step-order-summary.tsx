// ============================================
// STEP ORDER SUMMARY - Cart Review for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on TEL order-summary-web.component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { cartService } from '../../../services/cart.service';
import { CartResponse, CartItem } from '../../../store/interfaces';

@Component({
  tag: 'step-order-summary',
  styleUrl: 'step-order-summary.scss',
  shadow: true,
})
export class StepOrderSummary {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() cart: CartResponse | null = null;
  @State() isLoading: boolean = true;
  @State() error: string | null = null;
  @State() promoCode: string = '';
  @State() isApplyingPromo: boolean = false;
  @State() promoError: string | null = null;
  @State() promoSuccess: boolean = false;
  @State() termsAccepted: boolean = false;
  @State() deletingItemId: number | null = null;

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentWillLoad() {
    this.loadCart();
  }

  // ------------------------------------------
  // METHODS
  // ------------------------------------------

  private async loadCart() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await cartService.getCart();

      if (response.hasError) {
        this.error = response.message || 'Error al cargar el carrito';
        return;
      }

      this.cart = response;
      console.log('[StepOrderSummary] Cart loaded:', this.cart);
      console.log('[StepOrderSummary] Products:', this.cart.products?.map(p => ({
        cartId: p.cartId,
        name: p.productName,
        equipment: p.equipment,
        home: p.home,
        plan: p.plan,
        parentCartId: p.parentCartId,
        installments: p.installments,
        price: p.decPrice,
      })));

    } catch (err) {
      console.error('[StepOrderSummary] Error:', err);
      this.error = 'Error de conexión al cargar el carrito';
    } finally {
      this.isLoading = false;
    }
  }

  private handlePromoCodeChange = (e: Event) => {
    this.promoCode = (e.target as HTMLInputElement).value.toUpperCase();
    this.promoError = null;
    this.promoSuccess = false;
  };

  private handleApplyPromo = async () => {
    if (!this.promoCode.trim()) {
      this.promoError = 'Ingresa un código promocional';
      return;
    }

    this.isApplyingPromo = true;
    this.promoError = null;
    this.promoSuccess = false;

    try {
      cartService.storeDiscountCoupon(this.promoCode);
      const response = await cartService.getCart(this.promoCode);

      if (response.hasError) {
        this.promoError = 'Código promocional inválido';
        cartService.clearDiscountCoupon();
        return;
      }

      this.cart = response;
      this.promoSuccess = true;
      console.log('[StepOrderSummary] Promo applied successfully');

    } catch (err) {
      console.error('[StepOrderSummary] Promo error:', err);
      this.promoError = 'Error al aplicar el código';
      cartService.clearDiscountCoupon();
    } finally {
      this.isApplyingPromo = false;
    }
  };

  private handleRemoveItem = async (item: CartItem) => {
    this.deletingItemId = item.cartId;

    try {
      const result = await cartService.deleteItem(item.cartId, item.productId);

      if (result.hasError) {
        console.error('[StepOrderSummary] Delete error:', result.message);
        return;
      }

      await this.loadCart();

    } catch (err) {
      console.error('[StepOrderSummary] Error removing item:', err);
    } finally {
      this.deletingItemId = null;
    }
  };

  private handleTermsChange = (e: Event) => {
    this.termsAccepted = (e.target as HTMLInputElement).checked;
  };

  private handleProceed = () => {
    if (!this.termsAccepted) {
      return;
    }
    this.onNext?.();
  };

  private formatPrice(price: number): string {
    return `$${(price || 0).toFixed(2)}`;
  }

  private getItemCount(): number {
    return this.cart?.products?.reduce((sum, item) => sum + item.qty, 0) || 0;
  }

  // Separate equipment from plans
  // Classification logic for CLARO HOGAR flow:
  // - The API returns both equipment and plan with same flags and catalogName
  // - Key differentiators:
  //   1. catalogName === "Catalogo de Planes Fijos" (for some flows)
  //   2. installments: Equipment has > 0 (financed), Plan has === 0 (monthly service)
  //   3. plan flag or parentCartId > 0
  private getEquipmentItems(): CartItem[] {
    if (!this.cart?.products) return [];

    console.log('[StepOrderSummary] Classifying products...');

    return this.cart.products.filter(item => {
      // Log each item for debugging
      console.log('[StepOrderSummary] Item:', item.productName, {
        catalogName: item.catalogName,
        equipment: item.equipment,
        home: item.home,
        plan: item.plan,
        parentCartId: item.parentCartId,
        installments: item.installments,
      });

      // Check catalogName for fixed plans catalog
      if (item.catalogName === 'Catalogo de Planes Fijos') {
        console.log('[StepOrderSummary] -> PLAN (catalogName: Catalogo de Planes Fijos)');
        return false;
      }

      // If explicitly marked as plan, it's not equipment
      if (item.plan) {
        console.log('[StepOrderSummary] -> PLAN (explicit plan flag)');
        return false;
      }

      // If it has a parentCartId > 0, it's a plan linked to equipment
      if (item.parentCartId && item.parentCartId > 0) {
        console.log('[StepOrderSummary] -> PLAN (has parentCartId)');
        return false;
      }

      // TEL Logic: If home === true && internet === true, it's an internet PLAN
      if (item.home && item.internet) {
        console.log('[StepOrderSummary] -> PLAN (home + internet flags)');
        return false;
      }

      // CLARO HOGAR heuristic: Equipment has financing (installments > 0)
      if (item.home && item.installments > 0) {
        console.log('[StepOrderSummary] -> EQUIPMENT (home with installments)');
        return true;
      }

      // CLARO HOGAR heuristic: No installments = monthly plan (not equipment)
      if (item.home && (!item.installments || item.installments === 0)) {
        console.log('[StepOrderSummary] -> PLAN (home without installments = monthly plan)');
        return false;
      }

      // Regular equipment (phones, accessories, etc.)
      if (item.equipment || item.accesory) {
        console.log('[StepOrderSummary] -> EQUIPMENT');
        return true;
      }

      console.log('[StepOrderSummary] -> UNKNOWN (not classified)');
      return false;
    });
  }

  private getPlanItems(): CartItem[] {
    if (!this.cart?.products) return [];

    return this.cart.products.filter(item => {
      // Check catalogName for fixed plans catalog
      if (item.catalogName === 'Catalogo de Planes Fijos') return true;

      // Explicit plan flag
      if (item.plan) return true;

      // If it has a parentCartId > 0, it's a plan linked to equipment
      if (item.parentCartId && item.parentCartId > 0) return true;

      // TEL Logic: If home === true && internet === true, it's an internet PLAN
      if (item.home && item.internet) return true;

      // CLARO HOGAR heuristic: home=true without installments = monthly internet plan
      if (item.home && (!item.installments || item.installments === 0)) return true;

      return false;
    });
  }

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  private renderEquipmentItem(item: CartItem, index: number) {
    const isDeleting = this.deletingItemId === item.cartId;
    const planItem = this.getPlanItems().find(p => p.parentCartId === item.cartId);

    return (
      <div class="product-card" key={`equip-${item.cartId}`}>
        {/* Equipment Section Header */}
        <div class="section-header section-header--equipment">
          <div class="section-header__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div class="section-header__text">
            <span class="section-header__label">EQUIPO</span>
            {index === 0 && <span class="section-header__badge">Principal</span>}
          </div>
        </div>

        {/* Main Product Row */}
        <div class="product-card__main">
          {/* Image */}
          <div class="product-card__image">
            <img
              src={item.imgUrl || item.detailImage || '/assets/placeholder.png'}
              alt={item.productName}
              onError={(e) => (e.target as HTMLImageElement).src = '/assets/placeholder.png'}
            />
          </div>

          {/* Details */}
          <div class="product-card__details">
            <h3 class="product-name">{item.productName}</h3>

            <div class="product-specs">
              {/* Color */}
              {item.colorName && (
                <div class="spec-item">
                  <span
                    class="color-circle"
                    style={{ backgroundColor: item.webColor || '#ccc' }}
                  ></span>
                  <span class="spec-label">{item.colorName}</span>
                </div>
              )}

              {/* Storage */}
              {item.storageName && item.storage && (
                <div class="spec-item">
                  <span class="storage-badge">{item.storage}GB</span>
                </div>
              )}

              {/* Quantity */}
              <div class="spec-item">
                <span class="qty-label">Cant: {item.qty}</span>
              </div>
            </div>

            {/* Financing info */}
            {item.installments > 1 && (
              <div class="financing-info">
                <span class="financing-label">Financiamiento de Equipo:</span>
                <span class="financing-detail">Término de pago ({item.installments} meses)</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div class="product-card__pricing">
            {item.installments > 1 ? (
              <div class="price-financing">
                <span class="price-monthly">{this.formatPrice(item.decTotalPerMonth || item.decPrice)}</span>
                <span class="price-period">/mes</span>
              </div>
            ) : (
              <div class="price-single">
                <span class="price-total">{this.formatPrice(item.decTotalPrice || item.decPrice)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div class="product-card__actions">
            <button
              class="btn-action btn-action--delete"
              onClick={() => this.handleRemoveItem(item)}
              disabled={isDeleting}
              title="Eliminar"
            >
              {isDeleting ? (
                <span class="spinner-small"></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Associated Plan Section */}
        {planItem && this.renderAssociatedPlan(planItem)}
      </div>
    );
  }

  private renderAssociatedPlan(plan: CartItem) {
    const isDeleting = this.deletingItemId === plan.cartId;

    return (
      <div class="plan-section">
        {/* Plan Section Header */}
        <div class="section-header section-header--plan">
          <div class="section-header__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div class="section-header__text">
            <span class="section-header__label">TU PLAN</span>
          </div>
        </div>

        <div class="plan-section__content">
          <div class="plan-info">
            <span class="plan-name">{plan.productName}</span>
            <span class="plan-type">Plan de Internet</span>
          </div>
          <div class="plan-price">
            <span class="price">{this.formatPrice(plan.decPrice || plan.decTotalPerMonth)}</span>
            <span class="period">/mes</span>
          </div>
          <button
            class="btn-action btn-action--delete-small"
            onClick={() => this.handleRemoveItem(plan)}
            disabled={isDeleting}
            title="Eliminar plan"
          >
            {isDeleting ? (
              <span class="spinner-small"></span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  private renderStandalonePlan(plan: CartItem) {
    const isDeleting = this.deletingItemId === plan.cartId;

    return (
      <div class="product-card product-card--plan" key={`plan-${plan.cartId}`}>
        {/* Plan Section Header */}
        <div class="section-header section-header--plan">
          <div class="section-header__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div class="section-header__text">
            <span class="section-header__label">PLAN DE INTERNET</span>
          </div>
        </div>

        <div class="product-card__main product-card__main--plan">
          <div class="product-card__image product-card__image--plan">
            <img
              src={plan.imgUrl || plan.detailImage || '/assets/placeholder.png'}
              alt={plan.productName}
              onError={(e) => (e.target as HTMLImageElement).src = '/assets/placeholder.png'}
            />
          </div>

          <div class="product-card__details">
            <h3 class="product-name">{plan.productName}</h3>
            <span class="plan-type">Renta mensual</span>
          </div>

          <div class="product-card__pricing">
            <div class="price-financing">
              <span class="price-monthly">{this.formatPrice(plan.decPrice || plan.decTotalPerMonth)}</span>
              <span class="price-period">/mes</span>
            </div>
          </div>

          <div class="product-card__actions">
            <button
              class="btn-action btn-action--delete"
              onClick={() => this.handleRemoveItem(plan)}
              disabled={isDeleting}
              title="Eliminar"
            >
              {isDeleting ? (
                <span class="spinner-small"></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderPromoCode() {
    return (
      <div class="summary-card promo-section">
        <h4 class="summary-card__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          Cupón de descuento
        </h4>
        <div class="promo-input-group">
          <input
            type="text"
            class={{
              'promo-input': true,
              'error': !!this.promoError,
              'success': this.promoSuccess,
            }}
            placeholder="Ingresa tu código"
            value={this.promoCode}
            onInput={this.handlePromoCodeChange}
            disabled={this.isApplyingPromo}
          />
          <button
            class="promo-button"
            onClick={this.handleApplyPromo}
            disabled={this.isApplyingPromo || !this.promoCode.trim()}
          >
            {this.isApplyingPromo ? (
              <span class="spinner-small"></span>
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
        {this.promoError && (
          <span class="promo-message error">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2"></line>
            </svg>
            {this.promoError}
          </span>
        )}
        {this.promoSuccess && (
          <span class="promo-message success">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="9 12 11 14 15 10" fill="none" stroke="white" stroke-width="2"></polyline>
            </svg>
            ¡Cupón aplicado!
          </span>
        )}
      </div>
    );
  }

  private renderPaymentSummary() {
    if (!this.cart) return null;

    const monthlyRent = this.cart.subTotalPerMonth || 0;
    const subtotal = this.cart.subTotalPrice || 0;
    const tax = this.cart.totalTax || 0;
    const total = this.cart.totalPrice || 0;
    const downPayment = this.cart.totalDownPayment || 0;
    // Discount is calculated from promo code application (stored locally if applied)
    const discount = 0; // Will be calculated when promo system is fully integrated

    return (
      <div class="summary-card payment-summary">
        {/* Monthly Rent Section - TEL Style */}
        {monthlyRent > 0 && (
          <div class="rent-section">
            <div class="rent-row">
              <span class="rent-label">Renta mensual</span>
              <span class="rent-value">{this.formatPrice(monthlyRent)}</span>
            </div>
            <p class="rent-note">*No incluye cargos estatales y federales</p>
          </div>
        )}

        {/* Payment Breakdown */}
        <div class="payment-breakdown">
          <h4 class="summary-card__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            Detalle del pago
          </h4>

          <div class="detail-rows">
            {subtotal > 0 && (
              <div class="detail-row">
                <span class="label">Subtotal equipos</span>
                <span class="value">{this.formatPrice(subtotal)}</span>
              </div>
            )}

            {downPayment > 0 && (
              <div class="detail-row">
                <span class="label">Pago inicial</span>
                <span class="value">{this.formatPrice(downPayment)}</span>
              </div>
            )}

            {discount > 0 && (
              <div class="detail-row detail-row--discount">
                <span class="label">Descuento aplicado</span>
                <span class="value">-{this.formatPrice(discount)}</span>
              </div>
            )}

            <div class="detail-row">
              <span class="label">Cargos estatales y federales</span>
              <span class="value">{this.formatPrice(tax)}</span>
            </div>

            <div class="detail-row detail-row--shipping">
              <span class="label">Costo de envío</span>
              <span class="value value--free">GRATIS</span>
            </div>
          </div>

          {/* Total */}
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Paga hoy</span>
              <span class="total-value">{this.formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderTermsCheckbox() {
    return (
      <div class="terms-section">
        <label class="terms-checkbox">
          <input
            type="checkbox"
            checked={this.termsAccepted}
            onChange={this.handleTermsChange}
          />
          <span class="checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span class="terms-text">
            Acepto los <a href="#" onClick={(e) => e.preventDefault()}>términos y condiciones</a> de Claro Puerto Rico
          </span>
        </label>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const itemCount = this.getItemCount();
    const hasItems = itemCount > 0;
    const canProceed = hasItems && this.termsAccepted;
    const equipmentItems = this.getEquipmentItems();
    const standalonePlans = this.getPlanItems().filter(p => !p.parentCartId);

    return (
      <Host>
        <div class="step-order-summary">
          {/* Header */}
          <header class="header">
            <button class="btn-back" onClick={this.onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              <span>Regresar</span>
            </button>
            <div class="header__title-group">
              <h1 class="title">Resumen de tu orden</h1>
              {hasItems && (
                <span class="item-count">
                  {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                </span>
              )}
            </div>
          </header>

          {/* Loading */}
          {this.isLoading && (
            <div class="state-container">
              <div class="spinner"></div>
              <p>Cargando tu carrito...</p>
            </div>
          )}

          {/* Error */}
          {this.error && !this.isLoading && (
            <div class="state-container state-container--error">
              <svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{this.error}</p>
              <button class="btn-retry" onClick={() => this.loadCart()}>
                Reintentar
              </button>
            </div>
          )}

          {/* Empty Cart */}
          {!this.isLoading && !this.error && !hasItems && (
            <div class="state-container state-container--empty">
              <svg class="state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
              </svg>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega productos para continuar con tu compra</p>
              <button class="btn-back-catalog" onClick={this.onBack}>
                Ir al catálogo
              </button>
            </div>
          )}

          {/* Cart Content */}
          {!this.isLoading && !this.error && hasItems && (
            <div class="content-layout">
              {/* Products Column */}
              <div class="products-column">
                {equipmentItems.map((item, index) => this.renderEquipmentItem(item, index))}
                {standalonePlans.map(plan => this.renderStandalonePlan(plan))}
              </div>

              {/* Summary Column */}
              <div class="summary-column">
                {this.renderPromoCode()}
                {this.renderPaymentSummary()}
                {this.renderTermsCheckbox()}

                <button
                  class={{
                    'btn-proceed': true,
                    'disabled': !canProceed,
                  }}
                  onClick={this.handleProceed}
                  disabled={!canProceed}
                >
                  <span>Procesar orden</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
