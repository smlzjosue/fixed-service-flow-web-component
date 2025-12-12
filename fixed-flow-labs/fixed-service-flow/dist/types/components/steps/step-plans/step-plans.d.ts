import { Plan } from '../../../store/interfaces';
export declare class StepPlans {
    onNext: () => void;
    onBack: () => void;
    plans: Plan[];
    selectedPlan: Plan | null;
    isLoading: boolean;
    error: string | null;
    isAddingToCart: boolean;
    componentWillLoad(): Promise<void>;
    private loadPlans;
    /**
     * Handles plan selection - following TEL's flow:
     * 1. Check if there's an existing different plan -> delete it
     * 2. Store plan in session
     * 3. Call addToCart API
     */
    private handleSelectPlan;
    private handleContinue;
    private renderPlanCard;
    render(): any;
}
