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
export declare const defaultEnvironment: EnvironmentConfig;
/**
 * Get environment configuration
 * Priority: Component props > Environment variables > Defaults
 */
export declare function getEnvironment(overrides?: Partial<EnvironmentConfig>): EnvironmentConfig;
/**
 * Check if running in development mode
 */
export declare function isDevelopment(): boolean;
/**
 * Check if running in production mode
 */
export declare function isProduction(): boolean;
