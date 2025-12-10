import { Component, Prop, Event, EventEmitter, h, Host } from '@stencil/core';

@Component({
  tag: 'ui-checkbox',
  styleUrl: 'ui-checkbox.scss',
  shadow: true,
})
export class UiCheckbox {
  /**
   * The checkbox value
   */
  @Prop({ mutable: true }) checked: boolean = false;

  /**
   * The checkbox label
   */
  @Prop() label: string = '';

  /**
   * The checkbox name
   */
  @Prop() name: string = '';

  /**
   * Whether the checkbox is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether the checkbox has an error
   */
  @Prop() hasError: boolean = false;

  /**
   * Error message to display
   */
  @Prop() errorMessage: string = '';

  /**
   * Event emitted when the checkbox value changes
   */
  @Event() checkboxChange: EventEmitter<boolean>;

  private handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.checkboxChange.emit(this.checked);
  };

  render() {
    return (
      <Host>
        <label
          class={{
            'checkbox-container': true,
            'checkbox-container--disabled': this.disabled,
            'checkbox-container--error': this.hasError,
          }}
        >
          <input
            type="checkbox"
            name={this.name}
            checked={this.checked}
            disabled={this.disabled}
            onChange={this.handleChange}
            class="checkbox-input"
          />
          <span class="checkbox-checkmark">
            <svg
              class="checkbox-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          {this.label && <span class="checkbox-label">{this.label}</span>}
        </label>
        {this.hasError && this.errorMessage && (
          <span class="checkbox-error">{this.errorMessage}</span>
        )}
      </Host>
    );
  }
}
