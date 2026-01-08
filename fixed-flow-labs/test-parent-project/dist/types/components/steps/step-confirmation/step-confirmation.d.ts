import { FlowCompleteEvent } from '../../../store/interfaces';
export declare class StepConfirmation {
    onComplete: (event: FlowCompleteEvent) => void;
    onCancel: () => void;
    onBack: () => void;
    status: 'loading' | 'success' | 'error';
    orderId: string | null;
    orderNumber: string | null;
    confirmationSent: boolean;
    errorMessage: string;
    /**
     * Sync lifecycle - No async operations here
     * This allows the first render to happen immediately with status = 'loading'
     * showing the loader to the user
     */
    componentWillLoad(): void;
    /**
     * Called after first render - Safe to do async operations
     * The loader is already visible at this point
     */
    componentDidLoad(): void;
    /**
     * Initialize confirmation - async operations after component is mounted
     */
    private initializeConfirmation;
    /**
     * Determines if this is a catalogue/equipment flow (CLARO HOGAR)
     * vs an internet service flow
     */
    private isCatalogueFlow;
    /**
     * Handles confirmation for catalogue/equipment flow (CLARO HOGAR)
     * The purchase is already complete after payment - just show success
     */
    private handleCatalogueFlowConfirmation;
    private submitRequest;
    /**
     * Fetches order details after successful submission
     * Non-blocking - errors are logged but don't affect UI
     */
    private fetchOrderDetails;
    /**
     * Sends confirmation email to customer
     * Non-blocking - errors are logged but don't affect UI
     */
    private sendConfirmationEmail;
    private handleRetry;
    private handleClose;
    /**
     * Clears all flow-related sessionStorage keys
     * Calls clear methods from all services and removes all known keys
     */
    private clearSessionStorage;
    private renderLoading;
    private renderSuccess;
    private renderError;
    render(): any;
}
