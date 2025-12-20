// ============================================
// UI-STEPPER - Step Progress Indicator Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiStepper {
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
    static get is() { return "ui-stepper"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-stepper.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-stepper.css"]
        };
    }
    static get properties() {
        return {
            "steps": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "StepItem[]",
                    "resolved": "StepItem[]",
                    "references": {
                        "StepItem": {
                            "location": "local",
                            "path": "/Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow/src/components/ui/ui-stepper/ui-stepper.tsx",
                            "id": "src/components/ui/ui-stepper/ui-stepper.tsx::StepItem"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Array of step items with labels"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "currentStep": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Current active step (1-indexed)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "current-step",
                "defaultValue": "1"
            },
            "size": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'sm' | 'md'",
                    "resolved": "\"md\" | \"sm\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Size variant"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "size",
                "defaultValue": "'md'"
            }
        };
    }
}
//# sourceMappingURL=ui-stepper.js.map
