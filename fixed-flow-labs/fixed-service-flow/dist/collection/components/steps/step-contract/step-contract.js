// ============================================
// STEP CONTRACT - Contract Type Selection
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../../store/flow.store";
import { CONTRACT_OPTIONS } from "../../../store/interfaces";
import { formatPrice } from "../../../utils/formatters";
export class StepContract {
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
        if (flowState.selectedContract) {
            this.selectedOption = flowState.selectedContract;
            this.activeTab = flowState.selectedContract.typeId;
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
    static get is() { return "step-contract"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-contract.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-contract.css"]
        };
    }
    static get properties() {
        return {
            "onNext": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "onBack": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            }
        };
    }
    static get states() {
        return {
            "activeTab": {},
            "selectedOption": {}
        };
    }
}
//# sourceMappingURL=step-contract.js.map
