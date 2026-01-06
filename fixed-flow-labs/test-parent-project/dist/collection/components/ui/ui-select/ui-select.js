// ============================================
// UI-SELECT - Reusable Select/Dropdown Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiSelect {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Select label text
     */
    label;
    /**
     * Select name attribute
     */
    name;
    /**
     * Current selected value
     */
    value = '';
    /**
     * Placeholder text
     */
    placeholder = 'Seleccionar';
    /**
     * Options array
     */
    options = [];
    /**
     * Required field
     */
    required = false;
    /**
     * Disabled state
     */
    disabled = false;
    /**
     * Error message to display
     */
    error;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    isFocused = false;
    hasValue = false;
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when value changes
     */
    valueChange;
    /**
     * Emitted on focus
     */
    selectFocus;
    /**
     * Emitted on blur
     */
    selectBlur;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
    handleValueChange(newValue) {
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
    handleChange = (event) => {
        const target = event.target;
        this.value = target.value;
        this.valueChange.emit(this.value);
    };
    handleFocus = (event) => {
        this.isFocused = true;
        this.selectFocus.emit(event);
    };
    handleBlur = (event) => {
        this.isFocused = false;
        this.selectBlur.emit(event);
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const hasError = !!this.error;
        const containerClasses = {
            'ui-select': true,
            'ui-select--focused': this.isFocused,
            'ui-select--has-value': this.hasValue,
            'ui-select--disabled': this.disabled,
            'ui-select--error': hasError,
        };
        return (h(Host, { key: 'e9269eed274d316ea80c75aa5e7e50c0ba34fc47' }, h("div", { key: '8d47ea2fa885139cf32a99ffeb7ef321e5496ba8', class: containerClasses }, this.label && (h("label", { key: '9ab9217a64a0761baf6bee34d5eb1690f32b7e72', class: "ui-select__label", htmlFor: this.name }, this.label, this.required && h("span", { key: '0649aab4ebbb3e1f68aa3e429ba7695fed89e615', class: "ui-select__required" }, "*"))), h("div", { key: '6803db65c6814c57b021439e382ffa20b1a1ea7f', class: "ui-select__wrapper" }, h("select", { key: 'f882cd5cf4ec57bb0be6d001f9632b3cea47abc5', class: "ui-select__field", id: this.name, name: this.name, disabled: this.disabled, required: this.required, onChange: this.handleChange, onFocus: this.handleFocus, onBlur: this.handleBlur }, this.placeholder && (h("option", { key: 'c49966b7610e328c3e30161579b0c81a598fc1e8', value: "", disabled: true, selected: !this.value }, this.placeholder)), this.options.map((option) => (h("option", { value: option.value, disabled: option.disabled, selected: this.value === option.value }, option.label)))), h("div", { key: 'b48c6f0767da94d6f2bcada92c8a99cd79228ac5', class: "ui-select__icon" }, h("svg", { key: 'b2366328e299c9f4fcacbd9578b05c8cb3a1d222', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'edb3f3970155a51be157e76605fc3d59ed66a0ad', points: "6 9 12 15 18 9" })))), hasError && (h("div", { key: '8b4c1cc37314640cffa36f856a4f159daaa1f22e', class: "ui-select__error" }, this.error)))));
    }
    static get is() { return "ui-select"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-select.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-select.css"]
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
                    "text": "Select label text"
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
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Select name attribute"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "name"
            },
            "value": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Current selected value"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "value",
                "defaultValue": "''"
            },
            "placeholder": {
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
                    "text": "Placeholder text"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "placeholder",
                "defaultValue": "'Seleccionar'"
            },
            "options": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "SelectOption[]",
                    "resolved": "SelectOption[]",
                    "references": {
                        "SelectOption": {
                            "location": "local",
                            "path": "/Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow/src/components/ui/ui-select/ui-select.tsx",
                            "id": "src/components/ui/ui-select/ui-select.tsx::SelectOption"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Options array"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
            },
            "required": {
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
                    "text": "Required field"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "required",
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
            },
            "error": {
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
                    "text": "Error message to display"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "error"
            }
        };
    }
    static get states() {
        return {
            "isFocused": {},
            "hasValue": {}
        };
    }
    static get events() {
        return [{
                "method": "valueChange",
                "name": "valueChange",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when value changes"
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }, {
                "method": "selectFocus",
                "name": "selectFocus",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted on focus"
                },
                "complexType": {
                    "original": "FocusEvent",
                    "resolved": "FocusEvent",
                    "references": {
                        "FocusEvent": {
                            "location": "global",
                            "id": "global::FocusEvent"
                        }
                    }
                }
            }, {
                "method": "selectBlur",
                "name": "selectBlur",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted on blur"
                },
                "complexType": {
                    "original": "FocusEvent",
                    "resolved": "FocusEvent",
                    "references": {
                        "FocusEvent": {
                            "location": "global",
                            "id": "global::FocusEvent"
                        }
                    }
                }
            }];
    }
    static get watchers() {
        return [{
                "propName": "value",
                "methodName": "handleValueChange"
            }];
    }
}
//# sourceMappingURL=ui-select.js.map
