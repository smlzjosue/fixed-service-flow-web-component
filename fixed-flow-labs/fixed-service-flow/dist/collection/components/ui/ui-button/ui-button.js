// ============================================
// UI-BUTTON - Reusable Button Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
export class UiButton {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Button variant style
     */
    variant = 'primary';
    /**
     * Button size
     */
    size = 'md';
    /**
     * Disabled state
     */
    disabled = false;
    /**
     * Loading state (shows spinner)
     */
    loading = false;
    /**
     * Full width button
     */
    fullWidth = false;
    /**
     * Button type attribute
     */
    type = 'button';
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when button is clicked
     */
    buttonClick;
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleClick = (event) => {
        if (!this.disabled && !this.loading) {
            this.buttonClick.emit(event);
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const classes = {
            'ui-button': true,
            [`ui-button--${this.variant}`]: true,
            [`ui-button--${this.size}`]: true,
            'ui-button--disabled': this.disabled,
            'ui-button--loading': this.loading,
            'ui-button--full-width': this.fullWidth,
        };
        return (h(Host, { key: 'cc7f1be74ec793ade6906f7742d2e093aff405ff' }, h("button", { key: 'd416922c0b6461b3ebce9a346a7cd490199386e9', class: classes, type: this.type, disabled: this.disabled || this.loading, onClick: this.handleClick }, this.loading && (h("span", { key: '84fbd928ad7abeeba01ae7a1d22361299dfa40d4', class: "ui-button__spinner" })), h("span", { key: 'eeca2010f006dd7647d6dd780a99b888e9f588bc', class: "ui-button__content" }, h("slot", { key: '52903878f8c0f08f6473a686c2b7b6c304a3b79d' })))));
    }
    static get is() { return "ui-button"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-button.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-button.css"]
        };
    }
    static get properties() {
        return {
            "variant": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ButtonVariant",
                    "resolved": "\"outline\" | \"primary\" | \"secondary\" | \"text\"",
                    "references": {
                        "ButtonVariant": {
                            "location": "local",
                            "path": "/Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow/src/components/ui/ui-button/ui-button.tsx",
                            "id": "src/components/ui/ui-button/ui-button.tsx::ButtonVariant"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Button variant style"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "variant",
                "defaultValue": "'primary'"
            },
            "size": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "ButtonSize",
                    "resolved": "\"lg\" | \"md\" | \"sm\"",
                    "references": {
                        "ButtonSize": {
                            "location": "local",
                            "path": "/Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow/src/components/ui/ui-button/ui-button.tsx",
                            "id": "src/components/ui/ui-button/ui-button.tsx::ButtonSize"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Button size"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "size",
                "defaultValue": "'md'"
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
            "loading": {
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
                    "text": "Loading state (shows spinner)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loading",
                "defaultValue": "false"
            },
            "fullWidth": {
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
                    "text": "Full width button"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "full-width",
                "defaultValue": "false"
            },
            "type": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "'button' | 'submit' | 'reset'",
                    "resolved": "\"button\" | \"reset\" | \"submit\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Button type attribute"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "type",
                "defaultValue": "'button'"
            }
        };
    }
    static get events() {
        return [{
                "method": "buttonClick",
                "name": "buttonClick",
                "bubbles": true,
                "cancelable": true,
                "composed": true,
                "docs": {
                    "tags": [],
                    "text": "Emitted when button is clicked"
                },
                "complexType": {
                    "original": "MouseEvent",
                    "resolved": "MouseEvent",
                    "references": {
                        "MouseEvent": {
                            "location": "global",
                            "id": "global::MouseEvent"
                        }
                    }
                }
            }];
    }
}
//# sourceMappingURL=ui-button.js.map
