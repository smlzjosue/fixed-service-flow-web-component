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
        return (h(Host, { key: 'e723bb7d9908e73b2da21b541b7667b578775b26' }, h("div", { key: 'f405c20fcaa00122e658eb8428c51bf78d323a59', class: classes, role: "radio", "aria-checked": this.checked ? 'true' : 'false', "aria-disabled": this.disabled ? 'true' : 'false', tabIndex: this.disabled ? -1 : 0, onClick: this.handleSelect, onKeyDown: this.handleKeyDown }, h("input", { key: '6c925d310a0169922c0f2562ece51f688414b941', type: "radio", class: "ui-radio-card__input", name: this.name, value: this.value, checked: this.checked, disabled: this.disabled, tabIndex: -1 }), this.badge && (h("span", { key: 'fa6d60f225621c7d92c924e3d93f9c6b54ea9dfb', class: "ui-radio-card__badge" }, this.badge)), h("div", { key: '84c2ebdd0e6a585700dff78f90124c7337bfef0b', class: "ui-radio-card__indicator" }, h("span", { key: 'a2fc5631643f988d26203d994939a258a13cea78', class: "ui-radio-card__indicator-dot" })), h("div", { key: '5d9be107f32ecf67bbe0da159b52ed45605d8c26', class: "ui-radio-card__content" }, this.icon && (h("div", { key: '1d3b926f1cbf9c3eccfe507319844a817a75a690', class: "ui-radio-card__icon" }, h("slot", { key: 'c0fe7b272baba67871877f27655ad296917cb1a0', name: "icon" }, h("img", { key: 'bdb4fb3898503d28394382d2540446c33aee8db0', src: this.icon, alt: "" })))), h("div", { key: 'caaed923ee0126f860dda3638732ca575c71ad56', class: "ui-radio-card__text" }, this.cardTitle && (h("h4", { key: '0e2af4cea7248d1d22e916121e60b094f87f8424', class: "ui-radio-card__title" }, this.cardTitle)), this.description && (h("p", { key: 'f78aed2d474a15051103a3c303d2be7cf7f29c22', class: "ui-radio-card__description" }, this.description)), h("slot", { key: '145b0b783b0401ec96275a37b590342da62db751' })), this.price && (h("div", { key: '206ed0aa3e28a4da91f37d0b9e2cb13bc1192f31', class: "ui-radio-card__price" }, this.price))))));
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
