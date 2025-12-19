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

export { formatPhone as a, formatPrice as f, unformatPhone as u };
//# sourceMappingURL=p-C5fd-Qsk.js.map

//# sourceMappingURL=p-C5fd-Qsk.js.map