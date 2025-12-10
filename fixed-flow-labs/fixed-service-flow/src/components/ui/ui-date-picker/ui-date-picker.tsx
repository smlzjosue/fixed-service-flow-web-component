// ============================================
// UI-DATE-PICKER - Date Input Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, Event, EventEmitter, h, Host, Watch } from '@stencil/core';

@Component({
  tag: 'ui-date-picker',
  styleUrl: 'ui-date-picker.scss',
  shadow: true,
})
export class UiDatePicker {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Input label
   */
  @Prop() label?: string;

  /**
   * Input name attribute
   */
  @Prop() name?: string;

  /**
   * Current value (YYYY-MM-DD format)
   */
  @Prop({ mutable: true }) value: string = '';

  /**
   * Placeholder text
   */
  @Prop() placeholder?: string = 'dd/mm/yyyy';

  /**
   * Minimum date (YYYY-MM-DD)
   */
  @Prop() min?: string;

  /**
   * Maximum date (YYYY-MM-DD)
   */
  @Prop() max?: string;

  /**
   * Required field
   */
  @Prop() required: boolean = false;

  /**
   * Disabled state
   */
  @Prop() disabled: boolean = false;

  /**
   * Read-only state
   */
  @Prop() readonly: boolean = false;

  /**
   * Error message to display
   */
  @Prop() error?: string;

  /**
   * Helper text below the input
   */
  @Prop() helperText?: string;

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
  @Event() dateFocus: EventEmitter<FocusEvent>;

  /**
   * Emitted on blur
   */
  @Event() dateBlur: EventEmitter<FocusEvent>;

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

  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  };

  private handleFocus = (event: FocusEvent) => {
    this.isFocused = true;
    this.dateFocus.emit(event);
  };

  private handleBlur = (event: FocusEvent) => {
    this.isFocused = false;
    this.dateBlur.emit(event);
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const hasError = !!this.error;

    const containerClasses = {
      'ui-date-picker': true,
      'ui-date-picker--focused': this.isFocused,
      'ui-date-picker--has-value': this.hasValue,
      'ui-date-picker--disabled': this.disabled,
      'ui-date-picker--readonly': this.readonly,
      'ui-date-picker--error': hasError,
    };

    return (
      <Host>
        <div class={containerClasses}>
          {this.label && (
            <label class="ui-date-picker__label" htmlFor={this.name}>
              {this.label}
              {this.required && <span class="ui-date-picker__required">*</span>}
            </label>
          )}

          <div class="ui-date-picker__wrapper">
            <input
              type="date"
              class="ui-date-picker__field"
              id={this.name}
              name={this.name}
              value={this.value}
              min={this.min}
              max={this.max}
              placeholder={this.placeholder}
              disabled={this.disabled}
              readOnly={this.readonly}
              required={this.required}
              onInput={this.handleInput}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
            />
            <div class="ui-date-picker__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>

          {(hasError || this.helperText) && (
            <div class={{ 'ui-date-picker__message': true, 'ui-date-picker__message--error': hasError }}>
              {hasError ? this.error : this.helperText}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
