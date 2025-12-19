'use strict';

var index = require('./index-C7RCDrsz.js');

const uiCheckboxCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.checkbox-container{display:flex;align-items:flex-start;gap:0.75rem;cursor:pointer;user-select:none}.checkbox-container--disabled{cursor:not-allowed;opacity:0.5}.checkbox-container--error .checkbox-checkmark{border-color:#DA291C}.checkbox-input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.checkbox-input:checked~.checkbox-checkmark{background-color:#0097A9;border-color:#0097A9}.checkbox-input:checked~.checkbox-checkmark .checkbox-icon{opacity:1;transform:scale(1)}.checkbox-input:focus~.checkbox-checkmark{box-shadow:0 0 0 3px rgba(0, 151, 169, 0.2)}.checkbox-input:disabled~.checkbox-checkmark{background-color:#F5F5F5;border-color:#CCCCCC}.checkbox-checkmark{position:relative;flex-shrink:0;width:20px;height:20px;background-color:#FFFFFF;border:2px solid #CCCCCC;border-radius:0.25rem;transition:all 150ms ease}.checkbox-checkmark .checkbox-icon{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(0.5);width:14px;height:14px;color:#FFFFFF;opacity:0;transition:all 150ms ease}.checkbox-label{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;line-height:20px}.checkbox-error{display:block;margin-top:0.25rem;margin-left:calc(20px + 0.75rem);font-size:0.75rem;font-weight:400;line-height:1.5;color:#DA291C}`;

const UiCheckbox = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.checkboxChange = index.createEvent(this, "checkboxChange");
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
        return (index.h(index.Host, { key: '8bfd47168b95fd9ab276c8f9ea2cab01529a99d0' }, index.h("label", { key: '0492a7c0cfe36fa999a30ebdf2ff35a8b1c48e5c', class: {
                'checkbox-container': true,
                'checkbox-container--disabled': this.disabled,
                'checkbox-container--error': this.hasError,
            } }, index.h("input", { key: 'ef4fceb8c3b333b9bc73dbad6d22d4dc9d908a1d', type: "checkbox", name: this.name, checked: this.checked, disabled: this.disabled, onChange: this.handleChange, class: "checkbox-input" }), index.h("span", { key: 'ece99c1b23c8e2aa329e52d84cb175d744cf51a6', class: "checkbox-checkmark" }, index.h("svg", { key: '3c0b057f20cea04ae2d23192d72e512b22650011', class: "checkbox-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("polyline", { key: '3cc6b439b0176e4ee32d1aebebf03646250b8176', points: "20 6 9 17 4 12" }))), this.label && index.h("span", { key: '911f84b767bde496b61ca738b99a6395e6768387', class: "checkbox-label" }, this.label)), this.hasError && this.errorMessage && (index.h("span", { key: 'e21c969dd38c67fea70d4a8467810ba714918b4d', class: "checkbox-error" }, this.errorMessage))));
    }
};
UiCheckbox.style = uiCheckboxCss();

exports.ui_checkbox = UiCheckbox;
//# sourceMappingURL=ui-checkbox.entry.cjs.js.map
