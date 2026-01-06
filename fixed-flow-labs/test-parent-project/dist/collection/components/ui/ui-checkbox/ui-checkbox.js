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
        return (h(Host, { key: 'dc61beb573271c7c9a6af4e1d1ddf05ca1916455' }, h("label", { key: '6daa7cfa5988f44234ca04897e1431940c47feae', class: {
                'checkbox-container': true,
                'checkbox-container--disabled': this.disabled,
                'checkbox-container--error': this.hasError,
            } }, h("input", { key: 'fbfa3c6b7473a95c12760449b12a3c5c856902c9', type: "checkbox", name: this.name, checked: this.checked, disabled: this.disabled, onChange: this.handleChange, class: "checkbox-input" }), h("span", { key: '188252e7fef671e73d78d4ec1f6d6dfeb7ef2f09', class: "checkbox-checkmark" }, h("svg", { key: '24acebac0e82446afe0ba1844a137cebd361f492', class: "checkbox-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("polyline", { key: '5926de8b6a40a68666124c17e19d6c92e0b24de3', points: "20 6 9 17 4 12" }))), this.label && h("span", { key: '7687747060bb4a799ddbfebd990a83a7fdd08ca2', class: "checkbox-label" }, this.label)), this.hasError && this.errorMessage && (h("span", { key: '8fda44bec8f8f8d627787fb27ee52dae69e58e9a', class: "checkbox-error" }, this.errorMessage))));
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
