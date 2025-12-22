import { r as registerInstance, c as createEvent, h, H as Host } from './index-6Be1tPfL.js';

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
        return (h(Host, { key: '8f00683c0e8d5a705aa11994b5668d59da4f85d0' }, h("div", { key: '6f0e0d6854a86ed7b1130efe5c4ee116814da3fa', class: containerClasses }, this.label && (h("label", { key: '9408917aef00bce929a65ac560c11803b3ece125', class: "ui-date-picker__label", htmlFor: this.name }, this.label, this.required && h("span", { key: '4113451e3b30c061517be2bbe370c8694dcf0c0a', class: "ui-date-picker__required" }, "*"))), h("div", { key: 'a805d3d30ff0bc50971ee63b9b0cee48d1172941', class: "ui-date-picker__wrapper" }, h("input", { key: '86bceed35eb907d3ff3bbeb2fdb101e47c4abf87', type: "date", class: "ui-date-picker__field", id: this.name, name: this.name, value: this.value, min: this.min, max: this.max, placeholder: this.placeholder, disabled: this.disabled, readOnly: this.readonly, required: this.required, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur }), h("div", { key: '87b02ece272f3cc51261c0222733c49d8eb92c1d', class: "ui-date-picker__icon" }, h("svg", { key: 'a2e2587630df969406d5f1b1758bb23c82f7f195', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { key: '0354df53ff3ca4197859f95e9036a53f2a78a479', x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), h("line", { key: 'c5a4767b65bb0ffbec6278e42cfc564ac2b44107', x1: "16", y1: "2", x2: "16", y2: "6" }), h("line", { key: 'b5c6442f5f24d9c294b891a0be70a98ddc872dc9', x1: "8", y1: "2", x2: "8", y2: "6" }), h("line", { key: '519b20fcab6e9a01e71ce4d78a63d92df932013f', x1: "3", y1: "10", x2: "21", y2: "10" })))), (hasError || this.helperText) && (h("div", { key: 'e5828bc347b125671ecce0da97defbc77ff3a142', class: { 'ui-date-picker__message': true, 'ui-date-picker__message--error': hasError } }, hasError ? this.error : this.helperText)))));
    }
    static get watchers() { return {
        "value": ["handleValueChange"]
    }; }
};
UiDatePicker.style = uiDatePickerCss();

export { UiDatePicker as ui_date_picker };
//# sourceMappingURL=ui-date-picker.entry.js.map
