import { r as registerInstance, c as createEvent, h, H as Host } from './index-X-V47bix.js';

const uiDatePickerCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-date-picker{display:flex;flex-direction:column;width:100%}.ui-date-picker__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.ui-date-picker__required{color:#DA291C;margin-left:0.25rem}.ui-date-picker__wrapper{position:relative;width:100%}.ui-date-picker__field{width:100%;height:44px;padding:0 2.5rem 0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease;appearance:none}.ui-date-picker__field::-webkit-calendar-picker-indicator{position:absolute;right:0;top:0;width:100%;height:100%;opacity:0;cursor:pointer}.ui-date-picker__field::placeholder{color:#999999}.ui-date-picker__field:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.ui-date-picker__field:disabled{background-color:#F5F5F5;color:#666666;cursor:not-allowed}.ui-date-picker__field:read-only{background-color:#FAFAFA}.ui-date-picker__icon{position:absolute;top:50%;right:1rem;transform:translateY(-50%);pointer-events:none;color:#666666;transition:color 150ms ease}.ui-date-picker__icon svg{width:18px;height:18px}.ui-date-picker__message{margin-top:0.25rem;font-size:0.75rem;color:#666666}.ui-date-picker__message--error{color:#DA291C}.ui-date-picker--focused .ui-date-picker__label{color:#0097A9}.ui-date-picker--focused .ui-date-picker__icon{color:#0097A9}.ui-date-picker--error .ui-date-picker__field{border-color:#DA291C}.ui-date-picker--error .ui-date-picker__field:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.ui-date-picker--error .ui-date-picker__label{color:#DA291C}.ui-date-picker--error .ui-date-picker__icon{color:#DA291C}.ui-date-picker--disabled .ui-date-picker__label{color:#666666}.ui-date-picker--disabled .ui-date-picker__icon{color:#999999}`;

const UiDatePicker = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.valueChange = createEvent(this, "valueChange");
        this.dateFocus = createEvent(this, "dateFocus");
        this.dateBlur = createEvent(this, "dateBlur");
    }
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
        return (h(Host, { key: '2fba44933f6b6d4ee1a07ff6114d1af3a5b91cf4' }, h("div", { key: 'd21ae40556104f3ef06deed152199011561a6f9a', class: containerClasses }, this.label && (h("label", { key: 'aab8eb673e662af570a0181f5b97a0327db8477c', class: "ui-date-picker__label", htmlFor: this.name }, this.label, this.required && h("span", { key: '1a1c0933bba94aadd150ac71f8a32f1fe5597089', class: "ui-date-picker__required" }, "*"))), h("div", { key: 'a80f81f1efc8de0af8d486de7d8ca7e33a8df152', class: "ui-date-picker__wrapper" }, h("input", { key: '355db9746255733934d1c4c9290d69c71da54a37', type: "date", class: "ui-date-picker__field", id: this.name, name: this.name, value: this.value, min: this.min, max: this.max, placeholder: this.placeholder, disabled: this.disabled, readOnly: this.readonly, required: this.required, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur }), h("div", { key: '9700ceb04de257615b09b87d9b8347b7b51ef584', class: "ui-date-picker__icon" }, h("svg", { key: '7a0b88a98333d1602e0c8753989a612e5c20e0a2', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { key: 'eaaf0d7867082e1efedfd6a82acf29bf0e4a12a9', x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), h("line", { key: '122b7e60f119e86b095dede2b23a396946965ef0', x1: "16", y1: "2", x2: "16", y2: "6" }), h("line", { key: 'c2748b00ce2df1bf0058918f9d017ab0f8e75190', x1: "8", y1: "2", x2: "8", y2: "6" }), h("line", { key: '0881da40b8c0bf715abd0e4300945102cafd6681', x1: "3", y1: "10", x2: "21", y2: "10" })))), (hasError || this.helperText) && (h("div", { key: '2330a2dafb49a3da390b393648e12b1e0c74152f', class: { 'ui-date-picker__message': true, 'ui-date-picker__message--error': hasError } }, hasError ? this.error : this.helperText)))));
    }
    static get watchers() { return {
        "value": ["handleValueChange"]
    }; }
};
UiDatePicker.style = uiDatePickerCss();

export { UiDatePicker as ui_date_picker };
//# sourceMappingURL=ui-date-picker.entry.js.map
