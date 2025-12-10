// ============================================
// ENVIRONMENT - Environment Variables Helper
// Fixed Service Flow Web Component
// ============================================

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  apiBaseUrl: string;
  googleMapsApiKey: string;
  googleMapsMapId: string;
  debug: boolean;
}

/**
 * Default environment values
 * These can be overridden via component props
 */
export const defaultEnvironment: EnvironmentConfig = {
  apiBaseUrl: 'https://uat-tienda.claropr.com',
  googleMapsApiKey: '',
  googleMapsMapId: '8481b97098c495ab',
  debug: false,
};

/**
 * Get environment configuration
 * Priority: Component props > Environment variables > Defaults
 */
export function getEnvironment(overrides?: Partial<EnvironmentConfig>): EnvironmentConfig {
  return {
    ...defaultEnvironment,
    ...overrides,
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return !isDevelopment();
}
