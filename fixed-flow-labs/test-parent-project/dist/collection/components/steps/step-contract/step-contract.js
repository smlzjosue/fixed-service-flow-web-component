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
        return (h(Host, { key: '2f9c47b6c246b9276582b054d4acd5b5b93d120b' }, h("div", { key: '5b1aeb54cb7a37e15c577c024eac0f55c15304ad', class: "step-contract" }, h("header", { key: '8124ea48b7f4b7275506d5eb641fcdce708b6c53', class: "step-contract__header" }, h("button", { key: '138d75285752b27f2f9e662d39375ac9bc193050', class: "step-contract__back-link", onClick: this.onBack }, h("svg", { key: 'f28c0e80865b2a51790c673fa7942dd897cc2441', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '9e3dbb79939c6c0bc29d70eb1da75f17ab36abb4', points: "15 18 9 12 15 6" })), h("span", { key: 'cec0ed519992936daa1dcf6dcd61bf5da2954ccd' }, "Regresar")), h("h1", { key: '2d1c112d4c5e095717c75fab9bf1636220326aa2', class: "step-contract__title" }, "Selecciona un tipo de contrato"), h("div", { key: '15bfa6bca6b65dd8c594adeb91bd6d8e8bd24c26', class: "step-contract__divider" })), h("div", { key: 'b3a66f3ae45e8083dcbf5582d210860bbc8b4633', class: "step-contract__tabs" }, h("button", { key: '8d854b7de5b09a69114ca120df8b63ee207adb94', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
            }, onClick: () => this.handleTabChange(1) }, h("span", { key: '34a87eebe3a6ea8cbeb78e4a837678ac2ee95688', class: "step-contract__tab-title" }, "Con contrato"), h("span", { key: 'bcc3e9b40f4dab3e24ef58e4003dd7faceaf071f', class: "step-contract__tab-subtitle" }, "12 y 24 meses de contrato")), h("button", { key: '9864095499d6c08890a6c4515cf12c40a2967d2f', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
            }, onClick: () => this.handleTabChange(0) }, h("span", { key: '1a4c205a92d04fc91c94b23275be60b44928483e', class: "step-contract__tab-title" }, "Sin contrato"), h("span", { key: '8665ee734b582701bd7cf1ee2a9c4f1977c508c5', class: "step-contract__tab-subtitle" }, "Plan mensual con pago por adelantado"))), h("div", { key: 'ac54bf034d79f713ea0c41586925d68515e60b55', class: "step-contract__content" }, this.activeTab === 1 && withContract && (h("div", { key: '9ee6ddd69a8ff11ad53042d57038869f2e535319', class: "step-contract__options" }, withContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.deadlines === option.deadlines &&
                        this.selectedOption?.typeId === 1,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.deadlines === option.deadlines &&
                    this.selectedOption?.typeId === 1, onChange: () => this.handleSelectOption(1, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, this.formatContractLabel(option.deadlines)), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", totalCost > 0 ? formatPrice(totalCost) : '$0.00'))));
        }))), this.activeTab === 0 && withoutContract && (h("div", { key: '4ee8ead6d43fb11e43334d819f3a2472724d17ac', class: "step-contract__options step-contract__options--single" }, withoutContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.typeId === 0,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.typeId === 0, onChange: () => this.handleSelectOption(0, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, "Sin contrato"), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", formatPrice(totalCost)))));
        })))), h("div", { key: '1e67eac597810d31136d1ae7fbd373fa52fdeb52', class: "step-contract__actions" }, h("button", { key: '3a99d0c5e08de4e256b0e3827ddf79299199347e', class: "step-contract__btn-continue", onClick: this.handleContinue, disabled: !this.selectedOption }, "Continuar")))));
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
