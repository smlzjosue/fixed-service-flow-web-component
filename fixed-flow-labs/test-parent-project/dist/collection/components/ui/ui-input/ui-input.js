// ============================================
// UI-INPUT - Reusable Input Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiInput {
    // @ts-ignore: Reserved for future use (focus methods, etc.)
    _inputEl;
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Input label text
     */
    label;
    /**
     * Input type
     */
    type = 'text';
    /**
     * Input name attribute
     */
    name;
    /**
     * Current value
     */
    value = '';
    /**
     * Placeholder text
     */
    placeholder;
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
     * Helper text (shown when no error)
     */
    helperText;
    /**
     * Maximum length
     */
    maxlength;
    /**
     * Minimum length
     */
    minlength;
    /**
     * Input pattern for validation
     */
    pattern;
    /**
     * Autocomplete attribute
     */
    autocomplete;
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
     * Emitted on input event
     */
    inputEvent;
    /**
     * Emitted on focus
     */
    inputFocus;
    /**
     * Emitted on blur
     */
    inputBlur;
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
        this.inputEvent.emit(event);
    };
    handleFocus = (event) => {
        this.isFocused = true;
        this.inputFocus.emit(event);
    };
    handleBlur = (event) => {
        this.isFocused = false;
        this.inputBlur.emit(event);
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const hasError = !!this.error;
        const containerClasses = {
            'ui-input': true,
            'ui-input--focused': this.isFocused,
            'ui-input--has-value': this.hasValue,
            'ui-input--disabled': this.disabled,
            'ui-input--error': hasError,
        };
        return (h(Host, { key: '3bcc76c0d0e1edb626bccdfd14ae5e0ba3077b9d' }, h("div", { key: '6ee0cd732014bf702bc23d8387601e78cc8f7ef6', class: containerClasses }, this.label && (h("label", { key: 'd761e134cafa534770f9fa7b08b6bc9324212be8', class: "ui-input__label", htmlFor: this.name }, this.label, this.required && h("span", { key: '27950e7b45a9bf2ec9908aff6b2447e876ce5ab2', class: "ui-input__required" }, "*"))), h("div", { key: 'cb47fd0826ca5e4eed1b8dca52037fa03db9c649', class: "ui-input__wrapper" }, h("input", { key: '757f105d773018d1b2e8957951f93708843b7454', ref: (el) => (this._inputEl = el), class: "ui-input__field", type: this.type, id: this.name, name: this.name, value: this.value, placeholder: this.placeholder, disabled: this.disabled, readonly: this.readonly, required: this.required, maxlength: this.maxlength, minlength: this.minlength, pattern: this.pattern, autocomplete: this.autocomplete, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur })), (hasError || this.helperText) && (h("div", { key: 'fb5226de636e6b1d565844474a8660a731de2d2d', class: `ui-input__message ${hasError ? 'ui-input__message--error' : ''}` }, hasError ? this.error : this.helperText)))));
    }
    static get is() { return "ui-input"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-input.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-input.css"]
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
                    "text": "Input label text"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "label"
            },
            "type": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "InputType",
                    "resolved": "\"date\" | \"email\" | \"number\" | \"password\" | \"tel\" | \"text\"",
                    "references": {
                        "InputType": {
                            "location": "local",
                            "path": "/Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow/src/components/ui/ui-input/ui-input.tsx",
                            "id": "src/components/ui/ui-input/ui-input.tsx::InputType"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Input type"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "type",
                "defaultValue": "'text'"
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
                    "text": "Current value"
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
                "attribute": "placeholder"
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
                    "text": "Helper text (shown when no error)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "helper-text"
            },
            "maxlength": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Maximum length"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "maxlength"
            },
            "minlength": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Minimum length"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "minlength"
            },
            "pattern": {
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
                    "text": "Input pattern for validation"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "pattern"
            },
            "autocomplete": {
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
                    "text": "Autocomplete attribute"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "autocomplete"
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
                "method": "inputEvent",
                "name": "inputEvent",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted on input event"
                },
                "complexType": {
                    "original": "InputEvent",
                    "resolved": "InputEvent",
                    "references": {
                        "InputEvent": {
                            "location": "global",
                            "id": "global::InputEvent"
                        }
                    }
                }
            }, {
                "method": "inputFocus",
                "name": "inputFocus",
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
                "method": "inputBlur",
                "name": "inputBlur",
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
//# sourceMappingURL=ui-input.js.map
