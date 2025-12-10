// ============================================
// UI-RADIO-CARD - Selectable Card Radio Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, Event, EventEmitter, h, Host } from '@stencil/core';

@Component({
  tag: 'ui-radio-card',
  styleUrl: 'ui-radio-card.scss',
  shadow: true,
})
export class UiRadioCard {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Card title
   */
  @Prop() cardTitle?: string;

  /**
   * Card description
   */
  @Prop() description?: string;

  /**
   * Radio name (for grouping)
   */
  @Prop() name!: string;

  /**
   * Radio value
   */
  @Prop() value!: string;

  /**
   * Whether this card is selected
   */
  @Prop() checked: boolean = false;

  /**
   * Disabled state
   */
  @Prop() disabled: boolean = false;

  /**
   * Icon name or URL (optional)
   */
  @Prop() icon?: string;

  /**
   * Price to display (optional)
   */
  @Prop() price?: string;

  /**
   * Badge text (optional, e.g., "Recomendado")
   */
  @Prop() badge?: string;

  // ------------------------------------------
  // EVENTS
  // ------------------------------------------

  /**
   * Emitted when card is selected
   */
  @Event() cardSelect: EventEmitter<string>;

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  private handleSelect = () => {
    if (!this.disabled) {
      this.cardSelect.emit(this.value);
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !this.disabled) {
      event.preventDefault();
      this.cardSelect.emit(this.value);
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const classes = {
      'ui-radio-card': true,
      'ui-radio-card--checked': this.checked,
      'ui-radio-card--disabled': this.disabled,
    };

    return (
      <Host>
        <div
          class={classes}
          role="radio"
          aria-checked={this.checked ? 'true' : 'false'}
          aria-disabled={this.disabled ? 'true' : 'false'}
          tabIndex={this.disabled ? -1 : 0}
          onClick={this.handleSelect}
          onKeyDown={this.handleKeyDown}
        >
          {/* Hidden radio input for form compatibility */}
          <input
            type="radio"
            class="ui-radio-card__input"
            name={this.name}
            value={this.value}
            checked={this.checked}
            disabled={this.disabled}
            tabIndex={-1}
          />

          {/* Badge */}
          {this.badge && (
            <span class="ui-radio-card__badge">{this.badge}</span>
          )}

          {/* Radio indicator */}
          <div class="ui-radio-card__indicator">
            <span class="ui-radio-card__indicator-dot"></span>
          </div>

          {/* Content */}
          <div class="ui-radio-card__content">
            {this.icon && (
              <div class="ui-radio-card__icon">
                <slot name="icon">
                  <img src={this.icon} alt="" />
                </slot>
              </div>
            )}

            <div class="ui-radio-card__text">
              {this.cardTitle && (
                <h4 class="ui-radio-card__title">{this.cardTitle}</h4>
              )}
              {this.description && (
                <p class="ui-radio-card__description">{this.description}</p>
              )}
              <slot></slot>
            </div>

            {this.price && (
              <div class="ui-radio-card__price">{this.price}</div>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
