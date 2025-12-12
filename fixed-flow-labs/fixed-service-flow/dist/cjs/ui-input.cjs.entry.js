'use strict';

var index = require('./index-C7RCDrsz.js');

const uiInputCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-input{display:flex;flex-direction:column;width:100%}.ui-input__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.ui-input__required{color:#DA291C;margin-left:0.25rem}.ui-input__wrapper{position:relative;width:100%}.ui-input__field{width:100%;height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease;appearance:none}.ui-input__field::placeholder{color:#999999}.ui-input__field:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.ui-input__field:disabled{background-color:#F5F5F5;color:#666666;cursor:not-allowed}.ui-input__field:read-only{background-color:#FAFAFA}.ui-input__field[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6;transition:opacity 150ms ease}.ui-input__field[type=date]::-webkit-calendar-picker-indicator:hover{opacity:1}.ui-input__message{margin-top:0.25rem;font-size:0.75rem;color:#666666}.ui-input__message--error{color:#DA291C}.ui-input--focused .ui-input__label{color:#0097A9}.ui-input--error .ui-input__field{border-color:#DA291C}.ui-input--error .ui-input__field:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.ui-input--error .ui-input__label{color:#DA291C}.ui-input--disabled .ui-input__label{color:#666666}`;

const UiInput = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.valueChange = index.createEvent(this, "valueChange");
        this.inputEvent = index.createEvent(this, "inputEvent");
        this.inputFocus = index.createEvent(this, "inputFocus");
        this.inputBlur = index.createEvent(this, "inputBlur");
    }
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
        return (index.h(index.Host, { key: '3bcc76c0d0e1edb626bccdfd14ae5e0ba3077b9d' }, index.h("div", { key: '6ee0cd732014bf702bc23d8387601e78cc8f7ef6', class: containerClasses }, this.label && (index.h("label", { key: 'd761e134cafa534770f9fa7b08b6bc9324212be8', class: "ui-input__label", htmlFor: this.name }, this.label, this.required && index.h("span", { key: '27950e7b45a9bf2ec9908aff6b2447e876ce5ab2', class: "ui-input__required" }, "*"))), index.h("div", { key: 'cb47fd0826ca5e4eed1b8dca52037fa03db9c649', class: "ui-input__wrapper" }, index.h("input", { key: '757f105d773018d1b2e8957951f93708843b7454', ref: (el) => (this._inputEl = el), class: "ui-input__field", type: this.type, id: this.name, name: this.name, value: this.value, placeholder: this.placeholder, disabled: this.disabled, readonly: this.readonly, required: this.required, maxlength: this.maxlength, minlength: this.minlength, pattern: this.pattern, autocomplete: this.autocomplete, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur })), (hasError || this.helperText) && (index.h("div", { key: 'fb5226de636e6b1d565844474a8660a731de2d2d', class: `ui-input__message ${hasError ? 'ui-input__message--error' : ''}` }, hasError ? this.error : this.helperText)))));
    }
    static get watchers() { return {
        "value": ["handleValueChange"]
    }; }
};
UiInput.style = uiInputCss();

exports.ui_input = UiInput;
//# sourceMappingURL=ui-input.entry.cjs.js.map
