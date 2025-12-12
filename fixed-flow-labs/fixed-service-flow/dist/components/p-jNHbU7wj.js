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
const formatCurrency = (value, showDecimals = true) => {
    const options = {
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
const formatPrice = (price) => {
    return formatCurrency(price);
};
// ------------------------------------------
// PHONE FORMATTING
// ------------------------------------------
/**
 * Formats a phone number as (XXX) XXX-XXXX
 */
const formatPhone = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0)
        return '';
    if (digits.length <= 3)
        return `(${digits}`;
    if (digits.length <= 6)
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};
/**
 * Removes phone formatting to get raw digits
 */
const unformatPhone = (value) => {
    return value.replace(/\D/g, '').slice(0, 10);
};
// ------------------------------------------
// CONTRACT FORMATTING
// ------------------------------------------
/**
 * Formats contract duration
 */
const formatContractDuration = (months) => {
    if (months === 0)
        return 'Sin plazo fijo';
    if (months === 1)
        return '1 mes';
    if (months === 12)
        return '1 año';
    if (months === 24)
        return '2 años';
    return `${months} meses`;
};

export { formatPrice as a, formatPhone as b, formatContractDuration as f, unformatPhone as u };
//# sourceMappingURL=p-jNHbU7wj.js.map

//# sourceMappingURL=p-jNHbU7wj.js.map