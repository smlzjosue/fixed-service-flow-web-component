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
        return (h(Host, { key: 'e457f468d609daef802a898e93bcaefd55fa6f95' }, h("div", { key: 'dd576de5abe3b43d83a718d71a276fab2c75451e', class: classes, role: "radio", "aria-checked": this.checked ? 'true' : 'false', "aria-disabled": this.disabled ? 'true' : 'false', tabIndex: this.disabled ? -1 : 0, onClick: this.handleSelect, onKeyDown: this.handleKeyDown }, h("input", { key: 'a9d9718ac6614ae60fea1eb78bf16a1a44147625', type: "radio", class: "ui-radio-card__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, tabIndex: -1 }), this.badge && (h("span", { key: '2a02a6f0877b12f29b50a39efeee7eb3a663cd49', class: "ui-radio-card__badge" }, this.badge)), h("div", { key: 'b4e0b2282af44da7ff1a4c23cfc78a1492f4d967', class: "ui-radio-card__indicator" }, h("span", { key: '519c1979747352e12d0d27e2020076caa4ab8ce1', class: "ui-radio-card__indicator-dot" })), h("div", { key: '573faad7b661cc3322f8d0ef3a195eb4d0ed3129', class: "ui-radio-card__content" }, this.icon && (h("div", { key: '88113ae6e04aad0b91dbdb7b46e12bc8198fe283', class: "ui-radio-card__icon" }, h("slot", { key: '1ffb87e585c7ae96380ea0e50a3e76be8bdfd3b7', name: "icon" }, h("img", { key: '6015e1a2e34869b887f134c63fe94dd5eba90c9c', src: this.icon, alt: "" })))), h("div", { key: '2cc7ba6ec3ad0480f7a0024c3ef2d2744a107bf3', class: "ui-radio-card__text" }, this.cardTitle && (h("h4", { key: '89a26511d7858f1c2d44069ef035593dbdbb6734', class: "ui-radio-card__title" }, this.cardTitle)), this.description && (h("p", { key: 'edd5a1697902e4428fa2116b39bbf8be89bf1771', class: "ui-radio-card__description" }, this.description)), h("slot", { key: '0cc5a11dcc7f7a8b18e759c130cae2ceafa83038' })), this.price && (h("div", { key: 'e731fa721159342bea1c57fd098e627cb3b440da', class: "ui-radio-card__price" }, this.price))))));
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
