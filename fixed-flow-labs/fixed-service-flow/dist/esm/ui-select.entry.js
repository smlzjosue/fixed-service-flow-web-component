import { r as registerInstance, c as createEvent, h, H as Host } from './index-CYQeQM-n.js';

const uiSelectCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-select{display:flex;flex-direction:column;width:100%}.ui-select__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.ui-select__required{color:#DA291C;margin-left:0.25rem}.ui-select__wrapper{position:relative;width:100%}.ui-select__field{width:100%;height:44px;padding:0 2.5rem 0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;cursor:pointer;transition:border-color 150ms ease, box-shadow 150ms ease;appearance:none}.ui-select__field:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.ui-select__field:disabled{background-color:#F5F5F5;color:#666666;cursor:not-allowed}.ui-select__field option[value=""][disabled]{color:#999999}.ui-select__icon{position:absolute;top:50%;right:1rem;transform:translateY(-50%);pointer-events:none;color:#666666;transition:transform 150ms ease}.ui-select__icon svg{width:16px;height:16px}.ui-select__error{margin-top:0.25rem;font-size:0.75rem;color:#DA291C}.ui-select--focused .ui-select__label{color:#0097A9}.ui-select--focused .ui-select__icon{transform:translateY(-50%) rotate(180deg);color:#0097A9}.ui-select--error .ui-select__field{border-color:#DA291C}.ui-select--error .ui-select__field:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.ui-select--error .ui-select__label{color:#DA291C}.ui-select--disabled .ui-select__label{color:#666666}.ui-select--disabled .ui-select__icon{color:#999999}`;

const UiSelect = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.valueChange = createEvent(this, "valueChange");
        this.selectFocus = createEvent(this, "selectFocus");
        this.selectBlur = createEvent(this, "selectBlur");
    }
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
    static get watchers() { return {
        "value": ["handleValueChange"]
    }; }
};
UiSelect.style = uiSelectCss();

export { UiSelect as ui_select };
//# sourceMappingURL=ui-select.entry.js.map
