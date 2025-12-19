import { t as transformTag, p as proxyCustomElement, H, c as createEvent, h, d as Host } from './p-rjZjel3R.js';

const uiRadioCardCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-radio-card{position:relative;display:flex;align-items:flex-start;gap:1rem;padding:1.25rem;background-color:#FFFFFF;border:2px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;user-select:none}.ui-radio-card:hover:not(.ui-radio-card--disabled){border-color:#0097A9;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.ui-radio-card:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}.ui-radio-card__input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}.ui-radio-card__badge{position:absolute;top:0;right:1rem;transform:translateY(-50%);padding:0.25rem 0.75rem;font-size:0.75rem;font-weight:600;color:#FFFFFF;background-color:#0097A9;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px}.ui-radio-card__indicator{position:relative;flex-shrink:0;width:22px;height:22px;border:2px solid #CCCCCC;border-radius:50%;background-color:#FFFFFF;transition:all 150ms ease;margin-top:0.25rem}.ui-radio-card__indicator-dot{position:absolute;top:50%;left:50%;width:12px;height:12px;background-color:#0097A9;border-radius:50%;transform:translate(-50%, -50%) scale(0);transition:transform 150ms ease}.ui-radio-card__content{flex:1;display:flex;flex-wrap:wrap;align-items:flex-start;gap:0.75rem}.ui-radio-card__icon{flex-shrink:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center}.ui-radio-card__icon img,.ui-radio-card__icon svg{max-width:100%;max-height:100%;object-fit:contain}.ui-radio-card__text{flex:1;min-width:150px}.ui-radio-card__title{margin:0 0 0.25rem 0;font-size:1rem;font-weight:600;color:#333333;line-height:1.3}.ui-radio-card__description{margin:0;font-size:0.875rem;color:#666666;line-height:1.4}.ui-radio-card__price{font-size:1.25rem;font-weight:700;color:#0097A9;white-space:nowrap;margin-left:auto}.ui-radio-card--checked{border-color:#0097A9;background-color:rgba(0, 151, 169, 0.03)}.ui-radio-card--checked .ui-radio-card__indicator{border-color:#0097A9}.ui-radio-card--checked .ui-radio-card__indicator-dot{transform:translate(-50%, -50%) scale(1)}.ui-radio-card--disabled{cursor:not-allowed;opacity:0.6;background-color:#FAFAFA}.ui-radio-card--disabled .ui-radio-card__indicator{background-color:#F5F5F5}@media (max-width: 767px){.ui-radio-card{padding:1rem;gap:0.75rem}.ui-radio-card__content{flex-direction:column}.ui-radio-card__price{margin-left:0}.ui-radio-card__icon{width:40px;height:40px}}`;

const UiRadioCard$1 = /*@__PURE__*/ proxyCustomElement(class UiRadioCard extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.cardSelect = createEvent(this, "cardSelect");
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Card title
     */
    cardTitle;
    /**
     * Card description
     */
    description;
    /**
     * Radio name (for grouping)
     */
    name;
    /**
     * Radio value
     */
    value;
    /**
     * Whether this card is selected
     */
    checked = false;
    /**
     * Disabled state
     */
    disabled = false;
    /**
     * Icon name or URL (optional)
     */
    icon;
    /**
     * Price to display (optional)
     */
    price;
    /**
     * Badge text (optional, e.g., "Recomendado")
     */
    badge;
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when card is selected
     */
    cardSelect;
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleSelect = () => {
        if (!this.disabled) {
            this.cardSelect.emit(this.value);
        }
    };
    handleKeyDown = (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !this.disabled) {
            event.preventDefault();
            this.cardSelect.emit(this.value);
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const classes = {
            'ui-radio-card': true,
            'ui-radio-card--checked': this.checked,
            'ui-radio-card--disabled': this.disabled,
        };
        return (h(Host, { key: 'e723bb7d9908e73b2da21b541b7667b578775b26' }, h("div", { key: 'f405c20fcaa00122e658eb8428c51bf78d323a59', class: classes, role: "radio", "aria-checked": this.checked ? 'true' : 'false', "aria-disabled": this.disabled ? 'true' : 'false', tabIndex: this.disabled ? -1 : 0, onClick: this.handleSelect, onKeyDown: this.handleKeyDown }, h("input", { key: '6c925d310a0169922c0f2562ece51f688414b941', type: "radio", class: "ui-radio-card__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, tabIndex: -1 }), this.badge && (h("span", { key: 'fa6d60f225621c7d92c924e3d93f9c6b54ea9dfb', class: "ui-radio-card__badge" }, this.badge)), h("div", { key: '84c2ebdd0e6a585700dff78f90124c7337bfef0b', class: "ui-radio-card__indicator" }, h("span", { key: 'a2fc5631643f988d26203d994939a258a13cea78', class: "ui-radio-card__indicator-dot" })), h("div", { key: '5d9be107f32ecf67bbe0da159b52ed45605d8c26', class: "ui-radio-card__content" }, this.icon && (h("div", { key: '1d3b926f1cbf9c3eccfe507319844a817a75a690', class: "ui-radio-card__icon" }, h("slot", { key: 'c0fe7b272baba67871877f27655ad296917cb1a0', name: "icon" }, h("img", { key: 'bdb4fb3898503d28394382d2540446c33aee8db0', src: this.icon, alt: "" })))), h("div", { key: 'caaed923ee0126f860dda3638732ca575c71ad56', class: "ui-radio-card__text" }, this.cardTitle && (h("h4", { key: '0e2af4cea7248d1d22e916121e60b094f87f8424', class: "ui-radio-card__title" }, this.cardTitle)), this.description && (h("p", { key: 'f78aed2d474a15051103a3c303d2be7cf7f29c22', class: "ui-radio-card__description" }, this.description)), h("slot", { key: '145b0b783b0401ec96275a37b590342da62db751' })), this.price && (h("div", { key: '206ed0aa3e28a4da91f37d0b9e2cb13bc1192f31', class: "ui-radio-card__price" }, this.price))))));
    }
    static get style() { return uiRadioCardCss(); }
}, [769, "ui-radio-card", {
        "cardTitle": [1, "card-title"],
        "description": [1],
        "name": [1],
        "value": [1],
        "checked": [4],
        "disabled": [4],
        "icon": [1],
        "price": [1],
        "badge": [1]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-radio-card"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-radio-card":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiRadioCard$1);
            }
            break;
    } });
}
defineCustomElement$1();

const UiRadioCard = UiRadioCard$1;
const defineCustomElement = defineCustomElement$1;

export { UiRadioCard, defineCustomElement };
//# sourceMappingURL=ui-radio-card.js.map

//# sourceMappingURL=ui-radio-card.js.map