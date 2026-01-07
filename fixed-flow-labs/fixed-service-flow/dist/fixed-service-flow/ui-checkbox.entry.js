import { r as registerInstance, a as createEvent, h, d as Host } from './index-zT41ZBSk.js';

const uiCheckboxCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.checkbox-container{display:flex;align-items:flex-start;gap:0.75rem;cursor:pointer;user-select:none}.checkbox-container--disabled{cursor:not-allowed;opacity:0.5}.checkbox-container--error .checkbox-checkmark{border-color:#DA291C}.checkbox-input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkbox-input:checked~.checkbox-checkmark{background-color:#0097A9;border-color:#0097A9}.checkbox-input:checked~.checkbox-checkmark .checkbox-icon{opacity:1;transform:scale(1)}.checkbox-input:focus~.checkbox-checkmark{box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}.checkbox-input:disabled~.checkbox-checkmark{background-color:#F5F5F5;border-color:#CCCCCC}.checkbox-checkmark{position:relative;flex-shrink:0;width:20px;height:20px;background-color:#FFFFFF;border:2px solid #CCCCCC;border-radius:0.25rem;transition:all 150ms ease}.checkbox-checkmark .checkbox-icon{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(0.5);width:14px;height:14px;color:#FFFFFF;opacity:0;transition:all 150ms ease}.checkbox-label{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;line-height:20px}.checkbox-error{display:block;margin-top:0.25rem;margin-left:calc(20px + 0.75rem);font-size:0.75rem;font-weight:400;line-height:1.5;color:#DA291C}`;

const UiCheckbox = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.checkboxChange = createEvent(this, "checkboxChange", 7);
    }
    /**
     * The checkbox value
     */
    checked = false;
    /**
     * The checkbox label
     */
    label = '';
    /**
     * The checkbox name
     */
    name = '';
    /**
     * Whether the checkbox is disabled
     */
    disabled = false;
    /**
     * Whether the checkbox has an error
     */
    hasError = false;
    /**
     * Error message to display
     */
    errorMessage = '';
    /**
     * Event emitted when the checkbox value changes
     */
    checkboxChange;
    handleChange = (event) => {
        const target = event.target;
        this.checked = target.checked;
        this.checkboxChange.emit(this.checked);
    };
    render() {
        return (h(Host, { key: 'dc61beb573271c7c9a6af4e1d1ddf05ca1916455' }, h("label", { key: '6daa7cfa5988f44234ca04897e1431940c47feae', class: {
                'checkbox-container': true,
                'checkbox-container--disabled': this.disabled,
                'checkbox-container--error': this.hasError,
            } }, h("input", { key: 'fbfa3c6b7473a95c12760449b12a3c5c856902c9', type: "checkbox", name: this.name, checked: this.checked, disabled: this.disabled, onChange: this.handleChange, class: "checkbox-input" }), h("span", { key: '188252e7fef671e73d78d4ec1f6d6dfeb7ef2f09', class: "checkbox-checkmark" }, h("svg", { key: '24acebac0e82446afe0ba1844a137cebd361f492', class: "checkbox-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("polyline", { key: '5926de8b6a40a68666124c17e19d6c92e0b24de3', points: "20 6 9 17 4 12" }))), this.label && h("span", { key: '7687747060bb4a799ddbfebd990a83a7fdd08ca2', class: "checkbox-label" }, this.label)), this.hasError && this.errorMessage && (h("span", { key: '8fda44bec8f8f8d627787fb27ee52dae69e58e9a', class: "checkbox-error" }, this.errorMessage))));
    }
};
UiCheckbox.style = uiCheckboxCss();

export { UiCheckbox as ui_checkbox };
//# sourceMappingURL=ui-checkbox.entry.esm.js.map
