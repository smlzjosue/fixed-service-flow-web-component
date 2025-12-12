import { t as transformTag, p as proxyCustomElement, H, c as createEvent, h, d as Host } from './p-rjZjel3R.js';

const uiRadioCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:inline-block}.ui-radio{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none}.ui-radio__input{position:absolute;opacity:0;width:0;height:0}.ui-radio__indicator{position:relative;width:20px;height:20px;border:2px solid #CCCCCC;border-radius:50%;background-color:#FFFFFF;transition:all 150ms ease;flex-shrink:0}.ui-radio__indicator::after{content:"";position:absolute;top:50%;left:50%;width:10px;height:10px;background-color:#0097A9;border-radius:50%;transform:translate(-50%, -50%) scale(0);transition:transform 150ms ease}.ui-radio__label{font-size:1rem;color:#333333}.ui-radio:hover:not(.ui-radio--disabled) .ui-radio__indicator{border-color:#0097A9}.ui-radio--checked .ui-radio__indicator{border-color:#0097A9}.ui-radio--checked .ui-radio__indicator::after{transform:translate(-50%, -50%) scale(1)}.ui-radio--disabled{cursor:not-allowed;opacity:0.5}.ui-radio--disabled .ui-radio__indicator{background-color:#F5F5F5}.ui-radio .ui-radio__input:focus+.ui-radio__indicator{box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}`;

const UiRadio$1 = /*@__PURE__*/ proxyCustomElement(class UiRadio extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
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
        return (h(Host, { key: '2cddb727deb8cce43a4ddf7ac60eb8701993565f' }, h("label", { key: '914e4c52026f00597d0a71e3da85faee9da9cef0', class: classes }, h("input", { key: 'ce12172fe53d4258aa21c44b8a724bc91f0243eb', type: "radio", class: "ui-radio__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, onChange: this.handleChange }), h("span", { key: 'f8e55d78a6eeb8d3cafc7346d0e673d6b1a390be', class: "ui-radio__indicator" }), this.label && h("span", { key: '1a6c01f9c81963c1a5b46dcfb319da111f5251d1', class: "ui-radio__label" }, this.label), h("slot", { key: '7fcd3078aa6d3512cdbb8b973467d1014ecc4cb1' }))));
    }
    static get style() { return uiRadioCss(); }
}, [769, "ui-radio", {
        "label": [1],
        "name": [1],
        "value": [1],
        "checked": [4],
        "disabled": [4]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-radio"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-radio":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiRadio$1);
            }
            break;
    } });
}
defineCustomElement$1();

const UiRadio = UiRadio$1;
const defineCustomElement = defineCustomElement$1;

export { UiRadio, defineCustomElement };
//# sourceMappingURL=ui-radio.js.map

//# sourceMappingURL=ui-radio.js.map