import { EventEmitter } from '../../stencil-public-runtime';
import { FlowCompleteEvent, FlowErrorEvent, StepChangeEvent, FlowStep } from '../../store/interfaces';
export declare class FixedServiceFlow {
    /**
     * Base URL for the API
     */
    apiUrl: string;
    /**
     * Google Maps API Key
     */
    googleMapsKey: string;
    /**
     * Optional correlation ID for tracking
     */
    correlationId?: string;
    /**
     * Initial step (default: 1)
     */
    initialStep?: FlowStep;
    /**
     * Debug mode
     */
    debug?: boolean;
    currentStep: FlowStep;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    /**
     * Emitted when the flow completes successfully
     */
    flowComplete: EventEmitter<FlowCompleteEvent>;
    /**
     * Emitted when an error occurs
     */
    flowError: EventEmitter<FlowErrorEvent>;
    /**
     * Emitted when user cancels the flow
     */
    flowCancel: EventEmitter<void>;
    /**
     * Emitted when step changes
     */
    stepChange: EventEmitter<StepChangeEvent>;
    handleApiUrlChange(newValue: string): void;
    componentWillLoad(): Promise<void>;
    componentDidLoad(): void;
    disconnectedCallback(): void;
    private initializeToken;
    private handleStepChange;
    private _goToStep;
    private handleFlowComplete;
    private handleFlowCancel;
    private emitError;
    private log;
    /**
     * Checks if the current flow is for CLARO HOGAR (wireless internet)
     */
    private isClaroHogar;
    private renderStep;
    /**
     * Renders steps for Standard Flow (GPON/VRAD)
     * Steps: 1.Location -> 2.Plans -> 3.Contract -> 4.Form -> 5.Confirmation
     */
    private renderStandardStep;
    /**
     * Renders steps for CLARO HOGAR Flow (e-commerce)
     * Steps: 1.Location -> 2.Catalogue -> 3.ProductDetail -> 4.Plans ->
     *        5.OrderSummary -> 6.Shipping -> 7.Payment -> 8.Confirmation
     */
    private renderClaroHogarStep;
    private renderLoading;
    private renderError;
    render(): any;
}
