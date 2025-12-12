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
        return (h(Host, { key: 'd12d163681f1f07e8c081aa8b28314bd84ff21a5' }, h("div", { key: '58bb40c6e20a51a71a4957fba61706c8c91e6541', class: classes, role: "radio", "aria-checked": this.checked ? 'true' : 'false', "aria-disabled": this.disabled ? 'true' : 'false', tabIndex: this.disabled ? -1 : 0, onClick: this.handleSelect, onKeyDown: this.handleKeyDown }, h("input", { key: 'c2c2ead50ec5825a4c06b4f4e8ba29c0fee63213', type: "radio", class: "ui-radio-card__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, tabIndex: -1 }), this.badge && (h("span", { key: 'bbf7ac4cc6018cda4b8011543aaf0f1fd3dcbee3', class: "ui-radio-card__badge" }, this.badge)), h("div", { key: 'd99cbe0fdfc97fac40fc9f0391b21bbe1373aeb6', class: "ui-radio-card__indicator" }, h("span", { key: 'b4b666d531312857ca332cec80e5e99e7614fcff', class: "ui-radio-card__indicator-dot" })), h("div", { key: '3e1bd4bda69a5f5831f808c45f2429cfd1857e45', class: "ui-radio-card__content" }, this.icon && (h("div", { key: '02ea3f14f99fc2603650651c3112d3f598be1f93', class: "ui-radio-card__icon" }, h("slot", { key: '6dc60a9a3adfe35188d6bf97788e222aea3ded87', name: "icon" }, h("img", { key: '52bc4c5a55e6424b2680ad6bf87a899035d76b79', src: this.icon, alt: "" })))), h("div", { key: '938303753dfc53fa24a57b0fd570b43051e28ff7', class: "ui-radio-card__text" }, this.cardTitle && (h("h4", { key: 'e08580b3fcc8b29fc0f5122b0d5b316051055d41', class: "ui-radio-card__title" }, this.cardTitle)), this.description && (h("p", { key: 'b54a9e9fecd108aafc97961e9d19dc94995f9902', class: "ui-radio-card__description" }, this.description)), h("slot", { key: '08038bbf6a214dd679944a7bf6e92dd1076d9946' })), this.price && (h("div", { key: '722334c464a6365aa9c78158793b3893cb9f7790', class: "ui-radio-card__price" }, this.price))))));
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
