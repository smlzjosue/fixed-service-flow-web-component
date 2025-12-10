// ============================================
// FORMATTERS - Data Formatting Utilities
// Fixed Service Flow Web Component
// ============================================

// ------------------------------------------
// CURRENCY FORMATTING
// ------------------------------------------

/**
 * Formats a number as currency (USD)
 */
export const formatCurrency = (value: number, showDecimals: boolean = true): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  };

  return new Intl.NumberFormat('en-US', options).format(value);
};

/**
 * Formats a price for display (e.g., "$50.00")
 */
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

/**
 * Formats a price without decimals (e.g., "$50")
 */
export const formatPriceShort = (price: number): string => {
  return formatCurrency(price, false);
};

// ------------------------------------------
// PHONE FORMATTING
// ------------------------------------------

/**
 * Formats a phone number as (XXX) XXX-XXXX
 */
export const formatPhone = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

/**
 * Removes phone formatting to get raw digits
 */
export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 10);
};

// ------------------------------------------
// DATE FORMATTING
// ------------------------------------------

/**
 * Formats a date as MM/DD/YYYY
 */
export const formatDate = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formats a date as YYYY-MM-DD (for input fields)
 */
export const formatDateISO = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;

  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Formats a date in Spanish locale (e.g., "9 de diciembre de 2025")
 */
export const formatDateSpanish = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-PR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// ------------------------------------------
// ADDRESS FORMATTING
// ------------------------------------------

/**
 * Formats a full address
 */
export const formatAddress = (
  street: string,
  city: string,
  zipCode: string,
  country: string = 'Puerto Rico',
): string => {
  const parts = [street, city, zipCode, country].filter(Boolean);
  return parts.join(', ');
};

// ------------------------------------------
// NAME FORMATTING
// ------------------------------------------

/**
 * Formats a full name
 */
export const formatFullName = (
  firstName: string,
  secondName: string | undefined,
  lastName: string,
  secondLastName: string,
): string => {
  const parts = [firstName, secondName, lastName, secondLastName].filter(Boolean);
  return parts.join(' ');
};

/**
 * Capitalizes the first letter of each word
 */
export const capitalizeWords = (value: string): string => {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ------------------------------------------
// NUMBER FORMATTING
// ------------------------------------------

/**
 * Formats a number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Formats bytes to human readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// ------------------------------------------
// CONTRACT FORMATTING
// ------------------------------------------

/**
 * Formats contract duration
 */
export const formatContractDuration = (months: number): string => {
  if (months === 0) return 'Sin plazo fijo';
  if (months === 1) return '1 mes';
  if (months === 12) return '1 año';
  if (months === 24) return '2 años';
  return `${months} meses`;
};

/**
 * Formats contract costs summary
 */
export const formatContractCosts = (
  installation: number,
  activation: number,
  modem: number,
): string => {
  const costs: string[] = [];

  if (installation > 0) costs.push(`Instalación: ${formatPrice(installation)}`);
  else costs.push('Instalación: Sin costo');

  if (activation > 0) costs.push(`Activación: ${formatPrice(activation)}`);
  else costs.push('Activación: Sin costo');

  if (modem > 0) costs.push(`Modem: ${formatPrice(modem)}`);
  else costs.push('Modem: Sin costo');

  return costs.join(' | ');
};

// ------------------------------------------
// ENCODING UTILITIES
// ------------------------------------------

/**
 * Encodes a value to Base64
 */
export const encodeBase64 = (value: string | number): string => {
  return btoa(String(value));
};

/**
 * Decodes a Base64 value
 */
export const decodeBase64 = (value: string): string => {
  try {
    return atob(value);
  } catch {
    return '';
  }
};
