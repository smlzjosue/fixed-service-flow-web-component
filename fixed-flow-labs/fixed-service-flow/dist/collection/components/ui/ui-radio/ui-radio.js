// ============================================
// UI-RADIO - Reusable Radio Button Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiRadio {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Radio label text
     */
    label;
    /**
     * Radio name (for grouping)
     */
    name;
    /**
     * Radio value
     */
    value;
    /**
     * Whether this radio is selected
     */
    checked = false;
    /**
     * Disabled state
     */
    disabled = false;
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when radio is selected
     */
    radioChange;
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleChange = () => {
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
        return (h(Host, { key: '5d5286f41587a3aff01cc9cf4be0f8318091fc0e' }, h("label", { key: '67b47a9d98e10c15154687a79b82e6f8fe46e719', class: classes }, h("input", { key: '02e70e192a3245cfb8d89465ba817a7acf969aa4', type: "radio", class: "ui-radio__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, onChange: this.handleChange }), h("span", { key: '68de4357faddabc39f8129eb241c3c1b6c803d75', class: "ui-radio__indicator" }), this.label && h("span", { key: '0cdbf7e6b6bec132828f7f58cc9cbe6ffbbd26cd', class: "ui-radio__label" }, this.label), h("slot", { key: 'ecb70d06f09bb104a3c9ec9fab5d99f67e0ed1e7' }))));
    }
    static get is() { return "ui-radio"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-radio.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-radio.css"]
        };
    }
    static get properties() {
        return {
            "label": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Radio label text"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "label"
            },
            "name": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Radio name (for grouping)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "name"
            },
            "value": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Radio value"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "value"
            },
            "checked": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether this radio is selected"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "checked",
                "defaultValue": "false"
            },
            "disabled": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Disabled state"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            }
        };
    }
    static get events() {
        return [{
                "method": "radioChange",
                "name": "radioChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when radio is selected"
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }];
    }
}
//# sourceMappingURL=ui-radio.js.map
