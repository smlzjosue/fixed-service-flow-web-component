import { s as state, f as flowActions } from './p-1rCYjdXc.js';

// ============================================
// HTTP SERVICE - Base HTTP Client
// Fixed Service Flow Web Component
// ============================================
class HttpError extends Error {
    status;
    response;
    constructor(message, status, response) {
        super(message);
        this.status = status;
        this.response = response;
        this.name = 'HttpError';
    }
}
// ------------------------------------------
// HTTP SERVICE CLASS
// ------------------------------------------
class HttpService {
    baseUrl = '';
    defaultTimeout = 60000; // 60 seconds
    // ------------------------------------------
    // CONFIGURATION
    // ------------------------------------------
    setBaseUrl(url) {
        // Remove trailing slash
        this.baseUrl = url.replace(/\/$/, '');
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    setTimeout(timeout) {
        this.defaultTimeout = timeout;
    }
    // ------------------------------------------
    // HEADERS
    // ------------------------------------------
    getHeaders(customHeaders, isFormData) {
        const headers = new Headers();
        // Don't set Content-Type for FormData (browser sets it with boundary)
        if (!isFormData) {
            headers.set('Content-Type', 'application/json');
        }
        // Add authentication headers if token exists
        const token = state.token || sessionStorage.getItem('token');
        const correlationId = state.correlationId || sessionStorage.getItem('correlationId');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (correlationId) {
            headers.set('X-Correlation-ID', correlationId);
        }
        // Add app headers
        headers.set('App', 'shop');
        headers.set('Platform', 'web');
        // Add custom headers
        if (customHeaders) {
            Object.entries(customHeaders).forEach(([key, value]) => {
                headers.set(key, value);
            });
        }
        return headers;
    }
    // ------------------------------------------
    // REQUEST METHOD
    // ------------------------------------------
    async request(config) {
        const { method, endpoint, body, headers: customHeaders, timeout, isFormData } = config;
        // Ensure proper URL construction with slash between baseUrl and endpoint
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseUrl}${normalizedEndpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout || this.defaultTimeout);
        try {
            const fetchConfig = {
                method,
                headers: this.getHeaders(customHeaders, isFormData),
                signal: controller.signal,
            };
            // Add body for non-GET requests
            if (body && method !== 'GET') {
                if (isFormData && body instanceof FormData) {
                    fetchConfig.body = body;
                }
                else {
                    fetchConfig.body = JSON.stringify(body);
                }
            }
            const response = await fetch(url, fetchConfig);
            clearTimeout(timeoutId);
            // Parse response
            let data;
            const contentType = response.headers.get('content-type');
            // Get raw text first to handle all cases
            // (some servers like Claro's API return text/plain for JSON responses)
            const rawText = await response.text();
            // Try to parse as JSON regardless of content-type
            if (rawText && (rawText.startsWith('{') || rawText.startsWith('['))) {
                try {
                    data = JSON.parse(rawText);
                }
                catch {
                    // Not valid JSON, use as text
                    data = rawText;
                }
            }
            else if (contentType && contentType.includes('application/json')) {
                try {
                    data = JSON.parse(rawText);
                }
                catch {
                    data = rawText;
                }
            }
            else {
                data = rawText;
            }
            // Handle HTTP errors
            if (!response.ok) {
                throw new HttpError(`HTTP Error: ${response.status} ${response.statusText}`, response.status, data);
            }
            return {
                data,
                status: response.status,
                ok: response.ok,
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof HttpError) {
                throw error;
            }
            if (error.name === 'AbortError') {
                throw new HttpError('Request timeout', 408);
            }
            throw new HttpError(error.message || 'Network error', 0);
        }
    }
    // ------------------------------------------
    // CONVENIENCE METHODS
    // ------------------------------------------
    async get(endpoint, headers) {
        const response = await this.request({
            method: 'GET',
            endpoint,
            headers,
        });
        return response.data;
    }
    async post(endpoint, body, headers) {
        const response = await this.request({
            method: 'POST',
            endpoint,
            body,
            headers,
        });
        return response.data;
    }
    async postFormData(endpoint, formData, headers) {
        const response = await this.request({
            method: 'POST',
            endpoint,
            body: formData,
            headers,
            isFormData: true,
        });
        return response.data;
    }
    async put(endpoint, body, headers) {
        const response = await this.request({
            method: 'PUT',
            endpoint,
            body,
            headers,
        });
        return response.data;
    }
    async delete(endpoint, headers) {
        const response = await this.request({
            method: 'DELETE',
            endpoint,
            headers,
        });
        return response.data;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const httpService = new HttpService();

// ============================================
// TOKEN SERVICE - Authentication Token Management
// Fixed Service Flow Web Component
// ============================================
// CRITICAL: This service MUST be called before any other API calls
// The token is required for all API operations and also serves as the cart token
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
const tokenService = new TokenService();

export { httpService as h, tokenService as t };
//# sourceMappingURL=p-De3C6PL0.js.map

//# sourceMappingURL=p-De3C6PL0.js.map