// ============================================
// UI-STEPPER - Step Progress Indicator Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, h, Host } from '@stencil/core';

export interface StepItem {
  label: string;
  completed?: boolean;
}

@Component({
  tag: 'ui-stepper',
  styleUrl: 'ui-stepper.scss',
  shadow: true,
})
export class UiStepper {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Array of step items with labels
   */
  @Prop() steps: StepItem[] = [];

  /**
   * Current active step (1-indexed)
   */
  @Prop() currentStep: number = 1;

  /**
   * Size variant
   */
  @Prop() size: 'sm' | 'md' = 'md';

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  private getStepStatus(index: number): 'completed' | 'active' | 'pending' {
    const stepNumber = index + 1;
    if (stepNumber < this.currentStep) {
      return 'completed';
    } else if (stepNumber === this.currentStep) {
      return 'active';
    }
    return 'pending';
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const classes = {
      'ui-stepper': true,
      [`ui-stepper--${this.size}`]: true,
    };

    return (
      <Host>
        <div class={classes}>
          {this.steps.map((step, index) => {
            const status = this.getStepStatus(index);
            const isLast = index === this.steps.length - 1;

            return (
              <div class="ui-stepper__step" key={index}>
                {/* Step circle and connector */}
                <div class="ui-stepper__indicator">
                  <div
                    class={{
                      'ui-stepper__circle': true,
                      [`ui-stepper__circle--${status}`]: true,
                    }}
                  >
                    {status === 'completed' ? (
                      <svg
                        class="ui-stepper__check"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <span class="ui-stepper__number">{index + 1}</span>
                    )}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      class={{
                        'ui-stepper__connector': true,
                        'ui-stepper__connector--completed': status === 'completed',
                      }}
                    ></div>
                  )}
                </div>

                {/* Step label */}
                <span
                  class={{
                    'ui-stepper__label': true,
                    [`ui-stepper__label--${status}`]: true,
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </Host>
    );
  }
}
