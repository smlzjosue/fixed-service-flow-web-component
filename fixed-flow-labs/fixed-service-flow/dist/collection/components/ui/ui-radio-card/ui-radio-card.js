// ============================================
// UI-RADIO-CARD - Selectable Card Radio Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiRadioCard {
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
    static get is() { return "ui-radio-card"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-radio-card.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-radio-card.css"]
        };
    }
    static get properties() {
        return {
            "cardTitle": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Card title"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "card-title"
            },
            "description": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Card description"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "description"
            },
            "name": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Radio name (for grouping)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "name"
            },
            "value": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Radio value"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "value"
            },
            "checked": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether this card is selected"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "checked",
                "defaultValue": "false"
            },
            "disabled": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Disabled state"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "disabled",
                "defaultValue": "false"
            },
            "icon": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Icon name or URL (optional)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "icon"
            },
            "price": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Price to display (optional)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "price"
            },
            "badge": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": true,
                "docs": {
                    "tags": [],
                    "text": "Badge text (optional, e.g., \"Recomendado\")"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "badge"
            }
        };
    }
    static get events() {
        return [{
                "method": "cardSelect",
                "name": "cardSelect",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when card is selected"
                },
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                }
            }];
    }
}
//# sourceMappingURL=ui-radio-card.js.map
