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
    render(): any;
}
