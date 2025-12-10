// ============================================
// VALIDATORS - Form Validation Utilities
// Fixed Service Flow Web Component
// ============================================

// ------------------------------------------
// TYPES
// ------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export type ValidatorFn = (value: string) => ValidationResult;

// ------------------------------------------
// VALIDATION MESSAGES
// ------------------------------------------

export const VALIDATION_MESSAGES = {
  required: 'Este campo es requerido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  email: 'Ingrese un correo electrónico válido',
  phone: 'Ingrese un número de teléfono válido (10 dígitos)',
  zipCode: 'Ingrese un código postal válido (5 dígitos)',
  date: 'Ingrese una fecha válida',
  futureDate: 'La fecha debe ser futura',
  identification: 'La identificación debe tener al menos 10 caracteres',
  numeric: 'Solo se permiten números',
  alphanumeric: 'Solo se permiten letras y números',
};

// ------------------------------------------
// VALIDATION FUNCTIONS
// ------------------------------------------

/**
 * Creates a successful validation result
 */
export const valid = (): ValidationResult => ({
  isValid: true,
  message: '',
});

/**
 * Creates a failed validation result
 */
export const invalid = (message: string): ValidationResult => ({
  isValid: false,
  message,
});

/**
 * Required field validator
 */
export const required: ValidatorFn = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return invalid(VALIDATION_MESSAGES.required);
  }
  return valid();
};

/**
 * Minimum length validator
 */
export const minLength = (min: number): ValidatorFn => {
  return (value: string): ValidationResult => {
    if (value && value.length < min) {
      return invalid(VALIDATION_MESSAGES.minLength(min));
    }
    return valid();
  };
};

/**
 * Maximum length validator
 */
export const maxLength = (max: number): ValidatorFn => {
  return (value: string): ValidationResult => {
    if (value && value.length > max) {
      return invalid(VALIDATION_MESSAGES.maxLength(max));
    }
    return valid();
  };
};

/**
 * Email validator
 */
export const email: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return invalid(VALIDATION_MESSAGES.email);
  }
  return valid();
};

/**
 * Phone number validator (Puerto Rico format - 10 digits)
 */
export const phone: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  // Remove non-digit characters
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) {
    return invalid(VALIDATION_MESSAGES.phone);
  }
  return valid();
};

/**
 * Zip code validator (5 digits)
 */
export const zipCode: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(value)) {
    return invalid(VALIDATION_MESSAGES.zipCode);
  }
  return valid();
};

/**
 * Date validator (YYYY-MM-DD format)
 */
export const date: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return invalid(VALIDATION_MESSAGES.date);
  }

  const dateObj = new Date(value);
  if (isNaN(dateObj.getTime())) {
    return invalid(VALIDATION_MESSAGES.date);
  }

  return valid();
};

/**
 * Future date validator
 */
export const futureDate: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  const dateResult = date(value);
  if (!dateResult.isValid) return dateResult;

  const dateObj = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateObj <= today) {
    return invalid(VALIDATION_MESSAGES.futureDate);
  }

  return valid();
};

/**
 * Identification validator (min 10 characters)
 */
export const identification: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  if (value.length < 10) {
    return invalid(VALIDATION_MESSAGES.identification);
  }
  return valid();
};

/**
 * Numeric only validator
 */
export const numeric: ValidatorFn = (value: string): ValidationResult => {
  if (!value) return valid();

  const numericRegex = /^\d+$/;
  if (!numericRegex.test(value)) {
    return invalid(VALIDATION_MESSAGES.numeric);
  }
  return valid();
};

// ------------------------------------------
// COMPOSITE VALIDATORS
// ------------------------------------------

/**
 * Combines multiple validators
 */
export const compose = (...validators: ValidatorFn[]): ValidatorFn => {
  return (value: string): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        return result;
      }
    }
    return valid();
  };
};

// ------------------------------------------
// FIELD VALIDATORS (Pre-configured)
// ------------------------------------------

export const fieldValidators = {
  firstName: compose(required, minLength(3)),
  lastName: compose(required, minLength(3)),
  secondLastName: compose(required, minLength(3)),
  identificationNumber: compose(required, identification),
  identificationExpiration: compose(required, futureDate),
  phone1: compose(required, phone),
  phone2: phone, // Optional
  email: compose(required, email),
  businessName: required,
  position: required,
  address: required,
  city: required,
  zipCode: compose(required, zipCode),
};

// ------------------------------------------
// FORM VALIDATION
// ------------------------------------------

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validates a form object against field validators
 */
export const validateForm = (
  data: Record<string, string>,
  validators: Record<string, ValidatorFn>,
): { isValid: boolean; errors: FieldError[] } => {
  const errors: FieldError[] = [];

  for (const [field, validator] of Object.entries(validators)) {
    const value = data[field] || '';
    const result = validator(value);
    if (!result.isValid) {
      errors.push({ field, message: result.message });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
