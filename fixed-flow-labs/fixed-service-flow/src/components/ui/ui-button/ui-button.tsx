// ============================================
// UI-BUTTON - Reusable Button Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, Event, EventEmitter, h, Host } from '@stencil/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  tag: 'ui-button',
  styleUrl: 'ui-button.scss',
  shadow: true,
})
export class UiButton {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Button variant style
   */
  @Prop() variant: ButtonVariant = 'primary';

  /**
   * Button size
   */
  @Prop() size: ButtonSize = 'md';

  /**
   * Disabled state
   */
  @Prop() disabled: boolean = false;

  /**
   * Loading state (shows spinner)
   */
  @Prop() loading: boolean = false;

  /**
   * Full width button
   */
  @Prop() fullWidth: boolean = false;

  /**
   * Button type attribute
   */
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';

  // ------------------------------------------
  // EVENTS
  // ------------------------------------------

  /**
   * Emitted when button is clicked
   */
  @Event() buttonClick: EventEmitter<MouseEvent>;

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  private handleClick = (event: MouseEvent) => {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const classes = {
      'ui-button': true,
      [`ui-button--${this.variant}`]: true,
      [`ui-button--${this.size}`]: true,
      'ui-button--disabled': this.disabled,
      'ui-button--loading': this.loading,
      'ui-button--full-width': this.fullWidth,
    };

    return (
      <Host>
        <button
          class={classes}
          type={this.type}
          disabled={this.disabled || this.loading}
          onClick={this.handleClick}
        >
          {this.loading && (
            <span class="ui-button__spinner"></span>
          )}
          <span class="ui-button__content">
            <slot></slot>
          </span>
        </button>
      </Host>
    );
  }
}
