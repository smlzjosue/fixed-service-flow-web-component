// ============================================
// HTTP SERVICE - Base HTTP Client
// Fixed Service Flow Web Component
// ============================================
import { flowState } from "../store/flow.store";
export class HttpError extends Error {
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
export class HttpService {
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
        const token = flowState.token || sessionStorage.getItem('token');
        const correlationId = flowState.correlationId || sessionStorage.getItem('correlationId');
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
export const httpService = new HttpService();
export default httpService;
//# sourceMappingURL=http.service.js.map
