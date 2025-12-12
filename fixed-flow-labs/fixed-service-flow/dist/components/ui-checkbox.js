import { t as transformTag, p as proxyCustomElement, H, c as createEvent, h, d as Host } from './p-rjZjel3R.js';

const uiCheckboxCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.checkbox-container{display:flex;align-items:flex-start;gap:0.75rem;cursor:pointer;user-select:none}.checkbox-container--disabled{cursor:not-allowed;opacity:0.5}.checkbox-container--error .checkbox-checkmark{border-color:#DA291C}.checkbox-input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkbox-input:checked~.checkbox-checkmark{background-color:#0097A9;border-color:#0097A9}.checkbox-input:checked~.checkbox-checkmark .checkbox-icon{opacity:1;transform:scale(1)}.checkbox-input:focus~.checkbox-checkmark{box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}.checkbox-input:disabled~.checkbox-checkmark{background-color:#F5F5F5;border-color:#CCCCCC}.checkbox-checkmark{position:relative;flex-shrink:0;width:20px;height:20px;background-color:#FFFFFF;border:2px solid #CCCCCC;border-radius:0.25rem;transition:all 150ms ease}.checkbox-checkmark .checkbox-icon{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(0.5);width:14px;height:14px;color:#FFFFFF;opacity:0;transition:all 150ms ease}.checkbox-label{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;line-height:20px}.checkbox-error{display:block;margin-top:0.25rem;margin-left:calc(20px + 0.75rem);font-size:0.75rem;font-weight:400;line-height:1.5;color:#DA291C}`;

const UiCheckbox$1 = /*@__PURE__*/ proxyCustomElement(class UiCheckbox extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.checkboxChange = createEvent(this, "checkboxChange");
    }
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
        return (h(Host, { key: '16817164816315831787c620484ccb594b49bae2' }, h("label", { key: '4a64d438aaaa0f6a7122f0077cead9369f9126f1', class: {
                'checkbox-container': true,
                'checkbox-container--disabled': this.disabled,
                'checkbox-container--error': this.hasError,
            } }, h("input", { key: '2ef530b03b4a4235b084228b00b148fd43da67b2', type: "checkbox", name: this.name, checked: this.checked, disabled: this.disabled, onChange: this.handleChange, class: "checkbox-input" }), h("span", { key: '4ed49159d93920da4dd39595cd4adc2b1b016b9b', class: "checkbox-checkmark" }, h("svg", { key: '0914018e68bfd51d04b087a049eb3d3a0894da52', class: "checkbox-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("polyline", { key: '3445b4337aef0ae832d9d3f5cd21235f27a5682c', points: "20 6 9 17 4 12" }))), this.label && h("span", { key: 'bd80f8f8e8d2d85b425730ec1fddc2bc66926ae3', class: "checkbox-label" }, this.label)), this.hasError && this.errorMessage && (h("span", { key: 'b08c5fffb52d8c497140e2da50f19d380531cd28', class: "checkbox-error" }, this.errorMessage))));
    }
    static get style() { return uiCheckboxCss(); }
}, [769, "ui-checkbox", {
        "checked": [1028],
        "label": [1],
        "name": [1],
        "disabled": [4],
        "hasError": [4, "has-error"],
        "errorMessage": [1, "error-message"]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-checkbox"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-checkbox":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiCheckbox$1);
            }
            break;
    } });
}
defineCustomElement$1();

const UiCheckbox = UiCheckbox$1;
const defineCustomElement = defineCustomElement$1;

export { UiCheckbox, defineCustomElement };
//# sourceMappingURL=ui-checkbox.js.map

//# sourceMappingURL=ui-checkbox.js.map