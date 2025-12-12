import { t as transformTag, p as proxyCustomElement, H, c as createEvent, h, d as Host } from './p-rjZjel3R.js';

const uiButtonCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:inline-block}.ui-button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-weight:600;line-height:1;text-decoration:none;border:2px solid transparent;border-radius:9999px;cursor:pointer;transition:all 150ms ease;white-space:nowrap}.ui-button:focus{outline:none;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.3)}.ui-button--sm{height:32px;padding:0 1rem;font-size:0.875rem}.ui-button--md{height:40px;padding:0 1.5rem;font-size:1rem}.ui-button--lg{height:48px;padding:0 2rem;font-size:1rem}.ui-button--primary{background-color:#DA291C;border-color:#DA291C;color:#FFFFFF}.ui-button--primary:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561);border-color:rgb(181.843902439, 34.2, 23.356097561)}.ui-button--primary:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415);border-color:rgb(163.7658536585, 30.8, 21.0341463415)}.ui-button--secondary{background-color:#0097A9;border-color:#0097A9;color:#FFFFFF}.ui-button--secondary:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2);border-color:rgb(0, 114.5455621302, 128.2)}.ui-button--secondary:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8);border-color:rgb(0, 96.3183431953, 107.8)}.ui-button--outline{background-color:transparent;border-color:#0097A9;color:#0097A9}.ui-button--outline:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.08)}.ui-button--outline:active:not(:disabled){background-color:rgba(0, 151, 169, 0.15)}.ui-button--text{background-color:transparent;border-color:transparent;color:#0097A9;padding-left:0.5rem;padding-right:0.5rem}.ui-button--text:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.08)}.ui-button--text:active:not(:disabled){background-color:rgba(0, 151, 169, 0.15)}.ui-button--disabled,.ui-button:disabled{opacity:0.5;cursor:not-allowed}.ui-button--loading{cursor:wait}.ui-button--loading .ui-button__content{opacity:0.7}.ui-button--full-width{width:100%}.ui-button__spinner{width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite}.ui-button__content{display:inline-flex;align-items:center;gap:0.5rem}@keyframes spin{to{transform:rotate(360deg)}}`;

const UiButton$1 = /*@__PURE__*/ proxyCustomElement(class UiButton extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
        this.buttonClick = createEvent(this, "buttonClick");
    }
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
    static get style() { return uiButtonCss(); }
}, [769, "ui-button", {
        "variant": [1],
        "size": [1],
        "disabled": [4],
        "loading": [4],
        "fullWidth": [4, "full-width"],
        "type": [1]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-button"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-button":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiButton$1);
            }
            break;
    } });
}
defineCustomElement$1();

const UiButton = UiButton$1;
const defineCustomElement = defineCustomElement$1;

export { UiButton, defineCustomElement };
//# sourceMappingURL=ui-button.js.map

//# sourceMappingURL=ui-button.js.map