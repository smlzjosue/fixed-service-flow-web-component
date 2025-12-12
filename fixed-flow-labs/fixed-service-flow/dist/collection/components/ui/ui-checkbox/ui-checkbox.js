import { h, Host } from "@stencil/core";
export class UiCheckbox {
    /**
     * The checkbox value
     */
    checked = false;
    /**
     * The checkbox label
     */
    label = '';
    /**
     * The checkbox name
     */
    name = '';
    /**
     * Whether the checkbox is disabled
     */
    disabled = false;
    /**
     * Whether the checkbox has an error
     */
    hasError = false;
    /**
     * Error message to display
     */
    errorMessage = '';
    /**
     * Event emitted when the checkbox value changes
     */
    checkboxChange;
    handleChange = (event) => {
        const target = event.target;
        this.checked = target.checked;
        this.checkboxChange.emit(this.checked);
    };
    render() {
        return (h(Host, { key: '16817164816315831787c620484ccb594b49bae2' }, h("label", { key: '4a64d438aaaa0f6a7122f0077cead9369f9126f1', class: {
                'checkbox-container': true,
                'checkbox-container--disabled': this.disabled,
                'checkbox-container--error': this.hasError,
            } }, h("input", { key: '2ef530b03b4a4235b084228b00b148fd43da67b2', type: "checkbox", name: this.name, checked: this.checked, disabled: this.disabled, onChange: this.handleChange, class: "checkbox-input" }), h("span", { key: '4ed49159d93920da4dd39595cd4adc2b1b016b9b', class: "checkbox-checkmark" }, h("svg", { key: '0914018e68bfd51d04b087a049eb3d3a0894da52', class: "checkbox-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("polyline", { key: '3445b4337aef0ae832d9d3f5cd21235f27a5682c', points: "20 6 9 17 4 12" }))), this.label && h("span", { key: 'bd80f8f8e8d2d85b425730ec1fddc2bc66926ae3', class: "checkbox-label" }, this.label)), this.hasError && this.errorMessage && (h("span", { key: 'b08c5fffb52d8c497140e2da50f19d380531cd28', class: "checkbox-error" }, this.errorMessage))));
    }
    static get is() { return "ui-checkbox"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-checkbox.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-checkbox.css"]
        };
    }
    static get properties() {
        return {
            "checked": {
                "type": "boolean",
                "mutable": true,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The checkbox value"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "checked",
                "defaultValue": "false"
            },
            "label": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The checkbox label"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "label",
                "defaultValue": "''"
            },
            "name": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "The checkbox name"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "name",
                "defaultValue": "''"
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
                    "text": "Whether the checkbox is disabled"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            },
            "hasError": {
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
                    "text": "Whether the checkbox has an error"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "has-error",
                "defaultValue": "false"
            },
            "errorMessage": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Error message to display"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "error-message",
                "defaultValue": "''"
            }
        };
    }
    static get events() {
        return [{
                "method": "checkboxChange",
                "name": "checkboxChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Event emitted when the checkbox value changes"
                },
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                }
            }];
    }
}
//# sourceMappingURL=ui-checkbox.js.map
