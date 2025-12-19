'use strict';

var index = require('./index-C7RCDrsz.js');

const uiRadioCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:inline-block}.ui-radio{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none}.ui-radio__input{position:absolute;opacity:0;width:0;height:0}.ui-radio__indicator{position:relative;width:20px;height:20px;border:2px solid #CCCCCC;border-radius:50%;background-color:#FFFFFF;transition:all 150ms ease;flex-shrink:0}.ui-radio__indicator::after{content:"";position:absolute;top:50%;left:50%;width:10px;height:10px;background-color:#0097A9;border-radius:50%;transform:translate(-50%, -50%) scale(0);transition:transform 150ms ease}.ui-radio__label{font-size:1rem;color:#333333}.ui-radio:hover:not(.ui-radio--disabled) .ui-radio__indicator{border-color:#0097A9}.ui-radio--checked .ui-radio__indicator{border-color:#0097A9}.ui-radio--checked .ui-radio__indicator::after{transform:translate(-50%, -50%) scale(1)}.ui-radio--disabled{cursor:not-allowed;opacity:0.5}.ui-radio--disabled .ui-radio__indicator{background-color:#F5F5F5}.ui-radio .ui-radio__input:focus+.ui-radio__indicator{box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}`;

const UiRadio = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.radioChange = index.createEvent(this, "radioChange");
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
        return (index.h(index.Host, { key: '5d5286f41587a3aff01cc9cf4be0f8318091fc0e' }, index.h("label", { key: '67b47a9d98e10c15154687a79b82e6f8fe46e719', class: classes }, index.h("input", { key: '02e70e192a3245cfb8d89465ba817a7acf969aa4', type: "radio", class: "ui-radio__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, onChange: this.handleChange }), index.h("span", { key: '68de4357faddabc39f8129eb241c3c1b6c803d75', class: "ui-radio__indicator" }), this.label && index.h("span", { key: '0cdbf7e6b6bec132828f7f58cc9cbe6ffbbd26cd', class: "ui-radio__label" }, this.label), index.h("slot", { key: 'ecb70d06f09bb104a3c9ec9fab5d99f67e0ed1e7' }))));
    }
};
UiRadio.style = uiRadioCss();

exports.ui_radio = UiRadio;
//# sourceMappingURL=ui-radio.entry.cjs.js.map
