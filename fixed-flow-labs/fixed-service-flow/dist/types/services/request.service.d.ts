import { RequestResponse, OrderDetailsResponse, ConfirmationResponse, ServiceRequestPayload, FormData as CustomerFormData, SelectedContract, Plan, LocationData } from '../store/interfaces';
declare class RequestService {
    /**
     * Submits the service request
     * Endpoint: POST api/Orders/internetServiceRequest
     */
    submitRequest(payload: ServiceRequestPayload): Promise<RequestResponse>;
    /**
     * Gets order details after successful submission
     * Endpoint: GET api/Orders/getOrder?orderId={orderId}
     * Source: TEL - frontend/src/app/internet/services/plans.service.ts
     */
    getOrder(orderId: string): Promise<OrderDetailsResponse>;
    /**
     * Sends confirmation email to customer
     * Endpoint: POST api/Orders/sendConfirmation
     * Source: TEL - frontend/src/app/internet/services/plans.service.ts
     */
    sendConfirmation(orderId: string, email: string): Promise<ConfirmationResponse>;
    /**
     * Builds the request payload from flow data
     */
    buildPayload(formData: CustomerFormData, contract: SelectedContract, plan: Plan, location: LocationData): ServiceRequestPayload;
    /**
     * Generates a unique flow ID for tracking
     */
    private generateFlowId;
    /**
     * Validates that all required data is present before submission
     */
    validateSubmissionData(formData: CustomerFormData | null, contract: SelectedContract | null, plan: Plan | null, location: LocationData | null): {
        isValid: boolean;
        missingFields: string[];
    };
}
export declare const requestService: RequestService;
export default requestService;
