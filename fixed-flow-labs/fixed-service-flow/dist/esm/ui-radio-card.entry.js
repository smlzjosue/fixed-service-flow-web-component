import { r as registerInstance, c as createEvent, h, H as Host } from './index-X-V47bix.js';

const uiRadioCardCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-radio-card{position:relative;display:flex;align-items:flex-start;gap:1rem;padding:1.25rem;background-color:#FFFFFF;border:2px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;user-select:none}.ui-radio-card:hover:not(.ui-radio-card--disabled){border-color:#0097A9;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.ui-radio-card:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}.ui-radio-card__input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}.ui-radio-card__badge{position:absolute;top:0;right:1rem;transform:translateY(-50%);padding:0.25rem 0.75rem;font-size:0.75rem;font-weight:600;color:#FFFFFF;background-color:#0097A9;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px}.ui-radio-card__indicator{position:relative;flex-shrink:0;width:22px;height:22px;border:2px solid #CCCCCC;border-radius:50%;background-color:#FFFFFF;transition:all 150ms ease;margin-top:0.25rem}.ui-radio-card__indicator-dot{position:absolute;top:50%;left:50%;width:12px;height:12px;background-color:#0097A9;border-radius:50%;transform:translate(-50%, -50%) scale(0);transition:transform 150ms ease}.ui-radio-card__content{flex:1;display:flex;flex-wrap:wrap;align-items:flex-start;gap:0.75rem}.ui-radio-card__icon{flex-shrink:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center}.ui-radio-card__icon img,.ui-radio-card__icon svg{max-width:100%;max-height:100%;object-fit:contain}.ui-radio-card__text{flex:1;min-width:150px}.ui-radio-card__title{margin:0 0 0.25rem 0;font-size:1rem;font-weight:600;color:#333333;line-height:1.3}.ui-radio-card__description{margin:0;font-size:0.875rem;color:#666666;line-height:1.4}.ui-radio-card__price{font-size:1.25rem;font-weight:700;color:#0097A9;white-space:nowrap;margin-left:auto}.ui-radio-card--checked{border-color:#0097A9;background-color:rgba(0, 151, 169, 0.03)}.ui-radio-card--checked .ui-radio-card__indicator{border-color:#0097A9}.ui-radio-card--checked .ui-radio-card__indicator-dot{transform:translate(-50%, -50%) scale(1)}.ui-radio-card--disabled{cursor:not-allowed;opacity:0.6;background-color:#FAFAFA}.ui-radio-card--disabled .ui-radio-card__indicator{background-color:#F5F5F5}@media (max-width: 767px){.ui-radio-card{padding:1rem;gap:0.75rem}.ui-radio-card__content{flex-direction:column}.ui-radio-card__price{margin-left:0}.ui-radio-card__icon{width:40px;height:40px}}`;

const UiRadioCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h(Host, { key: '1c41c8217c70e9f480bb7a1748f6e1eb689491ec' }, h("div", { key: 'ca1afac1bcca4cd50a4fc16130b4aebd547b1783', class: classes, role: "radio", "aria-checked": this.checked ? 'true' : 'false', "aria-disabled": this.disabled ? 'true' : 'false', tabIndex: this.disabled ? -1 : 0, onClick: this.handleSelect, onKeyDown: this.handleKeyDown }, h("input", { key: '64292419422633d3d0401dff3f11cf5c55f4a617', type: "radio", class: "ui-radio-card__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, tabIndex: -1 }), this.badge && (h("span", { key: 'c77466bd35d573616c41cfe30dff8234218dc8c7', class: "ui-radio-card__badge" }, this.badge)), h("div", { key: 'b2378af1641a1c54b9df4971a8854ff3d265200c', class: "ui-radio-card__indicator" }, h("span", { key: '60e459800c4293ba88c24177c50cd4e412094d76', class: "ui-radio-card__indicator-dot" })), h("div", { key: 'd68455ab07ca8e162c48e909dcaac56ddee2c94a', class: "ui-radio-card__content" }, this.icon && (h("div", { key: '81bdca159ec377094410366c1d4b1dfbd97ea343', class: "ui-radio-card__icon" }, h("slot", { key: 'f2b397b1dd8fd280bf8fd5d9b8eea204bf8849ea', name: "icon" }, h("img", { key: 'b843b0c0b56a2cdaa97f38aaef82cddc68ca8ed1', src: this.icon, alt: "" })))), h("div", { key: '1241a9775169718f650be2e5694cdf5c1bf53cf4', class: "ui-radio-card__text" }, this.cardTitle && (h("h4", { key: 'c55dff86af55bba621699779e9d5b29038d2d83d', class: "ui-radio-card__title" }, this.cardTitle)), this.description && (h("p", { key: 'da6d4f38d523c3586db5c2566f5713d52da2c2ed', class: "ui-radio-card__description" }, this.description)), h("slot", { key: '0d04e6330e9853e3f6f0cc4e5f39206bb518cd29' })), this.price && (h("div", { key: 'a808d901d24f36e0b5d659f0cfa7447f464e5324', class: "ui-radio-card__price" }, this.price))))));
    }
};
UiRadioCard.style = uiRadioCardCss();

export { UiRadioCard as ui_radio_card };
//# sourceMappingURL=ui-radio-card.entry.js.map
