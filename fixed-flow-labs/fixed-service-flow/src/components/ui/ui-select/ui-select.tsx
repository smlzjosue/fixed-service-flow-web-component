// ============================================
// UI-SELECT - Reusable Select/Dropdown Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, Event, EventEmitter, h, Host, Watch } from '@stencil/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  tag: 'ui-select',
  styleUrl: 'ui-select.scss',
  shadow: true,
})
export class UiSelect {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Select label text
   */
  @Prop() label?: string;

  /**
   * Select name attribute
   */
  @Prop() name?: string;

  /**
   * Current selected value
   */
  @Prop({ mutable: true }) value: string = '';

  /**
   * Placeholder text
   */
  @Prop() placeholder?: string = 'Seleccionar';

  /**
   * Options array
   */
  @Prop() options: SelectOption[] = [];

  /**
   * Required field
   */
  @Prop() required: boolean = false;

  /**
   * Disabled state
   */
  @Prop() disabled: boolean = false;

  /**
   * Error message to display
   */
  @Prop() error?: string;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() isFocused: boolean = false;
  @State() hasValue: boolean = false;

  // ------------------------------------------
  // EVENTS
  // ------------------------------------------

  /**
   * Emitted when value changes
   */
  @Event() valueChange: EventEmitter<string>;

  /**
   * Emitted on focus
   */
  @Event() selectFocus: EventEmitter<FocusEvent>;

  /**
   * Emitted on blur
   */
  @Event() selectBlur: EventEmitter<FocusEvent>;

  // ------------------------------------------
  // WATCHERS
  // ------------------------------------------

  @Watch('value')
  handleValueChange(newValue: string) {
    this.hasValue = newValue && newValue.length > 0;
  }

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentWillLoad() {
    this.hasValue = this.value && this.value.length > 0;
  }

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  private handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  };

  private handleFocus = (event: FocusEvent) => {
    this.isFocused = true;
    this.selectFocus.emit(event);
  };

  private handleBlur = (event: FocusEvent) => {
    this.isFocused = false;
    this.selectBlur.emit(event);
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const hasError = !!this.error;

    const containerClasses = {
      'ui-select': true,
      'ui-select--focused': this.isFocused,
      'ui-select--has-value': this.hasValue,
      'ui-select--disabled': this.disabled,
      'ui-select--error': hasError,
    };

    return (
      <Host>
        <div class={containerClasses}>
          {this.label && (
            <label class="ui-select__label" htmlFor={this.name}>
              {this.label}
              {this.required && <span class="ui-select__required">*</span>}
            </label>
          )}

          <div class="ui-select__wrapper">
            <select
              class="ui-select__field"
              id={this.name}
              name={this.name}
              disabled={this.disabled}
              required={this.required}
              onChange={this.handleChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
            >
              {this.placeholder && (
                <option value="" disabled selected={!this.value}>
                  {this.placeholder}
                </option>
              )}
              {this.options.map((option) => (
                <option
                  value={option.value}
                  disabled={option.disabled}
                  selected={this.value === option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <div class="ui-select__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {hasError && (
            <div class="ui-select__error">{this.error}</div>
          )}
        </div>
      </Host>
    );
  }
}
