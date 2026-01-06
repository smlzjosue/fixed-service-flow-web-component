export interface ShippingAddress {
    name: string;
    email: string;
    phone: string;
    phone2?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    notes?: string;
    authorizerName?: string;
    authorizerPhone?: string;
}
export interface ShippingCreateRequest {
    flowId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    phone2: string;
    address1: string;
    address2: string;
    city: string;
    zip: string;
    state: string;
    town: string;
    notes: string;
    chvAuthorizerName?: string;
    chvAuthorizerPhone?: string;
}
export interface ShippingCreateResponse {
    hasError: boolean;
    response?: number;
    message?: string;
    errorDesc?: string;
}
export interface DeliveryMethod {
    id: number;
    name: string;
    type: 'SHIPPING' | 'PICKUP';
    address?: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        zipCode: string;
        phoneNumber?: string;
        email?: string;
    };
}
export interface DeliveryMethodsResponse {
    hasError: boolean;
    deliveryMethods?: DeliveryMethod[];
    errorDesc?: string;
}
export interface ZipCodeEntry {
    label: string;
    value: string;
}
export declare class ShippingService {
    private http;
    constructor();
    /**
     * Create shipping address
     * TEL Pattern: userId comes from wBCUserID or defaults to '0' for new clients
     * flowId 6 = CLARO HOGAR flow
     */
    createAddress(address: ShippingAddress, flowId?: string): Promise<ShippingCreateResponse>;
    /**
     * Get available delivery methods
     */
    getDeliveryMethods(): Promise<DeliveryMethodsResponse>;
    getShipmentId(): number;
    setShipmentId(id: number): void;
    getZipCode(): string;
    setZipCode(zip: string): void;
    storeShippingAddress(address: ShippingAddress): void;
    getStoredShippingAddress(): ShippingAddress | null;
    storeDeliveryMethod(method: DeliveryMethod): void;
    getStoredDeliveryMethod(): DeliveryMethod | null;
    clearShippingData(): void;
    /**
     * Validate if zip code is valid for Puerto Rico
     * Returns the municipality name if valid, null if invalid
     */
    validateZipCode(zipCode: string): string | null;
    /**
     * Get municipality by zip code
     */
    getMunicipalityByZip(zipCode: string): string;
    /**
     * Get all valid zip codes
     */
    getAllZipCodes(): ZipCodeEntry[];
    /**
     * Validate address is physical (not PO Box)
     */
    isValidPhysicalAddress(address: string): boolean;
    /**
     * Validate email format
     */
    isValidEmail(email: string): boolean;
    /**
     * Validate phone format (10 digits)
     */
    isValidPhone(phone: string): boolean;
    /**
     * Clean phone number - remove formatting
     */
    cleanPhoneNumber(phone: string): string;
    /**
     * Format phone number for display (XXX) XXX-XXXX
     */
    formatPhoneNumber(phone: string): string;
}
export declare const shippingService: ShippingService;
