// ============================================
// UI-DATE-PICKER - Date Input Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiDatePicker {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Input label
     */
    label;
    /**
     * Input name attribute
     */
    name;
    /**
     * Current value (YYYY-MM-DD format)
     */
    value = '';
    /**
     * Placeholder text
     */
    placeholder = 'dd/mm/yyyy';
    /**
     * Minimum date (YYYY-MM-DD)
     */
    min;
    /**
     * Maximum date (YYYY-MM-DD)
     */
    max;
    /**
     * Required field
     */
    required = false;
    /**
     * Disabled state
     */
    disabled = false;
    /**
     * Read-only state
     */
    readonly = false;
    /**
     * Error message to display
     */
    error;
    /**
     * Helper text below the input
     */
    helperText;
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
    dateFocus;
    /**
     * Emitted on blur
     */
    dateBlur;
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
    handleInput = (event) => {
        const target = event.target;
        this.value = target.value;
        this.valueChange.emit(this.value);
    };
    handleFocus = (event) => {
        this.isFocused = true;
        this.dateFocus.emit(event);
    };
    handleBlur = (event) => {
        this.isFocused = false;
        this.dateBlur.emit(event);
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const hasError = !!this.error;
        const containerClasses = {
            'ui-date-picker': true,
            'ui-date-picker--focused': this.isFocused,
            'ui-date-picker--has-value': this.hasValue,
            'ui-date-picker--disabled': this.disabled,
            'ui-date-picker--readonly': this.readonly,
            'ui-date-picker--error': hasError,
        };
        return (h(Host, { key: 'f881a3fdfa30d613ccd07242ad1acd03a6177ee9' }, h("div", { key: 'd2019b97e77a707f2c0e77f910db2bded097fca6', class: containerClasses }, this.label && (h("label", { key: '8283f1183c631ff17ddf82fd1404ea80afed3235', class: "ui-date-picker__label", htmlFor: this.name }, this.label, this.required && h("span", { key: '6086da90df959f30aaec6265d3212b626beba955', class: "ui-date-picker__required" }, "*"))), h("div", { key: '86d707025650f633e1dd43c8a1b0e58f4e0457df', class: "ui-date-picker__wrapper" }, h("input", { key: '3914d3e7e693863e8f5705ceb90865df29d7ce83', type: "date", class: "ui-date-picker__field", id: this.name, name: this.name, value: this.value, min: this.min, max: this.max, placeholder: this.placeholder, disabled: this.disabled, readOnly: this.readonly, required: this.required, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur }), h("div", { key: '3f7cca8e46f2bb03b3af3ed9d9135a208dab2c9f', class: "ui-date-picker__icon" }, h("svg", { key: '1117ff0b3b893d280bcefae043223427003cb5cc', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { key: 'e905dcd8e74c433b32cc6522c8a9d6542dc56b70', x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), h("line", { key: '6ad76c13dc56b7f1532919f8d11b280db507d7f2', x1: "16", y1: "2", x2: "16", y2: "6" }), h("line", { key: 'e50583c6934cfe75bf2c0e475c894d4da5aeb085', x1: "8", y1: "2", x2: "8", y2: "6" }), h("line", { key: 'a99893ebd1fed7a13eb827361521f6b977aececf', x1: "3", y1: "10", x2: "21", y2: "10" })))), (hasError || this.helperText) && (h("div", { key: '0cd9d9dee65596addc7f159b822fa28f85cb9bae', class: { 'ui-date-picker__message': true, 'ui-date-picker__message--error': hasError } }, hasError ? this.error : this.helperText)))));
    }
    static get is() { return "ui-date-picker"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-date-picker.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-date-picker.css"]
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
                    "text": "Input label"
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
                    "text": "Input name attribute"
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
                    "text": "Current value (YYYY-MM-DD format)"
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
                "defaultValue": "'dd/mm/yyyy'"
            },
            "min": {
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
                    "text": "Minimum date (YYYY-MM-DD)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "min"
            },
            "max": {
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
                    "text": "Maximum date (YYYY-MM-DD)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "max"
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
            "readonly": {
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
                    "text": "Read-only state"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "readonly",
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
            },
            "helperText": {
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
                    "text": "Helper text below the input"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "helper-text"
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
                "method": "dateFocus",
                "name": "dateFocus",
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
                "method": "dateBlur",
                "name": "dateBlur",
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
//# sourceMappingURL=ui-date-picker.js.map
