// ============================================
// TOKEN SERVICE - Authentication Token Management
// Fixed Service Flow Web Component
// ============================================
// CRITICAL: This service MUST be called before any other API calls
// The token is required for all API operations and also serves as the cart token
import { httpService } from "./http.service";
import { flowActions } from "../store/flow.store";
// ------------------------------------------
// TOKEN SERVICE CLASS
// ------------------------------------------
class TokenService {
    isInitializing = false;
    initPromise = null;
    // ------------------------------------------
    // GET TOKEN FROM API
    // ------------------------------------------
    /**
     * Fetches a new token from the API
     * Endpoint: POST api/Token/getToken
     * Request: { "agentName": "" }
     */
    async fetchToken() {
        const response = await httpService.post('api/Token/getToken', {
            agentName: '',
        });
        if (response.hasError) {
            throw new Error(response.message || 'Failed to obtain token');
        }
        return response;
    }
    // ------------------------------------------
    // INITIALIZE TOKEN
    // ------------------------------------------
    /**
     * Initializes the token - checks sessionStorage first, then fetches if needed
     * This method should be called at the start of the flow
     */
    async initialize() {
        // If already initializing, return the existing promise
        if (this.isInitializing && this.initPromise) {
            return this.initPromise;
        }
        this.isInitializing = true;
        this.initPromise = (async () => {
            try {
                // Check if token exists in sessionStorage
                const stored = flowActions.getStoredToken();
                if (stored.token && stored.correlationId) {
                    // Use existing token
                    flowActions.setToken(stored.token, stored.correlationId);
                    console.log('[TokenService] Using existing token from sessionStorage');
                    return true;
                }
                // Fetch new token
                console.log('[TokenService] Fetching new token...');
                const response = await this.fetchToken();
                // Store token
                flowActions.setToken(response.token, response.correlationId);
                console.log('[TokenService] Token obtained and stored successfully');
                return true;
            }
            catch (error) {
                console.error('[TokenService] Failed to initialize token:', error);
                flowActions.setError('Error al obtener el token de autenticación');
                return false;
            }
            finally {
                this.isInitializing = false;
            }
        })();
        return this.initPromise;
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Checks if a valid token exists
     */
    hasToken() {
        return flowActions.hasToken();
    }
    /**
     * Gets the current token
     */
    getToken() {
        const stored = flowActions.getStoredToken();
        return stored.token;
    }
    /**
     * Gets the current correlation ID
     */
    getCorrelationId() {
        const stored = flowActions.getStoredToken();
        return stored.correlationId;
    }
    /**
     * Clears the token (logout)
     */
    clearToken() {
        flowActions.clearToken();
        console.log('[TokenService] Token cleared');
    }
    /**
     * Forces a new token fetch (refresh)
     */
    async refreshToken() {
        this.clearToken();
        return this.initialize();
    }
    // ------------------------------------------
    // GUARD METHOD
    // ------------------------------------------
    /**
     * Ensures a token exists before proceeding
     * Use this as a guard before API calls
     */
    async ensureToken() {
        if (!this.hasToken()) {
            const success = await this.initialize();
            if (!success) {
                throw new Error('Failed to obtain authentication token');
            }
        }
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
export const tokenService = new TokenService();
export default tokenService;
//# sourceMappingURL=token.service.js.map
