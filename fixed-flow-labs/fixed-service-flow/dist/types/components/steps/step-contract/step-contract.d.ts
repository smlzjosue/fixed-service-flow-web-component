import { SelectedContract, ContractTypeId } from '../../../store/interfaces';
export declare class StepContract {
    onNext: () => void;
    onBack: () => void;
    activeTab: ContractTypeId;
    selectedOption: SelectedContract | null;
    componentWillLoad(): void;
    /**
     * Restaura la selección previa desde el store o sessionStorage
     * Esto permite mantener la selección cuando el usuario navega hacia atrás
     */
    private restorePreviousSelection;
    private handleTabChange;
    private handleSelectOption;
    private handleContinue;
    /**
     * Calcula el costo total de instalación (instalación + activación + modem)
     * Este es el valor que se muestra en la UI según el diseño de referencia
     */
    private getTotalInstallationCost;
    /**
     * Formatea la duración del contrato para mostrar en la card
     * Ej: "12 Meses de Contrato", "24 Meses de Contrato", "Sin contrato"
     */
    private formatContractLabel;
    render(): any;
}
