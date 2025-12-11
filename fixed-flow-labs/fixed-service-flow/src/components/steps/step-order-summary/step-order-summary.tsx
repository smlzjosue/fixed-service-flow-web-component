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
      // Store the promo code and reload cart
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
    try {
      const result = await cartService.deleteItem(item.cartId, item.productId);

      if (result.hasError) {
        console.error('[StepOrderSummary] Delete error:', result.message);
        return;
      }

      // Reload cart
      await this.loadCart();

    } catch (err) {
      console.error('[StepOrderSummary] Error removing item:', err);
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

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  private renderCartItem(item: CartItem) {
    return (
      <div class="cart-item">
        <div class="cart-item__image">
          <img src={item.imgUrl || '/assets/placeholder.png'} alt={item.productName} />
        </div>

        <div class="cart-item__details">
          <h4 class="item-name">{item.productName}</h4>
          {item.colorName && (
            <span class="item-variant">Color: {item.colorName}</span>
          )}
          {item.storageName && (
            <span class="item-variant">Almacenamiento: {item.storageName}</span>
          )}
          <span class="item-qty">Cantidad: {item.qty}</span>
        </div>

        <div class="cart-item__pricing">
          <div class="monthly-price">
            <span class="label">Mensual</span>
            <span class="value">{this.formatPrice(item.decTotalPerMonth || item.decPrice)}</span>
          </div>
          {item.installments > 1 && (
            <div class="installments">
              <span>{item.installments} plazos</span>
            </div>
          )}
          <div class="total-price">
            <span class="label">Total</span>
            <span class="value">{this.formatPrice(item.decTotalPrice || item.decPrice * item.qty)}</span>
          </div>
        </div>

        <button class="cart-item__remove" onClick={() => this.handleRemoveItem(item)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
        </button>
      </div>
    );
  }

  private renderPromoCode() {
    return (
      <div class="promo-section">
        <h4 class="section-title">Cupón de descuento</h4>
        <div class="promo-input-group">
          <input
            type="text"
            class={{
              'promo-input': true,
              'error': !!this.promoError,
              'success': this.promoSuccess,
            }}
            placeholder="Código promocional"
            value={this.promoCode}
            onInput={this.handlePromoCodeChange}
            disabled={this.isApplyingPromo}
          />
          <button
            class="promo-button"
            onClick={this.handleApplyPromo}
            disabled={this.isApplyingPromo || !this.promoCode.trim()}
          >
            {this.isApplyingPromo ? 'Aplicando...' : 'Aplicar'}
          </button>
        </div>
        {this.promoError && (
          <span class="promo-message error">{this.promoError}</span>
        )}
        {this.promoSuccess && (
          <span class="promo-message success">Cupón aplicado correctamente</span>
        )}
      </div>
    );
  }

  private renderPaymentDetails() {
    if (!this.cart) return null;

    const subtotal = this.cart.subTotalPrice || 0;
    const tax = this.cart.totalTax || 0;
    const total = this.cart.totalPrice || 0;
    const monthlyPayment = this.cart.subTotalPerMonth || 0;
    const downPayment = this.cart.totalDownPayment || 0;

    return (
      <div class="payment-details">
        <h4 class="section-title">Detalle del pago</h4>

        <div class="detail-row">
          <span class="label">Subtotal</span>
          <span class="value">{this.formatPrice(subtotal)}</span>
        </div>

        <div class="detail-row">
          <span class="label">IVU (11.5%)</span>
          <span class="value">{this.formatPrice(tax)}</span>
        </div>

        {downPayment > 0 && (
          <div class="detail-row">
            <span class="label">Pago inicial</span>
            <span class="value">{this.formatPrice(downPayment)}</span>
          </div>
        )}

        <div class="detail-row total">
          <span class="label">Total a pagar hoy</span>
          <span class="value">{this.formatPrice(total)}</span>
        </div>

        {monthlyPayment > 0 && (
          <div class="detail-row monthly">
            <span class="label">Renta mensual</span>
            <span class="value">{this.formatPrice(monthlyPayment)}</span>
          </div>
        )}
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
          <span class="checkmark"></span>
          <span class="terms-text">
            Acepto los <a href="#" target="_blank">términos y condiciones</a> de Claro Puerto Rico
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

    return (
      <Host>
        <div class="step-order-summary">
          {/* Header */}
          <div class="header">
            <button class="btn-back" onClick={this.onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Regresar
            </button>
            <h1 class="title">Resumen de tu orden</h1>
            {hasItems && (
              <span class="item-count">{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}</span>
            )}
          </div>

          {/* Loading */}
          {this.isLoading && (
            <div class="loading-container">
              <div class="spinner"></div>
              <p>Cargando carrito...</p>
            </div>
          )}

          {/* Error */}
          {this.error && !this.isLoading && (
            <div class="error-container">
              <p>{this.error}</p>
              <button class="btn-retry" onClick={() => this.loadCart()}>
                Reintentar
              </button>
            </div>
          )}

          {/* Empty Cart */}
          {!this.isLoading && !this.error && !hasItems && (
            <div class="empty-cart">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
              </svg>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega productos para continuar</p>
              <button class="btn-back-catalog" onClick={this.onBack}>
                Volver al catálogo
              </button>
            </div>
          )}

          {/* Cart Content */}
          {!this.isLoading && !this.error && hasItems && (
            <div class="content-grid">
              {/* Left: Cart Items */}
              <div class="cart-items-section">
                {this.cart?.products?.map(item => this.renderCartItem(item))}
              </div>

              {/* Right: Summary */}
              <div class="summary-section">
                {this.renderPromoCode()}
                {this.renderPaymentDetails()}
                {this.renderTermsCheckbox()}

                <button
                  class={{
                    'btn-proceed': true,
                    'disabled': !canProceed,
                  }}
                  onClick={this.handleProceed}
                  disabled={!canProceed}
                >
                  Procesar orden
                </button>
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
