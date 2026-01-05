import { r as registerInstance, c as createEvent, h, H as Host } from './index-CYQeQM-n.js';

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
        return (h(Host, { key: '2e68558ea972039e06e99723d1f1dc8076353f71' }, h("div", { key: '88027bdd23d38de850092b1d5828e1223999dbfe', class: classes, role: "radio", "aria-checked": this.checked ? 'true' : 'false', "aria-disabled": this.disabled ? 'true' : 'false', tabIndex: this.disabled ? -1 : 0, onClick: this.handleSelect, onKeyDown: this.handleKeyDown }, h("input", { key: 'b950800f90a4e0afd5e3a9b8417c92f1ceec1e52', type: "radio", class: "ui-radio-card__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, tabIndex: -1 }), this.badge && (h("span", { key: '0de31dfe0f0d0652b1f5f10d2b7a7c20873e8920', class: "ui-radio-card__badge" }, this.badge)), h("div", { key: '69b695f350f0fa846c2d6ff669886797b69bd716', class: "ui-radio-card__indicator" }, h("span", { key: '0c8d037fbf2c6e66336ee80928017ca29dcc4ed2', class: "ui-radio-card__indicator-dot" })), h("div", { key: 'a49023646a3eda9641cd4ebad4aeb76654bbc5bd', class: "ui-radio-card__content" }, this.icon && (h("div", { key: '0fc2355d6a6ad451de5424bdceec98f2c83c237d', class: "ui-radio-card__icon" }, h("slot", { key: '4341e87837a4f8afefd94103ac9dfdac614fa4a3', name: "icon" }, h("img", { key: 'b0f32581a62e160dbd66ca78cf3f440d7c4396da', src: this.icon, alt: "" })))), h("div", { key: '7f653fdcf76444f7559c0a98240850fbea65603f', class: "ui-radio-card__text" }, this.cardTitle && (h("h4", { key: '50cf26921ee423ef8cf989006fa09222f6c809e7', class: "ui-radio-card__title" }, this.cardTitle)), this.description && (h("p", { key: 'cfff88b731aba9fd5bf34bb478ca937e17e13d89', class: "ui-radio-card__description" }, this.description)), h("slot", { key: 'f236aef647bd3c209e50ce1040324b8e313155b0' })), this.price && (h("div", { key: 'f2db25133995a99277476e01e630180e10f38e00', class: "ui-radio-card__price" }, this.price))))));
    }
};
UiRadioCard.style = uiRadioCardCss();

export { UiRadioCard as ui_radio_card };
//# sourceMappingURL=ui-radio-card.entry.js.map
