import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { s as state, f as flowActions } from './p-Dom6fCh6.js';
import { C as CONTRACT_OPTIONS } from './p-CwWwm_QF.js';
import { f as formatContractDuration, a as formatPrice } from './p-jNHbU7wj.js';

const stepContractCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-contract{width:100%}.step-contract__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}.step-contract__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-contract__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-contract__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-contract__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-contract__btn-back{height:40px}.step-contract__tabs{display:flex;border-bottom:none;margin-bottom:1.5rem;background:#FFFFFF;border-radius:0 0 0.75rem 0.75rem;box-shadow:0 2px 4px rgba(0, 0, 0, 0.08);overflow:hidden}.step-contract__tab{flex:1;padding:1rem;background:transparent;border:none;cursor:pointer;text-align:center;position:relative;transition:all 150ms ease}.step-contract__tab:first-child{border-right:1px solid #E5E5E5}.step-contract__tab::after{content:"";position:absolute;bottom:0;left:1.5rem;right:1.5rem;height:3px;background:transparent;transition:background-color 150ms ease}.step-contract__tab--active::after{background:#0097A9}.step-contract__tab:hover:not(.step-contract__tab--active){background:#FAFAFA}.step-contract__tab-title{display:block;font-size:1.25rem;font-weight:600;line-height:1.35;font-weight:700;color:#333333;margin-bottom:0.25rem}.step-contract__tab-subtitle{display:block;font-size:0.75rem;font-weight:400;line-height:1.5;color:#666666}.step-contract__options{display:flex;flex-direction:column;gap:1rem;align-items:center}@media (min-width: 768px){.step-contract__options{flex-direction:row;justify-content:center}}.step-contract__option{flex:0 0 auto;width:280px;display:flex;align-items:flex-start;padding:1rem;border:1px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;position:relative;overflow:hidden}@media (max-width: 767px){.step-contract__option{width:100%;max-width:320px}}.step-contract__option::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#CCCCCC;border-radius:0.75rem 0 0 0.75rem;transition:background-color 150ms ease}.step-contract__option input[type=radio]{margin-right:0.75rem;margin-top:0.25rem;accent-color:#0097A9}.step-contract__option:hover{border-color:#999999}.step-contract__option--selected{border-color:#CCCCCC}.step-contract__option--selected::before{background:#0097A9}.step-contract__option-content{flex:1}.step-contract__option-title{display:block;font-size:1.25rem;font-weight:600;line-height:1.35;color:#333333;margin-bottom:0.5rem}.step-contract__option-details{display:flex;flex-direction:column;gap:0.25rem}.step-contract__option-details span{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666}.step-contract__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-contract__btn-continue{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-continue:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-continue{height:48px;background-color:#DA291C;color:#FFFFFF}.step-contract__btn-continue:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-contract__btn-continue:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-contract__btn-continue{min-width:200px}`;

const StepContract = /*@__PURE__*/ proxyCustomElement(class StepContract extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    activeTab = 1; // 1 = Con contrato
    selectedOption = null;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        // Restaurar selección previa si existe (cuando el usuario vuelve a este paso)
        this.restorePreviousSelection();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    /**
     * Restaura la selección previa desde el store o sessionStorage
     * Esto permite mantener la selección cuando el usuario navega hacia atrás
     */
    restorePreviousSelection() {
        // Primero intentar desde el store
        if (state.selectedContract) {
            this.selectedOption = state.selectedContract;
            this.activeTab = state.selectedContract.typeId;
            return;
        }
        // Si no está en el store, intentar desde sessionStorage
        const typeContractId = sessionStorage.getItem('typeContractId');
        if (typeContractId !== null) {
            const typeId = parseInt(typeContractId);
            const deadlines = parseInt(sessionStorage.getItem('contractInstallment') || '0');
            const installation = parseInt(sessionStorage.getItem('contractInstallation') || '0');
            const activation = parseInt(sessionStorage.getItem('contractActivation') || '0');
            const modem = parseInt(sessionStorage.getItem('contractModen') || '0');
            const contractType = CONTRACT_OPTIONS.find(c => c.typeId === typeId);
            this.selectedOption = {
                typeId,
                typeName: contractType?.type || '',
                deadlines,
                installation,
                activation,
                modem,
            };
            this.activeTab = typeId;
            // Sincronizar con el store
            flowActions.setContract(this.selectedOption);
        }
    }
    handleTabChange = (typeId) => {
        this.activeTab = typeId;
        // No limpiar la selección si ya hay una del mismo tipo
        if (this.selectedOption?.typeId !== typeId) {
            this.selectedOption = null;
        }
    };
    handleSelectOption = (typeId, option) => {
        const contractType = CONTRACT_OPTIONS.find(c => c.typeId === typeId);
        this.selectedOption = {
            typeId,
            typeName: contractType?.type || '',
            deadlines: option.deadlines,
            installation: option.installation,
            activation: option.activation,
            modem: option.modem,
        };
        flowActions.setContract(this.selectedOption);
    };
    handleContinue = () => {
        if (this.selectedOption) {
            this.onNext?.();
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const withContract = CONTRACT_OPTIONS.find(c => c.typeId === 1);
        const withoutContract = CONTRACT_OPTIONS.find(c => c.typeId === 0);
        return (h(Host, { key: 'f1905e6b70dc6122709e028226af1a20f4c968f0' }, h("div", { key: 'c08690c9d77c82e1b38bde06f53a4cf8fe57959c', class: "step-contract" }, h("header", { key: '4a2d90242969243120d78af3f6cf009b8ff9db57', class: "step-contract__header" }, h("h1", { key: '47c0a78c53271fd222de19dc91d55baa80f74c0d', class: "step-contract__title" }, "Selecciona un tipo de contrato"), h("button", { key: '33159923e314ff5bf6185ac5e0ed818f30af1c10', class: "step-contract__btn-back", onClick: this.onBack }, "Regresar")), h("div", { key: '0b1c67f46bfce90276b503d217340b7c196ff12d', class: "step-contract__tabs" }, h("button", { key: '646a2264e8069b0000bb891b7f3aaddd64d9bcf8', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
            }, onClick: () => this.handleTabChange(1) }, h("span", { key: '352c1520f14c686bcc190ccc916ce4d3d30f9616', class: "step-contract__tab-title" }, "Con contrato"), h("span", { key: '014665509e201e6d6d90c93a90ffc0d6bd5da668', class: "step-contract__tab-subtitle" }, "12 y 24 meses de contrato")), h("button", { key: 'bdabf0e35ef436bd3137301c734f0a17dadf9f3b', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
            }, onClick: () => this.handleTabChange(0) }, h("span", { key: '8963df3a459b259a9ac841d0ddd428c2f52f63bf', class: "step-contract__tab-title" }, "Sin contrato"), h("span", { key: 'f2337aa7d97707a5e46c966d4b7f00243bdfa6b2', class: "step-contract__tab-subtitle" }, "Sin verificaci\u00F3n de cr\u00E9dito", h("br", { key: 'f8bf274567bc524d85864f92db61f48f7daed407' }), "1 mes de plan por adelantado"))), h("div", { key: '1a08c254123f8312f938139a328ee34650d1fc22', class: "step-contract__content" }, this.activeTab === 1 && withContract && (h("div", { key: '9686ff7cf25586051b19c1becc9d2aca89c92263', class: "step-contract__options" }, withContract.contract.map((option) => (h("label", { class: {
                'step-contract__option': true,
                'step-contract__option--selected': this.selectedOption?.deadlines === option.deadlines &&
                    this.selectedOption?.typeId === 1,
            } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.deadlines === option.deadlines &&
                this.selectedOption?.typeId === 1, onChange: () => this.handleSelectOption(1, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, formatContractDuration(option.deadlines)), h("div", { class: "step-contract__option-details" }, h("span", null, "Instalaci\u00F3n: ", option.installation > 0 ? formatPrice(option.installation) : 'Sin Costo'), h("span", null, "Activaci\u00F3n: ", option.activation > 0 ? formatPrice(option.activation) : 'Sin Costo'), h("span", null, "Modem: ", option.modem > 0 ? formatPrice(option.modem) : 'Sin Costo')))))))), this.activeTab === 0 && withoutContract && (h("div", { key: '8a9c1a251df633a2eb37f5055a4efebe925b3c39', class: "step-contract__options" }, withoutContract.contract.map((option) => (h("label", { class: {
                'step-contract__option': true,
                'step-contract__option--selected': this.selectedOption?.typeId === 0,
            } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.typeId === 0, onChange: () => this.handleSelectOption(0, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, "Sin contrato"), h("div", { class: "step-contract__option-details" }, h("span", null, "Activaci\u00F3n: ", option.activation > 0 ? formatPrice(option.activation) : 'Sin Costo'), h("span", null, "Modem: ", formatPrice(option.modem)), h("span", null, "Instalaci\u00F3n: ", formatPrice(option.installation)))))))))), h("div", { key: '56a8e1df201c55a6686afed6678e04420d1f6000', class: "step-contract__actions" }, h("button", { key: '856440da906e26ccd05a915e4b3d45cf17f945d3', class: "step-contract__btn-continue", onClick: this.handleContinue, disabled: !this.selectedOption }, "Continuar")))));
    }
    static get style() { return stepContractCss(); }
}, [769, "step-contract", {
        "onNext": [16],
        "onBack": [16],
        "activeTab": [32],
        "selectedOption": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-contract"];
    components.forEach(tagName => { switch (tagName) {
        case "step-contract":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepContract);
            }
            break;
    } });
}
defineCustomElement();

export { StepContract as S, defineCustomElement as d };
//# sourceMappingURL=p-B657XdqM.js.map

//# sourceMappingURL=p-B657XdqM.js.map