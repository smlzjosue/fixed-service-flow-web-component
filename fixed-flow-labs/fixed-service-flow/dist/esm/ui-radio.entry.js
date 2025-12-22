import { r as registerInstance, c as createEvent, h, H as Host } from './index-6Be1tPfL.js';

const uiRadioCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:inline-block}.ui-radio{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none}.ui-radio__input{position:absolute;opacity:0;width:0;height:0}.ui-radio__indicator{position:relative;width:20px;height:20px;border:2px solid #CCCCCC;border-radius:50%;background-color:#FFFFFF;transition:all 150ms ease;flex-shrink:0}.ui-radio__indicator::after{content:"";position:absolute;top:50%;left:50%;width:10px;height:10px;background-color:#0097A9;border-radius:50%;transform:translate(-50%, -50%) scale(0);transition:transform 150ms ease}.ui-radio__label{font-size:1rem;color:#333333}.ui-radio:hover:not(.ui-radio--disabled) .ui-radio__indicator{border-color:#0097A9}.ui-radio--checked .ui-radio__indicator{border-color:#0097A9}.ui-radio--checked .ui-radio__indicator::after{transform:translate(-50%, -50%) scale(1)}.ui-radio--disabled{cursor:not-allowed;opacity:0.5}.ui-radio--disabled .ui-radio__indicator{background-color:#F5F5F5}.ui-radio .ui-radio__input:focus+.ui-radio__indicator{box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}`;

const UiRadio = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.radioChange = createEvent(this, "radioChange");
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Radio label text
     */
    label;
    /**
     * Radio name (for grouping)
     */
    name;
    /**
     * Radio value
     */
    value;
    /**
     * Whether this radio is selected
     */
    checked = false;
    /**
     * Disabled state
     */
    disabled = false;
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when radio is selected
     */
    radioChange;
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleChange = () => {
        if (!this.disabled) {
            this.radioChange.emit(this.value);
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const classes = {
            'ui-radio': true,
            'ui-radio--checked': this.checked,
            'ui-radio--disabled': this.disabled,
        };
        return (h(Host, { key: 'da8fad750b8b09cd272f8bef14938b2ba2ebeb79' }, h("label", { key: 'ec9e38353af9618f385694f2fc435812a304b5f5', class: classes }, h("input", { key: '32c12be448288ba2c68118d7eedc8cee79d57d32', type: "radio", class: "ui-radio__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, onChange: this.handleChange }), h("span", { key: 'a2f3c8c0bda6de388921104419483984879ac4fb', class: "ui-radio__indicator" }), this.label && h("span", { key: '26de83538fa5201be553054dc5c08ad5f5538c50', class: "ui-radio__label" }, this.label), h("slot", { key: 'c38ec451b275857078275c414a9db693473e755f' }))));
    }
};
UiRadio.style = uiRadioCss();

export { UiRadio as ui_radio };
//# sourceMappingURL=ui-radio.entry.js.map
