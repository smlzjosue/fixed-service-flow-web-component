import { d as getRenderingRef, f as forceUpdate } from './index-CYQeQM-n.js';

const appendToMap = (map, propName, value) => {
    const items = map.get(propName);
    if (!items) {
        map.set(propName, [value]);
    }
    else if (!items.includes(value)) {
        items.push(value);
    }
};
const debounce = (fn, ms) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = 0;
            fn(...args);
        }, ms);
    };
};

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement) => !('isConnected' in maybeElement) || maybeElement.isConnected;
const cleanupElements = debounce((map) => {
    for (let key of map.keys()) {
        map.set(key, map.get(key).filter(isConnected));
    }
}, 2_000);
const stencilSubscription = () => {
    if (typeof getRenderingRef !== 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        return {};
    }
    const elmsToUpdate = new Map();
    return {
        dispose: () => elmsToUpdate.clear(),
        get: (propName) => {
            const elm = getRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        },
        set: (propName) => {
            const elements = elmsToUpdate.get(propName);
            if (elements) {
                elmsToUpdate.set(propName, elements.filter(forceUpdate));
            }
            cleanupElements(elmsToUpdate);
        },
        reset: () => {
            elmsToUpdate.forEach((elms) => elms.forEach(forceUpdate));
            cleanupElements(elmsToUpdate);
        },
    };
};

const unwrap = (val) => (typeof val === 'function' ? val() : val);
const createObservableMap = (defaultState, shouldUpdate = (a, b) => a !== b) => {
    const unwrappedState = unwrap(defaultState);
    let states = new Map(Object.entries(unwrappedState ?? {}));
    const handlers = {
        dispose: [],
        get: [],
        set: [],
        reset: [],
    };
    // Track onChange listeners to enable removeListener functionality
    const changeListeners = new Map();
    const reset = () => {
        // When resetting the state, the default state may be a function - unwrap it to invoke it.
        // otherwise, the state won't be properly reset
        states = new Map(Object.entries(unwrap(defaultState) ?? {}));
        handlers.reset.forEach((cb) => cb());
    };
    const dispose = () => {
        // Call first dispose as resetting the state would
        // cause less updates ;)
        handlers.dispose.forEach((cb) => cb());
        reset();
    };
    const get = (propName) => {
        handlers.get.forEach((cb) => cb(propName));
        return states.get(propName);
    };
    const set = (propName, value) => {
        const oldValue = states.get(propName);
        if (shouldUpdate(value, oldValue, propName)) {
            states.set(propName, value);
            handlers.set.forEach((cb) => cb(propName, value, oldValue));
        }
    };
    const state = (typeof Proxy === 'undefined'
        ? {}
        : new Proxy(unwrappedState, {
            get(_, propName) {
                return get(propName);
            },
            ownKeys(_) {
                return Array.from(states.keys());
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            has(_, propName) {
                return states.has(propName);
            },
            set(_, propName, value) {
                set(propName, value);
                return true;
            },
        }));
    const on = (eventName, callback) => {
        handlers[eventName].push(callback);
        return () => {
            removeFromArray(handlers[eventName], callback);
        };
    };
    const onChange = (propName, cb) => {
        const setHandler = (key, newValue) => {
            if (key === propName) {
                cb(newValue);
            }
        };
        const resetHandler = () => cb(unwrap(defaultState)[propName]);
        // Register the handlers
        const unSet = on('set', setHandler);
        const unReset = on('reset', resetHandler);
        // Track the relationship between the user callback and internal handlers
        changeListeners.set(cb, { setHandler, resetHandler, propName });
        return () => {
            unSet();
            unReset();
            changeListeners.delete(cb);
        };
    };
    const use = (...subscriptions) => {
        const unsubs = subscriptions.reduce((unsubs, subscription) => {
            if (subscription.set) {
                unsubs.push(on('set', subscription.set));
            }
            if (subscription.get) {
                unsubs.push(on('get', subscription.get));
            }
            if (subscription.reset) {
                unsubs.push(on('reset', subscription.reset));
            }
            if (subscription.dispose) {
                unsubs.push(on('dispose', subscription.dispose));
            }
            return unsubs;
        }, []);
        return () => unsubs.forEach((unsub) => unsub());
    };
    const forceUpdate = (key) => {
        const oldValue = states.get(key);
        handlers.set.forEach((cb) => cb(key, oldValue, oldValue));
    };
    const removeListener = (propName, listener) => {
        const listenerInfo = changeListeners.get(listener);
        if (listenerInfo && listenerInfo.propName === propName) {
            // Remove the specific handlers that were created for this listener
            removeFromArray(handlers.set, listenerInfo.setHandler);
            removeFromArray(handlers.reset, listenerInfo.resetHandler);
            changeListeners.delete(listener);
        }
    };
    return {
        state,
        get,
        set,
        on,
        onChange,
        use,
        dispose,
        reset,
        forceUpdate,
        removeListener,
    };
};
const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        array.length--;
    }
};

