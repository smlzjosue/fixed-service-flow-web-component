import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import { s as state, f as flowActions } from './p-1rCYjdXc.js';
import { C as CONTRACT_OPTIONS } from './p-Ci1a0P5z.js';
import { f as formatPrice } from './p-C5fd-Qsk.js';

const stepContractCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-contract{width:100%}.step-contract__header{display:flex;align-items:center;justify-content:space-between;padding-bottom:1rem;margin-bottom:1rem;position:relative}.step-contract__header::after{content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:100vw;height:1px;background:#E5E5E5}.step-contract__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-contract__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-contract__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-contract__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-contract__btn-back{height:40px}.step-contract__tabs{display:flex;margin-bottom:1.5rem;background:#FFFFFF;border-radius:0 0 0.75rem 0.75rem;box-shadow:0 2px 4px rgba(0, 0, 0, 0.08);overflow:hidden}.step-contract__tab{flex:1;padding:1.25rem 1rem;background:transparent;border:none;cursor:pointer;text-align:center;position:relative;transition:all 150ms ease}.step-contract__tab:first-child{border-right:1px solid #E5E5E5}.step-contract__tab::after{content:"";position:absolute;bottom:0;left:0;right:0;height:4px;background:transparent;transition:background-color 150ms ease}.step-contract__tab--active::after{background:#0097A9}.step-contract__tab:hover:not(.step-contract__tab--active){background:#FAFAFA}.step-contract__tab-title{display:block;font-size:1rem;font-weight:700;color:#333333;margin-bottom:0.25rem}.step-contract__tab-subtitle{display:block;font-size:0.875rem;color:#666666;line-height:1.5}.step-contract__options{display:flex;flex-direction:column;gap:1rem;align-items:center}@media (min-width: 768px){.step-contract__options{flex-direction:row;justify-content:center}}.step-contract__options--single{justify-content:center}.step-contract__option{flex:0 0 auto;width:280px;display:flex;align-items:center;padding:1rem 1.25rem;background:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;position:relative;overflow:hidden}@media (max-width: 767px){.step-contract__option{width:100%;max-width:320px}}.step-contract__option::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#CCCCCC;border-radius:0.75rem 0 0 0.75rem;transition:background-color 150ms ease}.step-contract__option input[type=radio]{width:20px;height:20px;margin-right:0.75rem;accent-color:#0097A9;flex-shrink:0}.step-contract__option:hover{border-color:#999999}.step-contract__option--selected::before{background:#0097A9}.step-contract__option-content{flex:1;display:flex;flex-direction:column;gap:0.25rem}.step-contract__option-title{display:block;font-size:1rem;font-weight:600;color:#333333;line-height:1.35}.step-contract__option-price{display:block;font-size:0.875rem;color:#666666}.step-contract__option-price strong,.step-contract__option-price b{font-weight:600}.step-contract__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-contract__btn-continue{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-continue:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-continue{height:48px;background-color:#DA291C;color:#FFFFFF}.step-contract__btn-continue:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-contract__btn-continue:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-contract__btn-continue{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-contract__btn-continue:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-contract__btn-continue:disabled:hover{background-color:#999999;border-color:#999999}.step-contract__btn-back-mobile{display:none;width:100%;margin-top:1rem;padding:0.5rem;background:transparent;border:none;color:#0097A9;font-size:1rem;cursor:pointer;text-decoration:none;text-align:center}.step-contract__btn-back-mobile:hover{text-decoration:underline}@media (max-width: 767px){.step-contract{padding:0 1rem}.step-contract__header{flex-direction:column;align-items:flex-start;gap:0.5rem;padding-bottom:0.75rem;margin-bottom:1rem}.step-contract__header .step-contract__title{font-size:1.25rem;line-height:1.35}.step-contract__header .step-contract__btn-back{order:-1;height:auto;padding:0.5rem 0;border:none;background:transparent;color:#0097A9;font-size:0.875rem}.step-contract__header .step-contract__btn-back:hover{background:transparent;text-decoration:underline}.step-contract__tabs{margin-bottom:1rem}.step-contract__tab{padding:0.75rem 0.5rem}.step-contract__tab-title{font-size:0.875rem}.step-contract__tab-subtitle{font-size:0.75rem;line-height:1.35}.step-contract__options{padding:0}.step-contract__option{width:100%;max-width:none}.step-contract__actions{margin-top:1rem;padding-top:1rem}.step-contract__btn-continue{width:100%;min-width:auto}.step-contract__btn-back-mobile{display:block}.step-contract__btn-back{display:none}}`;

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
    /**
     * Calcula el costo total de instalación (instalación + activación + modem)
     * Este es el valor que se muestra en la UI según el diseño de referencia
     */
    getTotalInstallationCost(option) {
        return option.installation + option.activation + option.modem;
    }
    /**
     * Formatea la duración del contrato para mostrar en la card
     * Ej: "12 Meses de Contrato", "24 Meses de Contrato", "Sin contrato"
     */
    formatContractLabel(months) {
        if (months === 0)
            return 'Sin contrato';
        return `${months} Meses de Contrato`;
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const withContract = CONTRACT_OPTIONS.find(c => c.typeId === 1);
        const withoutContract = CONTRACT_OPTIONS.find(c => c.typeId === 0);
        return (h(Host, { key: '73b98b5cf5d386bb18c0b9a87de1ee94f522ae06' }, h("div", { key: 'da718e5fa4e5e9bd81c9e8c36b3535678d49b205', class: "step-contract" }, h("header", { key: '40fda6a530e609dda8a9b20bdcbf64d765767491', class: "step-contract__header" }, h("h1", { key: '8c1ff3fd242f2a6cb27e01a987a6df0ef4199b00', class: "step-contract__title" }, "Selecciona un tipo de contrato"), h("button", { key: 'bf9aa661368be724e6b1521663289fbfa3b9d433', class: "step-contract__btn-back", onClick: this.onBack }, "Regresar")), h("div", { key: '7fef8469c756a814a1d233c00f090e545c487c96', class: "step-contract__tabs" }, h("button", { key: '949bd4bc3bbb1ccbaf5bf29e6fde2f49bbbf15a7', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
            }, onClick: () => this.handleTabChange(1) }, h("span", { key: '54a89fcfdb912495a4955c73cd62ac25fd71c69e', class: "step-contract__tab-title" }, "Con contrato"), h("span", { key: '1daa33b5cb332fc2feb94f80694405f560b6b1eb', class: "step-contract__tab-subtitle" }, "12 y 24 meses de contrato")), h("button", { key: 'f701fb3b4d46661df2e1ca2d0016926b4507e356', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
            }, onClick: () => this.handleTabChange(0) }, h("span", { key: '5ac2103a653ebf3cc0d64d29b351c5ebe27ff855', class: "step-contract__tab-title" }, "Sin contrato"), h("span", { key: '5f959ccb57f11053f15f68f2ce3fb23805a0188b', class: "step-contract__tab-subtitle" }, "Plan mensual con pago por adelantado"))), h("div", { key: 'c19ec6ec322d7547eb1afcbb860297ee4912d172', class: "step-contract__content" }, this.activeTab === 1 && withContract && (h("div", { key: 'fa0e33d74261a223ede9a349330420eb02b7afe9', class: "step-contract__options" }, withContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.deadlines === option.deadlines &&
                        this.selectedOption?.typeId === 1,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.deadlines === option.deadlines &&
                    this.selectedOption?.typeId === 1, onChange: () => this.handleSelectOption(1, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, this.formatContractLabel(option.deadlines)), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", totalCost > 0 ? formatPrice(totalCost) : '$0.00'))));
        }))), this.activeTab === 0 && withoutContract && (h("div", { key: '960c31f56eb79aee44ece402f81bce7aae7563fc', class: "step-contract__options step-contract__options--single" }, withoutContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.typeId === 0,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.typeId === 0, onChange: () => this.handleSelectOption(0, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, "Sin contrato"), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", formatPrice(totalCost)))));
        })))), h("div", { key: 'c4a7e733a3059a8240741de67386417fedc53dc6', class: "step-contract__actions" }, h("button", { key: '27ba1b393678129d75dd67bef3d08346e5d6a718', class: "step-contract__btn-continue", onClick: this.handleContinue, disabled: !this.selectedOption }, "Continuar"), h("button", { key: '629f3ae675dee5c469bc381123d6f42c805b54a9', type: "button", class: "step-contract__btn-back-mobile", onClick: this.onBack }, "Regresar")))));
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
//# sourceMappingURL=p-CTQsV_JX.js.map

//# sourceMappingURL=p-CTQsV_JX.js.map