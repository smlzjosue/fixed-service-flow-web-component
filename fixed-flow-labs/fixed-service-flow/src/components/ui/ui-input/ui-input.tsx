// ============================================
// UI-INPUT - Reusable Input Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, Event, EventEmitter, h, Host, Watch } from '@stencil/core';

export type InputType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'date';

@Component({
  tag: 'ui-input',
  styleUrl: 'ui-input.scss',
  shadow: true,
})
export class UiInput {
  // @ts-ignore: Reserved for future use (focus methods, etc.)
  private _inputEl?: HTMLInputElement;

  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Input label text
   */
  @Prop() label?: string;

  /**
   * Input type
   */
  @Prop() type: InputType = 'text';

  /**
   * Input name attribute
   */
  @Prop() name?: string;

  /**
   * Current value
   */
  @Prop({ mutable: true }) value: string = '';

  /**
   * Placeholder text
   */
  @Prop() placeholder?: string;

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
   * Helper text (shown when no error)
   */
  @Prop() helperText?: string;

  /**
   * Maximum length
   */
  @Prop() maxlength?: number;

  /**
   * Minimum length
   */
  @Prop() minlength?: number;

  /**
   * Input pattern for validation
   */
  @Prop() pattern?: string;

  /**
   * Autocomplete attribute
   */
  @Prop() autocomplete?: string;

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
   * Emitted on input event
   */
  @Event() inputEvent: EventEmitter<InputEvent>;

  /**
   * Emitted on focus
   */
  @Event() inputFocus: EventEmitter<FocusEvent>;

  /**
   * Emitted on blur
   */
  @Event() inputBlur: EventEmitter<FocusEvent>;

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

  private handleInput = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.inputEvent.emit(event);
  };

  private handleFocus = (event: FocusEvent) => {
    this.isFocused = true;
    this.inputFocus.emit(event);
  };

  private handleBlur = (event: FocusEvent) => {
    this.isFocused = false;
    this.inputBlur.emit(event);
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const hasError = !!this.error;

    const containerClasses = {
      'ui-input': true,
      'ui-input--focused': this.isFocused,
      'ui-input--has-value': this.hasValue,
      'ui-input--disabled': this.disabled,
      'ui-input--error': hasError,
    };

    return (
      <Host>
        <div class={containerClasses}>
          {this.label && (
            <label class="ui-input__label" htmlFor={this.name}>
              {this.label}
              {this.required && <span class="ui-input__required">*</span>}
            </label>
          )}

          <div class="ui-input__wrapper">
            <input
              ref={(el) => (this._inputEl = el)}
              class="ui-input__field"
              type={this.type}
              id={this.name}
              name={this.name}
              value={this.value}
              placeholder={this.placeholder}
              disabled={this.disabled}
              readonly={this.readonly}
              required={this.required}
              maxlength={this.maxlength}
              minlength={this.minlength}
              pattern={this.pattern}
              autocomplete={this.autocomplete}
              onInput={this.handleInput}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
            />
          </div>

          {(hasError || this.helperText) && (
            <div class={`ui-input__message ${hasError ? 'ui-input__message--error' : ''}`}>
              {hasError ? this.error : this.helperText}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
