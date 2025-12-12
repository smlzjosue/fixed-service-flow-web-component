// ============================================
// STEP CONTRACT - Contract Type Selection
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../../store/flow.store";
import { CONTRACT_OPTIONS } from "../../../store/interfaces";
import { formatPrice, formatContractDuration } from "../../../utils/formatters";
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
