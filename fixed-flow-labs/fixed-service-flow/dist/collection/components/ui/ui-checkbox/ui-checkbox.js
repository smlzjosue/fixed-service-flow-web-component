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
        return (h(Host, { key: 'ff5968bb6e59836932b8204b034937339d9b6b6b' }, h("label", { key: 'c32b386ccee6f0e87f7fdabcdd5a5c5c49426018', class: {
                'checkbox-container': true,
                'checkbox-container--disabled': this.disabled,
                'checkbox-container--error': this.hasError,
            } }, h("input", { key: '815aa71c5b0f684bb5486883183da9c18b34aa7a', type: "checkbox", name: this.name, checked: this.checked, disabled: this.disabled, onChange: this.handleChange, class: "checkbox-input" }), h("span", { key: 'b6cc09e864d6f7deb1c2ed54c3b3ab7586436466', class: "checkbox-checkmark" }, h("svg", { key: '441e30e7177119c46852af30e889b30148b90b53', class: "checkbox-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("polyline", { key: '220e428b4f0558fd407037cae97df00ba4fdee5c', points: "20 6 9 17 4 12" }))), this.label && h("span", { key: '5602fd774fbb215629363528499db3e8f201249b', class: "checkbox-label" }, this.label)), this.hasError && this.errorMessage && (h("span", { key: 'f76c3e7ca98aa262b05ca29bbf100e04d3af5dfd', class: "checkbox-error" }, this.errorMessage))));
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
