// ============================================
// ENVIRONMENT - Environment Variables Helper
// Fixed Service Flow Web Component
// ============================================
/**
 * Default environment values
 * These can be overridden via component props
 */
export const defaultEnvironment = {
    apiBaseUrl: 'https://uat-tienda.claropr.com',
    googleMapsApiKey: '',
    googleMapsMapId: '8481b97098c495ab',
    debug: false,
};
/**
 * Get environment configuration
 * Priority: Component props > Environment variables > Defaults
 */
export function getEnvironment(overrides) {
    return {
        ...defaultEnvironment,
        ...overrides,
    };
}
/**
 * Check if running in development mode
 */
export function isDevelopment() {
    return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}
/**
 * Check if running in production mode
 */
export function isProduction() {
    return !isDevelopment();
}
//# sourceMappingURL=environment.js.map
