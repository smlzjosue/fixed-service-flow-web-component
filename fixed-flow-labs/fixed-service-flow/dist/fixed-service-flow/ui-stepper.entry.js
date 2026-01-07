import { r as registerInstance, h, d as Host } from './index-zT41ZBSk.js';

const uiStepperCss = () => `.ui-stepper{display:flex;align-items:flex-start;justify-content:center;width:100%}.ui-stepper__step{display:flex;flex-direction:column;align-items:flex-start;position:relative}.ui-stepper__indicator{display:flex;align-items:center;position:relative}.ui-stepper__circle{width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.875rem;transition:all 250ms ease;flex-shrink:0}.ui-stepper__circle--pending{background-color:#FFFFFF;color:#999999;border:2px solid #CCCCCC}.ui-stepper__circle--active{background-color:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.ui-stepper__circle--completed{background-color:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.ui-stepper__number{line-height:1}.ui-stepper__check{width:16px;height:16px}.ui-stepper__connector{width:220px;height:2px;background-color:#CCCCCC;transition:background-color 250ms ease;margin-left:8px;margin-right:8px}.ui-stepper__connector--completed{background-color:#0097A9}.ui-stepper__label{position:relative;left:calc(32px / 2);transform:translateX(-50%);margin-top:0.5rem;font-size:0.75rem;font-weight:500;text-align:center;transition:color 250ms ease;white-space:nowrap}.ui-stepper__label--pending{color:#808080}.ui-stepper__label--active{color:#0097A9;font-weight:600}.ui-stepper__label--completed{color:#0097A9}.ui-stepper--sm .ui-stepper__circle{width:24px;height:24px;font-size:0.75rem}.ui-stepper--sm .ui-stepper__check{width:12px;height:12px}.ui-stepper--sm .ui-stepper__connector{width:30px}.ui-stepper--sm .ui-stepper__label{font-size:10px;left:calc(24px / 2)}@media (max-width: 576px){.ui-stepper__connector{width:80px}.ui-stepper__label{font-size:11px}}`;

const UiStepper = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Array of step items with labels
     */
    steps = [];
    /**
     * Current active step (1-indexed)
     */
    currentStep = 1;
    /**
     * Size variant
     */
    size = 'md';
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    getStepStatus(index) {
        const stepNumber = index + 1;
        if (stepNumber < this.currentStep) {
            return 'completed';
        }
        else if (stepNumber === this.currentStep) {
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
        return (h(Host, { key: 'df6adc9763aed239c6eaf79af2f2d549f48579c6' }, h("div", { key: 'bfb747939107bdd62106748334c198a2fb50713b', class: classes }, this.steps.map((step, index) => {
            const status = this.getStepStatus(index);
            const isLast = index === this.steps.length - 1;
            return (h("div", { class: "ui-stepper__step", key: index }, h("div", { class: "ui-stepper__indicator" }, h("div", { class: {
                    'ui-stepper__circle': true,
                    [`ui-stepper__circle--${status}`]: true,
                } }, status === 'completed' ? (h("svg", { class: "ui-stepper__check", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3" }, h("polyline", { points: "20 6 9 17 4 12" }))) : (h("span", { class: "ui-stepper__number" }, index + 1))), !isLast && (h("div", { class: {
                    'ui-stepper__connector': true,
                    'ui-stepper__connector--completed': status === 'completed',
                } }))), h("span", { class: {
                    'ui-stepper__label': true,
                    [`ui-stepper__label--${status}`]: true,
                } }, step.label)));
        }))));
    }
};
UiStepper.style = uiStepperCss();

export { UiStepper as ui_stepper };
//# sourceMappingURL=ui-stepper.entry.esm.js.map
