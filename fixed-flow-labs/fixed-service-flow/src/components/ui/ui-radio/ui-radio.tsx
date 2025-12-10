// ============================================
// UI-RADIO - Reusable Radio Button Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, Event, EventEmitter, h, Host } from '@stencil/core';

@Component({
  tag: 'ui-radio',
  styleUrl: 'ui-radio.scss',
  shadow: true,
})
export class UiRadio {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Radio label text
   */
  @Prop() label?: string;

  /**
   * Radio name (for grouping)
   */
  @Prop() name!: string;

  /**
   * Radio value
   */
  @Prop() value!: string;

  /**
   * Whether this radio is selected
   */
  @Prop() checked: boolean = false;

  /**
   * Disabled state
   */
  @Prop() disabled: boolean = false;

  // ------------------------------------------
  // EVENTS
  // ------------------------------------------

  /**
   * Emitted when radio is selected
   */
  @Event() radioChange: EventEmitter<string>;

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  private handleChange = () => {
    if (!this.disabled) {
      this.radioChange.emit(this.value);
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const classes = {
      'ui-radio': true,
      'ui-radio--checked': this.checked,
      'ui-radio--disabled': this.disabled,
    };

    return (
      <Host>
        <label class={classes}>
          <input
            type="radio"
            class="ui-radio__input"
            name={this.name}
            value={this.value}
            checked={this.checked}
            disabled={this.disabled}
            onChange={this.handleChange}
          />
          <span class="ui-radio__indicator"></span>
          {this.label && <span class="ui-radio__label">{this.label}</span>}
          <slot></slot>
        </label>
      </Host>
    );
  }
}
