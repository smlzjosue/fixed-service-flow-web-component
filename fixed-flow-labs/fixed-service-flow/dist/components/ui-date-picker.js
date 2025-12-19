import { t as transformTag, p as proxyCustomElement, H, c as createEvent, h, d as Host } from './p-rjZjel3R.js';

const uiDatePickerCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-date-picker{display:flex;flex-direction:column;width:100%}.ui-date-picker__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.ui-date-picker__required{color:#DA291C;margin-left:0.25rem}.ui-date-picker__wrapper{position:relative;width:100%}.ui-date-picker__field{width:100%;height:44px;padding:0 2.5rem 0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease;appearance:none}.ui-date-picker__field::-webkit-calendar-picker-indicator{position:absolute;right:0;top:0;width:100%;height:100%;opacity:0;cursor:pointer}.ui-date-picker__field::placeholder{color:#999999}.ui-date-picker__field:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.ui-date-picker__field:disabled{background-color:#F5F5F5;color:#666666;cursor:not-allowed}.ui-date-picker__field:read-only{background-color:#FAFAFA}.ui-date-picker__icon{position:absolute;top:50%;right:1rem;transform:translateY(-50%);pointer-events:none;color:#666666;transition:color 150ms ease}.ui-date-picker__icon svg{width:18px;height:18px}.ui-date-picker__message{margin-top:0.25rem;font-size:0.75rem;color:#666666}.ui-date-picker__message--error{color:#DA291C}.ui-date-picker--focused .ui-date-picker__label{color:#0097A9}.ui-date-picker--focused .ui-date-picker__icon{color:#0097A9}.ui-date-picker--error .ui-date-picker__field{border-color:#DA291C}.ui-date-picker--error .ui-date-picker__field:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.ui-date-picker--error .ui-date-picker__label{color:#DA291C}.ui-date-picker--error .ui-date-picker__icon{color:#DA291C}.ui-date-picker--disabled .ui-date-picker__label{color:#666666}.ui-date-picker--disabled .ui-date-picker__icon{color:#999999}`;

const UiDatePicker$1 = /*@__PURE__*/ proxyCustomElement(class UiDatePicker extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
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
        return (h(Host, { key: 'f881a3fdfa30d613ccd07242ad1acd03a6177ee9' }, h("div", { key: 'd2019b97e77a707f2c0e77f910db2bded097fca6', class: containerClasses }, this.label && (h("label", { key: '8283f1183c631ff17ddf82fd1404ea80afed3235', class: "ui-date-picker__label", htmlFor: this.name }, this.label, this.required && h("span", { key: '6086da90df959f30aaec6265d3212b626beba955', class: "ui-date-picker__required" }, "*"))), h("div", { key: '86d707025650f633e1dd43c8a1b0e58f4e0457df', class: "ui-date-picker__wrapper" }, h("input", { key: '3914d3e7e693863e8f5705ceb90865df29d7ce83', type: "date", class: "ui-date-picker__field", id: this.name, name: this.name, value: this.value, min: this.min, max: this.max, placeholder: this.placeholder, disabled: this.disabled, readOnly: this.readonly, required: this.required, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur }), h("div", { key: '3f7cca8e46f2bb03b3af3ed9d9135a208dab2c9f', class: "ui-date-picker__icon" }, h("svg", { key: '1117ff0b3b893d280bcefae043223427003cb5cc', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { key: 'e905dcd8e74c433b32cc6522c8a9d6542dc56b70', x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), h("line", { key: '6ad76c13dc56b7f1532919f8d11b280db507d7f2', x1: "16", y1: "2", x2: "16", y2: "6" }), h("line", { key: 'e50583c6934cfe75bf2c0e475c894d4da5aeb085', x1: "8", y1: "2", x2: "8", y2: "6" }), h("line", { key: 'a99893ebd1fed7a13eb827361521f6b977aececf', x1: "3", y1: "10", x2: "21", y2: "10" })))), (hasError || this.helperText) && (h("div", { key: '0cd9d9dee65596addc7f159b822fa28f85cb9bae', class: { 'ui-date-picker__message': true, 'ui-date-picker__message--error': hasError } }, hasError ? this.error : this.helperText)))));
    }
    static get watchers() { return {
        "value": ["handleValueChange"]
    }; }
    static get style() { return uiDatePickerCss(); }
}, [769, "ui-date-picker", {
        "label": [1],
        "name": [1],
        "value": [1025],
        "placeholder": [1],
        "min": [1],
        "max": [1],
        "required": [4],
        "disabled": [4],
        "readonly": [4],
        "error": [1],
        "helperText": [1, "helper-text"],
        "isFocused": [32],
        "hasValue": [32]
    }, undefined, {
        "value": ["handleValueChange"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-date-picker"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-date-picker":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiDatePicker$1);
            }
            break;
    } });
}
defineCustomElement$1();

const UiDatePicker = UiDatePicker$1;
const defineCustomElement = defineCustomElement$1;

export { UiDatePicker, defineCustomElement };
//# sourceMappingURL=ui-date-picker.js.map

//# sourceMappingURL=ui-date-picker.js.map