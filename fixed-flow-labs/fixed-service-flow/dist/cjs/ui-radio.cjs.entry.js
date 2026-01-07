'use strict';

var index = require('./index-BAqxGv-h.js');

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
        return (index.h(index.Host, { key: 'ddc26443b31d66c2a1367d4653181bfb1adf1793' }, index.h("label", { key: '9b17283ce9f824899c8018506e7c632cc4eeb2de', class: classes }, index.h("input", { key: 'e2d4b62c6733cf4284bc5d41ffb5aef2cc672dcf', type: "radio", class: "ui-radio__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, onChange: this.handleChange }), index.h("span", { key: '65c11e6d7c7779a64ed30ecd82a004afb841ef1b', class: "ui-radio__indicator" }), this.label && index.h("span", { key: 'f227f69d775b1e978ec4d29679acf585e955845f', class: "ui-radio__label" }, this.label), index.h("slot", { key: 'b6cc56c2ae9bfeba3ffbdbdc69696fe7b90f22f1' }))));
    }
};
UiRadio.style = uiRadioCss();

exports.ui_radio = UiRadio;
//# sourceMappingURL=ui-radio.entry.cjs.js.map
