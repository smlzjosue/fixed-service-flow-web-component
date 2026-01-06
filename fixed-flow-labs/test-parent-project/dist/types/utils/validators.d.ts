export interface ValidationResult {
    isValid: boolean;
    message: string;
}
export type ValidatorFn = (value: string) => ValidationResult;
export declare const VALIDATION_MESSAGES: {
    required: string;
    minLength: (min: number) => string;
    maxLength: (max: number) => string;
    email: string;
    phone: string;
    zipCode: string;
    date: string;
    futureDate: string;
    identification: string;
    numeric: string;
    alphanumeric: string;
};
/**
 * Creates a successful validation result
 */
export declare const valid: () => ValidationResult;
/**
 * Creates a failed validation result
 */
export declare const invalid: (message: string) => ValidationResult;
/**
 * Required field validator
 */
export declare const required: ValidatorFn;
/**
 * Minimum length validator
 */
export declare const minLength: (min: number) => ValidatorFn;
/**
 * Maximum length validator
 */
export declare const maxLength: (max: number) => ValidatorFn;
/**
 * Email validator
 */
export declare const email: ValidatorFn;
/**
 * Phone number validator (Puerto Rico format - 10 digits)
 */
export declare const phone: ValidatorFn;
/**
 * Zip code validator (5 digits)
 */
export declare const zipCode: ValidatorFn;
/**
 * Date validator (YYYY-MM-DD format)
 */
export declare const date: ValidatorFn;
/**
 * Future date validator
 */
export declare const futureDate: ValidatorFn;
/**
 * Identification validator (min 10 characters)
 */
export declare const identification: ValidatorFn;
/**
 * Numeric only validator
 */
export declare const numeric: ValidatorFn;
/**
 * Combines multiple validators
 */
export declare const compose: (...validators: ValidatorFn[]) => ValidatorFn;
export declare const fieldValidators: {
    firstName: ValidatorFn;
    lastName: ValidatorFn;
    secondLastName: ValidatorFn;
    identificationNumber: ValidatorFn;
    identificationExpiration: ValidatorFn;
    phone1: ValidatorFn;
    phone2: ValidatorFn;
    email: ValidatorFn;
    businessName: ValidatorFn;
    position: ValidatorFn;
    address: ValidatorFn;
    city: ValidatorFn;
    zipCode: ValidatorFn;
};
export interface FieldError {
    field: string;
    message: string;
}
/**
 * Validates a form object against field validators
 */
export declare const validateForm: (data: Record<string, string>, validators: Record<string, ValidatorFn>) => {
    isValid: boolean;
    errors: FieldError[];
};
