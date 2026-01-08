import { Plan } from '../../../store/interfaces';
export declare class StepPlans {
    onNext: () => void;
    onBack: () => void;
    plans: Plan[];
    selectedPlan: Plan | null;
    isLoading: boolean;
    error: string | null;
    isAddingToCart: boolean;
    /**
     * Sync lifecycle - No async operations here
     * This allows the first render to happen immediately with isLoading = true
     * showing the loader to the user
     */
    componentWillLoad(): void;
    /**
     * Called after first render - Safe to do async operations
     * The loader is already visible at this point
     */
    componentDidLoad(): void;
    /**
     * Initialize plans data - async operations after component is mounted
     */
    private initializePlans;
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
    /**
     * Gets the service type label for display in header
     * Shows (GPON) or (VRAD) for standard flows
     */
    private getServiceTypeLabel;
    render(): any;
}
