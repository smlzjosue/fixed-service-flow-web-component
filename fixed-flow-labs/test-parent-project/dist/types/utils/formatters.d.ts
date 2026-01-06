/**
 * Formats a number as currency (USD)
 */
export declare const formatCurrency: (value: number, showDecimals?: boolean) => string;
/**
 * Formats a price for display (e.g., "$50.00")
 */
export declare const formatPrice: (price: number) => string;
/**
 * Formats a price without decimals (e.g., "$50")
 */
export declare const formatPriceShort: (price: number) => string;
/**
 * Formats a phone number as (XXX) XXX-XXXX
 */
export declare const formatPhone: (value: string) => string;
/**
 * Removes phone formatting to get raw digits
 */
export declare const unformatPhone: (value: string) => string;
/**
 * Formats a date as MM/DD/YYYY
 */
export declare const formatDate: (value: string | Date) => string;
/**
 * Formats a date as YYYY-MM-DD (for input fields)
 */
export declare const formatDateISO: (value: string | Date) => string;
/**
 * Formats a date in Spanish locale (e.g., "9 de diciembre de 2025")
 */
export declare const formatDateSpanish: (value: string | Date) => string;
/**
 * Formats a full address
 */
export declare const formatAddress: (street: string, city: string, zipCode: string, country?: string) => string;
/**
 * Formats a full name
 */
export declare const formatFullName: (firstName: string, secondName: string | undefined, lastName: string, secondLastName: string) => string;
/**
 * Capitalizes the first letter of each word
 */
export declare const capitalizeWords: (value: string) => string;
/**
 * Formats a number with thousand separators
 */
export declare const formatNumber: (value: number) => string;
/**
 * Formats bytes to human readable size
 */
export declare const formatBytes: (bytes: number, decimals?: number) => string;
/**
 * Formats contract duration
 */
export declare const formatContractDuration: (months: number) => string;
/**
 * Formats contract costs summary
 */
export declare const formatContractCosts: (installation: number, activation: number, modem: number) => string;
/**
 * Encodes a value to Base64
 */
export declare const encodeBase64: (value: string | number) => string;
/**
 * Decodes a Base64 value
 */
export declare const decodeBase64: (value: string) => string;
