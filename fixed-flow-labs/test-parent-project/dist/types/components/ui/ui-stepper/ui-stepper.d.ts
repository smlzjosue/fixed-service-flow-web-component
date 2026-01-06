export interface StepItem {
    label: string;
    completed?: boolean;
}
export declare class UiStepper {
    /**
     * Array of step items with labels
     */
    steps: StepItem[];
    /**
     * Current active step (1-indexed)
     */
    currentStep: number;
    /**
     * Size variant
     */
    size: 'sm' | 'md';
    private getStepStatus;
    render(): any;
}