const createStore = (defaultState, shouldUpdate) => {
    const map = createObservableMap(defaultState, shouldUpdate);
    map.use(stencilSubscription());
    return map;
};

// ============================================
// FLOW STORE - Global State Management
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// INITIAL STATE
// ------------------------------------------
const initialState = {
    // Navigation
    currentStep: 1,
    // Authentication
    token: null,
    correlationId: null,
    // Step 1: Location
    location: null,
    // Step 2: Plans
    availablePlans: [],
    selectedPlan: null,
    // Step 3: Contract
    selectedContract: null,
    // Step 4: Form
    formData: null,
    // Step 5: Confirmation
    orderId: null,
    requestError: null,
    // UI State
    isLoading: false,
    error: null,
};
// ------------------------------------------
// CREATE STORE
// ------------------------------------------
const { state, onChange, reset} = createStore(initialState);
// ------------------------------------------
// STORE ACTIONS
// ------------------------------------------
const flowActions = {
    // Authentication
    setToken: (token, correlationId) => {
        state.token = token;
        state.correlationId = correlationId;
        // Persist to sessionStorage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('correlationId', correlationId);
    },
    getStoredToken: () => {
        return {
            token: sessionStorage.getItem('token'),
            correlationId: sessionStorage.getItem('correlationId'),
        };
    },
    hasToken: () => {
        return !!state.token || !!sessionStorage.getItem('token');
    },
    clearToken: () => {
        state.token = null;
        state.correlationId = null;
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('correlationId');
    },
    // Navigation
    setStep: (step) => {
        state.currentStep = step;
    },
    nextStep: () => {
        if (state.currentStep < 5) {
            state.currentStep = (state.currentStep + 1);
        }
    },
    prevStep: () => {
        if (state.currentStep > 1) {
            state.currentStep = (state.currentStep - 1);
        }
    },
    // Location (Step 1)
    setLocation: (location) => {
        state.location = location;
        // Persist to sessionStorage (Base64 encoded as per spec)
        sessionStorage.setItem('latitud', btoa(String(location.latitude)));
        sessionStorage.setItem('longitud', btoa(String(location.longitude)));
        sessionStorage.setItem('planCodeInternet', btoa(location.serviceType));
    },
    // Plans (Step 2)
    setAvailablePlans: (plans) => {
        state.availablePlans = plans;
    },
    selectPlan: (plan) => {
        state.selectedPlan = plan;
        // Persist to sessionStorage
        sessionStorage.setItem('planId', String(plan.planId));
        sessionStorage.setItem('planPrice', String(plan.decPrice));
        sessionStorage.setItem('plan', JSON.stringify(plan));
    },
    // Contract (Step 3)
    setContract: (contract) => {
        state.selectedContract = contract;
        // Persist to sessionStorage
        sessionStorage.setItem('typeContractId', String(contract.typeId));
        sessionStorage.setItem('contractInstallment', String(contract.deadlines));
        sessionStorage.setItem('contractInstallation', String(contract.installation));
        sessionStorage.setItem('contractActivation', String(contract.activation));
        sessionStorage.setItem('contractModen', String(contract.modem));
    },
    // Form (Step 4)
    setFormData: (formData) => {
        state.formData = formData;
    },
    // Confirmation (Step 5)
    setOrderResult: (orderId, error) => {
        state.orderId = orderId;
        state.requestError = error;
    },
    // UI State
    setLoading: (isLoading) => {
        state.isLoading = isLoading;
    },
    setError: (error) => {
        state.error = error;
    },
    clearError: () => {
        state.error = null;
    },
    // Reset
    resetFlow: () => {
        // Clear sessionStorage items
        const keysToRemove = [
            'planCodeInternet',
            'latitud',
            'longitud',
            'planId',
            'planPrice',
            'plan',
            'typeContractId',
            'contractInstallment',
            'contractInstallation',
            'contractActivation',
            'contractModen',
        ];
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        // Reset store to initial state
        reset();
    },
    // Get complete state for submission
    getSubmissionData: () => {
        return {
            location: state.location,
            plan: state.selectedPlan,
            contract: state.selectedContract,
            formData: state.formData,
        };
    },
};
// ------------------------------------------
// STORE WATCHERS (for debugging)
// ------------------------------------------
if (typeof window !== 'undefined' && window.__FSF_DEBUG__) {
    onChange('currentStep', (value) => {
        console.log('[FSF Store] Step changed:', value);
    });
    onChange('isLoading', (value) => {
        console.log('[FSF Store] Loading:', value);
    });
    onChange('error', (value) => {
        if (value) {
            console.error('[FSF Store] Error:', value);
        }
    });
}

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

export { flowActions as f, httpService as h, state as s, tokenService as t };
//# sourceMappingURL=token.service-B9M544XN.js.map

//# sourceMappingURL=token.service-B9M544XN.js.map