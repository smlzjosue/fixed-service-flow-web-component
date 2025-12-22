'use strict';

var index = require('./index-BAqxGv-h.js');

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
    if (typeof index.getRenderingRef !== 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        return {};
    }
    const elmsToUpdate = new Map();
    return {
        dispose: () => elmsToUpdate.clear(),
        get: (propName) => {
            const elm = index.getRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        },
        set: (propName) => {
            const elements = elmsToUpdate.get(propName);
            if (elements) {
                elmsToUpdate.set(propName, elements.filter(index.forceUpdate));
            }
            cleanupElements(elmsToUpdate);
        },
        reset: () => {
            elmsToUpdate.forEach((elms) => elms.forEach(index.forceUpdate));
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

// ============================================
// TYPESCRIPT INTERFACES
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// CONSTANTS
// ------------------------------------------
/**
 * Valor base del modem (usado en cálculos de Sin Contrato)
 * Fuente: TEL/frondend/src/app/shared/const/appConst.ts
 */
/**
 * Opciones de contrato para servicio de internet fijo
 *
 * CON CONTRATO:
 * - 12 meses: Instalación $80.00
 * - 24 meses: Instalación $0.00 (sin costo)
 *
 * SIN CONTRATO:
 * - Instalación $160.00
 */
const CONTRACT_OPTIONS = [
    {
        typeId: 1,
        type: 'Con Contrato',
        contract: [
            {
                contractId: 2,
                deadlines: 12,
                installation: 80,
                activation: 0,
                modem: 0,
            },
            {
                contractId: 3,
                deadlines: 24,
                installation: 0,
                activation: 0,
                modem: 0,
            },
        ],
    },
    {
        typeId: 0,
        type: 'Sin Contrato',
        contract: [
            {
                contractId: 1,
                deadlines: 0,
                installation: 160,
                activation: 0,
                modem: 0,
            },
        ],
    },
];
const SERVICE_MESSAGES = {
    NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
};

// ============================================
// COVERAGE SERVICE - Location Coverage Validation
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// COVERAGE SERVICE CLASS
// ------------------------------------------
class CoverageService {
    // ------------------------------------------
    // VALIDATE COVERAGE
    // ------------------------------------------
    /**
     * Validates coverage for a given location
     * Endpoint: POST api/Catalogue/getInternetPlans
     */
    async validateCoverage(latitude, longitude) {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        const response = await httpService.post('api/Catalogue/getInternetPlans', {
            latitud: String(latitude),
            longitud: String(longitude),
        });
        return response;
    }
    // ------------------------------------------
    // CHECK COVERAGE AND BUILD LOCATION DATA
    // ------------------------------------------
    /**
     * Checks coverage and returns structured location data
     */
    async checkCoverage(latitude, longitude, address, city, zipCode) {
        const response = await this.validateCoverage(latitude, longitude);
        // Check for errors
        if (response.hasError) {
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: '',
                serviceMessage: SERVICE_MESSAGES.NO_COVERAGE,
                isValid: false,
            };
        }
        // Get the priority service
        const serviceType = response.priorityService;
        // Find the service message
        let serviceMessage = SERVICE_MESSAGES.NO_COVERAGE;
        if (response.attributes && response.attributes.length > 0) {
            const priorityAttribute = response.attributes.find(attr => attr.servicE_NAME === serviceType);
            if (priorityAttribute) {
                serviceMessage = priorityAttribute.servicE_MESSAGE;
            }
        }
        // Validate that we have a valid service type
        const validServiceTypes = ['GPON', 'VRAD', 'CLARO HOGAR'];
        const isValid = validServiceTypes.includes(serviceType);
        if (!isValid) {
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: '',
                serviceMessage: SERVICE_MESSAGES.NO_COVERAGE,
                isValid: false,
            };
        }
        console.log('[CoverageService] Returning valid coverage');
        return {
            latitude,
            longitude,
            address,
            city,
            zipCode,
            serviceType,
            serviceMessage,
            isValid: true,
        };
    }
    // ------------------------------------------
    // GET SERVICE TYPE DISPLAY NAME
    // ------------------------------------------
    /**
     * Gets a user-friendly display name for the service type
     */
    getServiceDisplayName(serviceType) {
        const displayNames = {
            GPON: 'Fibra Óptica',
            VRAD: 'Internet DSL',
            'CLARO HOGAR': 'Internet Inalámbrico',
        };
        return displayNames[serviceType] || serviceType;
    }
    // ------------------------------------------
    // CHECK IF SERVICE TYPE REQUIRES SPECIAL HANDLING
    // ------------------------------------------
    /**
     * Checks if the service type is CLARO HOGAR (requires different flow)
     */
    isClaroHogar(serviceType) {
        return serviceType.toLowerCase() === 'claro hogar';
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const coverageService = new CoverageService();

// ============================================
// PLANS SERVICE - Internet Plans Management
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// PLANS SERVICE CLASS
// ------------------------------------------
class PlansService {
    // Track current plan in cart
    currentCartId = 0;
    // ------------------------------------------
    // GET PLANS
    // ------------------------------------------
    /**
     * Fetches available internet plans for a service type
     * Endpoint: POST api/Plans/getPlansInternet
     *
     * For CLARO HOGAR, the type should be "internet" (following TEL pattern)
     */
    async getPlans(serviceType, catalogId = 0) {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        // Map service type to API type parameter
        // TEL uses 'internet' for CLARO HOGAR products
        let apiType = serviceType;
        if (serviceType === 'CLARO HOGAR') {
            apiType = 'internet';
        }
        console.log('[PlansService] Fetching plans for type:', apiType, 'catalogId:', catalogId);
        const response = await httpService.post('api/Plans/getPlansInternet', {
            catalogID: catalogId,
            type: apiType,
        });
        console.log('[PlansService] Response:', response);
        if (response.hasError) {
            console.error('[PlansService] API error:', response.message);
            throw new Error(response.message || 'Failed to fetch plans');
        }
        console.log('[PlansService] Plans found:', response.planList?.length || 0);
        return response.planList || [];
    }
    // ------------------------------------------
    // ADD TO CART (Main method - like TEL's api/Card/addToCart)
    // ------------------------------------------
    /**
     * Adds a plan to the cart
     * This replicates TEL's Card.pushAddToCart + Card.addToCart flow
     * Endpoint: POST api/Card/addToCart
     */
    async addToCart(plan, parentCartId = 0, parentProductId = 0, installments = 0, creditClass = '') {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        const token = tokenService.getToken() || '';
        const price = this.getEffectivePrice(plan);
        // Build cart item following TEL's pushAddToCart structure
        const cartItem = {
            token: token,
            productId: plan.planId,
            notificationDetailID: 0,
            chvSource: '',
            promoCode: sessionStorage.getItem('discountCoupon') || '',
            installments: installments,
            decPrice: price,
            decDeposit: 0,
            decDownPayment: 0,
            decTotalPrice: price,
            Qty: 1,
            flowId: 1,
            ssoToken: '',
            userID: '0',
            parentProductId: parentProductId,
            parentCartId: parentCartId,
            creditClass: creditClass,
            downgradeAllowed: false,
            pendingAccelerated: 0,
            acceletartedAmount: 0,
            pastDueAmount: 0,
            delicuency: false,
        };
        // POST to api/Card/addToCart with cartItems as JSON string array
        const response = await httpService.post('api/Card/addToCart', {
            cartItems: JSON.stringify([cartItem]),
        });
        if (response.hasError) {
            throw new Error(response.message || 'Failed to add plan to cart');
        }
        // Store cart info for later operations
        if (response.code) {
            this.currentCartId = response.code;
        }
        // Also store in sessionStorage (TEL pattern)
        this.storePlanInSession(plan);
        return response;
    }
    // ------------------------------------------
    // ADD TO CART CURRENT PLAN (Keep existing plan)
    // ------------------------------------------
    /**
     * Keeps the current plan in cart (used when continuing with existing plan)
     * Endpoint: POST api/Plans/addToCartCurrentPlan
     */
    async addToCartCurrentPlan(productId, cartId) {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        const formData = new FormData();
        formData.append('productId', String(productId));
        formData.append('cartId', String(cartId));
        return await httpService.postFormData('api/Plans/addToCartCurrentPlan', formData);
    }
    // ------------------------------------------
    // DELETE PLAN FROM CART
    // ------------------------------------------
    /**
     * Removes a plan from the cart
     * Endpoint: POST api/Card/deleteItem
     */
    async deleteFromCart(cartId, productId = 0) {
        await tokenService.ensureToken();
        const response = await httpService.post('api/Card/deleteItem', {
            cartId: cartId,
            productId: productId,
        });
        if (!response.hasError) {
            // Clear local tracking if we deleted the current plan
            if (cartId === this.currentCartId) {
                this.currentCartId = 0;
            }
        }
        return response;
    }
    // ------------------------------------------
    // SESSION STORAGE (TEL Pattern)
    // ------------------------------------------
    /**
     * Stores plan data in sessionStorage following TEL's pattern
     */
    storePlanInSession(plan) {
        try {
            // Store full plan object
            sessionStorage.setItem('plan', JSON.stringify(plan));
            // Store plan ID
            sessionStorage.setItem('planId', String(plan.planId));
            // Store price
            const price = this.getEffectivePrice(plan);
            sessionStorage.setItem('planPrice', String(price));
            // Store plan code in Base64 (TEL pattern)
            sessionStorage.setItem('planCodeInternet', btoa(plan.planSoc || String(plan.planId)));
        }
        catch (e) {
            console.error('[PlansService] Error storing plan in session:', e);
        }
    }
    /**
     * Gets stored plan from sessionStorage
     */
    getStoredPlan() {
        try {
            const planData = sessionStorage.getItem('plan');
            return planData ? JSON.parse(planData) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Gets stored plan ID from sessionStorage
     */
    getStoredPlanId() {
        const planId = sessionStorage.getItem('planId');
        return planId ? parseInt(planId, 10) : 0;
    }
    /**
     * Gets current cart ID
     */
    getCartId() {
        return this.currentCartId;
    }
    /**
     * Sets current cart ID (from parent flow)
     */
    setCartId(cartId) {
        this.currentCartId = cartId;
    }
    /**
     * Clears plan from session and memory
     */
    clearPlan() {
        this.currentCartId = 0;
        sessionStorage.removeItem('plan');
        sessionStorage.removeItem('planId');
        sessionStorage.removeItem('planPrice');
        sessionStorage.removeItem('planCodeInternet');
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Formats price for display
     */
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    /**
     * Parses plan description HTML to extract features
     */
    parsePlanFeatures(description) {
        if (!description)
            return [];
        // Extract text from <li> tags
        const liRegex = /<li[^>]*>([^<]+)<\/li>/gi;
        const features = [];
        let match;
        while ((match = liRegex.exec(description)) !== null) {
            features.push(match[1].trim());
        }
        return features;
    }
    /**
     * Gets the discount percentage if there's a sale price
     */
    getDiscountPercentage(originalPrice, salePrice) {
        if (!salePrice || salePrice >= originalPrice)
            return 0;
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    /**
     * Checks if plan has a promotion
     */
    hasPromotion(plan) {
        return plan.bitPromotion || (plan.decSalePrice && plan.decSalePrice < plan.decPrice);
    }
    /**
     * Gets the effective price (sale price if available, otherwise regular price)
     */
    getEffectivePrice(plan) {
        if (plan.decSalePrice && plan.decSalePrice < plan.decPrice) {
            return plan.decSalePrice;
        }
        return plan.decPrice;
    }
    /**
     * Sorts plans by price (ascending)
     */
    sortByPrice(plans, ascending = true) {
        return [...plans].sort((a, b) => {
            const priceA = this.getEffectivePrice(a);
            const priceB = this.getEffectivePrice(b);
            return ascending ? priceA - priceB : priceB - priceA;
        });
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const plansService = new PlansService();

// ============================================
// REQUEST SERVICE - Service Request Submission
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// REQUEST SERVICE CLASS
// ------------------------------------------
class RequestService {
    // ------------------------------------------
    // SUBMIT REQUEST
    // ------------------------------------------
    /**
     * Submits the service request
     * Endpoint: POST api/Orders/internetServiceRequest
     */
    async submitRequest(payload) {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        // Build FormData
        const formData = new FormData();
        // Add all fields to FormData
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        const response = await httpService.postFormData('api/Orders/internetServiceRequest', formData);
        return response;
    }
    // ------------------------------------------
    // GET ORDER DETAILS
    // ------------------------------------------
    /**
     * Gets order details after successful submission
     * Endpoint: GET api/Orders/getOrder?orderId={orderId}
     * Source: TEL - frontend/src/app/internet/services/plans.service.ts
     */
    async getOrder(orderId) {
        await tokenService.ensureToken();
        const response = await httpService.get(`api/Orders/getOrder?orderId=${encodeURIComponent(orderId)}`);
        return response;
    }
    // ------------------------------------------
    // SEND CONFIRMATION EMAIL
    // ------------------------------------------
    /**
     * Sends confirmation email to customer
     * Endpoint: POST api/Orders/sendConfirmation
     * Source: TEL - frontend/src/app/internet/services/plans.service.ts
     */
    async sendConfirmation(orderId, email) {
        await tokenService.ensureToken();
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('email', email);
        const response = await httpService.postFormData('api/Orders/sendConfirmation', formData);
        return response;
    }
    // ------------------------------------------
    // BUILD PAYLOAD
    // ------------------------------------------
    /**
     * Builds the request payload from flow data
     */
    buildPayload(formData, contract, plan, location) {
        return {
            // Contract type
            type: contract.typeId,
            // Personal data
            name: formData.personal.firstName,
            second_name: formData.personal.secondName || '',
            last_name: formData.personal.lastName,
            second_surname: formData.personal.secondLastName,
            // date_birth: Campo requerido por el backend pero no recolectado en el formulario empresarial.
            // Se envía fecha por defecto. TODO: Discutir con backend si es necesario para flujo empresarial.
            date_birth: formData.personal.birthDate || '1990-01-01',
            email: formData.personal.email,
            telephone1: formData.personal.phone1,
            telephone2: formData.personal.phone2 || '',
            // Address
            zipCode: formData.address.zipCode,
            address: formData.address.address,
            city: formData.address.city,
            // Identification
            id_type: formData.personal.identificationType === 'license' ? '1' : '2',
            id: formData.personal.identificationNumber,
            identification_expiration: formData.personal.identificationExpiration,
            // Flow tracking
            frontFlowId: this.generateFlowId(),
            // Plan details
            plan_id: String(plan.planId),
            plan_name: plan.planName,
            // Contract details
            deadlines: String(contract.deadlines),
            installation: String(contract.installation),
            activation: String(contract.activation),
            moden: String(contract.modem),
            // Customer status - Backend espera booleano, no string
            claro_customer: formData.isExistingCustomer,
            // Location
            latitud: String(location.latitude),
            longitud: String(location.longitude),
            // Business data (optional)
            business_name: formData.business.businessName,
            business_position: formData.business.position,
        };
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Generates a unique flow ID for tracking
     */
    generateFlowId() {
        return `FSF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Validates that all required data is present before submission
     */
    validateSubmissionData(formData, contract, plan, location) {
        const missingFields = [];
        if (!location) {
            missingFields.push('location');
        }
        if (!plan) {
            missingFields.push('plan');
        }
        if (!contract) {
            missingFields.push('contract');
        }
        if (!formData) {
            missingFields.push('formData');
        }
        else {
            // Validate personal data
            if (!formData.personal.firstName)
                missingFields.push('firstName');
            if (!formData.personal.lastName)
                missingFields.push('lastName');
            if (!formData.personal.secondLastName)
                missingFields.push('secondLastName');
            if (!formData.personal.identificationNumber)
                missingFields.push('identificationNumber');
            if (!formData.personal.identificationExpiration)
                missingFields.push('identificationExpiration');
            if (!formData.personal.phone1)
                missingFields.push('phone1');
            if (!formData.personal.email)
                missingFields.push('email');
            // Validate business data
            if (!formData.business.businessName)
                missingFields.push('businessName');
            if (!formData.business.position)
                missingFields.push('position');
            // Validate address
            if (!formData.address.address)
                missingFields.push('address');
            if (!formData.address.city)
                missingFields.push('city');
            if (!formData.address.zipCode)
                missingFields.push('zipCode');
        }
        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const requestService = new RequestService();

// ============================================
// CONSTANTS - Application Constants
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// API ENDPOINTS
// ------------------------------------------
// ------------------------------------------
// GOOGLE MAPS
// ------------------------------------------
const GOOGLE_MAPS_CONFIG = {
    DEFAULT_CENTER: {
        lat: 18.333036,
        lng: -66.4161211,
    },
    DEFAULT_ZOOM: 17,
    MAP_ID: '8481b97098c495ab',
    DEFAULT_MAP_TYPE: 'satellite',
};
// ------------------------------------------
// ERROR MESSAGES
// ------------------------------------------
const ERROR_MESSAGES = {
    // Coverage
    NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
    COVERAGE_ERROR: 'Error al verificar la cobertura. Por favor, intenta de nuevo.',
    // Request
    REQUEST_ERROR: '¡Lo sentimos, ha ocurrido un error en el proceso de solicitud! En este momento estamos presentando inconvenientes en nuestro sistema. Por favor, inténtalo nuevamente.',
    // Geolocation
    GEOLOCATION_DENIED: 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.',
    GEOLOCATION_UNAVAILABLE: 'No se pudo obtener tu ubicación. Por favor, ingresa tu dirección manualmente.',
    GEOLOCATION_TIMEOUT: 'Tiempo de espera agotado al obtener tu ubicación.',
};
// ------------------------------------------
// SUCCESS MESSAGES
// ------------------------------------------
const SUCCESS_MESSAGES = {
    REQUEST_SUCCESS: '¡Tu solicitud fue enviada con éxito!',
    REQUEST_SUCCESS_SUBTITLE: 'Pronto nos comunicaremos contigo.',
};

// ============================================
// MAPS SERVICE - Google Maps Integration
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// MAPS SERVICE CLASS
// ------------------------------------------
class MapsService {
    apiKey = '';
    isLoaded = false;
    loadPromise = null;
    map = null;
    marker = null;
    autocomplete = null;
    infoWindow = null;
    // ------------------------------------------
    // INITIALIZATION
    // ------------------------------------------
    /**
     * Sets the Google Maps API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Loads the Google Maps JavaScript API
     */
    async loadGoogleMaps() {
        if (this.isLoaded) {
            return;
        }
        if (this.loadPromise) {
            return this.loadPromise;
        }
        if (!this.apiKey) {
            throw new Error('Google Maps API key is required');
        }
        this.loadPromise = new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.google?.maps) {
                this.isLoaded = true;
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,marker&v=weekly`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Google Maps API'));
            };
            document.head.appendChild(script);
        });
        return this.loadPromise;
    }
    /**
     * Checks if Google Maps is loaded
     */
    isGoogleMapsLoaded() {
        return this.isLoaded && !!window.google?.maps;
    }
    // ------------------------------------------
    // MAP MANAGEMENT
    // ------------------------------------------
    /**
     * Initializes the map in a container element
     */
    async initMap(container, options) {
        await this.loadGoogleMaps();
        const defaultOptions = {
            center: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER,
            zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
            mapTypeId: GOOGLE_MAPS_CONFIG.DEFAULT_MAP_TYPE,
            mapId: GOOGLE_MAPS_CONFIG.MAP_ID,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.LEFT_TOP,
                mapTypeIds: ['roadmap', 'satellite'],
            },
            streetViewControl: false,
            fullscreenControl: false,
        };
        this.map = new google.maps.Map(container, {
            ...defaultOptions,
            ...options,
        });
        return this.map;
    }
    /**
     * Gets the current map instance
     */
    getMap() {
        return this.map;
    }
    /**
     * Centers the map on given coordinates
     */
    centerMap(coordinates) {
        if (this.map) {
            this.map.setCenter(coordinates);
        }
    }
    /**
     * Sets the map zoom level
     */
    setZoom(zoom) {
        if (this.map) {
            this.map.setZoom(zoom);
        }
    }
    // ------------------------------------------
    // MARKER MANAGEMENT
    // ------------------------------------------
    /**
     * Adds or updates a marker on the map
     */
    async setMarker(coordinates) {
        if (!this.map) {
            throw new Error('Map not initialized');
        }
        // Remove existing marker
        if (this.marker) {
            this.marker.map = null;
        }
        // Create new advanced marker
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
        this.marker = new AdvancedMarkerElement({
            map: this.map,
            position: coordinates,
            gmpDraggable: true,
        });
        // Center map on marker
        this.map.setCenter(coordinates);
    }
    /**
     * Adds a click listener to the map (like TEL: this.map.addListener("click", ...))
     * When user clicks on map, it triggers geocoding at that location
     */
    addMapClickListener(onMapClick) {
        if (!this.map) {
            console.warn('Map not initialized');
            return;
        }
        this.map.addListener('click', (e) => {
            if (e.latLng) {
                const coordinates = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                onMapClick(coordinates);
            }
        });
    }
    /**
     * Clears the marker from the map (like TEL: clear() method)
     */
    clear() {
        this.removeMarker();
    }
    /**
     * Gets the current marker position
     */
    getMarkerPosition() {
        if (!this.marker?.position) {
            return null;
        }
        const position = this.marker.position;
        return {
            lat: position.lat,
            lng: position.lng,
        };
    }
    /**
     * Removes the marker from the map
     */
    removeMarker() {
        if (this.marker) {
            this.marker.map = null;
            this.marker = null;
        }
    }
    // ------------------------------------------
    // INFOWINDOW (like TEL pattern)
    // ------------------------------------------
    /**
     * Shows an InfoWindow at the marker position with custom HTML content
     * Like TEL: this.infowindow.open(this.map, this.marker)
     */
    showInfoWindow(content, onContinueClick) {
        if (!this.map || !this.marker) {
            console.warn('Map or marker not initialized');
            return;
        }
        // Close existing InfoWindow
        this.closeInfoWindow();
        // Override Google Maps InfoWindow styles - force wider width
        const popStyle = `<style>
      .gm-ui-hover-effect { display: none !important; }
      .gm-style .gm-style-iw-c { padding: 0px !important; width: 600px !important; max-width: none !important; }
      .gm-style .gm-style-iw-d { padding: 0px !important; overflow: unset !important; width: 100% !important; max-width: none !important; }
      .gm-style .gm-style-iw-tc { display: none !important; }
      .gm-style-iw { width: 600px !important; max-width: none !important; }
    </style>`;
        // Create InfoWindow with TEL config: maxWidth: 600
        this.infoWindow = new google.maps.InfoWindow({
            content: popStyle + content,
            maxWidth: 600,
        });
        // Open InfoWindow at marker position
        this.infoWindow.open({
            anchor: this.marker,
            map: this.map,
        });
        // Force wider InfoWindow after DOM is ready
        this.infoWindow.addListener('domready', () => {
            // Use setTimeout to ensure Google Maps has finished applying its styles
            setTimeout(() => {
                // Target the main InfoWindow container and set explicit width
                const iwc = document.querySelector('.gm-style-iw-c');
                const iwd = document.querySelector('.gm-style-iw-d');
                if (iwc) {
                    iwc.style.setProperty('width', '600px', 'important');
                    iwc.style.setProperty('max-width', 'none', 'important');
                    iwc.style.setProperty('padding', '0', 'important');
                }
                if (iwd) {
                    iwd.style.setProperty('width', '100%', 'important');
                    iwd.style.setProperty('max-width', 'none', 'important');
                    iwd.style.setProperty('overflow', 'visible', 'important');
                }
                // Also target the general container
                const gmiw = document.querySelector('.gm-style-iw');
                if (gmiw) {
                    gmiw.style.setProperty('width', '600px', 'important');
                    gmiw.style.setProperty('max-width', 'none', 'important');
                }
            }, 50);
        });
        // Store callback reference for external access
        if (onContinueClick) {
            // Use a global callback that can be accessed from the InfoWindow content
            window.__infoWindowContinueCallback = onContinueClick;
        }
    }
    /**
     * Closes the InfoWindow
     */
    closeInfoWindow() {
        if (this.infoWindow) {
            this.infoWindow.close();
            this.infoWindow = null;
        }
    }
    /**
     * Gets the current InfoWindow instance
     */
    getInfoWindow() {
        return this.infoWindow;
    }
    // ------------------------------------------
    // AUTOCOMPLETE
    // ------------------------------------------
    /**
     * Initializes address autocomplete on an input element
     */
    async initAutocomplete(inputElement, onPlaceSelected) {
        await this.loadGoogleMaps();
        // Restrict to Puerto Rico
        const options = {
            componentRestrictions: { country: 'pr' },
            fields: ['address_components', 'geometry', 'formatted_address'],
            types: ['address'],
        };
        this.autocomplete = new google.maps.places.Autocomplete(inputElement, options);
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete?.getPlace();
            if (!place?.geometry?.location) {
                return;
            }
            const result = this.parseAddressComponents(place);
            onPlaceSelected(result);
            // Update map and marker if map exists
            if (this.map) {
                this.centerMap(result.coordinates);
                this.setMarker(result.coordinates);
            }
        });
    }
    /**
     * Parses Google Places address components
     */
    parseAddressComponents(place) {
        const components = place.address_components || [];
        let streetNumber = '';
        let route = '';
        let city = '';
        let zipCode = '';
        for (const component of components) {
            const type = component.types[0];
            switch (type) {
                case 'street_number':
                    streetNumber = component.long_name;
                    break;
                case 'route':
                    route = component.long_name;
                    break;
                case 'locality':
                case 'administrative_area_level_2':
                    city = city || component.long_name;
                    break;
                case 'postal_code':
                    zipCode = component.long_name;
                    break;
            }
        }
        const address = [streetNumber, route].filter(Boolean).join(' ');
        const location = place.geometry?.location;
        return {
            address,
            city,
            zipCode,
            coordinates: {
                lat: location?.lat() || 0,
                lng: location?.lng() || 0,
            },
            formattedAddress: place.formatted_address || '',
        };
    }
    // ------------------------------------------
    // GEOCODING
    // ------------------------------------------
    /**
     * Geocodes an address to coordinates
     */
    async geocodeAddress(address) {
        await this.loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({
                address,
                componentRestrictions: { country: 'pr' },
            }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const place = results[0];
                    const result = this.parseGeocoderResult(place);
                    resolve(result);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
     * Reverse geocodes coordinates to an address
     */
    async reverseGeocode(coordinates) {
        await this.loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({ location: coordinates }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const place = results[0];
                    const result = this.parseGeocoderResult(place);
                    resolve(result);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
     * Parses geocoder result to GeocodeResult
     */
    parseGeocoderResult(result) {
        const components = result.address_components || [];
        let streetNumber = '';
        let route = '';
        let city = '';
        let zipCode = '';
        for (const component of components) {
            const type = component.types[0];
            switch (type) {
                case 'street_number':
                    streetNumber = component.long_name;
                    break;
                case 'route':
                    route = component.long_name;
                    break;
                case 'locality':
                case 'administrative_area_level_2':
                    city = city || component.long_name;
                    break;
                case 'postal_code':
                    zipCode = component.long_name;
                    break;
            }
        }
        const address = [streetNumber, route].filter(Boolean).join(' ');
        const location = result.geometry.location;
        return {
            address,
            city,
            zipCode,
            coordinates: {
                lat: location.lat(),
                lng: location.lng(),
            },
            formattedAddress: result.formatted_address,
        };
    }
    // ------------------------------------------
    // GEOLOCATION
    // ------------------------------------------
    /**
     * Gets the user's current location
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            }, (error) => {
                let message = 'Error getting location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                reject(new Error(message));
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });
    }
    /**
     * Gets current location and reverse geocodes it
     */
    async getCurrentLocationWithAddress() {
        const coordinates = await this.getCurrentLocation();
        return this.reverseGeocode(coordinates);
    }
    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------
    /**
     * Cleans up map resources
     */
    destroy() {
        this.closeInfoWindow();
        this.removeMarker();
        this.autocomplete = null;
        this.map = null;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const mapsService = new MapsService();

// ============================================
// CATALOGUE SERVICE - Product Catalogue for CLARO HOGAR
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// CATALOGUE SERVICE CLASS
// ------------------------------------------
class CatalogueService {
    // Catalog IDs (from TEL API structure)
    // catalogId 6 = Hogar (parent category)
    // Subcategory 39 = Internet + Telefonía
    // Subcategory 23 = Internet Inalámbrico
    HOGAR_CATALOGUE_ID = 6;
    DEFAULT_PAGE_ITEMS = 300;
    // Filter values for selecting subcategory (used in our component)
    // These are subcatalog IDs as strings for the filter component
    FILTER_INTERNET_TELEFONIA = '39'; // Subcatalog ID
    FILTER_INTERNET_INALAMBRICO = '23'; // Subcatalog ID
    // ------------------------------------------
    // LIST CATALOGUE
    // ------------------------------------------
    /**
     * Fetches product catalogue for CLARO HOGAR (wireless internet devices)
     * Endpoint: POST api/Catalogue/listCatalogue
     *
     * Response structure from API:
     * {
     *   hasError: false,
     *   catalogs: [
     *     { catalogId: 23, catalog: [{ catalogId: 1, products: [...] }, ...] }
     *   ]
     * }
     */
    async listCatalogue(subcatalogId = this.FILTER_INTERNET_INALAMBRICO, pageNo = 1, searchText = '', brand = '', price = '') {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        // Use parent catalog ID (Hogar = 6) and categoryID = "0" to get all subcategories
        const request = {
            catalogId: this.HOGAR_CATALOGUE_ID, // Use Hogar (6) as parent
            pageNo: pageNo,
            pageItems: this.DEFAULT_PAGE_ITEMS,
            creditClass: 'C',
            orderBy: 7,
            news: 0,
            offers: '0',
            categoryID: '0', // Get all subcategories
            brand: brand,
            filter: searchText,
            price: price,
            labels: [],
        };
        console.log('[CatalogueService] Request:', JSON.stringify(request));
        const apiResponse = await httpService.post('api/Catalogue/listCatalogue', request);
        console.log('[CatalogueService] API Response keys:', Object.keys(apiResponse || {}));
        if (apiResponse.hasError) {
            throw new Error(apiResponse.message || 'Failed to fetch catalogue');
        }
        // Parse products from the nested structure
        // First find Hogar catalog, then find the requested subcatalog
        const targetSubcatalogId = parseInt(subcatalogId, 10);
        const products = this.extractProductsFromSubcatalog(apiResponse, this.HOGAR_CATALOGUE_ID, targetSubcatalogId);
        console.log('[CatalogueService] Extracted products:', products.length);
        return {
            hasError: false,
            products: products,
            totalItems: products.length,
        };
    }
    /**
     * Extracts products from a specific subcatalog within the Hogar catalog
     * Structure: catalogs[] -> find Hogar (6) -> catalog[] -> find subcatalog (23 or 39) -> products
     */
    extractProductsFromSubcatalog(response, parentCatalogId, subcatalogId) {
        if (!response.catalogs || !Array.isArray(response.catalogs)) {
            console.log('[CatalogueService] No catalogs in response');
            return [];
        }
        // Find the parent catalog (Hogar = 6)
        const parentCatalog = response.catalogs.find(c => c.catalogId === parentCatalogId);
        if (!parentCatalog) {
            console.log('[CatalogueService] Parent catalog not found:', parentCatalogId);
            // Try to find subcatalog directly in catalogs array
            for (const catalog of response.catalogs) {
                if (catalog.catalog) {
                    const subcatalog = catalog.catalog.find(sc => sc.catalogId === subcatalogId);
                    if (subcatalog) {
                        console.log('[CatalogueService] Found subcatalog in:', catalog.catalogId);
                        return subcatalog.products || [];
                    }
                }
            }
            return [];
        }
        console.log('[CatalogueService] Found parent catalog:', parentCatalog.catalogId, parentCatalog.catalogName);
        // Find the subcatalog within the parent
        if (!parentCatalog.catalog || !Array.isArray(parentCatalog.catalog)) {
            console.log('[CatalogueService] No subcatalogs in parent');
            return parentCatalog.products || [];
        }
        const subcatalog = parentCatalog.catalog.find(sc => sc.catalogId === subcatalogId);
        if (!subcatalog) {
            console.log('[CatalogueService] Subcatalog not found:', subcatalogId);
            console.log('[CatalogueService] Available subcatalogs:', parentCatalog.catalog.map(sc => ({ id: sc.catalogId, name: sc.catalogName })));
            // Return first subcatalog's products as fallback
            return parentCatalog.catalog[0]?.products || [];
        }
        console.log('[CatalogueService] Found subcatalog:', subcatalog.catalogId, subcatalog.catalogName);
        return subcatalog.products || [];
    }
    /**
     * BFS search for catalog by ID (matches TEL's findCatalogById)
     * Reserved for future use with nested catalog navigation
     */
    // @ts-ignore: Reserved for future use
    _findCatalogById(catalogs, catalogId) {
        const queue = [...catalogs];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current.catalogId === catalogId) {
                return current;
            }
            if (current.catalog && current.catalog.length > 0) {
                queue.push(...current.catalog);
            }
        }
        return null;
    }
    // ------------------------------------------
    // GET FILTERS
    // ------------------------------------------
    /**
     * Returns the available product type filters
     */
    getProductTypeFilters() {
        return [
            {
                value: this.FILTER_INTERNET_TELEFONIA,
                label: 'Internet + Telefonía',
            },
            {
                value: this.FILTER_INTERNET_INALAMBRICO,
                label: 'Internet Inalámbrico',
            },
        ];
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Formats price for display (monthly installment)
     */
    formatInstallmentPrice(price) {
        return `$${price.toFixed(2)}/mes`;
    }
    /**
     * Formats regular price
     */
    formatRegularPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    /**
     * Calculates monthly installment from total price
     */
    calculateInstallment(totalPrice, installments) {
        if (installments <= 0)
            return totalPrice;
        return Number((totalPrice / installments).toFixed(2));
    }
    /**
     * Cleans HTML from product description
     */
    cleanDescription(html) {
        if (!html)
            return '';
        // Remove HTML tags
        return html.replace(/<[^>]*>/g, '').trim();
    }
    /**
     * Truncates text to max length with ellipsis
     */
    truncateText(text, maxLength = 80) {
        if (!text || text.length <= maxLength)
            return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    /**
     * Parses product colors from API response
     */
    parseColors(colors) {
        if (!colors || !Array.isArray(colors))
            return [];
        return colors.map(c => c.webColor).filter(Boolean);
    }
    /**
     * Stores selected product in sessionStorage
     */
    storeProductInSession(product) {
        try {
            sessionStorage.setItem('selectedProduct', JSON.stringify(product));
            sessionStorage.setItem('productId', String(product.productId));
        }
        catch (e) {
            console.error('[CatalogueService] Error storing product in session:', e);
        }
    }
    /**
     * Gets stored product from sessionStorage
     */
    getStoredProduct() {
        try {
            const data = sessionStorage.getItem('selectedProduct');
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Clears product from session
     */
    clearProduct() {
        sessionStorage.removeItem('selectedProduct');
        sessionStorage.removeItem('productId');
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const catalogueService = new CatalogueService();

// ============================================
// CART SERVICE - Shopping Cart for CLARO HOGAR
// Fixed Service Flow Web Component
// Based on TEL: card.service.ts
// ============================================
// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS$3 = {
    CART: 'cart',
    CART_ID: 'cartId',
    MAIN_ID: 'mainId',
    DISCOUNT_COUPON: 'discountCoupon',
    CART_TOTAL: 'cartTotal',
    CART_PRODUCTS: 'cartProducts',
};
// ------------------------------------------
// CONSTANTS
// ------------------------------------------
// Flow IDs (from TEL appConst.ts)
const FLOW_ID = {
    HOME: 6};
// Credit class
const DEFAULT_CREDIT_CLASS = 'C';
// ------------------------------------------
// CART SERVICE CLASS
// ------------------------------------------
class CartService {
    // ------------------------------------------
    // GET CART
    // ------------------------------------------
    /**
     * Retrieves the shopping cart contents
     * Endpoint: POST api/Card/getCart
     *
     * @param promoCode - Optional discount/promo code
     * @returns CartResponse with products and totals
     */
    async getCart(promoCode = '') {
        try {
            await tokenService.ensureToken();
            // Get promo code from session if not provided
            const appliedPromoCode = promoCode || this.getDiscountCoupon() || '';
            const request = {
                promoCode: appliedPromoCode,
            };
            console.log('[CartService] Getting cart with promo:', appliedPromoCode || 'none');
            const response = await httpService.post('api/Card/getCart', request);
            if (response.hasError) {
                console.error('[CartService] API error:', response.message);
                return {
                    hasError: true,
                    message: response.message || 'Error al obtener el carrito',
                    errorDisplay: response.errorDisplay,
                };
            }
            // Store cart data in session
            this.storeCartInSession(response);
            return response;
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                hasError: true,
                message: 'Error de conexión al obtener el carrito',
            };
        }
    }
    // ------------------------------------------
    // ADD TO CART
    // ------------------------------------------
    /**
     * Adds a product to the cart
     * Endpoint: POST api/Card/addToCart
     *
     * IMPORTANT: The backend expects `cartItems` as a JSON string array, not an object.
     * See TEL: card.service.ts pushAddToCart() and CardController.cs addToCart()
     *
     * @param product - Product to add
     * @param installments - Number of installments
     * @param quantity - Quantity to add (default 1)
     * @param parentCartId - Parent cart ID for accessories
     * @param parentProductId - Parent product ID for accessories
     * @returns AddToCartResponse with new cart ID
     */
    async addToCart(product, installments, quantity = 1, parentCartId, parentProductId) {
        try {
            await tokenService.ensureToken();
            const token = tokenService.getToken() || '';
            // Build cart item object (following TEL pushAddToCart format)
            const cartItem = {
                token: token,
                productId: String(product.productId),
                notificationDetailID: 0,
                chvSource: '',
                promoCode: '',
                installments: installments,
                decPrice: product.update_price || 0,
                decDeposit: 0,
                decDownPayment: product.decDownPayment || 0,
                decTotalPrice: product.regular_price || 0,
                Qty: quantity,
                flowId: FLOW_ID.HOME,
                ssoToken: '',
                userID: '0',
                parentProductId: parentProductId || 0,
                parentCartId: parentCartId || 0,
                creditClass: DEFAULT_CREDIT_CLASS,
                downgradeAllowed: false,
                pendingAccelerated: 0,
                acceletartedAmount: 0,
                pastDueAmount: 0,
                delicuency: false,
            };
            // Backend expects cartItems as a JSON STRING of array, not an object
            // See: CardController.cs line 52: "{\"cartItems\": " + data.cartItems + "}"
            const cartItemsString = JSON.stringify([cartItem]);
            const request = {
                cartItems: cartItemsString,
            };
            console.log('[CartService] Adding to cart:', product.productName);
            console.log('[CartService] Request payload:', request);
            const response = await httpService.post('api/Card/addToCart', request);
            if (response.hasError) {
                console.error('[CartService] Add to cart error:', response.message);
                return {
                    code: 0,
                    hasError: true,
                    message: response.message || 'Error al agregar al carrito',
                    errorDisplay: response.errorDisplay,
                };
            }
            // Store the mainId returned
            if (response.code) {
                this.storeMainId(response.code);
            }
            console.log('[CartService] Added to cart, mainId:', response.code);
            return response;
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                code: 0,
                hasError: true,
                message: 'Error de conexión al agregar al carrito',
            };
        }
    }
    /**
     * Adds a plan to the cart
     * Plans have special handling with parentCartId linking to the equipment
     *
     * IMPORTANT: Backend expects `cartItems` as a JSON string array
     */
    async addPlanToCart(plan, parentCartId, parentProductId) {
        try {
            await tokenService.ensureToken();
            const token = tokenService.getToken() || '';
            // Build cart item for plan (following TEL format)
            const cartItem = {
                token: token,
                productId: String(plan.planId),
                notificationDetailID: 0,
                chvSource: '',
                promoCode: '',
                installments: 1, // Plans are monthly
                decPrice: plan.decSalePrice || plan.decPrice,
                decDeposit: 0,
                decDownPayment: 0,
                decTotalPrice: plan.decPrice,
                Qty: 1,
                flowId: FLOW_ID.HOME,
                ssoToken: '',
                userID: '0',
                parentProductId: parentProductId,
                parentCartId: parentCartId,
                creditClass: DEFAULT_CREDIT_CLASS,
                downgradeAllowed: false,
                pendingAccelerated: 0,
                acceletartedAmount: 0,
                pastDueAmount: 0,
                delicuency: false,
            };
            // Backend expects cartItems as JSON string
            const cartItemsString = JSON.stringify([cartItem]);
            const request = {
                cartItems: cartItemsString,
            };
            console.log('[CartService] Adding plan to cart:', plan.planName);
            const response = await httpService.post('api/Card/addToCart', request);
            if (response.hasError) {
                console.error('[CartService] Add plan error:', response.message);
                return {
                    code: 0,
                    hasError: true,
                    message: response.message || 'Error al agregar el plan',
                    errorDisplay: response.errorDisplay,
                };
            }
            console.log('[CartService] Plan added to cart');
            return response;
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                code: 0,
                hasError: true,
                message: 'Error de conexión al agregar el plan',
            };
        }
    }
    // ------------------------------------------
    // DELETE FROM CART
    // ------------------------------------------
    /**
     * Removes an item from the cart
     * Endpoint: POST api/Card/deleteItem
     *
     * @param cartId - Cart item ID to remove
     * @param productId - Product ID to remove
     * @returns Success/error response
     */
    async deleteItem(cartId, productId) {
        try {
            await tokenService.ensureToken();
            const request = {
                cartId: cartId,
                productId: productId,
            };
            console.log('[CartService] Deleting item:', cartId, productId);
            const response = await httpService.post('api/Card/deleteItem', request);
            if (response.hasError) {
                console.error('[CartService] Delete error:', response.message);
                return {
                    hasError: true,
                    message: response.message || 'Error al eliminar del carrito',
                };
            }
            console.log('[CartService] Item deleted successfully');
            return { hasError: false };
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                hasError: true,
                message: 'Error de conexión al eliminar del carrito',
            };
        }
    }
    /**
     * Clears the entire cart
     * Deletes all items one by one
     */
    async clearCart() {
        try {
            const cart = await this.getCart();
            if (cart.hasError || !cart.products?.length) {
                return { hasError: false };
            }
            // Delete each item
            for (const item of cart.products) {
                const result = await this.deleteItem(item.cartId, item.productId);
                if (result.hasError) {
                    return result;
                }
            }
            // Clear session storage
            this.clearCartSession();
            return { hasError: false };
        }
        catch (error) {
            console.error('[CartService] Clear cart error:', error);
            return {
                hasError: true,
                message: 'Error al limpiar el carrito',
            };
        }
    }
    // ------------------------------------------
    // SESSION STORAGE METHODS
    // ------------------------------------------
    /**
     * Stores cart data in session for quick access
     */
    storeCartInSession(cart) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$3.CART, JSON.stringify(cart));
            if (cart.totalPrice !== undefined) {
                sessionStorage.setItem(STORAGE_KEYS$3.CART_TOTAL, String(cart.totalPrice));
            }
            if (cart.products) {
                sessionStorage.setItem(STORAGE_KEYS$3.CART_PRODUCTS, JSON.stringify(cart.products));
            }
        }
        catch (e) {
            console.error('[CartService] Error storing cart:', e);
        }
    }
    /**
     * Gets cached cart from session
     */
    getCachedCart() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS$3.CART);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores the mainId (primary cart item ID)
     */
    storeMainId(mainId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$3.MAIN_ID, String(mainId));
        }
        catch (e) {
            console.error('[CartService] Error storing mainId:', e);
        }
    }
    /**
     * Gets the stored mainId
     */
    getMainId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS$3.MAIN_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores discount/promo coupon code
     */
    storeDiscountCoupon(code) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$3.DISCOUNT_COUPON, code);
        }
        catch (e) {
            console.error('[CartService] Error storing coupon:', e);
        }
    }
    /**
     * Gets stored discount coupon
     */
    getDiscountCoupon() {
        try {
            return sessionStorage.getItem(STORAGE_KEYS$3.DISCOUNT_COUPON);
        }
        catch {
            return null;
        }
    }
    /**
     * Clears discount coupon
     */
    clearDiscountCoupon() {
        try {
            sessionStorage.removeItem(STORAGE_KEYS$3.DISCOUNT_COUPON);
        }
        catch (e) {
            console.error('[CartService] Error clearing coupon:', e);
        }
    }
    /**
     * Clears all cart session data
     */
    clearCartSession() {
        try {
            Object.values(STORAGE_KEYS$3).forEach(key => {
                sessionStorage.removeItem(key);
            });
            console.log('[CartService] Cleared cart session');
        }
        catch (e) {
            console.error('[CartService] Error clearing session:', e);
        }
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Calculates cart totals from items
     */
    calculateTotals(items) {
        let subtotal = 0;
        let monthlyPayment = 0;
        items.forEach(item => {
            subtotal += (item.decPrice || 0) * item.qty;
            monthlyPayment += (item.decTotalPerMonth || item.decPrice || 0) * item.qty;
        });
        // Puerto Rico tax rate (11.5%)
        const taxRate = 0.115;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        return {
            subtotal: Number(subtotal.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            total: Number(total.toFixed(2)),
            monthlyPayment: Number(monthlyPayment.toFixed(2)),
        };
    }
    /**
     * Gets equipment items from cart (excludes plans)
     */
    getEquipmentItems(items) {
        return items.filter(item => item.equipment === true || item.home === true);
    }
    /**
     * Gets plan items from cart
     */
    getPlanItems(items) {
        return items.filter(item => item.plan === true);
    }
    /**
     * Checks if cart has equipment
     */
    hasEquipment(items) {
        return items.some(item => item.equipment === true || item.home === true);
    }
    /**
     * Checks if cart has a plan
     */
    hasPlan(items) {
        return items.some(item => item.plan === true);
    }
    /**
     * Gets cart item count
     */
    getItemCount(items) {
        return items.reduce((count, item) => count + item.qty, 0);
    }
    /**
     * Formats price for display
     */
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const cartService = new CartService();

// ============================================
// PRODUCT SERVICE - Equipment Detail for CLARO HOGAR
// Fixed Service Flow Web Component
// Based on TEL: product.service.ts
// ============================================
// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS$2 = {
    SELECTED_PRODUCT: 'selectedProduct',
    PRODUCT_ID: 'productId',
    MAIN_ID: 'mainId',
    CHILDREN_ID: 'childrenId',
    PARENT_ID: 'parentId',
    DEVICE_TYPE: 'deviceType',
    SELECTED_COLOR: 'selectedColor',
    SELECTED_STORAGE: 'selectedStorage',
    SUBCATALOG_ID: 'subcatalogId', // For CLARO HOGAR plans API
};
// ------------------------------------------
// CONSTANTS (following TEL pattern)
// ------------------------------------------
// TEL uses entryBarrier = 1 to determine if product is in stock
const ENTRY_BARRIER = 1;
// ------------------------------------------
// PRODUCT SERVICE CLASS
// ------------------------------------------
class ProductService {
    // ------------------------------------------
    // TEL PATTERN: Extract stock and images from nested colors structure
    // ------------------------------------------
    /**
     * Extracts stock quantity and images from TEL's colors[].storages[].products[] structure
     * Following TEL product.service.ts indexCalculations() and searchStock() pattern
     *
     * @param colors - The colors array from API response
     * @returns Object with stock, images array, and childrenId
     */
    extractStockAndImagesFromColors(colors) {
        const images = [];
        let stock = undefined;
        let childrenId = undefined;
        let hasStock = false;
        if (!colors || colors.length === 0) {
            console.log('[ProductService] No colors array in response, stock will be undefined');
            return { stock, images, childrenId };
        }
        // TEL Pattern: First try to find default color and storage with stock
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            if (!color.storages || color.storages.length === 0)
                continue;
            for (let j = 0; j < color.storages.length; j++) {
                const storage = color.storages[j];
                if (!storage.products || storage.products.length === 0)
                    continue;
                const product = storage.products[0];
                // Check if this is the default color/storage with stock
                if (color.defaultColor && storage.defaultStorage) {
                    if (product.stock !== undefined && product.stock > ENTRY_BARRIER) {
                        stock = product.stock;
                        childrenId = product.productId;
                        hasStock = true;
                        // Extract images (TEL pattern: imgUrl, side_image, back_image)
                        if (product.imgUrl)
                            images.push(product.imgUrl);
                        if (product.side_image)
                            images.push(product.side_image);
                        if (product.back_image)
                            images.push(product.back_image);
                        console.log('[ProductService] Found default with stock:', stock, 'childrenId:', childrenId);
                        break;
                    }
                }
            }
            if (hasStock)
                break;
        }
        // If no default found with stock, search all colors/storages for any with stock
        if (!hasStock) {
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                if (!color.storages || color.storages.length === 0)
                    continue;
                for (let j = 0; j < color.storages.length; j++) {
                    const storage = color.storages[j];
                    if (!storage.products || storage.products.length === 0)
                        continue;
                    const product = storage.products[0];
                    if (product.stock !== undefined && product.stock > ENTRY_BARRIER) {
                        stock = product.stock;
                        childrenId = product.productId;
                        hasStock = true;
                        // Extract images
                        if (product.imgUrl)
                            images.push(product.imgUrl);
                        if (product.side_image)
                            images.push(product.side_image);
                        if (product.back_image)
                            images.push(product.back_image);
                        console.log('[ProductService] Found any with stock:', stock, 'childrenId:', childrenId);
                        break;
                    }
                }
                if (hasStock)
                    break;
            }
        }
        // If still no stock found, check first available product's stock (might be 0 or undefined)
        if (stock === undefined && colors.length > 0) {
            const firstColor = colors[0];
            if (firstColor.storages && firstColor.storages.length > 0) {
                const firstStorage = firstColor.storages[0];
                if (firstStorage.products && firstStorage.products.length > 0) {
                    const firstProduct = firstStorage.products[0];
                    stock = firstProduct.stock;
                    childrenId = firstProduct.productId;
                    // Still extract images even if no stock
                    if (firstProduct.imgUrl)
                        images.push(firstProduct.imgUrl);
                    if (firstProduct.side_image)
                        images.push(firstProduct.side_image);
                    if (firstProduct.back_image)
                        images.push(firstProduct.back_image);
                    console.log('[ProductService] Using first product stock:', stock, 'childrenId:', childrenId);
                }
            }
        }
        return { stock, images, childrenId };
    }
    // ------------------------------------------
    // GET EQUIPMENT DETAIL
    // ------------------------------------------
    /**
     * Fetches detailed product/equipment information
     * Endpoint: POST api/Catalogue/equipmentDetail
     *
     * @param productId - The product ID to fetch details for
     * @returns ProductDetailResponse with full product info
     */
    async getEquipmentDetail(productId) {
        try {
            // Ensure token exists
            await tokenService.ensureToken();
            const token = tokenService.getToken() || '';
            const request = {
                productId: productId,
                userID: 0, // Guest user
                token: token,
            };
            console.log('[ProductService] Fetching equipment detail:', productId);
            const response = await httpService.post('api/Catalogue/equipmentDetail', request);
            if (response.hasError) {
                console.error('[ProductService] API error:', response.message);
                return {
                    hasError: true,
                    message: response.message || 'Error al cargar el detalle del producto',
                    errorDisplay: response.errorDisplay,
                };
            }
            // TEL Pattern: Extract stock and images from colors[].storages[].products[] structure
            // This is the canonical way TEL retrieves product availability
            const { stock, images: nestedImages, childrenId } = this.extractStockAndImagesFromColors(response.colors);
            // Build images array: start with main image, then add detail image and images from colors structure
            const productImages = [];
            if (response.imgUrl)
                productImages.push(response.imgUrl);
            if (response.detailImage && response.detailImage !== response.imgUrl) {
                productImages.push(response.detailImage);
            }
            // Add images from nested structure (side_image, back_image from colors)
            nestedImages.forEach(img => {
                if (img && !productImages.includes(img)) {
                    productImages.push(img);
                }
            });
            // Add any additional images from response
            if (response.images?.length) {
                response.images.forEach(img => {
                    if (img && !productImages.includes(img)) {
                        productImages.push(img);
                    }
                });
            }
            // Determine final stock: use nested stock if available, otherwise fallback to root stock
            const finalStock = stock !== undefined ? stock : response.stock;
            const product = {
                productId: response.productId || productId,
                productName: response.productName || '',
                brandName: response.brandName,
                imgUrl: response.imgUrl || '',
                detailImage: response.detailImage,
                images: productImages.length > 0 ? productImages : undefined,
                shortDescription: response.shortDescription,
                longDescription: response.longDescription,
                regular_price: response.regular_price || 0,
                update_price: response.update_price || 0,
                installments: response.installments || 0,
                decDownPayment: response.decDownPayment,
                decDeposit: response.decDeposit,
                creditClass: response.creditClass,
                colors: response.colors, // API returns TEL structure, may differ from ProductColorDetail
                storages: response.storages,
                specifications: response.specifications,
                features: response.features,
                catalogId: response.catalogId,
                home: response.home,
                stock: finalStock,
            };
            console.log('[ProductService] Product stock from nested structure:', stock, 'root:', response.stock, 'final:', finalStock);
            // Store childrenId if found from nested structure
            if (childrenId) {
                this.storeChildrenId(childrenId);
                console.log('[ProductService] Stored childrenId from colors:', childrenId);
            }
            // Store product ID in session
            this.storeMainId(productId);
            return {
                hasError: false,
                product: product,
            };
        }
        catch (error) {
            console.error('[ProductService] Exception:', error);
            return {
                hasError: true,
                message: 'Error de conexión al cargar el detalle del producto',
            };
        }
    }
    // ------------------------------------------
    // SESSION STORAGE METHODS
    // ------------------------------------------
    /**
     * Stores the main product ID (mainId) in sessionStorage
     * Used for cart operations and tracking
     */
    storeMainId(productId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$2.MAIN_ID, String(productId));
            console.log('[ProductService] Stored mainId:', productId);
        }
        catch (e) {
            console.error('[ProductService] Error storing mainId:', e);
        }
    }
    /**
     * Gets the stored main product ID
     */
    getMainId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS$2.MAIN_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores selected product from catalogue in session
     * @param product - Product to store
     * @param subcatalogId - Optional subcatalog ID for CLARO HOGAR plans API
     */
    storeSelectedProduct(product, subcatalogId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$2.SELECTED_PRODUCT, JSON.stringify(product));
            sessionStorage.setItem(STORAGE_KEYS$2.PRODUCT_ID, String(product.productId));
            if (subcatalogId) {
                sessionStorage.setItem(STORAGE_KEYS$2.SUBCATALOG_ID, String(subcatalogId));
                console.log('[ProductService] Stored subcatalogId:', subcatalogId);
            }
            console.log('[ProductService] Stored selected product:', product.productName);
        }
        catch (e) {
            console.error('[ProductService] Error storing product:', e);
        }
    }
    /**
     * Stores the subcatalog ID for CLARO HOGAR plans API
     */
    storeSubcatalogId(subcatalogId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$2.SUBCATALOG_ID, String(subcatalogId));
            console.log('[ProductService] Stored subcatalogId:', subcatalogId);
        }
        catch (e) {
            console.error('[ProductService] Error storing subcatalogId:', e);
        }
    }
    /**
     * Gets the stored subcatalog ID
     */
    getSubcatalogId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS$2.SUBCATALOG_ID);
            return value ? parseInt(value, 10) : 0;
        }
        catch {
            return 0;
        }
    }
    /**
     * Gets the stored selected product
     */
    getSelectedProduct() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS$2.SELECTED_PRODUCT);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Gets the stored product ID
     */
    getProductId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS$2.PRODUCT_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores selected color for the product
     */
    storeSelectedColor(colorId, colorName, webColor) {
        try {
            const colorData = { colorId, colorName, webColor };
            sessionStorage.setItem(STORAGE_KEYS$2.SELECTED_COLOR, JSON.stringify(colorData));
        }
        catch (e) {
            console.error('[ProductService] Error storing color:', e);
        }
    }
    /**
     * Gets the stored selected color
     */
    getSelectedColor() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS$2.SELECTED_COLOR);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores selected storage option
     */
    storeSelectedStorage(storageId, storageName) {
        try {
            const storageData = { storageId, storageName };
            sessionStorage.setItem(STORAGE_KEYS$2.SELECTED_STORAGE, JSON.stringify(storageData));
        }
        catch (e) {
            console.error('[ProductService] Error storing storage:', e);
        }
    }
    /**
     * Gets the stored selected storage
     */
    getSelectedStorage() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS$2.SELECTED_STORAGE);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores children product ID (for variants)
     */
    storeChildrenId(childrenId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$2.CHILDREN_ID, String(childrenId));
        }
        catch (e) {
            console.error('[ProductService] Error storing childrenId:', e);
        }
    }
    /**
     * Gets stored children product ID
     */
    getChildrenId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS$2.CHILDREN_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores parent product ID
     */
    storeParentId(parentId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$2.PARENT_ID, String(parentId));
        }
        catch (e) {
            console.error('[ProductService] Error storing parentId:', e);
        }
    }
    /**
     * Gets stored parent product ID
     */
    getParentId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS$2.PARENT_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores device type
     */
    storeDeviceType(deviceType) {
        try {
            sessionStorage.setItem(STORAGE_KEYS$2.DEVICE_TYPE, deviceType);
        }
        catch (e) {
            console.error('[ProductService] Error storing deviceType:', e);
        }
    }
    /**
     * Gets stored device type
     */
    getDeviceType() {
        try {
            return sessionStorage.getItem(STORAGE_KEYS$2.DEVICE_TYPE);
        }
        catch {
            return null;
        }
    }
    /**
     * Clears all product-related session data
     */
    clearProductSession() {
        try {
            Object.values(STORAGE_KEYS$2).forEach(key => {
                sessionStorage.removeItem(key);
            });
            console.log('[ProductService] Cleared product session');
        }
        catch (e) {
            console.error('[ProductService] Error clearing session:', e);
        }
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Formats price for display
     */
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    /**
     * Formats monthly installment price
     */
    formatInstallmentPrice(price) {
        return `$${price.toFixed(2)}/mes`;
    }
    /**
     * Calculates monthly installment
     */
    calculateInstallment(totalPrice, installments) {
        if (installments <= 0)
            return totalPrice;
        return Number((totalPrice / installments).toFixed(2));
    }
    /**
     * Cleans HTML from description
     */
    cleanDescription(html) {
        if (!html)
            return '';
        return html.replace(/<[^>]*>/g, '').trim();
    }
    /**
     * Checks if product is a CLARO HOGAR product
     */
    isHomeProduct(product) {
        return product.home === true ||
            product.catalogId === 6;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const productService = new ProductService();

// ============================================
// STORAGE UTILS - SessionStorage Utilities
// Fixed Service Flow Web Component
// ============================================
/**
 * Storage utilities for sessionStorage with Base64 encoding
 * Following TEL pattern for session data persistence
 */
const storageUtils = {
    /**
     * Get value from sessionStorage
     */
    get(key) {
        try {
            const value = sessionStorage.getItem(key);
            return value;
        }
        catch {
            return null;
        }
    },
    /**
     * Set value in sessionStorage
     */
    set(key, value) {
        try {
            sessionStorage.setItem(key, value);
        }
        catch (e) {
            console.error('[StorageUtils] Error setting value:', e);
        }
    },
    /**
     * Get JSON value from sessionStorage
     */
    getJSON(key) {
        try {
            const value = sessionStorage.getItem(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    },
    /**
     * Set JSON value in sessionStorage
     */
    setJSON(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.error('[StorageUtils] Error setting JSON value:', e);
        }
    },
    /**
     * Remove value from sessionStorage
     */
    remove(key) {
        try {
            sessionStorage.removeItem(key);
        }
        catch (e) {
            console.error('[StorageUtils] Error removing value:', e);
        }
    },
    /**
     * Clear all sessionStorage
     */
    clear() {
        try {
            sessionStorage.clear();
        }
        catch (e) {
            console.error('[StorageUtils] Error clearing storage:', e);
        }
    },
    /**
     * Get value with Base64 decoding (TEL pattern)
     */
    getEncoded(key) {
        try {
            const value = sessionStorage.getItem(key);
            if (!value)
                return null;
            return atob(value);
        }
        catch {
            return null;
        }
    },
    /**
     * Set value with Base64 encoding (TEL pattern)
     */
    setEncoded(key, value) {
        try {
            sessionStorage.setItem(key, btoa(value));
        }
        catch (e) {
            console.error('[StorageUtils] Error setting encoded value:', e);
        }
    },
    /**
     * Get JSON value with Base64 decoding (TEL pattern)
     */
    getEncodedJSON(key) {
        try {
            const value = sessionStorage.getItem(key);
            if (!value)
                return null;
            const decoded = atob(value);
            return JSON.parse(decoded);
        }
        catch {
            return null;
        }
    },
    /**
     * Set JSON value with Base64 encoding (TEL pattern)
     */
    setEncodedJSON(key, value) {
        try {
            const json = JSON.stringify(value);
            sessionStorage.setItem(key, btoa(json));
        }
        catch (e) {
            console.error('[StorageUtils] Error setting encoded JSON value:', e);
        }
    },
};

// ============================================
// SHIPPING SERVICE - Address & Delivery Management
// Fixed Service Flow Web Component
// Based on TEL ShipmentService
// ============================================
// ------------------------------------------
// ZIP CODE DATA (Puerto Rico)
// ------------------------------------------
const PR_ZIP_CODES = [
    { label: 'Adjuntas', value: '00601' },
    { label: 'Adjuntas', value: '00631' },
    { label: 'Aguada', value: '00602' },
    { label: 'Aguadilla', value: '00603' },
    { label: 'Aguadilla', value: '00604' },
    { label: 'Aguadilla', value: '00605' },
    { label: 'Aguadilla', value: '00690' },
    { label: 'Aguas Buenas', value: '00703' },
    { label: 'Aibonito', value: '00705' },
    { label: 'La Plata', value: '00786' },
    { label: 'Añasco', value: '00610' },
    { label: 'Angeles', value: '00611' },
    { label: 'Arecibo', value: '00612' },
    { label: 'Arecibo', value: '00613' },
    { label: 'Arecibo', value: '00614' },
    { label: 'Arecibo', value: '00616' },
    { label: 'Arecibo', value: '00652' },
    { label: 'Arecibo', value: '00688' },
    { label: 'Arroyo', value: '00714' },
    { label: 'Barceloneta', value: '00617' },
    { label: 'Barranquitas', value: '00794' },
    { label: 'Bayamón', value: '00956' },
    { label: 'Bayamón', value: '00957' },
    { label: 'Bayamón', value: '00959' },
    { label: 'Bayamón', value: '00961' },
    { label: 'Bayamón', value: '00958' },
    { label: 'Cabo Rojo', value: '00623' },
    { label: 'Boquerón', value: '00622' },
    { label: 'Caguas', value: '00725' },
    { label: 'Caguas', value: '00727' },
    { label: 'Caguas', value: '00726' },
    { label: 'Camuy', value: '00627' },
    { label: 'Canóvanas', value: '00729' },
    { label: 'Canóvanas', value: '00745' },
    { label: 'Carolina', value: '00979' },
    { label: 'Carolina', value: '00982' },
    { label: 'Carolina', value: '00983' },
    { label: 'Carolina', value: '00985' },
    { label: 'Carolina', value: '00987' },
    { label: 'Carolina', value: '00981' },
    { label: 'Carolina', value: '00984' },
    { label: 'Carolina', value: '00986' },
    { label: 'Carolina', value: '00988' },
    { label: 'Cataño', value: '00962' },
    { label: 'Cataño', value: '00963' },
    { label: 'Cayey', value: '00736' },
    { label: 'Cayey', value: '00737' },
    { label: 'Ceiba', value: '00735' },
    { label: 'Ceiba', value: '00742' },
    { label: 'Ciales', value: '00638' },
    { label: 'Cidra', value: '00739' },
    { label: 'Coamo', value: '00769' },
    { label: 'Comerio', value: '00782' },
    { label: 'Corozal', value: '00783' },
    { label: 'Culebra', value: '00775' },
    { label: 'Dorado', value: '00646' },
    { label: 'Fajardo', value: '00738' },
    { label: 'Fajardo', value: '00740' },
    { label: 'Florida', value: '00650' },
    { label: 'Guánica', value: '00653' },
    { label: 'Guánica', value: '00647' },
    { label: 'Guayama', value: '00784' },
    { label: 'Guayama', value: '00704' },
    { label: 'Guayama', value: '00785' },
    { label: 'Guayanilla', value: '00656' },
    { label: 'Guaynabo', value: '00965' },
    { label: 'Guaynabo', value: '00966' },
    { label: 'Guaynabo', value: '00968' },
    { label: 'Guaynabo', value: '00971' },
    { label: 'Guaynabo', value: '00970' },
    { label: 'Guaynabo', value: '00969' },
    { label: 'Gurabo', value: '00778' },
    { label: 'Hatillo', value: '00659' },
    { label: 'Hormigueros', value: '00660' },
    { label: 'Humacao', value: '00791' },
    { label: 'Humacao', value: '00792' },
    { label: 'Humacao', value: '00741' },
    { label: 'Isabela', value: '00662' },
    { label: 'Jayuya', value: '00664' },
    { label: 'Juana Díaz', value: '00795' },
    { label: 'Juncos', value: '00777' },
    { label: 'Lajas', value: '00667' },
    { label: 'Lares', value: '00669' },
    { label: 'Las Marías', value: '00670' },
    { label: 'Las Piedras', value: '00771' },
    { label: 'Loíza', value: '00772' },
    { label: 'Luquillo', value: '00773' },
    { label: 'Manatí', value: '00674' },
    { label: 'Maricao', value: '00606' },
    { label: 'Maunabo', value: '00707' },
    { label: 'Mayaguez', value: '00680' },
    { label: 'Mayaguez', value: '00682' },
    { label: 'Mayaguez', value: '00681' },
    { label: 'Moca', value: '00676' },
    { label: 'Morovis', value: '00687' },
    { label: 'Naguabo', value: '00718' },
    { label: 'Rio Blanco', value: '00744' },
    { label: 'Naranjito', value: '00719' },
    { label: 'Orocovis', value: '00720' },
    { label: 'Patillas', value: '00723' },
    { label: 'Peñuelas', value: '00624' },
    { label: 'Ponce', value: '00716' },
    { label: 'Ponce', value: '00717' },
    { label: 'Ponce', value: '00728' },
    { label: 'Ponce', value: '00730' },
    { label: 'Ponce', value: '00731' },
    { label: 'Ponce', value: '00733' },
    { label: 'Ponce', value: '00780' },
    { label: 'Ponce', value: '00715' },
    { label: 'Ponce', value: '00732' },
    { label: 'Ponce', value: '00734' },
    { label: 'Quebradillas', value: '00678' },
    { label: 'Rincón', value: '00677' },
    { label: 'Río Grande', value: '00721' },
    { label: 'Río Grande', value: '00745' },
    { label: 'Sabana Grande', value: '00637' },
    { label: 'Salinas', value: '00751' },
    { label: 'San Germán', value: '00683' },
    { label: 'San Germán', value: '00636' },
    { label: 'San Juan', value: '00921' },
    { label: 'San Juan', value: '00923' },
    { label: 'San Juan', value: '00924' },
    { label: 'San Juan', value: '00929' },
    { label: 'San Juan', value: '00915' },
    { label: 'San Juan', value: '00916' },
    { label: 'San Juan', value: '00920' },
    { label: 'San Juan', value: '00909' },
    { label: 'San Juan', value: '00910' },
    { label: 'Fort Buchanan', value: '00934' },
    { label: 'San Juan', value: '00936' },
    { label: 'San Juan', value: '00917' },
    { label: 'San Juan', value: '00919' },
    { label: 'San Juan', value: '00911' },
    { label: 'San Juan', value: '00912' },
    { label: 'San Juan', value: '00913' },
    { label: 'San Juan', value: '00914' },
    { label: 'San Juan', value: '00940' },
    { label: 'San Juan', value: '00901' },
    { label: 'San Juan', value: '00902' },
    { label: 'San Juan', value: '00906' },
    { label: 'San Juan', value: '00925' },
    { label: 'San Juan', value: '00926' },
    { label: 'San Juan', value: '00927' },
    { label: 'San Juan', value: '00928' },
    { label: 'San Juan', value: '00930' },
    { label: 'San Juan', value: '00907' },
    { label: 'San Juan', value: '00908' },
    { label: 'San Juan', value: '00931' },
    { label: 'San Juan', value: '00933' },
    { label: 'San Lorenzo', value: '00754' },
    { label: 'San Sebastián', value: '00685' },
    { label: 'Santa Isabel', value: '00757' },
    { label: 'Toa Alta', value: '00953' },
    { label: 'Toa Alta', value: '00954' },
    { label: 'Toa Baja', value: '00949' },
    { label: 'Toa Baja', value: '00950' },
    { label: 'Toa Baja', value: '00951' },
    { label: 'Toa Baja', value: '00952' },
    { label: 'Trujillo Alto', value: '00976' },
    { label: 'Trujillo Alto', value: '00977' },
    { label: 'Saint Just', value: '00978' },
    { label: 'Utuado', value: '00641' },
    { label: 'Utuado', value: '00611' },
    { label: 'Vega Alta', value: '00692' },
    { label: 'Vega Baja', value: '00693' },
    { label: 'Vega Baja', value: '00694' },
    { label: 'Vieques', value: '00765' },
    { label: 'Villalba', value: '00766' },
    { label: 'Yabucoa', value: '00767' },
    { label: 'Yauco', value: '00698' },
];
// Invalid address patterns (PO Box, HC, RR not allowed)
const INVALID_ADDRESS_PATTERNS = ['PO BOX', 'P.O. BOX', 'P O BOX', 'HC ', 'RR ', 'APARTADO'];
// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS$1 = {
    SHIPMENT_ID: 'shipmentId',
    ZIP_CODE: 'zipCode',
    SHIPPING_ADDRESS: 'shippingAddress',
    DELIVERY_METHOD: 'deliveryMethodInfo',
};
// ------------------------------------------
// SHIPPING SERVICE CLASS
// ------------------------------------------
class ShippingService {
    http;
    constructor() {
        this.http = httpService;
    }
    // ------------------------------------------
    // API METHODS
    // ------------------------------------------
    /**
     * Create shipping address
     * TEL Pattern: userId comes from wBCUserID or defaults to '0' for new clients
     * flowId 6 = CLARO HOGAR flow
     */
    async createAddress(address, flowId = '6') {
        // TEL Pattern: userId from wBCUserID or '0' for new clients (line 102 shipment.page.ts)
        const userId = storageUtils.get('wBCUserID') || '0';
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('flowId', flowId);
        formData.append('userId', userId);
        formData.append('name', address.name);
        formData.append('email', address.email);
        formData.append('phone', this.cleanPhoneNumber(address.phone));
        formData.append('phone2', this.cleanPhoneNumber(address.phone2 || ''));
        formData.append('address1', address.address1);
        formData.append('address2', address.address2 || '');
        formData.append('city', address.city);
        formData.append('zip', address.zip + '-0000');
        formData.append('state', address.state);
        formData.append('town', address.city);
        formData.append('notes', address.notes || '');
        formData.append('chvAuthorizerName', address.authorizerName || '');
        formData.append('chvAuthorizerPhone', this.cleanPhoneNumber(address.authorizerPhone || ''));
        try {
            const response = await this.http.postFormData('api/Address/create', formData);
            if (!response.hasError && response.response) {
                this.setShipmentId(response.response);
                this.setZipCode(address.zip);
                this.storeShippingAddress(address);
            }
            return response;
        }
        catch (error) {
            console.error('[ShippingService] Create address error:', error);
            return {
                hasError: true,
                message: 'Error al crear la dirección de envío',
            };
        }
    }
    /**
     * Get available delivery methods
     */
    async getDeliveryMethods() {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        try {
            const response = await this.http.postFormData('api/Address/getDeliveryMethods', formData);
            return response;
        }
        catch (error) {
            console.error('[ShippingService] Get delivery methods error:', error);
            return {
                hasError: true,
                errorDesc: 'Error al obtener métodos de entrega',
            };
        }
    }
    // ------------------------------------------
    // STORAGE METHODS
    // ------------------------------------------
    getShipmentId() {
        const id = storageUtils.get(STORAGE_KEYS$1.SHIPMENT_ID);
        return id ? parseInt(id, 10) : 0;
    }
    setShipmentId(id) {
        storageUtils.set(STORAGE_KEYS$1.SHIPMENT_ID, id.toString());
    }
    getZipCode() {
        return storageUtils.get(STORAGE_KEYS$1.ZIP_CODE) || '';
    }
    setZipCode(zip) {
        storageUtils.set(STORAGE_KEYS$1.ZIP_CODE, zip);
    }
    storeShippingAddress(address) {
        storageUtils.setJSON(STORAGE_KEYS$1.SHIPPING_ADDRESS, address);
    }
    getStoredShippingAddress() {
        return storageUtils.getJSON(STORAGE_KEYS$1.SHIPPING_ADDRESS);
    }
    storeDeliveryMethod(method) {
        storageUtils.setJSON(STORAGE_KEYS$1.DELIVERY_METHOD, method);
    }
    getStoredDeliveryMethod() {
        return storageUtils.getJSON(STORAGE_KEYS$1.DELIVERY_METHOD);
    }
    clearShippingData() {
        storageUtils.remove(STORAGE_KEYS$1.SHIPMENT_ID);
        storageUtils.remove(STORAGE_KEYS$1.ZIP_CODE);
        storageUtils.remove(STORAGE_KEYS$1.SHIPPING_ADDRESS);
        storageUtils.remove(STORAGE_KEYS$1.DELIVERY_METHOD);
    }
    // ------------------------------------------
    // VALIDATION METHODS
    // ------------------------------------------
    /**
     * Validate if zip code is valid for Puerto Rico
     * Returns the municipality name if valid, null if invalid
     */
    validateZipCode(zipCode) {
        const entry = PR_ZIP_CODES.find((z) => z.value === zipCode);
        return entry ? entry.label : null;
    }
    /**
     * Get municipality by zip code
     */
    getMunicipalityByZip(zipCode) {
        return this.validateZipCode(zipCode) || '';
    }
    /**
     * Get all valid zip codes
     */
    getAllZipCodes() {
        return PR_ZIP_CODES;
    }
    /**
     * Validate address is physical (not PO Box)
     */
    isValidPhysicalAddress(address) {
        const upperAddress = address.toUpperCase();
        return !INVALID_ADDRESS_PATTERNS.some((pattern) => upperAddress.includes(pattern));
    }
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    }
    /**
     * Validate phone format (10 digits)
     */
    isValidPhone(phone) {
        const cleaned = this.cleanPhoneNumber(phone);
        return cleaned.length === 10;
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Clean phone number - remove formatting
     */
    cleanPhoneNumber(phone) {
        return phone.replace(/\(|\)|-|\s/g, '');
    }
    /**
     * Format phone number for display (XXX) XXX-XXXX
     */
    formatPhoneNumber(phone) {
        const cleaned = this.cleanPhoneNumber(phone);
        if (cleaned.length !== 10)
            return phone;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
}
// Export singleton instance
const shippingService = new ShippingService();

// ============================================
// PAYMENT SERVICE - Payment Processing
// Fixed Service Flow Web Component
// Based on TEL PaymentService & PaymentIframeService
// ============================================
// ------------------------------------------
// STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS = {
    ORDER_BAN: 'orderBan',
    PAYMENT_RESULT: 'paymentResult',
};
// ------------------------------------------
// PAYMENT SERVICE CLASS
// ------------------------------------------
class PaymentService {
    paymentIframeUrl = '';
    /**
     * Set the payment iframe URL (from environment config)
     */
    setPaymentIframeUrl(url) {
        this.paymentIframeUrl = url;
    }
    /**
     * Get the payment iframe URL
     */
    getPaymentIframeUrl() {
        return this.paymentIframeUrl;
    }
    // ------------------------------------------
    // API METHODS
    // ------------------------------------------
    /**
     * Create order before payment
     */
    async createOrder(request) {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('flowId', request.flowId);
        formData.append('frontFlowId', request.frontFlowId);
        formData.append('frontFlowName', request.frontFlowName);
        formData.append('banExisting', request.banExisting || '');
        formData.append('subscriberExisting', request.subscriberExisting || '');
        formData.append('amount', request.amount);
        formData.append('email', request.email);
        formData.append('zipCode', request.zipCode);
        formData.append('deposit', request.deposit);
        formData.append('pastDueAmount', request.pastDueAmount || '0');
        try {
            const response = await httpService.postFormData('api/Orders/creationOfOrder', formData);
            if (!response.hasError && response.ban) {
                this.storeOrderBan(response.ban);
            }
            return response;
        }
        catch (error) {
            console.error('[PaymentService] Create order error:', error);
            return {
                hasError: true,
                errorDisplay: 'Error al crear la orden',
            };
        }
    }
    /**
     * Record successful payment
     */
    async recordPayment(request) {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('ban', request.ban);
        formData.append('cardNumber', request.cardNumber);
        formData.append('cardType', request.cardType);
        formData.append('authorizationNumber', request.authorizationNumber);
        formData.append('referenceNumber', request.referenceNumber);
        formData.append('description', request.description);
        formData.append('operationId', request.operationId);
        formData.append('amount', request.amount);
        formData.append('deposit', request.deposit);
        try {
            const response = await httpService.postFormData('api/Payment/record', formData);
            return response;
        }
        catch (error) {
            console.error('[PaymentService] Record payment error:', error);
            return {
                hasError: true,
                errorDisplay: 'Error al registrar el pago',
            };
        }
    }
    /**
     * Record payment error
     */
    async recordPaymentError(ban, subscriber, description, operationId, deposit, cardType, cardNumber, amount) {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('ban', ban);
        formData.append('subscriber', subscriber);
        formData.append('description', description);
        formData.append('operationId', operationId);
        formData.append('deposit', deposit);
        formData.append('cardType', cardType);
        formData.append('cardNumber', cardNumber);
        formData.append('amount', amount);
        try {
            return await httpService.postFormData('api/Payment/error', formData);
        }
        catch (error) {
            console.error('[PaymentService] Record error error:', error);
            return { hasError: true };
        }
    }
    /**
     * Get payment iframe URL
     * TEL uses: api/Payment/getPaymentIframe (NOT getIframe)
     */
    async getPaymentIframe(request) {
        try {
            const response = await httpService.post('api/Payment/getPaymentIframe', request);
            return response;
        }
        catch (error) {
            console.error('[PaymentService] Get iframe error:', error);
            return {
                errorInfo: {
                    hasError: true,
                    errorDisplay: 'Error al obtener el iframe de pago',
                },
            };
        }
    }
    // ------------------------------------------
    // STORAGE METHODS
    // ------------------------------------------
    storeOrderBan(ban) {
        storageUtils.set(STORAGE_KEYS.ORDER_BAN, ban);
    }
    getOrderBan() {
        return storageUtils.get(STORAGE_KEYS.ORDER_BAN) || '';
    }
    storePaymentResult(result) {
        storageUtils.setJSON(STORAGE_KEYS.PAYMENT_RESULT, result);
    }
    getPaymentResult() {
        return storageUtils.getJSON(STORAGE_KEYS.PAYMENT_RESULT);
    }
    clearPaymentData() {
        storageUtils.remove(STORAGE_KEYS.ORDER_BAN);
        storageUtils.remove(STORAGE_KEYS.PAYMENT_RESULT);
    }
    // ------------------------------------------
    // PAYMENT ITEMS HELPERS
    // ------------------------------------------
    /**
     * Build payment items array from cart data
     */
    buildPaymentItems(cartData) {
        const items = [];
        if (cartData.depositAmount && cartData.depositAmount > 0) {
            items.push({ paymentType: 'DEPOSIT', amount: cartData.depositAmount });
        }
        if (cartData.totalDownPayment && cartData.totalDownPayment > 0) {
            items.push({ paymentType: 'DOWNPAYMENT', amount: cartData.totalDownPayment });
        }
        if (cartData.totalTax && cartData.totalTax > 0) {
            // Calculate tax portion
            const taxAmount = (cartData.totalPrice || 0) -
                (cartData.depositAmount || 0) -
                (cartData.totalDownPayment || 0) -
                (cartData.installmentAmount || 0);
            if (taxAmount > 0) {
                items.push({ paymentType: 'TAXES', amount: Number(taxAmount.toFixed(2)) });
            }
        }
        if (cartData.cartUpdateResponse?.acceletartedAmount) {
            items.push({
                paymentType: 'INSTALLMENT',
                amount: cartData.cartUpdateResponse.acceletartedAmount,
            });
        }
        return items;
    }
    /**
     * Calculate total amount from payment items
     */
    calculateTotalAmount(items) {
        return items.reduce((sum, item) => sum + item.amount, 0);
    }
}
// Export singleton instance
const paymentService = new PaymentService();

const fixedServiceFlowCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;color:#333333;line-height:1.5}.fsf-container{width:100%;max-width:1200px;margin:0 auto;padding:1rem}@media (min-width: 768px){.fsf-container{padding:1.5rem}}.fsf-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:2rem}.fsf-loading__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.fsf-loading__text{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.fsf-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:2rem;text-align:center}.fsf-error__icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;font-size:1.75rem;font-weight:700;color:#FFFFFF;background-color:#DA291C;border-radius:50%}.fsf-error__title{margin-top:1rem;font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333}.fsf-error__message{margin-top:0.5rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666;max-width:400px}.fsf-error__button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.fsf-error__button:disabled{opacity:0.5;cursor:not-allowed}.fsf-error__button{height:48px;background-color:#DA291C;color:#FFFFFF}.fsf-error__button:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.fsf-error__button:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.fsf-error__button{margin-top:1.5rem}.step-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:2rem;text-align:center;background:#FFFFFF;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);margin:1rem}.step-placeholder h2{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333;margin-bottom:1rem}.step-placeholder p{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-placeholder button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-placeholder button:disabled{opacity:0.5;cursor:not-allowed}.step-placeholder button{height:48px;background-color:#DA291C;color:#FFFFFF}.step-placeholder button:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-placeholder button:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-placeholder button{margin:0.5rem}.step-placeholder button:last-child{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-placeholder button:last-child:disabled{opacity:0.5;cursor:not-allowed}.step-placeholder button:last-child{height:48px;background-color:#0097A9;color:#FFFFFF}.step-placeholder button:last-child:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-placeholder button:last-child:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;

/**
 * CLARO HOGAR step names for clarity
 */
const CLARO_HOGAR_STEPS = {
    LOCATION: 1, // Ubicación/Cobertura
    CATALOGUE: 2, // Catálogo de productos
    PRODUCT_DETAIL: 3, // Detalle del producto
    PLANS: 4, // Planes de internet
    ORDER_SUMMARY: 5, // Resumen de orden
    SHIPPING: 6, // Dirección de envío
    PAYMENT: 7, // Pago
    CONFIRMATION: 8, // Confirmación
};
// Max step per flow type
const MAX_STEP_STANDARD = 5;
const MAX_STEP_CLARO_HOGAR = 8;
const FixedServiceFlow = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.flowComplete = index.createEvent(this, "flowComplete");
        this.flowError = index.createEvent(this, "flowError");
        this.flowCancel = index.createEvent(this, "flowCancel");
        this.stepChange = index.createEvent(this, "stepChange");
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Base URL for the API
     */
    apiUrl;
    /**
     * Google Maps API Key
     */
    googleMapsKey;
    /**
     * Optional correlation ID for tracking
     */
    correlationId;
    /**
     * Initial step (default: 1)
     */
    initialStep = 1;
    /**
     * Debug mode
     */
    debug = false;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    currentStep = 1;
    isLoading = true;
    error = null;
    isInitialized = false;
    // ------------------------------------------
    // EVENTS
    // ------------------------------------------
    /**
     * Emitted when the flow completes successfully
     */
    flowComplete;
    /**
     * Emitted when an error occurs
     */
    flowError;
    /**
     * Emitted when user cancels the flow
     */
    flowCancel;
    /**
     * Emitted when step changes
     */
    stepChange;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
    handleApiUrlChange(newValue) {
        if (newValue) {
            httpService.setBaseUrl(newValue);
        }
    }
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentWillLoad() {
        // Set debug mode
        if (this.debug) {
            window.__FSF_DEBUG__ = true;
        }
        // Configure HTTP service
        if (this.apiUrl) {
            httpService.setBaseUrl(this.apiUrl);
        }
        // Set initial step
        if (this.initialStep) {
            this.currentStep = this.initialStep;
            flowActions.setStep(this.initialStep);
        }
        // Initialize token
        await this.initializeToken();
    }
    componentDidLoad() {
        this.log('Component loaded');
    }
    disconnectedCallback() {
        this.log('Component disconnected');
        // Cleanup if needed
    }
    // ------------------------------------------
    // INITIALIZATION
    // ------------------------------------------
    async initializeToken() {
        this.isLoading = true;
        this.error = null;
        try {
            const success = await tokenService.initialize();
            if (!success) {
                this.error = 'Error al inicializar la sesión';
                this.emitError(new Error(this.error), false);
            }
            this.isInitialized = true;
        }
        catch (err) {
            this.error = err.message || 'Error de inicialización';
            this.emitError(err, false);
        }
        finally {
            this.isLoading = false;
        }
    }
    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    handleStepChange = (direction) => {
        const from = this.currentStep;
        const maxStep = this.isClaroHogar() ? MAX_STEP_CLARO_HOGAR : MAX_STEP_STANDARD;
        let to;
        if (direction === 'forward') {
            to = Math.min(this.currentStep + 1, maxStep);
            flowActions.nextStep();
        }
        else {
            to = Math.max(this.currentStep - 1, 1);
            flowActions.prevStep();
        }
        this.currentStep = to;
        flowActions.setStep(to);
        this.stepChange.emit({ from, to, direction });
        this.log(`Step changed: ${from} -> ${to}`);
    };
    // @ts-ignore: goToStep reserved for future use (direct step navigation)
    _goToStep = (step) => {
        const from = this.currentStep;
        const direction = step > from ? 'forward' : 'backward';
        flowActions.setStep(step);
        this.currentStep = step;
        this.stepChange.emit({ from, to: step, direction });
        this.log(`Step changed: ${from} -> ${step}`);
    };
    // ------------------------------------------
    // EVENT HANDLERS
    // ------------------------------------------
    handleFlowComplete = (event) => {
        this.log('Flow completed', event);
        this.flowComplete.emit(event);
    };
    handleFlowCancel = () => {
        this.log('Flow cancelled');
        flowActions.resetFlow();
        this.currentStep = 1;
        flowActions.setStep(1);
        this.flowCancel.emit();
    };
    emitError(error, recoverable = true) {
        this.flowError.emit({
            step: this.currentStep,
            error,
            recoverable,
        });
    }
    // ------------------------------------------
    // HELPERS
    // ------------------------------------------
    log(...args) {
        if (this.debug) {
            console.log('[FixedServiceFlow]', ...args);
        }
    }
    /**
     * Checks if the current flow is for CLARO HOGAR (wireless internet)
     */
    isClaroHogar() {
        const serviceType = state.location?.serviceType?.toUpperCase();
        return serviceType === 'CLARO HOGAR';
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    renderStep() {
        const stepProps = {
            onNext: () => this.handleStepChange('forward'),
            onBack: () => this.handleStepChange('backward'),
            onComplete: this.handleFlowComplete,
            googleMapsKey: this.googleMapsKey,
        };
        // CLARO HOGAR Flow (e-commerce)
        if (this.isClaroHogar()) {
            this.log('CLARO HOGAR flow - step:', this.currentStep);
            return this.renderClaroHogarStep(stepProps);
        }
        // Standard Flow (GPON/VRAD - internet service request)
        return this.renderStandardStep(stepProps);
    }
    /**
     * Renders steps for Standard Flow (GPON/VRAD)
     * Steps: 1.Location -> 2.Plans -> 3.Contract -> 4.Form -> 5.Confirmation
     */
    renderStandardStep(stepProps) {
        switch (this.currentStep) {
            case 1:
                return index.h("step-location", { ...stepProps });
            case 2:
                return index.h("step-plans", { ...stepProps });
            case 3:
                return index.h("step-contract", { ...stepProps });
            case 4:
                return index.h("step-form", { ...stepProps });
            case 5:
                return index.h("step-confirmation", { ...stepProps, onCancel: this.handleFlowCancel });
            default:
                return null;
        }
    }
    /**
     * Renders steps for CLARO HOGAR Flow (e-commerce)
     * Steps: 1.Location -> 2.Catalogue -> 3.ProductDetail -> 4.Plans ->
     *        5.OrderSummary -> 6.Shipping -> 7.Payment -> 8.Confirmation
     */
    renderClaroHogarStep(stepProps) {
        switch (this.currentStep) {
            case CLARO_HOGAR_STEPS.LOCATION:
                return index.h("step-location", { ...stepProps });
            case CLARO_HOGAR_STEPS.CATALOGUE:
                return index.h("step-catalogue", { ...stepProps });
            case CLARO_HOGAR_STEPS.PRODUCT_DETAIL:
                return index.h("step-product-detail", { ...stepProps });
            case CLARO_HOGAR_STEPS.PLANS:
                // Plans for the selected product
                return index.h("step-plans", { ...stepProps });
            case CLARO_HOGAR_STEPS.ORDER_SUMMARY:
                return index.h("step-order-summary", { ...stepProps });
            case CLARO_HOGAR_STEPS.SHIPPING:
                return index.h("step-shipping", { ...stepProps });
            case CLARO_HOGAR_STEPS.PAYMENT:
                return index.h("step-payment", { ...stepProps });
            case CLARO_HOGAR_STEPS.CONFIRMATION:
                return index.h("step-confirmation", { ...stepProps, onCancel: this.handleFlowCancel });
            default:
                return null;
        }
    }
    renderLoading() {
        return (index.h("div", { class: "fsf-loading" }, index.h("div", { class: "fsf-loading__spinner" }), index.h("p", { class: "fsf-loading__text" }, "Cargando...")));
    }
    renderError() {
        return (index.h("div", { class: "fsf-error" }, index.h("div", { class: "fsf-error__icon" }, "!"), index.h("h3", { class: "fsf-error__title" }, "Error"), index.h("p", { class: "fsf-error__message" }, this.error), index.h("button", { class: "fsf-error__button", onClick: () => this.initializeToken() }, "Reintentar")));
    }
    render() {
        // Show loading state
        if (this.isLoading) {
            return (index.h(index.Host, null, this.renderLoading()));
        }
        // Show error state
        if (this.error && !this.isInitialized) {
            return (index.h(index.Host, null, this.renderError()));
        }
        // Render flow
        return (index.h(index.Host, null, index.h("div", { class: "fsf-container" }, this.renderStep())));
    }
    static get watchers() { return {
        "apiUrl": ["handleApiUrlChange"]
    }; }
};
FixedServiceFlow.style = fixedServiceFlowCss();

const stepCatalogueCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-catalogue{width:100%;padding:0 1rem}.container-filter{display:grid;grid-gap:10px;padding:20px 0;align-items:center;justify-content:space-between;border-bottom:1px solid #DBDBDB;grid-template-columns:auto 1fr auto}@media (max-width: 991px){.container-filter{grid-template-columns:1fr;gap:15px}}.filter-title-main{margin:0;font-size:24px;font-weight:700;color:#333333}@media (max-width: 991px){.filter-title-main{font-size:20px}}.filter-content{display:flex;gap:10px;align-items:center;justify-content:flex-end}@media (max-width: 991px){.filter-content{width:100%}}.input-filter-wrapper{position:relative;display:flex;align-items:center;width:300px}@media (max-width: 991px){.input-filter-wrapper{flex:1;width:auto}}.search-icon{position:absolute;left:12px;width:20px;height:20px;color:#999999}.input-filter{width:100%;height:40px;padding:8px 12px 8px 40px;font-size:16px;border:1px solid #DBDBDB;border-radius:12px;outline:none;transition:border-color 0.2s}.input-filter:focus{border-color:#DA291C}.input-filter::placeholder{color:#999999}.btn-search{height:40px;padding:0 24px;background:#DA291C;color:#FFFFFF;border:none;border-radius:22px;font-size:16px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background-color 0.2s}.btn-search:hover{background:rgb(181.843902439, 34.2, 23.356097561)}@media (max-width: 767px){.btn-search{padding:0 16px;font-size:14px}}.btn-hidden-filter{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;background:transparent;color:#0097A9;border:1px solid #0097A9;border-radius:22px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-hidden-filter:hover{background:rgba(0, 151, 169, 0.1)}.btn-hidden-filter .filter-icon{width:16px;height:16px}@media (max-width: 991px){.btn-hidden-filter{display:none}}.catalogue-content{display:grid;grid-template-columns:280px 1fr;gap:24px;padding:20px 0}@media (max-width: 1199px){.catalogue-content{grid-template-columns:240px 1fr}}@media (max-width: 991px){.catalogue-content{grid-template-columns:1fr}}.filter-container{border-radius:12px;border:1px solid #DBDBDB;background:#FFFFFF;height:fit-content}@media (max-width: 991px){.filter-container{display:none !important}}.filter-header{padding:20px;display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #DBDBDB}.filter-title{margin:0;font-size:24px;font-weight:700;color:#333333}.reset-filter{margin:0;color:#0097A9;cursor:pointer;font-size:14px;font-weight:700;text-decoration:none}.reset-filter:hover{text-decoration:underline}.filter-result{padding:20px;border-bottom:1px solid #DBDBDB}.filter-result .result{margin:0;font-size:14px;font-weight:700;color:#666666}.filter-type-product{border-bottom:1px solid #DBDBDB}.filter-type-product:last-child{border-bottom:none}.filter-type-title{display:flex;padding:20px;cursor:pointer;align-items:center;justify-content:space-between}.filter-title-section{margin:0;font-size:16px;font-weight:700;color:#333333}.chevron-icon{width:20px;height:20px;color:#666666}.slot-radio{padding:0 20px 20px}.radio-group{display:flex;flex-direction:column;gap:12px}.radio-button{display:flex;align-items:center;gap:10px;cursor:pointer}.radio-button input[type=radio]{width:18px;height:18px;accent-color:#0097A9;cursor:pointer}.radio-button .radio-label{font-size:14px;color:#333333}.products-section{min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:2rem;background:rgba(255, 255, 255, 0.95);border-radius:16px}.loading-container p{margin-top:1rem;font-size:18px;font-weight:600;color:#333333}.error-container,.empty-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;color:#666666}.error-container p,.empty-container p{margin-top:1rem;font-size:16px}.error-container button,.empty-container button{margin-top:1rem;padding:8px 24px;background:#0097A9;color:#FFFFFF;border:none;border-radius:20px;cursor:pointer}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.container-product{display:grid;grid-gap:1.5rem;align-items:stretch;grid-template-columns:1fr 1fr 1fr}@media (max-width: 1399px){.container-product{grid-template-columns:1fr 1fr}}@media (max-width: 767px){.container-product{grid-template-columns:1fr}}.container-product-filter-off{grid-template-columns:1fr 1fr 1fr 1fr}@media (max-width: 1399px){.container-product-filter-off{grid-template-columns:1fr 1fr 1fr}}@media (max-width: 1199px){.container-product-filter-off{grid-template-columns:1fr 1fr}}@media (max-width: 767px){.container-product-filter-off{grid-template-columns:1fr}}.new-product-item{width:100%;height:100%;overflow:hidden;position:relative;border-radius:12px;border:solid 1px #dbdbdb;background:#FFFFFF;box-shadow:2px 3px 27px -3px rgb(211, 211, 211);transition:transform 0.2s, box-shadow 0.2s;display:flex;flex-direction:column}.new-product-item:hover{transform:translateY(-2px);box-shadow:2px 6px 32px -3px rgb(180, 180, 180)}.new-product-item__top{display:grid;margin-top:20px;position:relative;grid-column-gap:16px;padding:16px 16px 8px;grid-template-columns:1fr 2fr}@media (max-width: 1199px){.new-product-item__top{display:flex;flex-direction:column}}.new-product-item__img{display:flex;align-items:center;justify-content:center}.new-product-item__img img{max-width:100%;max-height:120px;object-fit:contain}@media (max-width: 1199px){.new-product-item__img{width:100px;margin:0 auto 16px}}.new-product-item__info .title{margin-top:10px;color:#3c3c3c;font-size:18px;font-weight:700;line-height:24px;margin-bottom:16px;font-family:Roboto, sans-serif}@media (max-width: 1199px){.new-product-item__info .title{margin-top:0;font-size:16px;min-height:48px}}.new-product-item__info .financed-price .financed-price-text{margin-top:4px;color:#3c3c3c;font-size:16px;font-weight:700;line-height:16px}.new-product-item__info .financed-price .financed-price__value{color:#DA291C;font-size:18px;font-weight:700;line-height:24px}.new-product-item__info .financed-price .installments-text{color:#3c3c3c;font-size:14px;font-weight:700;line-height:16px}.new-product-item__info .regular-price{color:#6c6c6c;font-size:14px;font-weight:400;margin-top:10px;line-height:16px}.container-colors{display:flex;gap:8px;padding:10px 25px 15px;flex-wrap:wrap}.color-dot{width:14px;height:14px;border-radius:50%;border:1px solid #3c3c3c;cursor:pointer}.color-dot:active{transform:scale(0.95)}.new-product-item__middle{padding:15px;color:#3c3c3c;min-height:65px;font-size:14px;line-height:1.4;border-top:2px solid #dbdbdb;border-bottom:2px solid #dbdbdb;flex-grow:1}.new-product-item__middle .description-text{display:block}.new-product-item__middle .see-detail{display:inline-block;margin-top:8px;font-size:14px;color:#0097A9;cursor:pointer;text-decoration:underline}.new-product-item__bottom{padding:1rem;display:flex;justify-content:center;align-items:center}.action-button{color:#DA291C;text-align:center;font-size:16px;font-weight:700;line-height:16px;border:solid 1px #DA291C;border-radius:30px;padding:0.5rem 2.5rem;background:transparent;cursor:pointer;transition:all 0.2s}.action-button:hover{background-color:#DA291C;color:#FFFFFF}.back-button-container{display:flex;justify-content:center;padding:24px 0 40px}.btn-back{padding:12px 32px;background:transparent;color:#0097A9;border:2px solid #0097A9;border-radius:30px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#0097A9;color:#FFFFFF}.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}.modal-content{position:relative;background:#FFFFFF;border-radius:12px;max-width:500px;width:100%;max-height:80vh;overflow:hidden;box-shadow:0 4px 20px rgba(0, 0, 0, 0.15);animation:modalFadeIn 0.2s ease-out}@keyframes modalFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}.modal-close{position:absolute;top:12px;right:12px;width:32px;height:32px;background:transparent;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}.modal-close svg{width:20px;height:20px;color:#3c3c3c}.modal-close:hover{background:#f0f0f0}.modal-title{padding:20px;padding-right:50px;border-bottom:1px solid #dbdbdb;color:#3c3c3c;font-size:20px;font-weight:700;line-height:1.3}.modal-title .modal-subtitle{font-size:14px;font-weight:500;color:#6c6c6c;margin-bottom:8px}@media (max-width: 767px){.modal-title{font-size:18px;padding:16px;padding-right:45px}}.modal-body{padding:20px;max-height:300px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#ccc transparent}.modal-body::-webkit-scrollbar{width:6px}.modal-body::-webkit-scrollbar-track{background:transparent}.modal-body::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}.modal-text{margin:0;color:#3c3c3c;font-size:16px;font-weight:400;line-height:1.5;text-align:justify}@media (max-width: 767px){.modal-text{font-size:14px}}`;

const StepCatalogue = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    products = [];
    filteredProducts = [];
    isLoading = true;
    error = null;
    searchText = '';
    selectedFilter = '';
    showFilters = true;
    filterOptions = [];
    // Modal state (TEL pattern: seeMoreModal)
    showDetailModal = false;
    modalTitle = '';
    modalContent = '';
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        // Get filter options (sync)
        this.filterOptions = catalogueService.getProductTypeFilters();
        // Set default filter to "Internet Inalámbrico" (second option)
        this.selectedFilter = catalogueService.FILTER_INTERNET_INALAMBRICO;
        // isLoading is already true by default, so loader will show immediately
    }
    componentDidLoad() {
        // Load products after component renders (shows loader while loading)
        this.loadProducts();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadProducts() {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await catalogueService.listCatalogue(this.selectedFilter, 1, this.searchText);
            this.products = response.products || [];
            this.filteredProducts = this.products;
        }
        catch (err) {
            console.error('[StepCatalogue] Error loading products:', err);
            this.error = 'Error al cargar el catálogo de productos';
        }
        finally {
            this.isLoading = false;
        }
    }
    handleFilterChange = async (filterValue) => {
        this.selectedFilter = filterValue;
        await this.loadProducts();
    };
    handleSearchInput = (e) => {
        this.searchText = e.target.value;
    };
    handleSearch = async () => {
        await this.loadProducts();
    };
    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    };
    // @ts-ignore: toggleFilters reserved for mobile filter toggle feature
    _toggleFilters = () => {
        this.showFilters = !this.showFilters;
    };
    clearFilters = () => {
        this.selectedFilter = catalogueService.FILTER_INTERNET_INALAMBRICO;
        this.searchText = '';
        this.loadProducts();
    };
    handleViewMore = (product) => {
        // Store selected product and subcatalog ID for plans API
        const subcatalogId = parseInt(this.selectedFilter, 10);
        catalogueService.storeProductInSession(product);
        productService.storeSelectedProduct(product, subcatalogId);
        console.log('[StepCatalogue] Product selected:', product.productName, 'subcatalogId:', subcatalogId);
        this.onNext?.();
    };
    cleanHTML(html) {
        return catalogueService.cleanDescription(html);
    }
    getSelectedFilterCount() {
        return this.selectedFilter ? 1 : 0;
    }
    /**
     * Opens the detail modal with product description
     * TEL pattern: seeMore() -> modalProvider.seeMoreModal()
     */
    handleSeeDetail = (product) => {
        const fullDescription = this.cleanHTML(product.shortDescription || '');
        this.modalTitle = product.productName;
        this.modalContent = fullDescription;
        this.showDetailModal = true;
    };
    /**
     * Closes the detail modal
     * TEL pattern: closeModal() -> modalController.dismiss()
     */
    closeDetailModal = () => {
        this.showDetailModal = false;
        this.modalTitle = '';
        this.modalContent = '';
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderFilterSidebar() {
        const filterCount = this.getSelectedFilterCount();
        return (index.h("aside", { class: "filter-container", style: { display: this.showFilters ? 'block' : 'none' } }, index.h("div", { class: "filter-header" }, index.h("span", { class: "filter-title" }, "Filtrar por:"), index.h("a", { class: "reset-filter", onClick: this.clearFilters }, "Limpiar filtros")), index.h("div", { class: "filter-result" }, index.h("p", { class: "result" }, filterCount > 0
            ? `filtros seleccionados (${filterCount})`
            : 'Ningún filtro seleccionado')), index.h("div", { class: "filter-type-product" }, index.h("div", { class: "filter-type-title" }, index.h("h4", { class: "filter-title-section" }, "Tipo de producto"), index.h("svg", { class: "chevron-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("polyline", { points: "6 9 12 15 18 9" }))), index.h("div", { class: "slot-radio" }, index.h("div", { class: "radio-group" }, this.filterOptions.map((option) => (index.h("label", { class: "radio-button" }, index.h("input", { type: "radio", name: "productType", value: option.value, checked: this.selectedFilter === option.value, onChange: () => this.handleFilterChange(option.value) }), index.h("span", { class: "radio-label" }, option.label)))))))));
    }
    renderProductCard(product) {
        const description = this.cleanHTML(product.shortDescription || '');
        const truncatedDesc = catalogueService.truncateText(description, 80);
        return (index.h("div", { class: "new-product-item" }, index.h("div", { class: "new-product-item__top" }, index.h("div", { class: "new-product-item__img" }, index.h("img", { src: product.imgUrl, alt: product.productName, loading: "lazy" })), index.h("div", { class: "new-product-item__info" }, index.h("div", { class: "title" }, product.productName), product.installments > 0 && (index.h("div", { class: "financed-price" }, index.h("div", { class: "financed-price-text" }, "Financiado"), index.h("div", { class: "financed-price__value" }, "$", product.update_price?.toFixed(2) || '0.00', "/mes"), index.h("div", { class: "installments-text" }, product.installments, " Plazos"))), index.h("div", { class: "regular-price" }, "Precio regular: $", product.regular_price?.toFixed(2) || '0.00'))), product.colors && product.colors.length > 0 && (index.h("div", { class: "container-colors" }, product.colors.map((color) => (index.h("div", { class: "color-dot", style: { backgroundColor: color.webColor } }))))), index.h("div", { class: "new-product-item__middle" }, description ? (index.h("span", { class: "description-text" }, truncatedDesc, description.length > 80 && (index.h("a", { class: "see-detail", onClick: (e) => { e.stopPropagation(); this.handleSeeDetail(product); } }, "Ver detalle")))) : (index.h("span", { class: "description-text" }, "\u00A0"))), index.h("div", { class: "new-product-item__bottom" }, index.h("button", { class: "action-button", onClick: () => this.handleViewMore(product) }, "Ver m\u00E1s"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        // Get title based on selected filter
        const title = this.selectedFilter === catalogueService.FILTER_INTERNET_INALAMBRICO
            ? 'Internet Inalámbrico'
            : 'Internet + Telefonía';
        return (index.h(index.Host, { key: '1d039e0886b26c3b2d248b58dc19eba3e95b39dd' }, index.h("div", { key: '0fea0f07a26ab17953f23c3205f2c328ef1c9a54', class: "step-catalogue" }, index.h("div", { key: 'd5517730f8f9bedc0f09fbf0a51cfd3a18dc3dce', class: "container-filter" }, index.h("h1", { key: '8ff3960af6aaccfc4dccab2432e95db8f534b14f', class: "filter-title-main" }, title), index.h("div", { key: '50173802907da0d15f13201412db24e0f817bf99', class: "filter-content" }, index.h("div", { key: '18f2bc15ebd502525768b79bba73d13d239dc2ef', class: "input-filter-wrapper" }, index.h("svg", { key: '5ac2b02cf6691d7c138bdc8d6618778c4202da53', class: "search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("circle", { key: '5bc9fbf6d6194a87a03b976a80c4c13a85823252', cx: "11", cy: "11", r: "8" }), index.h("path", { key: '4723e015a9c94331741bed88d873c2a536a31834', d: "m21 21-4.35-4.35" })), index.h("input", { key: '799681d42ba267c147e477c8f4f645d51069fa50', type: "text", class: "input-filter", placeholder: "Buscar articulo", value: this.searchText, onInput: this.handleSearchInput, onKeyPress: this.handleKeyPress })), index.h("button", { key: '9d13777022d9949eb4245034f38533373ef0db05', class: "btn-search", onClick: this.handleSearch }, "Buscar"))), index.h("div", { key: '343c9edbe94686e15f21affec70a3f68ed5965f8', class: "catalogue-content" }, this.renderFilterSidebar(), index.h("div", { key: 'd51f10033f77682dc03d8d958cf004d574838954', class: "products-section" }, this.isLoading && (index.h("div", { key: '1542625375f5d2b265bbecff44ab65468c6d4f4d', class: "loading-container" }, index.h("div", { key: 'b48473e6d22f9a536cf7b9c6d9d4a839e34c23a3', class: "spinner" }), index.h("p", { key: '702f744448fd22ec0d409d793c129356190dc195' }, "Cargando productos..."))), this.error && !this.isLoading && (index.h("div", { key: 'b82d6659d975570d777397909715cc488f97dbe5', class: "error-container" }, index.h("p", { key: '5c0d488ed32e225157052291c5f495188c06e400' }, this.error), index.h("button", { key: 'fddf301ab62cffc59b0842a551052c4cddfd254f', onClick: () => this.loadProducts() }, "Reintentar"))), !this.isLoading && !this.error && (index.h("div", { key: '24aaff67c25f41f0bc71b5ce07e9a87f64638896', class: {
                'container-product': true,
                'container-product-filter-off': !this.showFilters,
            } }, this.filteredProducts.map((product) => this.renderProductCard(product)))), !this.isLoading && !this.error && this.filteredProducts.length === 0 && (index.h("div", { key: '5ae49ef2980aab9518bdf6694a4960e0838cd5f4', class: "empty-container" }, index.h("p", { key: '220c85131df9697d53d68d3ec621a067d44ad649' }, "No hay productos disponibles para esta categor\u00EDa"))))), index.h("div", { key: '1c759d41bf1b1dac3ef539c3ef36623723035494', class: "back-button-container" }, index.h("button", { key: '28b296115d047f38f0311fdaebf43d595154a599', class: "btn-back", onClick: this.onBack }, "Regresar"))), this.showDetailModal && (index.h("div", { key: '02995010245195e6520bda1264d2fe2efb7fc0ae', class: "modal-overlay", onClick: this.closeDetailModal }, index.h("div", { key: 'f966900e2d3cd3a2f0e7a72cf2a128c35e60b1b3', class: "modal-content", onClick: (e) => e.stopPropagation() }, index.h("button", { key: 'a762de75addd97999a2f9650ed00b57278607f21', class: "modal-close", onClick: this.closeDetailModal }, index.h("svg", { key: 'fc2a4e5bdc6bea5020f478b702c485a358c5e281', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("line", { key: 'd1b8b336ee9d0f39770e1707deaa2b19d312ec33', x1: "18", y1: "6", x2: "6", y2: "18" }), index.h("line", { key: '7fc1ea360318bd51f315964e2149488a9f648bd6', x1: "6", y1: "6", x2: "18", y2: "18" }))), index.h("div", { key: 'd91d7d8e23e652f3b7e6077271235b2add677d8b', class: "modal-title" }, index.h("div", { key: '711ea47e08e5fd17bfa30979a8373bcce66553e8', class: "modal-subtitle" }, "Descripci\u00F3n completa"), this.modalTitle), index.h("div", { key: '0cfbd7a95944d5a96504699156d9a0377de59296', class: "modal-body" }, index.h("p", { key: '1cb734b48ec1cd332fc5074e790df3e42759ee4e', class: "modal-text" }, this.modalContent)))))));
    }
};
StepCatalogue.style = stepCatalogueCss();

const stepConfirmationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-confirmation{width:100%}.step-confirmation__header{margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #E5E5E5}.step-confirmation__header-title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-confirmation__content{background-color:#FFFFFF;border:1px solid #E5E5E5;border-radius:0.75rem;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);transition:box-shadow 150ms ease, border-color 150ms ease;padding:3rem 2rem;text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading{display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading p{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.step-confirmation__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-confirmation__result{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:500px}.step-confirmation__icon{display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.step-confirmation__icon img{width:48px;height:48px}.step-confirmation__icon svg{width:40px;height:40px}.step-confirmation__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;margin-bottom:0.5rem}.step-confirmation__title--success{color:#15A045}.step-confirmation__title--error{color:#E00814}.step-confirmation__message{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-confirmation__order-id{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0.5rem 1rem;background:#FAFAFA;border-radius:0.5rem}.step-confirmation__actions{margin-top:1.5rem;text-align:center}.step-confirmation__btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-confirmation__btn:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-confirmation__btn:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-confirmation__btn{min-width:180px}.step-confirmation__btn--error{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn--error:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn--error{height:48px;background-color:#DA291C;color:#FFFFFF}.step-confirmation__btn--error:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-confirmation__btn--error:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepConfirmation = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onComplete;
    onCancel;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    status = 'loading';
    orderId = null;
    orderNumber = null;
    confirmationSent = false;
    errorMessage = '';
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentWillLoad() {
        // Check if this is a catalogue flow (CLARO HOGAR) or internet flow
        // Catalogue flow: has payment result but no contract/formData
        // Internet flow: has contract and formData
        const isCatalogueFlow = this.isCatalogueFlow();
        if (isCatalogueFlow) {
            await this.handleCatalogueFlowConfirmation();
        }
        else {
            await this.submitRequest();
        }
    }
    /**
     * Determines if this is a catalogue/equipment flow (CLARO HOGAR)
     * vs an internet service flow
     */
    isCatalogueFlow() {
        // Catalogue flow has payment result stored but no contract/formData
        const paymentResult = paymentService.getPaymentResult();
        const hasContract = !!state.selectedContract;
        const hasFormData = !!state.formData;
        // If we have payment result but no contract/formData, it's catalogue flow
        return !!paymentResult && !hasContract && !hasFormData;
    }
    /**
     * Handles confirmation for catalogue/equipment flow (CLARO HOGAR)
     * The purchase is already complete after payment - just show success
     */
    async handleCatalogueFlowConfirmation() {
        this.status = 'loading';
        try {
            const paymentResult = paymentService.getPaymentResult();
            if (!paymentResult || !paymentResult.success) {
                throw new Error('No se encontró información del pago');
            }
            // Get order BAN from payment service
            const orderBan = paymentService.getOrderBan();
            // For catalogue flow, the orderId comes from the payment process
            this.orderId = orderBan || paymentResult.operationId || null;
            console.log('[StepConfirmation] Catalogue flow - payment success:', {
                orderId: this.orderId,
                operationId: paymentResult.operationId,
                authorizationNumber: paymentResult.authorizationNumber,
            });
            // Mark as success
            this.status = 'success';
            // Store result
            flowActions.setOrderResult(this.orderId, null);
            // Emit complete event with available data
            this.onComplete?.({
                orderId: this.orderId,
                plan: state.selectedPlan,
                contract: null, // Not applicable for catalogue flow
                customer: null, // Customer data came from shipping form
                location: state.location,
            });
        }
        catch (error) {
            console.error('[StepConfirmation] Catalogue flow error:', error);
            this.status = 'error';
            this.errorMessage = error.message || ERROR_MESSAGES.REQUEST_ERROR;
            flowActions.setOrderResult(null, this.errorMessage);
        }
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async submitRequest() {
        this.status = 'loading';
        try {
            const { location, plan, contract, formData } = {
                location: state.location,
                plan: state.selectedPlan,
                contract: state.selectedContract,
                formData: state.formData,
            };
            // Validate all data exists
            const validation = requestService.validateSubmissionData(formData, contract, plan, location);
            if (!validation.isValid) {
                throw new Error(`Datos incompletos: ${validation.missingFields.join(', ')}`);
            }
            // Build and submit payload
            const payload = requestService.buildPayload(formData, contract, plan, location);
            const response = await requestService.submitRequest(payload);
            if (response.hasError) {
                throw new Error(response.errorDisplay || response.message || ERROR_MESSAGES.REQUEST_ERROR);
            }
            // Success - store orderId
            this.orderId = response.orderId || null;
            // Get order details (async, don't block on failure)
            if (this.orderId) {
                this.fetchOrderDetails(this.orderId);
                // Send confirmation email (async, don't block on failure)
                this.sendConfirmationEmail(this.orderId, formData.personal.email);
            }
            // Mark as success
            this.status = 'success';
            // Store result
            flowActions.setOrderResult(this.orderId, null);
            // Emit complete event
            this.onComplete?.({
                orderId: this.orderId,
                plan: plan,
                contract: contract,
                customer: formData,
                location: location,
            });
        }
        catch (error) {
            console.error('Request submission failed:', error);
            this.status = 'error';
            this.errorMessage = error.message || ERROR_MESSAGES.REQUEST_ERROR;
            flowActions.setOrderResult(null, this.errorMessage);
        }
    }
    /**
     * Fetches order details after successful submission
     * Non-blocking - errors are logged but don't affect UI
     */
    async fetchOrderDetails(orderId) {
        try {
            const orderDetails = await requestService.getOrder(orderId);
            if (!orderDetails.hasError && orderDetails.orderNumber) {
                this.orderNumber = orderDetails.orderNumber;
            }
        }
        catch (error) {
            // Non-critical - just log the error
            console.warn('Could not fetch order details:', error);
        }
    }
    /**
     * Sends confirmation email to customer
     * Non-blocking - errors are logged but don't affect UI
     */
    async sendConfirmationEmail(orderId, email) {
        try {
            const confirmationResult = await requestService.sendConfirmation(orderId, email);
            if (!confirmationResult.hasError && confirmationResult.sent) {
                this.confirmationSent = true;
            }
        }
        catch (error) {
            // Non-critical - just log the error
            console.warn('Could not send confirmation email:', error);
        }
    }
    handleRetry = () => {
        this.submitRequest();
    };
    handleClose = () => {
        // Clear all sessionStorage data (following TEL pattern)
        this.clearSessionStorage();
        // Reset flow state
        flowActions.resetFlow();
        // Notify parent
        this.onCancel?.();
    };
    /**
     * Clears all flow-related sessionStorage keys
     * Calls clear methods from all services and removes all known keys
     */
    clearSessionStorage() {
        console.log('[StepConfirmation] Clearing all sessionStorage data');
        // Clear using service methods (they handle their own keys)
        try {
            cartService.clearCartSession();
            productService.clearProductSession();
            shippingService.clearShippingData();
            paymentService.clearPaymentData();
            plansService.clearPlan();
            flowActions.clearToken();
        }
        catch (e) {
            console.warn('[StepConfirmation] Error clearing service data:', e);
        }
        // Also clear all known keys directly to ensure complete cleanup
        const keysToRemove = [
            // Token/Auth
            'token',
            'correlationId',
            // Location data (Base64 encoded)
            'latitud',
            'longitud',
            'planCodeInternet',
            // Plan data
            'plan',
            'planId',
            'planPrice',
            // Contract data
            'typeContractId',
            'contractInstallment',
            'contractInstallation',
            'contractActivation',
            'contractModen',
            // Cart data
            'cart',
            'cartId',
            'cartTotal',
            'cartProducts',
            'mainId',
            'discountCoupon',
            // Product data
            'selectedProduct',
            'productId',
            'subcatalogId',
            'selectedColor',
            'selectedStorage',
            'childrenId',
            'parentId',
            'deviceType',
            // Shipping data
            'shipmentId',
            'zipCode',
            'shippingAddress',
            'deliveryMethod',
            // Payment data
            'orderBan',
            'paymentResult',
            // Legacy keys (TEL pattern)
            'serviceLatitude',
            'serviceLongitude',
            'serviceAddress',
            'serviceCity',
            'serviceZipCode',
            'serviceType',
            'serviceMessage',
            'planName',
            'planSoc',
            'planFeatures',
            'customerFirstName',
            'customerSecondName',
            'customerLastName',
            'customerSecondLastName',
            'customerIdType',
            'customerIdNumber',
            'customerIdExpiration',
            'customerPhone1',
            'customerPhone2',
            'customerEmail',
            'customerBirthDate',
            'businessName',
            'businessPosition',
            'isExistingCustomer',
            'shoppingCart',
        ];
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
        });
        console.log('[StepConfirmation] SessionStorage cleared successfully');
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    renderLoading() {
        return (index.h("div", { class: "step-confirmation__loading" }, index.h("div", { class: "step-confirmation__spinner" }), index.h("p", null, "Procesando tu solicitud...")));
    }
    renderSuccess() {
        // Prefer orderNumber from getOrder API, fallback to orderId from submit response
        const displayOrderId = this.orderNumber || this.orderId;
        return (index.h("div", { class: "step-confirmation__result step-confirmation__result--success" }, index.h("div", { class: "step-confirmation__icon step-confirmation__icon--success" }, index.h("img", { src: "/assets/images/ok-check.svg", alt: "\u00C9xito" })), index.h("h2", { class: "step-confirmation__title step-confirmation__title--success" }, SUCCESS_MESSAGES.REQUEST_SUCCESS), index.h("p", { class: "step-confirmation__message" }, SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE), displayOrderId && (index.h("p", { class: "step-confirmation__order-id" }, "N\u00FAmero de orden: ", displayOrderId)), this.confirmationSent && (index.h("p", { class: "step-confirmation__email-sent" }, "Se ha enviado un correo de confirmaci\u00F3n a tu email."))));
    }
    renderError() {
        return (index.h("div", { class: "step-confirmation__result step-confirmation__result--error" }, index.h("div", { class: "step-confirmation__icon step-confirmation__icon--error" }, index.h("img", { src: "/assets/images/error-check.svg", alt: "Error" })), index.h("h2", { class: "step-confirmation__title step-confirmation__title--error" }, "\u00A1Lo sentimos, ha ocurrido un error en el proceso de solicitud!"), index.h("p", { class: "step-confirmation__message" }, "En este momento estamos presentando inconvenientes en nuestro sistema.", index.h("br", null), "Por favor, int\u00E9ntalo nuevamente.")));
    }
    render() {
        return (index.h(index.Host, { key: '0a081b0843178190303cce4d47266e6a403d917e' }, index.h("div", { key: '2e789d7b821c0da6f8a97d5e74699f7169ff6195', class: "step-confirmation" }, index.h("header", { key: '57d5358882d30435df30ad4507cb737e866ce613', class: "step-confirmation__header" }, index.h("h1", { key: '233f25820b50000bcfa20ae6047d993cc8ffbb4e', class: "step-confirmation__header-title" }, "Confirmaci\u00F3n de Solicitud")), index.h("div", { key: '0ba5dc1be0b8eb3c371de813a4ef00b77931b388', class: "step-confirmation__content" }, this.status === 'loading' && this.renderLoading(), this.status === 'success' && this.renderSuccess(), this.status === 'error' && this.renderError()), this.status === 'success' && (index.h("div", { key: '29ca086c51fd73e7f2d93ab8878d18bd7a2e03cc', class: "step-confirmation__actions" }, index.h("button", { key: 'f36b14052cc1e0f46c77e24136b189e907decc2f', class: "step-confirmation__btn", onClick: this.handleClose }, "Cerrar"))), this.status === 'error' && (index.h("div", { key: '850c7c645536e4b2cbb08074acecb366db1068b7', class: "step-confirmation__actions" }, index.h("button", { key: '0975292274d5e61aa745fc619b09a0973e25cb90', class: "step-confirmation__btn step-confirmation__btn--error", onClick: this.handleRetry }, "Volver a intentar"))))));
    }
};
StepConfirmation.style = stepConfirmationCss();

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

const stepContractCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-contract{width:100%}.step-contract__header{display:flex;align-items:center;justify-content:space-between;padding-bottom:1rem;margin-bottom:1rem;border-bottom:1px solid #CCCCCC;box-shadow:0 1px 2px rgba(0, 0, 0, 0.05)}.step-contract__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-contract__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-contract__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-contract__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-contract__btn-back{height:40px}.step-contract__tabs{display:flex;margin-bottom:1.5rem;background:#FFFFFF;border-radius:0 0 0.75rem 0.75rem;box-shadow:0 2px 4px rgba(0, 0, 0, 0.08);overflow:hidden}.step-contract__tab{flex:1;padding:1.25rem 1rem;background:transparent;border:none;cursor:pointer;text-align:center;position:relative;transition:all 150ms ease}.step-contract__tab:first-child{border-right:1px solid #E5E5E5}.step-contract__tab::after{content:"";position:absolute;bottom:0;left:0;right:0;height:4px;background:transparent;transition:background-color 150ms ease}.step-contract__tab--active::after{background:#0097A9}.step-contract__tab:hover:not(.step-contract__tab--active){background:#FAFAFA}.step-contract__tab-title{display:block;font-size:1rem;font-weight:700;color:#333333;margin-bottom:0.25rem}.step-contract__tab-subtitle{display:block;font-size:0.875rem;color:#666666;line-height:1.5}.step-contract__options{display:flex;flex-direction:column;gap:1rem;align-items:center}@media (min-width: 768px){.step-contract__options{flex-direction:row;justify-content:center}}.step-contract__options--single{justify-content:center}.step-contract__option{flex:0 0 auto;width:280px;display:flex;align-items:center;padding:1rem 1.25rem;background:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;position:relative;overflow:hidden}@media (max-width: 767px){.step-contract__option{width:100%;max-width:320px}}.step-contract__option::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#CCCCCC;border-radius:0.75rem 0 0 0.75rem;transition:background-color 150ms ease}.step-contract__option input[type=radio]{width:20px;height:20px;margin-right:0.75rem;accent-color:#0097A9;flex-shrink:0}.step-contract__option:hover{border-color:#999999}.step-contract__option--selected::before{background:#0097A9}.step-contract__option-content{flex:1;display:flex;flex-direction:column;gap:0.25rem}.step-contract__option-title{display:block;font-size:1rem;font-weight:600;color:#333333;line-height:1.35}.step-contract__option-price{display:block;font-size:0.875rem;color:#666666}.step-contract__option-price strong,.step-contract__option-price b{font-weight:600}.step-contract__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-contract__btn-continue{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-continue:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-continue{height:48px;background-color:#DA291C;color:#FFFFFF}.step-contract__btn-continue:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-contract__btn-continue:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-contract__btn-continue{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-contract__btn-continue:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-contract__btn-continue:disabled:hover{background-color:#999999;border-color:#999999}.step-contract__btn-back-mobile{display:none;width:100%;margin-top:1rem;padding:0.5rem;background:transparent;border:none;color:#0097A9;font-size:1rem;cursor:pointer;text-decoration:none;text-align:center}.step-contract__btn-back-mobile:hover{text-decoration:underline}@media (max-width: 767px){.step-contract{padding:0 1rem}.step-contract__header{flex-direction:column;align-items:flex-start;gap:0.5rem;padding-bottom:0.75rem;margin-bottom:1rem}.step-contract__header .step-contract__title{font-size:1.25rem;line-height:1.35}.step-contract__header .step-contract__btn-back{order:-1;height:auto;padding:0.5rem 0;border:none;background:transparent;color:#0097A9;font-size:0.875rem}.step-contract__header .step-contract__btn-back:hover{background:transparent;text-decoration:underline}.step-contract__tabs{margin-bottom:1rem}.step-contract__tab{padding:0.75rem 0.5rem}.step-contract__tab-title{font-size:0.875rem}.step-contract__tab-subtitle{font-size:0.75rem;line-height:1.35}.step-contract__options{padding:0}.step-contract__option{width:100%;max-width:none}.step-contract__actions{margin-top:1rem;padding-top:1rem}.step-contract__btn-continue{width:100%;min-width:auto}.step-contract__btn-back-mobile{display:block}.step-contract__btn-back{display:none}}`;

const StepContract = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    activeTab = 1; // 1 = Con contrato
    selectedOption = null;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        // Restaurar selección previa si existe (cuando el usuario vuelve a este paso)
        this.restorePreviousSelection();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    /**
     * Restaura la selección previa desde el store o sessionStorage
     * Esto permite mantener la selección cuando el usuario navega hacia atrás
     */
    restorePreviousSelection() {
        // Primero intentar desde el store
        if (state.selectedContract) {
            this.selectedOption = state.selectedContract;
            this.activeTab = state.selectedContract.typeId;
            return;
        }
        // Si no está en el store, intentar desde sessionStorage
        const typeContractId = sessionStorage.getItem('typeContractId');
        if (typeContractId !== null) {
            const typeId = parseInt(typeContractId);
            const deadlines = parseInt(sessionStorage.getItem('contractInstallment') || '0');
            const installation = parseInt(sessionStorage.getItem('contractInstallation') || '0');
            const activation = parseInt(sessionStorage.getItem('contractActivation') || '0');
            const modem = parseInt(sessionStorage.getItem('contractModen') || '0');
            const contractType = CONTRACT_OPTIONS.find(c => c.typeId === typeId);
            this.selectedOption = {
                typeId,
                typeName: contractType?.type || '',
                deadlines,
                installation,
                activation,
                modem,
            };
            this.activeTab = typeId;
            // Sincronizar con el store
            flowActions.setContract(this.selectedOption);
        }
    }
    handleTabChange = (typeId) => {
        this.activeTab = typeId;
        // No limpiar la selección si ya hay una del mismo tipo
        if (this.selectedOption?.typeId !== typeId) {
            this.selectedOption = null;
        }
    };
    handleSelectOption = (typeId, option) => {
        const contractType = CONTRACT_OPTIONS.find(c => c.typeId === typeId);
        this.selectedOption = {
            typeId,
            typeName: contractType?.type || '',
            deadlines: option.deadlines,
            installation: option.installation,
            activation: option.activation,
            modem: option.modem,
        };
        flowActions.setContract(this.selectedOption);
    };
    handleContinue = () => {
        if (this.selectedOption) {
            this.onNext?.();
        }
    };
    /**
     * Calcula el costo total de instalación (instalación + activación + modem)
     * Este es el valor que se muestra en la UI según el diseño de referencia
     */
    getTotalInstallationCost(option) {
        return option.installation + option.activation + option.modem;
    }
    /**
     * Formatea la duración del contrato para mostrar en la card
     * Ej: "12 Meses de Contrato", "24 Meses de Contrato", "Sin contrato"
     */
    formatContractLabel(months) {
        if (months === 0)
            return 'Sin contrato';
        return `${months} Meses de Contrato`;
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const withContract = CONTRACT_OPTIONS.find(c => c.typeId === 1);
        const withoutContract = CONTRACT_OPTIONS.find(c => c.typeId === 0);
        return (index.h(index.Host, { key: '73b98b5cf5d386bb18c0b9a87de1ee94f522ae06' }, index.h("div", { key: 'da718e5fa4e5e9bd81c9e8c36b3535678d49b205', class: "step-contract" }, index.h("header", { key: '40fda6a530e609dda8a9b20bdcbf64d765767491', class: "step-contract__header" }, index.h("h1", { key: '8c1ff3fd242f2a6cb27e01a987a6df0ef4199b00', class: "step-contract__title" }, "Selecciona un tipo de contrato"), index.h("button", { key: 'bf9aa661368be724e6b1521663289fbfa3b9d433', class: "step-contract__btn-back", onClick: this.onBack }, "Regresar")), index.h("div", { key: '7fef8469c756a814a1d233c00f090e545c487c96', class: "step-contract__tabs" }, index.h("button", { key: '949bd4bc3bbb1ccbaf5bf29e6fde2f49bbbf15a7', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
            }, onClick: () => this.handleTabChange(1) }, index.h("span", { key: '54a89fcfdb912495a4955c73cd62ac25fd71c69e', class: "step-contract__tab-title" }, "Con contrato"), index.h("span", { key: '1daa33b5cb332fc2feb94f80694405f560b6b1eb', class: "step-contract__tab-subtitle" }, "12 y 24 meses de contrato")), index.h("button", { key: 'f701fb3b4d46661df2e1ca2d0016926b4507e356', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
            }, onClick: () => this.handleTabChange(0) }, index.h("span", { key: '5ac2103a653ebf3cc0d64d29b351c5ebe27ff855', class: "step-contract__tab-title" }, "Sin contrato"), index.h("span", { key: '5f959ccb57f11053f15f68f2ce3fb23805a0188b', class: "step-contract__tab-subtitle" }, "Plan mensual con pago por adelantado"))), index.h("div", { key: 'c19ec6ec322d7547eb1afcbb860297ee4912d172', class: "step-contract__content" }, this.activeTab === 1 && withContract && (index.h("div", { key: 'fa0e33d74261a223ede9a349330420eb02b7afe9', class: "step-contract__options" }, withContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (index.h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.deadlines === option.deadlines &&
                        this.selectedOption?.typeId === 1,
                } }, index.h("input", { type: "radio", name: "contract", checked: this.selectedOption?.deadlines === option.deadlines &&
                    this.selectedOption?.typeId === 1, onChange: () => this.handleSelectOption(1, option) }), index.h("div", { class: "step-contract__option-content" }, index.h("span", { class: "step-contract__option-title" }, this.formatContractLabel(option.deadlines)), index.h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", totalCost > 0 ? formatPrice(totalCost) : '$0.00'))));
        }))), this.activeTab === 0 && withoutContract && (index.h("div", { key: '960c31f56eb79aee44ece402f81bce7aae7563fc', class: "step-contract__options step-contract__options--single" }, withoutContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (index.h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.typeId === 0,
                } }, index.h("input", { type: "radio", name: "contract", checked: this.selectedOption?.typeId === 0, onChange: () => this.handleSelectOption(0, option) }), index.h("div", { class: "step-contract__option-content" }, index.h("span", { class: "step-contract__option-title" }, "Sin contrato"), index.h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", formatPrice(totalCost)))));
        })))), index.h("div", { key: 'c4a7e733a3059a8240741de67386417fedc53dc6', class: "step-contract__actions" }, index.h("button", { key: '27ba1b393678129d75dd67bef3d08346e5d6a718', class: "step-contract__btn-continue", onClick: this.handleContinue, disabled: !this.selectedOption }, "Continuar"), index.h("button", { key: '629f3ae675dee5c469bc381123d6f42c805b54a9', type: "button", class: "step-contract__btn-back-mobile", onClick: this.onBack }, "Regresar")))));
    }
};
StepContract.style = stepContractCss();

// ============================================
// VALIDATORS - Form Validation Utilities
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// VALIDATION MESSAGES
// ------------------------------------------
const VALIDATION_MESSAGES = {
    required: 'Este campo es requerido',
    minLength: (min) => `Debe tener al menos ${min} caracteres`,
    maxLength: (max) => `No puede exceder ${max} caracteres`,
    email: 'Ingrese un correo electrónico válido',
    phone: 'Ingrese un número de teléfono válido (10 dígitos)',
    zipCode: 'Ingrese un código postal válido (5 dígitos)',
    date: 'Ingrese una fecha válida',
    futureDate: 'La fecha debe ser futura',
    identification: 'La identificación debe tener al menos 10 caracteres',
    numeric: 'Solo se permiten números',
    alphanumeric: 'Solo se permiten letras y números',
};
// ------------------------------------------
// VALIDATION FUNCTIONS
// ------------------------------------------
/**
 * Creates a successful validation result
 */
const valid = () => ({
    isValid: true,
    message: '',
});
/**
 * Creates a failed validation result
 */
const invalid = (message) => ({
    isValid: false,
    message,
});
/**
 * Required field validator
 */
const required = (value) => {
    if (!value || value.trim() === '') {
        return invalid(VALIDATION_MESSAGES.required);
    }
    return valid();
};
/**
 * Minimum length validator
 */
const minLength = (min) => {
    return (value) => {
        if (value && value.length < min) {
            return invalid(VALIDATION_MESSAGES.minLength(min));
        }
        return valid();
    };
};
/**
 * Email validator
 */
const email = (value) => {
    if (!value)
        return valid();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return invalid(VALIDATION_MESSAGES.email);
    }
    return valid();
};
/**
 * Phone number validator (Puerto Rico format - 10 digits)
 */
const phone = (value) => {
    if (!value)
        return valid();
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) {
        return invalid(VALIDATION_MESSAGES.phone);
    }
    return valid();
};
/**
 * Zip code validator (5 digits)
 */
const zipCode = (value) => {
    if (!value)
        return valid();
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(value)) {
        return invalid(VALIDATION_MESSAGES.zipCode);
    }
    return valid();
};
/**
 * Date validator (YYYY-MM-DD format)
 */
const date = (value) => {
    if (!value)
        return valid();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
        return invalid(VALIDATION_MESSAGES.date);
    }
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
        return invalid(VALIDATION_MESSAGES.date);
    }
    return valid();
};
/**
 * Future date validator
 */
const futureDate = (value) => {
    if (!value)
        return valid();
    const dateResult = date(value);
    if (!dateResult.isValid)
        return dateResult;
    const dateObj = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj <= today) {
        return invalid(VALIDATION_MESSAGES.futureDate);
    }
    return valid();
};
/**
 * Identification validator (min 10 characters)
 */
const identification = (value) => {
    if (!value)
        return valid();
    if (value.length < 10) {
        return invalid(VALIDATION_MESSAGES.identification);
    }
    return valid();
};
// ------------------------------------------
// COMPOSITE VALIDATORS
// ------------------------------------------
/**
 * Combines multiple validators
 */
const compose = (...validators) => {
    return (value) => {
        for (const validator of validators) {
            const result = validator(value);
            if (!result.isValid) {
                return result;
            }
        }
        return valid();
    };
};
// ------------------------------------------
// FIELD VALIDATORS (Pre-configured)
// ------------------------------------------
const fieldValidators = {
    firstName: compose(required, minLength(3)),
    lastName: compose(required, minLength(3)),
    secondLastName: compose(required, minLength(3)),
    identificationNumber: compose(required, identification),
    identificationExpiration: compose(required, futureDate),
    phone1: compose(required, phone),
    phone2: phone, // Optional
    email: compose(required, email),
    businessName: required,
    position: required,
    address: required,
    city: required,
    zipCode: compose(required, zipCode),
};

const stepFormCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-form{width:100%;max-width:800px;margin:0 auto}.step-form__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #E5E5E5}.step-form__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-form__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-form__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-form__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-form__btn-back{height:40px}.step-form__stepper{display:none;margin-bottom:1.5rem;padding:1rem 0}@media (max-width: 767px){.step-form__stepper{display:block}}.step-form form{border:1px solid #E5E5E5;border-radius:0.75rem;padding:1.5rem;background:white}.step-form__instructions{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0;background:transparent}.step-form__section{margin-bottom:1.5rem;padding-bottom:0.5rem}.step-form__row{display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1rem}@media (min-width: 768px){.step-form__row{grid-template-columns:1fr 1fr}}.step-form__row:last-child{margin-bottom:0}.step-form__field{display:flex;flex-direction:column}@media (min-width: 768px){.step-form__field--id{grid-column:span 1}}.step-form__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.step-form__label .required{color:#DA291C}.step-form__required{color:#333333;margin-right:0.25rem}.step-form__input{width:100%;height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease}.step-form__input::placeholder{color:#999999}.step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__input:disabled{background-color:#F5F5F5;cursor:not-allowed}.step-form__input.error{border-color:#DA291C}.step-form__input.error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__input--error{border-color:#DA291C}.step-form__input--error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__error{margin-top:0.25rem;font-size:0.75rem;color:#DA291C}.step-form__id-row{display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 768px){.step-form__id-row{flex-direction:row;align-items:flex-start}.step-form__id-row input[type=text].step-form__input{flex:1}}.step-form__id-row input[type=text].step-form__input{margin-top:4px;width:100%;height:44px;min-height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;box-sizing:border-box;appearance:none;-webkit-appearance:none}.step-form__id-row input[type=text].step-form__input::placeholder{color:#999999}.step-form__id-row input[type=text].step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__radio-group{display:flex;flex-direction:row;align-items:flex-start;gap:1rem}.step-form__radio-group--horizontal{flex-direction:row;gap:1rem}.step-form__radio{display:flex;align-items:flex-start;gap:0.25rem;font-size:0.875rem;font-weight:400;line-height:1.5;color:#333333;cursor:pointer;max-width:90px;line-height:1.2;margin-top:14px}.step-form__radio input[type=radio]{accent-color:#0097A9;margin-top:2px;flex-shrink:0}.step-form__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-form__btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-submit:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-submit{height:48px;background-color:#DA291C;color:#FFFFFF}.step-form__btn-submit:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-form__btn-submit:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-form__btn-submit{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-form__btn-submit:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-form__btn-submit:disabled:hover{background-color:#999999;border-color:#999999}@media (max-width: 767px){.step-form__btn-submit{width:100%;min-width:auto}}.step-form__btn-back-mobile{display:none;width:100%;margin-top:1rem;padding:0.5rem;background:transparent;border:none;color:#0097A9;font-size:1rem;cursor:pointer;text-decoration:none;text-align:center}.step-form__btn-back-mobile:hover{text-decoration:underline}@media (max-width: 767px){.step-form__header{flex-direction:column;align-items:flex-start;gap:0.75rem}.step-form__header .step-form__title{font-size:1.25rem;order:1}.step-form__header .step-form__btn-back{order:2;align-self:flex-start;height:auto;padding:0.5rem 0;border:none;background:transparent;color:#0097A9;font-size:0.875rem}.step-form__header .step-form__btn-back:hover{background:transparent;text-decoration:underline}.step-form form{padding:1rem}.step-form__instructions{font-size:0.875rem}.step-form__row{grid-template-columns:1fr}.step-form__id-row{flex-direction:column;gap:0.75rem}.step-form__id-row .step-form__input{width:100%;margin-top:0}.step-form__actions{padding-top:1rem;margin-top:1rem}.step-form__btn-back-mobile{display:block}.step-form__btn-back{display:none}}`;

// Mobile breakpoint (matches $breakpoint-md in variables.scss)
const MOBILE_BREAKPOINT = 768;
// Steps configuration for ui-stepper
const FORM_STEPS = [
    { label: 'Identificación' },
    { label: 'Contacto' },
];
const StepForm = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    formData = {
        personal: {
            firstName: '',
            secondName: '',
            lastName: '',
            secondLastName: '',
            identificationType: 'license',
            identificationNumber: '',
            identificationExpiration: '',
            phone1: '',
            phone2: '',
            email: '',
        },
        business: {
            businessName: '',
            position: '',
        },
        address: {
            address: state.location?.address || '',
            city: state.location?.city || '',
            zipCode: state.location?.zipCode || '',
        },
        isExistingCustomer: false,
    };
    errors = {};
    touched = {};
    /** Current form section (mobile only) */
    currentSection = 'identification';
    /** Whether we're in mobile view */
    isMobile = false;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.checkMobile();
        window.addEventListener('resize', this.handleResize);
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
    }
    // ------------------------------------------
    // MOBILE DETECTION
    // ------------------------------------------
    handleResize = () => {
        this.checkMobile();
    };
    checkMobile() {
        this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    }
    // ------------------------------------------
    // SECTION MANAGEMENT
    // ------------------------------------------
    /** Get current step number (1-indexed) for stepper */
    getCurrentStepNumber() {
        return this.currentSection === 'identification' ? 1 : 2;
    }
    /** Fields in identification section */
    getIdentificationFields() {
        return [
            { field: 'firstName', value: this.formData.personal.firstName },
            { field: 'lastName', value: this.formData.personal.lastName },
            { field: 'secondLastName', value: this.formData.personal.secondLastName },
            { field: 'identificationNumber', value: this.formData.personal.identificationNumber },
            { field: 'identificationExpiration', value: this.formData.personal.identificationExpiration },
        ];
    }
    /** Fields in contact section */
    getContactFields() {
        return [
            { field: 'phone1', value: this.formData.personal.phone1 },
            { field: 'email', value: this.formData.personal.email },
            { field: 'businessName', value: this.formData.business.businessName },
            { field: 'position', value: this.formData.business.position },
            { field: 'address', value: this.formData.address.address },
            { field: 'city', value: this.formData.address.city },
            { field: 'zipCode', value: this.formData.address.zipCode },
        ];
    }
    /** Validate identification section fields */
    isIdentificationValid() {
        for (const { field, value } of this.getIdentificationFields()) {
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    return false;
                }
            }
        }
        return true;
    }
    /** Validate contact section fields */
    isContactValid() {
        for (const { field, value } of this.getContactFields()) {
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    return false;
                }
            }
        }
        return true;
    }
    /** Mark identification fields as touched and validate */
    validateIdentificationSection() {
        const fields = this.getIdentificationFields();
        let isValid = true;
        const newTouched = { ...this.touched };
        const newErrors = { ...this.errors };
        for (const { field, value } of fields) {
            newTouched[field] = true;
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    isValid = false;
                    newErrors[field] = result.message;
                }
                else {
                    delete newErrors[field];
                }
            }
        }
        this.touched = newTouched;
        this.errors = newErrors;
        return isValid;
    }
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleInput = (section, field) => (e) => {
        const target = e.target;
        let value = target.value;
        // Format phone numbers
        if (field === 'phone1' || field === 'phone2') {
            value = unformatPhone(value);
        }
        this.formData = {
            ...this.formData,
            [section]: {
                ...this.formData[section],
                [field]: value,
            },
        };
        // Mark as touched
        this.touched = { ...this.touched, [field]: true };
        // Validate field
        this.validateField(field, value);
    };
    handleRadioChange = (field, value) => {
        if (field === 'identificationType') {
            this.formData = {
                ...this.formData,
                personal: {
                    ...this.formData.personal,
                    identificationType: value,
                },
            };
        }
        else if (field === 'isExistingCustomer') {
            this.formData = {
                ...this.formData,
                isExistingCustomer: value,
            };
        }
    };
    validateField(field, value) {
        const validator = fieldValidators[field];
        if (!validator)
            return { isValid: true, message: '' };
        const result = validator(value);
        if (!result.isValid) {
            this.errors = { ...this.errors, [field]: result.message };
        }
        else {
            const { [field]: _, ...rest } = this.errors;
            this.errors = rest;
        }
        return result;
    }
    getFieldsToValidate() {
        return [
            { field: 'firstName', value: this.formData.personal.firstName },
            { field: 'lastName', value: this.formData.personal.lastName },
            { field: 'secondLastName', value: this.formData.personal.secondLastName },
            { field: 'identificationNumber', value: this.formData.personal.identificationNumber },
            { field: 'identificationExpiration', value: this.formData.personal.identificationExpiration },
            { field: 'phone1', value: this.formData.personal.phone1 },
            { field: 'email', value: this.formData.personal.email },
            { field: 'businessName', value: this.formData.business.businessName },
            { field: 'position', value: this.formData.business.position },
            { field: 'address', value: this.formData.address.address },
            { field: 'city', value: this.formData.address.city },
            { field: 'zipCode', value: this.formData.address.zipCode },
        ];
    }
    /**
     * Verifica si el formulario es válido sin modificar el estado de errores.
     * Se usa para habilitar/deshabilitar el botón Continuar.
     */
    isFormValid() {
        for (const { field, value } of this.getFieldsToValidate()) {
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Check if current section is valid (for mobile button state)
     */
    isCurrentSectionValid() {
        if (!this.isMobile) {
            return this.isFormValid();
        }
        if (this.currentSection === 'identification') {
            return this.isIdentificationValid();
        }
        else {
            return this.isContactValid();
        }
    }
    validateForm() {
        const fieldsToValidate = this.getFieldsToValidate();
        let isValid = true;
        const newErrors = {};
        for (const { field, value } of fieldsToValidate) {
            const result = this.validateField(field, value);
            if (!result.isValid) {
                isValid = false;
                newErrors[field] = result.message;
            }
        }
        this.errors = newErrors;
        return isValid;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        // In mobile, handle section navigation
        if (this.isMobile) {
            if (this.currentSection === 'identification') {
                // Validate identification section and move to contact
                if (this.validateIdentificationSection()) {
                    this.currentSection = 'contact';
                }
                return;
            }
            // In contact section, validate all and submit
        }
        // Mark all fields as touched
        this.touched = {
            firstName: true,
            lastName: true,
            secondLastName: true,
            identificationNumber: true,
            identificationExpiration: true,
            phone1: true,
            email: true,
            businessName: true,
            position: true,
            address: true,
            city: true,
            zipCode: true,
        };
        if (this.validateForm()) {
            flowActions.setFormData(this.formData);
            this.onNext?.();
        }
    };
    handleBack = () => {
        // In mobile, navigate between sections first
        if (this.isMobile && this.currentSection === 'contact') {
            this.currentSection = 'identification';
            return;
        }
        // Otherwise, go back to previous step
        this.onBack?.();
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderInput(label, field, section, value, options = {}) {
        const { type = 'text', placeholder = '', required = false, disabled = false } = options;
        const hasError = this.touched[field] && this.errors[field];
        const displayValue = (field === 'phone1' || field === 'phone2') ? formatPhone(value) : value;
        return (index.h("div", { class: "step-form__field" }, index.h("label", { class: "step-form__label" }, required && index.h("span", { class: "step-form__required" }, "*"), label, ":"), index.h("input", { type: type, class: { 'step-form__input': true, 'step-form__input--error': !!hasError }, value: displayValue, placeholder: placeholder, disabled: disabled, onInput: this.handleInput(section, field) }), hasError && index.h("span", { class: "step-form__error" }, this.errors[field])));
    }
    // ------------------------------------------
    // SECTION RENDERERS
    // ------------------------------------------
    /** Render identification section (mobile step 1) */
    renderIdentificationSection() {
        return (index.h("div", { class: "step-form__section" }, index.h("div", { class: "step-form__row" }, this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
            placeholder: 'Ingrese nombre',
            required: true,
        }), this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
            placeholder: 'Ingrese segundo nombre (Opcional)',
        })), index.h("div", { class: "step-form__row" }, this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
            placeholder: 'Ingrese apellido',
            required: true,
        }), this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
            placeholder: 'Ingrese segundo apellido',
            required: true,
        })), index.h("div", { class: "step-form__row" }, index.h("div", { class: "step-form__field step-form__field--id" }, index.h("label", { class: "step-form__label" }, index.h("span", { class: "step-form__required" }, "*"), "Identificaci\u00F3n:"), index.h("div", { class: "step-form__id-row" }, index.h("div", { class: "step-form__radio-group" }, index.h("label", { class: "step-form__radio" }, index.h("input", { type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'license', onChange: () => this.handleRadioChange('identificationType', 'license') }), "Licencia de conducir"), index.h("label", { class: "step-form__radio" }, index.h("input", { type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'passport', onChange: () => this.handleRadioChange('identificationType', 'passport') }), "Pasaporte")), index.h("input", { type: "text", class: { 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }, value: this.formData.personal.identificationNumber, placeholder: "Ingrese nro de identificaci\u00F3n", onInput: this.handleInput('personal', 'identificationNumber') })), this.touched['identificationNumber'] && this.errors['identificationNumber'] && (index.h("span", { class: "step-form__error" }, this.errors['identificationNumber']))), this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
            type: 'date',
            required: true,
        }))));
    }
    /** Render contact section (mobile step 2) */
    renderContactSection() {
        return [
            index.h("div", { class: "step-form__section" }, index.h("div", { class: "step-form__row" }, this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
                type: 'tel',
                placeholder: 'Ingrese nro de teléfono',
                required: true,
            }), this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
                type: 'tel',
                placeholder: 'Ingrese nro de teléfono',
            }))),
            /* Business Information */
            index.h("div", { class: "step-form__section" }, index.h("div", { class: "step-form__row" }, this.renderInput('Nombre legal de Empresa (según IRS)', 'businessName', 'business', this.formData.business.businessName, {
                placeholder: 'Ingresar nombre legal de empresa',
                required: true,
            }), this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
                placeholder: 'Ingrese posición actual',
                required: true,
            }))),
            /* Address */
            index.h("div", { class: "step-form__section" }, index.h("div", { class: "step-form__row" }, this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
                placeholder: 'Ingrese dirección',
                required: true,
            }), this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
                placeholder: 'Ingrese ciudad',
                required: true,
            })), index.h("div", { class: "step-form__row" }, this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
                placeholder: 'Ingrese código postal',
                required: true,
            }), this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
                type: 'email',
                placeholder: 'Ingrese correo electrónico',
                required: true,
            }))),
            /* Existing Customer */
            index.h("div", { class: "step-form__section" }, index.h("div", { class: "step-form__field" }, index.h("label", { class: "step-form__label" }, index.h("span", { class: "step-form__required" }, "*"), "Cliente existente de Claro PR:"), index.h("div", { class: "step-form__radio-group step-form__radio-group--horizontal" }, index.h("label", { class: "step-form__radio" }, index.h("input", { type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === true, onChange: () => this.handleRadioChange('isExistingCustomer', true) }), "S\u00ED"), index.h("label", { class: "step-form__radio" }, index.h("input", { type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === false, onChange: () => this.handleRadioChange('isExistingCustomer', false) }), "No")))),
        ];
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const currentStepNumber = this.getCurrentStepNumber();
        return (index.h(index.Host, { key: '0ff3baeb8d758c4ab60d3af46716223f9cc41dbb' }, index.h("div", { key: 'b7c5b885e03241a732c5e234bf059d3d7f001372', class: "step-form" }, index.h("header", { key: '5d149adc54d4e3c36abc554476aa0774d77dd2f8', class: "step-form__header" }, index.h("h1", { key: '7824074ec9cfebc87d57159953874a854c5849c4', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), index.h("button", { key: '554400631442f25b7b9ae8c0c21fcc793672ae66', type: "button", class: "step-form__btn-back", onClick: this.handleBack }, "Regresar")), this.isMobile && (index.h("div", { key: 'ab28ab7cbcac54cf0a0c2c0e11b13c7289cdb18f', class: "step-form__stepper" }, index.h("ui-stepper", { key: '6575f57a4351c8a586e612ea0dc05ad38b3d56c9', steps: FORM_STEPS, currentStep: currentStepNumber }))), index.h("form", { key: 'c9af47b6e343737b09412ba09500bed39a1c47d8', onSubmit: this.handleSubmit }, index.h("p", { key: '47578d738b67c231804db4c961cac430e1d9c57d', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), !this.isMobile && ([
            this.renderIdentificationSection(),
            ...this.renderContactSection(),
        ]), this.isMobile && this.currentSection === 'identification' && (this.renderIdentificationSection()), this.isMobile && this.currentSection === 'contact' && (this.renderContactSection()), index.h("div", { key: '67dcdd884f9778fce2b9844b8e9bd2f5b78bb390', class: "step-form__actions" }, index.h("button", { key: 'e4da19eb9543cdf255b6caf882f5eb4f17dd2c87', type: "submit", class: "step-form__btn-submit", disabled: !this.isCurrentSectionValid() }, "Continuar"), index.h("button", { key: 'f517b1101d80971753a7176113f18be80ae36a4b', type: "button", class: "step-form__btn-back-mobile", onClick: this.handleBack }, "Regresar"))))));
    }
};
StepForm.style = stepFormCss();

const stepLocationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-location{width:100%;position:relative}.step-location__validating-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.9);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn 0.2s ease-out}.step-location__validating-content{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem;background:#FFFFFF;border-radius:16px;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__validating-spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}.step-location__validating-text{margin:0;font-size:18px;font-weight:600;color:#333333}.step-location__header{text-align:center;margin-bottom:1rem}.step-location__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;font-weight:400}.step-location__title--highlight{color:#DA291C;font-weight:700}.step-location__map-container{position:relative;border-radius:0.75rem;overflow:hidden;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08)}.step-location__controls{position:absolute;top:3.5rem;left:0.75rem;right:0.75rem;z-index:1;display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 576px){.step-location__controls{left:120px;right:50px}}@media (min-width: 768px){.step-location__controls{top:3.5rem;left:130px;right:60px}}.step-location__input-group{display:flex;align-items:center;background:#FFFFFF;border-radius:10px;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);overflow:hidden;border:1px solid #E5E5E5}.step-location__input-icon{display:flex;align-items:center;justify-content:center;padding-left:0.75rem;color:#999999}.step-location__input-icon svg{width:20px;height:20px}.step-location__input{flex:1;padding:0.75rem 0.75rem;border:none;font-size:0.875rem;outline:none;background:transparent;min-width:0}.step-location__input::placeholder{color:#999999}.step-location__btn-validate{padding:0.75rem 1.25rem;background:#DA291C;color:#FFFFFF;border:none;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background-color 150ms ease;white-space:nowrap;min-width:100px}.step-location__btn-validate:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-location__btn-validate:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-validate--loading{pointer-events:none}.step-location__btn-validate-content{display:inline-flex;align-items:center;gap:0.5rem}.step-location__btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:btn-spin 0.8s linear infinite}@keyframes btn-spin{to{transform:rotate(360deg)}}.step-location__btn-location{display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;background:#0097A9;color:#FFFFFF;border:none;border-radius:0.25rem;font-size:0.75rem;font-weight:500;cursor:pointer;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);transition:background-color 150ms ease;white-space:nowrap;align-self:flex-start}.step-location__btn-location:hover:not(:disabled){background:rgb(0, 114.5455621302, 128.2)}.step-location__btn-location:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-location-icon{width:16px;height:16px}.step-location__map{position:relative;width:100%;height:400px;background:#E5E5E5}@media (min-width: 768px){.step-location__map{height:500px}}.step-location__map-canvas{width:100%;height:100%}.step-location__map-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5}.step-location__map-loading p{font-size:1rem;font-weight:400;line-height:1.5;margin-top:1rem}.step-location__map-error{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5;padding:1rem;text-align:center}.step-location__map-error p{font-size:1rem;font-weight:400;line-height:1.5;color:#DA291C}.step-location__map-error small{margin-top:0.5rem;font-size:0.75rem}.step-location__spinner{width:40px;height:40px;border:3px solid #CCCCCC;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-location__map-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:#666666}.step-location__map-placeholder p{font-size:1rem;font-weight:400;line-height:1.5}.step-location__map-placeholder small{margin-top:0.5rem;font-size:0.75rem}.step-location__modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);z-index:400;display:flex;align-items:center;justify-content:center}.step-location__modal{position:relative;width:90%;max-width:400px;background:#FFFFFF;border-radius:0.75rem;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__modal--error .step-location__modal-error-bar{display:block}.step-location__modal-close{position:absolute;top:0.75rem;right:0.75rem;width:32px;height:32px;background:transparent;border:none;font-size:1.5rem;color:#666666;cursor:pointer;line-height:1}.step-location__modal-close:hover{color:#333333}.step-location__modal-error-bar{display:none;background:#DA291C;color:#FFFFFF;padding:0.5rem 1rem;margin:-2rem -1.5rem 1rem;font-weight:600}.step-location__modal-success-icon{width:60px;height:60px;margin:0 auto 1rem;color:#44AF69}.step-location__modal-success-icon svg{width:100%;height:100%}.step-location__modal-message{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;margin-bottom:1.5rem}.step-location__modal-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-location__modal-btn:disabled{opacity:0.5;cursor:not-allowed}.step-location__modal-btn{height:48px;background-color:#0097A9;color:#FFFFFF}.step-location__modal-btn:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-location__modal-btn:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}.step-location__modal-btn{min-width:150px}`;

const StepLocation = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    get el() { return index.getElement(this); }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    googleMapsKey;
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    address = '';
    isValidating = false;
    isLoadingMap = true;
    isGettingLocation = false;
    locationData = null;
    mapError = null;
    currentCoordinates = null;
    geocodeResult = null;
    showErrorModal = false;
    errorMessage = '';
    // ------------------------------------------
    // REFS
    // ------------------------------------------
    mapContainer;
    addressInput;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentDidLoad() {
        await this.initializeMap();
    }
    disconnectedCallback() {
        mapsService.destroy();
    }
    // ------------------------------------------
    // MAP INITIALIZATION
    // ------------------------------------------
    async initializeMap() {
        if (!this.googleMapsKey) {
            this.mapError = 'Google Maps API key no configurada';
            this.isLoadingMap = false;
            return;
        }
        try {
            mapsService.setApiKey(this.googleMapsKey);
            // Initialize map
            await mapsService.initMap(this.mapContainer);
            // Initialize autocomplete on address input
            if (this.addressInput) {
                await mapsService.initAutocomplete(this.addressInput, (result) => {
                    this.handlePlaceSelected(result);
                });
            }
            // Add map click listener (like TEL: this.map.addListener("click", ...))
            mapsService.addMapClickListener(async (coordinates) => {
                await this.handleMapClick(coordinates);
            });
            this.isLoadingMap = false;
        }
        catch (error) {
            console.error('Error initializing map:', error);
            this.mapError = 'Error al cargar Google Maps';
            this.isLoadingMap = false;
        }
    }
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleAddressChange = (e) => {
        this.address = e.target.value;
    };
    /**
     * Handles keypress on address input (like TEL: inputText.addEventListener("keypress", ...))
     * Triggers validation when Enter is pressed
     */
    handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
            e.preventDefault();
            this.handleValidate();
        }
    };
    /**
     * Handles click on map (like TEL: this.map.addListener("click", ...))
     * Reverse geocodes the clicked location and validates coverage
     */
    handleMapClick = async (coordinates) => {
        // Clear previous marker
        mapsService.clear();
        // Reverse geocode the clicked location
        const result = await mapsService.reverseGeocode(coordinates);
        if (result) {
            this.geocodeResult = result;
            this.address = result.formattedAddress || result.address;
            this.currentCoordinates = result.coordinates;
            // Update map marker
            mapsService.setMarker(result.coordinates);
        }
        else {
            // If reverse geocode fails, still set coordinates
            this.currentCoordinates = coordinates;
            mapsService.setMarker(coordinates);
        }
        // Auto-validate coverage (like TEL does on map click)
        await this.handleValidate();
    };
    handlePlaceSelected = (result) => {
        this.geocodeResult = result;
        this.address = result.formattedAddress || result.address;
        this.currentCoordinates = result.coordinates;
        // Update map marker
        mapsService.setMarker(result.coordinates);
        mapsService.centerMap(result.coordinates);
    };
    handleValidate = async () => {
        if (!this.currentCoordinates && !this.address.trim()) {
            return;
        }
        this.isValidating = true;
        try {
            let coords = this.currentCoordinates;
            let city = this.geocodeResult?.city || '';
            let zipCode = this.geocodeResult?.zipCode || '';
            // If we don't have coordinates, try to geocode the address
            if (!coords && this.address.trim()) {
                const geocoded = await mapsService.geocodeAddress(this.address);
                if (geocoded) {
                    coords = geocoded.coordinates;
                    city = geocoded.city;
                    zipCode = geocoded.zipCode;
                    this.currentCoordinates = coords;
                    this.geocodeResult = geocoded;
                    // Update map
                    mapsService.setMarker(coords);
                    mapsService.centerMap(coords);
                }
                else {
                    this.errorMessage = 'No se pudo encontrar la dirección. Por favor, intenta con otra dirección.';
                    this.showErrorModal = true;
                    this.isValidating = false;
                    return;
                }
            }
            if (!coords) {
                this.errorMessage = 'Por favor, ingresa una dirección válida.';
                this.showErrorModal = true;
                this.isValidating = false;
                return;
            }
            // Validate coverage with API
            const location = await coverageService.checkCoverage(coords.lat, coords.lng, this.address || this.geocodeResult?.address || '', city, zipCode);
            this.locationData = location;
            if (location.isValid) {
                // Show InfoWindow on marker (like TEL)
                this.showCoverageInfoWindow(location.serviceMessage, true);
            }
            else {
                // Show error InfoWindow
                this.showCoverageInfoWindow(ERROR_MESSAGES.NO_COVERAGE, false);
            }
        }
        catch (error) {
            console.error('Coverage validation error:', error);
            this.errorMessage = ERROR_MESSAGES.COVERAGE_ERROR;
            this.showErrorModal = true;
        }
        finally {
            this.isValidating = false;
        }
    };
    /**
     * Shows coverage result in InfoWindow on the marker (like TEL pattern)
     * Styles match TEL: .info, .infoOn, .infoOff, .continue-map, .continue-button
     */
    showCoverageInfoWindow(message, isSuccess) {
        // TEL-style InfoWindow content - width auto to fill parent container (600px set by maps.service)
        const infoWindowContent = `
      <div class="general-container" style="font-family: 'Open Sans', Arial, sans-serif; width: 100%; box-sizing: border-box;">
        <div class="info ${isSuccess ? 'infoOn' : 'infoOff'}" style="
          padding: ${isSuccess ? '20px' : '15px 20px'};
          width: 100%;
          height: auto;
          box-sizing: border-box;
          background: ${isSuccess ? '#1F97AF' : '#EE122C'};
          color: #ffffff;
          font-size: 14px;
          line-height: 1.5;
          white-space: normal;
        ">
          ${message}
        </div>
        <div class="continue-map" style="
          width: 100%;
          height: auto;
          padding: 20px;
          font-size: 16px;
          text-align: center;
          background: #ffffff;
          color: #1F97AF;
          cursor: pointer;
          box-sizing: border-box;
        ">
          ${!isSuccess ? `
            <div style="color: #333; margin-bottom: 8px;">
              Actualmente usted se encuentra fuera del rango de cobertura.
            </div>
          ` : ''}
          <div
            id="infowindow-continue-btn"
            class="no-link continue-button"
            onclick="if(window.__infoWindowContinueCallback) window.__infoWindowContinueCallback();"
            style="
              text-decoration: none;
              color: #1F97AF;
              font-size: 16px;
              cursor: pointer;
              font-weight: 600;
            "
          >
            ${isSuccess ? 'Continuar' : 'Cerrar'}
          </div>
        </div>
      </div>
    `;
        mapsService.showInfoWindow(infoWindowContent, () => {
            if (isSuccess && this.locationData && this.locationData.isValid) {
                this.handleInfoWindowContinue();
            }
            else {
                mapsService.closeInfoWindow();
            }
        });
    }
    /**
     * Handles continue from InfoWindow (like TEL: goToRouter method)
     */
    handleInfoWindowContinue = () => {
        if (this.locationData && this.locationData.isValid) {
            // Close InfoWindow
            mapsService.closeInfoWindow();
            // Store data in sessionStorage with Base64 encoding (like TEL)
            this.storeLocationInSession(this.locationData);
            // Set location in store
            flowActions.setLocation(this.locationData);
            this.onNext?.();
        }
    };
    /**
     * Stores location data in sessionStorage with Base64 encoding (like TEL)
     * TEL pattern: sessionStorage.setItem('planCodeInternet', btoa(planCode))
     */
    storeLocationInSession(location) {
        try {
            // Store coordinates in Base64 (like TEL)
            sessionStorage.setItem('latitud', btoa(String(location.latitude)));
            sessionStorage.setItem('longitud', btoa(String(location.longitude)));
            // Special handling for CLARO HOGAR (like TEL)
            // TEL: if (servicE_NAME == 'CLARO HOGAR') { sessionStorage.removeItem('planCodeInternet'); }
            if (location.serviceType.toUpperCase() === 'CLARO HOGAR') {
                sessionStorage.removeItem('planCodeInternet');
                console.log('[StepLocation] CLARO HOGAR detected - planCodeInternet removed');
            }
            else {
                sessionStorage.setItem('planCodeInternet', btoa(location.serviceType));
                console.log('[StepLocation] Service type stored:', location.serviceType);
            }
            // Also store full plan data as JSON (for convenience)
            sessionStorage.setItem('plan', JSON.stringify({
                serviceType: location.serviceType,
                serviceMessage: location.serviceMessage,
                address: location.address,
                city: location.city,
                zipCode: location.zipCode,
            }));
            console.log('[StepLocation] Location data stored in sessionStorage');
        }
        catch (error) {
            console.error('[StepLocation] Error storing location in sessionStorage:', error);
        }
    }
    handleUseCurrentLocation = async () => {
        this.isGettingLocation = true;
        try {
            const result = await mapsService.getCurrentLocationWithAddress();
            if (result) {
                this.geocodeResult = result;
                this.address = result.formattedAddress || result.address;
                this.currentCoordinates = result.coordinates;
                // Update map
                mapsService.setMarker(result.coordinates);
                mapsService.centerMap(result.coordinates);
                mapsService.setZoom(17);
            }
            else {
                // Got coordinates but couldn't reverse geocode
                const coords = await mapsService.getCurrentLocation();
                this.currentCoordinates = coords;
                mapsService.setMarker(coords);
                mapsService.centerMap(coords);
                mapsService.setZoom(17);
            }
        }
        catch (error) {
            console.error('Geolocation error:', error);
            if (error.message.includes('denied')) {
                this.errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
            }
            else if (error.message.includes('unavailable')) {
                this.errorMessage = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
            }
            else {
                this.errorMessage = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
            }
            this.showErrorModal = true;
        }
        finally {
            this.isGettingLocation = false;
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (index.h(index.Host, { key: 'a0e39ccf15c31beadf5745a12b68eb6978c3c4fb' }, index.h("div", { key: '29e3069719060c1b3ffdedbe3dfb4b1fb75f26a6', class: "step-location" }, this.isValidating && (index.h("div", { key: 'cd414f53d6795dddb702cdf4d40154041a69fd21', class: "step-location__validating-overlay" }, index.h("div", { key: '6303dca28d5f98260f5cf60c3c5a0b3fa31b79a1', class: "step-location__validating-content" }, index.h("div", { key: 'd7e01f97aa7552f2f80721b2aade6c43e34a3bda', class: "step-location__validating-spinner" }), index.h("p", { key: 'f468f21dd7e903b99759029cf7966cc62d4f1e46', class: "step-location__validating-text" }, "Validando cobertura...")))), index.h("header", { key: 'd199addc6a2be5361a867292498904efa375bb43', class: "step-location__header" }, index.h("h1", { key: '8c4ee99ad1633ff1af97cc89c7be518dab81e2c9', class: "step-location__title" }, index.h("span", { key: 'd5c12910a1421efbae94a1e3683e9c781f52538d', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), index.h("div", { key: '32566aabafe10db547a578dc5066f5df0e1b01d0', class: "step-location__map-container" }, index.h("div", { key: '52f93d98e524bf887f17c70c6a0e7d724c6d3f2e', class: "step-location__controls" }, index.h("div", { key: 'c0c0202f1df12acbaaa3f1d997fc87fccb322f6e', class: "step-location__input-group" }, index.h("span", { key: '7ebfce7e2ff99c11e83c8164cbc3c3368135c9f9', class: "step-location__input-icon" }, index.h("svg", { key: 'cb0a1b98f6ef2645596b4222a025e268194245d2', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { key: 'e0064d0fc51ac25d10a9718394e9861121bfa263', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), index.h("circle", { key: 'e6885929b60851f3a4f628ab5cd05ff5fa0bbbeb', cx: "12", cy: "10", r: "3" }))), index.h("input", { key: '1ac6b661a47ddf27d1605112e84ee3846f704604', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), index.h("button", { key: 'ca0e84097fd91267937541df90dc7fb3f3404bb9', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (index.h("span", { class: "step-location__btn-validate-content" }, index.h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), index.h("button", { key: 'e869cf4c4543e8e8b23fe4b2a1e6c00131ae02a6', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, index.h("svg", { key: 'd348516737de953040485157235a47d951be3e8b', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("circle", { key: 'd98bc6ab679863ce5d1e5a94180b926ca4a88db4', cx: "12", cy: "12", r: "10" }), index.h("circle", { key: 'b22d454be6686e057d91746535026d6aebe8f793', cx: "12", cy: "12", r: "3" }), index.h("line", { key: '7c835cbf33507f21fe0b59b18856e31e56285ee4', x1: "12", y1: "2", x2: "12", y2: "6" }), index.h("line", { key: '24919757ce7dc1f9afe0438d45546c1822775795', x1: "12", y1: "18", x2: "12", y2: "22" }), index.h("line", { key: '6ef0ff7c8ddd9b8be597aa646c262916db7794de', x1: "2", y1: "12", x2: "6", y2: "12" }), index.h("line", { key: '3c11883af54ddaff01ddf88208704bbf83a3b171', x1: "18", y1: "12", x2: "22", y2: "12" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual')), index.h("div", { key: '678e04c53c79555bd5268515bdbe1774b6fd5ba2', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (index.h("div", { key: 'bd4381f0ccfdc46eda1ca526911fda09e48b70c2', class: "step-location__map-loading" }, index.h("div", { key: 'f6ed91a500b319052324b8f79cc4bc199a596d73', class: "step-location__spinner" }), index.h("p", { key: '76401eb2fa68492e07543fa04a012edf2f355b5b' }, "Cargando mapa..."))), this.mapError && (index.h("div", { key: '64efa54b41a451333213327beabbe1d36ae874c7', class: "step-location__map-error" }, index.h("p", { key: '4b3652acd2aabe5026e5acb287b6d0e24ce716ea' }, this.mapError), !this.googleMapsKey && (index.h("small", { key: 'a084a7a9d993f36f8886147afa180c770273d57b' }, "Configura la prop google-maps-key en el componente")))), index.h("div", { key: '6c6ee52902c57df2c5dc2e919689c4a0f1095a24', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (index.h("div", { key: 'd03ec2dd73fee9a4528457c7c076dc6abf49c443', class: "step-location__modal-backdrop" }, index.h("div", { key: '5a50009d8570659606f9abe463fc5d7adf01843c', class: "step-location__modal step-location__modal--error" }, index.h("button", { key: 'a5be2ce167fc6b19cbf3d1b36103638b8c5216f1', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), index.h("div", { key: '5411fbcb00b4ee72ceaf8fa9919ca7b7847597cb', class: "step-location__modal-error-bar" }, "Error"), index.h("p", { key: '98759c5ce7a8774f681ad58560a96f56963c34b1', class: "step-location__modal-message" }, this.errorMessage), index.h("button", { key: '9242de88c7371d61399809512b915adbcbc62083', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
    }
};
StepLocation.style = stepLocationCss();

const stepOrderSummaryCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-order-summary{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem;transition:color 0.2s}.header .btn-back svg{width:20px;height:20px}.header .btn-back:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.header__title-group{display:flex;align-items:center;gap:1rem;flex:1}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0}.header .item-count{font-size:0.875rem;color:#666666;background:#E5E5E5;padding:0.25rem 0.5rem;border-radius:9999px;font-weight:500}.state-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;background:white;border-radius:0.75rem;padding:2rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.state-container .state-icon{width:80px;height:80px;color:#999999;margin-bottom:1rem}.state-container h3{font-size:1.5rem;color:#4D4D4D;margin:0 0 0.5rem 0}.state-container p{color:#808080;margin:0 0 1.5rem 0}.state-container--error .state-icon{color:#DA291C}.state-container--error p{color:#DA291C}.state-container--empty .state-icon{color:#CCCCCC}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:currentColor;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.btn-retry,.btn-back-catalog{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600;transition:background 0.2s}.btn-retry:hover,.btn-back-catalog:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back-catalog{background:#0097A9}.btn-back-catalog:hover{background:rgb(0, 105.4319526627, 118)}.content-layout{display:grid;grid-template-columns:1fr 380px;gap:1.5rem}@media (max-width: 992px){.content-layout{grid-template-columns:1fr}}.products-column{display:flex;flex-direction:column;gap:1rem}.summary-column{display:flex;flex-direction:column;gap:1rem}@media (max-width: 992px){.summary-column{order:-1}}.product-card{background:white;border-radius:0.75rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);overflow:hidden}.product-card__badge{display:flex;gap:0.25rem;padding:0.5rem 1rem;background:#FAFAFA;border-bottom:1px solid #F5F5F5}.product-card__main{display:grid;grid-template-columns:100px 1fr auto auto;gap:1rem;padding:1rem;align-items:center}@media (max-width: 768px){.product-card__main{grid-template-columns:80px 1fr auto;grid-template-rows:auto auto}}.product-card__main--plan{grid-template-columns:60px 1fr auto auto}@media (max-width: 768px){.product-card__main--plan{grid-template-columns:60px 1fr auto}}.product-card__image{width:100px;height:100px;background:#FAFAFA;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;overflow:hidden}@media (max-width: 768px){.product-card__image{width:80px;height:80px}}.product-card__image img{max-width:90%;max-height:90%;object-fit:contain}.product-card__image--plan{width:60px;height:60px;background:linear-gradient(135deg, #DA291C 0%, rgb(150.2073170732, 28.25, 19.2926829268) 100%);border-radius:0.5rem}.product-card__image--plan img{filter:brightness(0) invert(1);width:40px;height:40px}.product-card__details{display:flex;flex-direction:column;gap:0.25rem}.product-card__pricing{display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem}@media (max-width: 768px){.product-card__pricing{grid-column:2/-1;flex-direction:row;justify-content:space-between;align-items:center;width:100%}}.product-card__actions{display:flex;align-items:center}.product-card--plan .product-card__main{grid-template-columns:60px 1fr auto auto}.section-header{display:flex;align-items:center;gap:0.5rem;padding:1rem 1.5rem;border-bottom:1px solid #F5F5F5}.section-header__icon{width:36px;height:36px;border-radius:0.5rem;display:flex;align-items:center;justify-content:center}.section-header__icon svg{width:20px;height:20px}.section-header__text{display:flex;align-items:center;gap:0.5rem;flex:1}.section-header__label{font-size:0.875rem;font-weight:700;letter-spacing:0.5px}.section-header__badge{font-size:0.75rem;font-weight:600;padding:2px 0.5rem;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px}.section-header--equipment{background:linear-gradient(135deg, rgba(0, 151, 169, 0.08) 0%, rgba(0, 151, 169, 0.02) 100%);border-left:4px solid #0097A9}.section-header--equipment .section-header__icon{background:#0097A9;color:white}.section-header--equipment .section-header__label{color:#0097A9}.section-header--equipment .section-header__badge{background:rgba(218, 41, 28, 0.15);color:#DA291C}.section-header--plan{background:linear-gradient(135deg, rgba(218, 41, 28, 0.08) 0%, rgba(218, 41, 28, 0.02) 100%);border-left:4px solid #DA291C}.section-header--plan .section-header__icon{background:#DA291C;color:white}.section-header--plan .section-header__label{color:#DA291C}.badge{display:inline-flex;align-items:center;padding:2px 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}.badge--equipment{background:rgba(0, 151, 169, 0.15);color:#0097A9}.badge--main{background:rgba(218, 41, 28, 0.15);color:#DA291C}.badge--plan{background:rgba(68, 175, 105, 0.15);color:#44AF69}.product-name{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0;line-height:1.3}.product-specs{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}.spec-item{display:flex;align-items:center;gap:4px}.spec-label{font-size:0.875rem;color:#666666}.plan-type{font-size:0.875rem;color:#808080}.financing-info{display:flex;flex-direction:column;gap:2px;margin-top:0.25rem;padding-top:0.25rem;border-top:1px dashed #E5E5E5}.financing-label{font-size:0.75rem;font-weight:600;color:#4D4D4D}.financing-detail{font-size:0.75rem;color:#808080}.color-circle{display:inline-block;width:16px;height:16px;border-radius:50%;border:2px solid #E5E5E5;box-shadow:inset 0 0 0 1px rgba(0, 0, 0, 0.1)}.storage-badge{display:inline-flex;align-items:center;padding:2px 0.25rem;background:#F5F5F5;border-radius:0.25rem;font-size:0.75rem;font-weight:600;color:#4D4D4D}.qty-label{font-size:0.875rem;color:#808080}.price-financing,.price-single{text-align:right}@media (max-width: 768px){.price-financing,.price-single{text-align:left}}.price-monthly{font-size:1.25rem;font-weight:700;color:#DA291C}.price-period{font-size:0.875rem;color:#808080}.price-installments{display:block;font-size:0.75rem;color:#808080;margin-top:2px}.price-total{font-size:1.25rem;font-weight:700;color:#1A1A1A}.price-full{display:flex;gap:0.25rem;font-size:0.875rem}.price-full .label{color:#808080}.price-full .value{font-weight:600;color:#4D4D4D}.btn-action{background:none;border:none;cursor:pointer;padding:0.25rem;transition:all 0.2s;display:flex;align-items:center;justify-content:center}.btn-action svg{width:20px;height:20px}.btn-action--delete{color:#999999;border-radius:0.5rem}.btn-action--delete:hover:not(:disabled){color:#DA291C;background:rgba(218, 41, 28, 0.1)}.btn-action--delete:disabled{opacity:0.5;cursor:not-allowed}.btn-action--delete-small{color:#999999}.btn-action--delete-small svg{width:16px;height:16px}.btn-action--delete-small:hover:not(:disabled){color:#DA291C}.btn-action--delete-small:disabled{opacity:0.5;cursor:not-allowed}.plan-section{border-top:none}.plan-section .section-header--plan{margin:0;border-radius:0;border-left-width:0;padding-left:calc(1.5rem + 4px);border-top:1px dashed #E5E5E5}.plan-section__content{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:linear-gradient(to right, rgba(218, 41, 28, 0.03), white)}.plan-section .plan-label{font-size:0.75rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px;font-weight:600}.plan-section .plan-info{flex:1;display:flex;flex-direction:column;gap:2px}.plan-section .plan-name{font-size:0.875rem;font-weight:600;color:#333333}.plan-section .plan-type{font-size:0.75rem;color:#808080}.plan-section .plan-price{display:flex;align-items:baseline;gap:2px}.plan-section .plan-price .price{font-size:1.25rem;font-weight:700;color:#DA291C}.plan-section .plan-price .period{font-size:0.875rem;color:#808080}.summary-card{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.summary-card__title{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px}.summary-card__title svg{width:18px;height:18px;color:#999999}.promo-section .promo-input-group{display:flex;gap:0.5rem}.promo-section .promo-input{flex:1;height:44px;border:1px solid #CCCCCC;border-radius:0.5rem;padding:0 1rem;font-size:0.875rem;transition:border-color 0.2s}.promo-section .promo-input:focus{outline:none;border-color:#0097A9}.promo-section .promo-input.error{border-color:#DA291C}.promo-section .promo-input.success{border-color:#44AF69}.promo-section .promo-input:disabled{background:#F5F5F5;cursor:not-allowed}.promo-section .promo-button{height:44px;padding:0 1.5rem;background:#E5E5E5;color:#4D4D4D;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;min-width:90px;display:flex;align-items:center;justify-content:center}.promo-section .promo-button:hover:not(:disabled){background:#CCCCCC}.promo-section .promo-button:disabled{opacity:0.5;cursor:not-allowed}.promo-section .promo-message{display:flex;align-items:center;gap:0.25rem;font-size:0.875rem;margin-top:0.5rem}.promo-section .promo-message svg{width:14px;height:14px;flex-shrink:0}.promo-section .promo-message.error{color:#DA291C}.promo-section .promo-message.success{color:#44AF69}.payment-summary{padding:0;overflow:hidden}.rent-section{background:linear-gradient(135deg, #DA291C 0%, rgb(172.8048780488, 32.5, 22.1951219512) 100%);padding:1.5rem;color:white}.rent-section .rent-row{display:flex;justify-content:space-between;align-items:center}.rent-section .rent-label{font-size:1rem;font-weight:500}.rent-section .rent-value{font-size:1.75rem;font-weight:700}.rent-section .rent-note{font-size:0.75rem;opacity:0.8;margin:0.25rem 0 0 0}.payment-breakdown{padding:1.5rem}.payment-breakdown .detail-rows{margin-bottom:1rem}.detail-row{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #F5F5F5}.detail-row:last-child{border-bottom:none}.detail-row .label{font-size:0.875rem;color:#666666}.detail-row .value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.detail-row .value--free{color:#44AF69;font-weight:700;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px}.detail-row--discount .label{color:#44AF69}.detail-row--discount .value{color:#44AF69;font-weight:600}.detail-row--shipping{background:rgba(68, 175, 105, 0.05);margin:0 -1.5rem;padding:0.5rem 1.5rem;border-bottom:none}.total-section{background:#FAFAFA;margin:0 -1.5rem -1.5rem;padding:1.5rem;border-top:2px solid #E5E5E5}.total-row{display:flex;justify-content:space-between;align-items:center}.total-label{font-size:1rem;font-weight:600;color:#1A1A1A}.total-value{font-size:1.75rem;font-weight:700;color:#DA291C}.terms-section{background:white;border-radius:0.75rem;padding:1rem 1.5rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.terms-checkbox{display:flex;align-items:flex-start;gap:0.5rem;cursor:pointer}.terms-checkbox input[type=checkbox]{display:none}.terms-checkbox .checkmark{width:22px;height:22px;border:2px solid #CCCCCC;border-radius:0.25rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;background:white}.terms-checkbox .checkmark svg{width:14px;height:14px;stroke:white;opacity:0;transition:opacity 0.2s}.terms-checkbox input[type=checkbox]:checked+.checkmark{background:#0097A9;border-color:#0097A9}.terms-checkbox input[type=checkbox]:checked+.checkmark svg{opacity:1}.terms-checkbox .terms-text{font-size:0.875rem;color:#666666;line-height:1.5}.terms-checkbox .terms-text a{color:#0097A9;text-decoration:none;font-weight:500}.terms-checkbox .terms-text a:hover{text-decoration:underline}.btn-proceed{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;height:56px;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(218, 41, 28, 0.3)}.btn-proceed svg{width:20px;height:20px;transition:transform 0.2s}.btn-proceed:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512);box-shadow:0 6px 16px rgba(218, 41, 28, 0.4)}.btn-proceed:hover:not(:disabled) svg{transform:translateX(4px)}.btn-proceed:disabled,.btn-proceed.disabled{background:#CCCCCC;box-shadow:none;cursor:not-allowed}.btn-proceed:disabled svg,.btn-proceed.disabled svg{transform:none}`;

const StepOrderSummary = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    cart = null;
    isLoading = true;
    error = null;
    promoCode = '';
    isApplyingPromo = false;
    promoError = null;
    promoSuccess = false;
    termsAccepted = false;
    deletingItemId = null;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadCart();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadCart() {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await cartService.getCart();
            if (response.hasError) {
                this.error = response.message || 'Error al cargar el carrito';
                return;
            }
            this.cart = response;
            console.log('[StepOrderSummary] Cart loaded:', this.cart);
            console.log('[StepOrderSummary] Products:', this.cart.products?.map(p => ({
                cartId: p.cartId,
                name: p.productName,
                equipment: p.equipment,
                home: p.home,
                plan: p.plan,
                parentCartId: p.parentCartId,
                installments: p.installments,
                price: p.decPrice,
            })));
        }
        catch (err) {
            console.error('[StepOrderSummary] Error:', err);
            this.error = 'Error de conexión al cargar el carrito';
        }
        finally {
            this.isLoading = false;
        }
    }
    handlePromoCodeChange = (e) => {
        this.promoCode = e.target.value.toUpperCase();
        this.promoError = null;
        this.promoSuccess = false;
    };
    handleApplyPromo = async () => {
        if (!this.promoCode.trim()) {
            this.promoError = 'Ingresa un código promocional';
            return;
        }
        this.isApplyingPromo = true;
        this.promoError = null;
        this.promoSuccess = false;
        try {
            cartService.storeDiscountCoupon(this.promoCode);
            const response = await cartService.getCart(this.promoCode);
            if (response.hasError) {
                this.promoError = 'Código promocional inválido';
                cartService.clearDiscountCoupon();
                return;
            }
            this.cart = response;
            this.promoSuccess = true;
            console.log('[StepOrderSummary] Promo applied successfully');
        }
        catch (err) {
            console.error('[StepOrderSummary] Promo error:', err);
            this.promoError = 'Error al aplicar el código';
            cartService.clearDiscountCoupon();
        }
        finally {
            this.isApplyingPromo = false;
        }
    };
    handleRemoveItem = async (item) => {
        this.deletingItemId = item.cartId;
        try {
            const result = await cartService.deleteItem(item.cartId, item.productId);
            if (result.hasError) {
                console.error('[StepOrderSummary] Delete error:', result.message);
                return;
            }
            await this.loadCart();
        }
        catch (err) {
            console.error('[StepOrderSummary] Error removing item:', err);
        }
        finally {
            this.deletingItemId = null;
        }
    };
    handleTermsChange = (e) => {
        this.termsAccepted = e.target.checked;
    };
    handleProceed = () => {
        if (!this.termsAccepted) {
            return;
        }
        this.onNext?.();
    };
    formatPrice(price) {
        return `$${(price || 0).toFixed(2)}`;
    }
    getItemCount() {
        return this.cart?.products?.reduce((sum, item) => sum + item.qty, 0) || 0;
    }
    // Separate equipment from plans
    // Classification logic for CLARO HOGAR flow:
    // - The API returns both equipment and plan with same flags and catalogName
    // - Key differentiators:
    //   1. catalogName === "Catalogo de Planes Fijos" (for some flows)
    //   2. installments: Equipment has > 0 (financed), Plan has === 0 (monthly service)
    //   3. plan flag or parentCartId > 0
    getEquipmentItems() {
        if (!this.cart?.products)
            return [];
        console.log('[StepOrderSummary] Classifying products...');
        return this.cart.products.filter(item => {
            // Log each item for debugging
            console.log('[StepOrderSummary] Item:', item.productName, {
                catalogName: item.catalogName,
                equipment: item.equipment,
                home: item.home,
                plan: item.plan,
                parentCartId: item.parentCartId,
                installments: item.installments,
            });
            // Check catalogName for fixed plans catalog
            if (item.catalogName === 'Catalogo de Planes Fijos') {
                console.log('[StepOrderSummary] -> PLAN (catalogName: Catalogo de Planes Fijos)');
                return false;
            }
            // If explicitly marked as plan, it's not equipment
            if (item.plan) {
                console.log('[StepOrderSummary] -> PLAN (explicit plan flag)');
                return false;
            }
            // If it has a parentCartId > 0, it's a plan linked to equipment
            if (item.parentCartId && item.parentCartId > 0) {
                console.log('[StepOrderSummary] -> PLAN (has parentCartId)');
                return false;
            }
            // TEL Logic: If home === true && internet === true, it's an internet PLAN
            if (item.home && item.internet) {
                console.log('[StepOrderSummary] -> PLAN (home + internet flags)');
                return false;
            }
            // CLARO HOGAR heuristic: Equipment has financing (installments > 0)
            if (item.home && item.installments > 0) {
                console.log('[StepOrderSummary] -> EQUIPMENT (home with installments)');
                return true;
            }
            // CLARO HOGAR heuristic: No installments = monthly plan (not equipment)
            if (item.home && (!item.installments || item.installments === 0)) {
                console.log('[StepOrderSummary] -> PLAN (home without installments = monthly plan)');
                return false;
            }
            // Regular equipment (phones, accessories, etc.)
            if (item.equipment || item.accesory) {
                console.log('[StepOrderSummary] -> EQUIPMENT');
                return true;
            }
            console.log('[StepOrderSummary] -> UNKNOWN (not classified)');
            return false;
        });
    }
    getPlanItems() {
        if (!this.cart?.products)
            return [];
        return this.cart.products.filter(item => {
            // Check catalogName for fixed plans catalog
            if (item.catalogName === 'Catalogo de Planes Fijos')
                return true;
            // Explicit plan flag
            if (item.plan)
                return true;
            // If it has a parentCartId > 0, it's a plan linked to equipment
            if (item.parentCartId && item.parentCartId > 0)
                return true;
            // TEL Logic: If home === true && internet === true, it's an internet PLAN
            if (item.home && item.internet)
                return true;
            // CLARO HOGAR heuristic: home=true without installments = monthly internet plan
            if (item.home && (!item.installments || item.installments === 0))
                return true;
            return false;
        });
    }
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderEquipmentItem(item, index$1) {
        const isDeleting = this.deletingItemId === item.cartId;
        const planItem = this.getPlanItems().find(p => p.parentCartId === item.cartId);
        return (index.h("div", { class: "product-card", key: `equip-${item.cartId}` }, index.h("div", { class: "section-header section-header--equipment" }, index.h("div", { class: "section-header__icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" }), index.h("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" }))), index.h("div", { class: "section-header__text" }, index.h("span", { class: "section-header__label" }, "EQUIPO"), index$1 === 0 && index.h("span", { class: "section-header__badge" }, "Principal"))), index.h("div", { class: "product-card__main" }, index.h("div", { class: "product-card__image" }, index.h("img", { src: item.imgUrl || item.detailImage || '/assets/placeholder.png', alt: item.productName, onError: (e) => e.target.src = '/assets/placeholder.png' })), index.h("div", { class: "product-card__details" }, index.h("h3", { class: "product-name" }, item.productName), index.h("div", { class: "product-specs" }, item.colorName && (index.h("div", { class: "spec-item" }, index.h("span", { class: "color-circle", style: { backgroundColor: item.webColor || '#ccc' } }), index.h("span", { class: "spec-label" }, item.colorName))), item.storageName && item.storage && (index.h("div", { class: "spec-item" }, index.h("span", { class: "storage-badge" }, item.storage, "GB"))), index.h("div", { class: "spec-item" }, index.h("span", { class: "qty-label" }, "Cant: ", item.qty))), item.installments > 1 && (index.h("div", { class: "financing-info" }, index.h("span", { class: "financing-label" }, "Financiamiento de Equipo:"), index.h("span", { class: "financing-detail" }, "T\u00E9rmino de pago (", item.installments, " meses)")))), index.h("div", { class: "product-card__pricing" }, item.installments > 1 ? (index.h("div", { class: "price-financing" }, index.h("span", { class: "price-monthly" }, this.formatPrice(item.decTotalPerMonth || item.decPrice)), index.h("span", { class: "price-period" }, "/mes"))) : (index.h("div", { class: "price-single" }, index.h("span", { class: "price-total" }, this.formatPrice(item.decTotalPrice || item.decPrice))))), index.h("div", { class: "product-card__actions" }, index.h("button", { class: "btn-action btn-action--delete", onClick: () => this.handleRemoveItem(item), disabled: isDeleting, title: "Eliminar" }, isDeleting ? (index.h("span", { class: "spinner-small" })) : (index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" }), index.h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), index.h("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))))), planItem && this.renderAssociatedPlan(planItem)));
    }
    renderAssociatedPlan(plan) {
        const isDeleting = this.deletingItemId === plan.cartId;
        return (index.h("div", { class: "plan-section" }, index.h("div", { class: "section-header section-header--plan" }, index.h("div", { class: "section-header__icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }))), index.h("div", { class: "section-header__text" }, index.h("span", { class: "section-header__label" }, "TU PLAN"))), index.h("div", { class: "plan-section__content" }, index.h("div", { class: "plan-info" }, index.h("span", { class: "plan-name" }, plan.productName), index.h("span", { class: "plan-type" }, "Plan de Internet")), index.h("div", { class: "plan-price" }, index.h("span", { class: "price" }, this.formatPrice(plan.decPrice || plan.decTotalPerMonth)), index.h("span", { class: "period" }, "/mes")), index.h("button", { class: "btn-action btn-action--delete-small", onClick: () => this.handleRemoveItem(plan), disabled: isDeleting, title: "Eliminar plan" }, isDeleting ? (index.h("span", { class: "spinner-small" })) : (index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })))))));
    }
    renderStandalonePlan(plan) {
        const isDeleting = this.deletingItemId === plan.cartId;
        return (index.h("div", { class: "product-card product-card--plan", key: `plan-${plan.cartId}` }, index.h("div", { class: "section-header section-header--plan" }, index.h("div", { class: "section-header__icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }))), index.h("div", { class: "section-header__text" }, index.h("span", { class: "section-header__label" }, "PLAN DE INTERNET"))), index.h("div", { class: "product-card__main product-card__main--plan" }, index.h("div", { class: "product-card__image product-card__image--plan" }, index.h("img", { src: plan.imgUrl || plan.detailImage || '/assets/placeholder.png', alt: plan.productName, onError: (e) => e.target.src = '/assets/placeholder.png' })), index.h("div", { class: "product-card__details" }, index.h("h3", { class: "product-name" }, plan.productName), index.h("span", { class: "plan-type" }, "Renta mensual")), index.h("div", { class: "product-card__pricing" }, index.h("div", { class: "price-financing" }, index.h("span", { class: "price-monthly" }, this.formatPrice(plan.decPrice || plan.decTotalPerMonth)), index.h("span", { class: "price-period" }, "/mes"))), index.h("div", { class: "product-card__actions" }, index.h("button", { class: "btn-action btn-action--delete", onClick: () => this.handleRemoveItem(plan), disabled: isDeleting, title: "Eliminar" }, isDeleting ? (index.h("span", { class: "spinner-small" })) : (index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" }))))))));
    }
    renderPromoCode() {
        return (index.h("div", { class: "summary-card promo-section" }, index.h("h4", { class: "summary-card__title" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" }), index.h("line", { x1: "7", y1: "7", x2: "7.01", y2: "7" })), "Cup\u00F3n de descuento"), index.h("div", { class: "promo-input-group" }, index.h("input", { type: "text", class: {
                'promo-input': true,
                'error': !!this.promoError,
                'success': this.promoSuccess,
            }, placeholder: "Ingresa tu c\u00F3digo", value: this.promoCode, onInput: this.handlePromoCodeChange, disabled: this.isApplyingPromo }), index.h("button", { class: "promo-button", onClick: this.handleApplyPromo, disabled: this.isApplyingPromo || !this.promoCode.trim() }, this.isApplyingPromo ? (index.h("span", { class: "spinner-small" })) : ('Aplicar'))), this.promoError && (index.h("span", { class: "promo-message error" }, index.h("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14" }, index.h("circle", { cx: "12", cy: "12", r: "10" }), index.h("line", { x1: "12", y1: "8", x2: "12", y2: "12", stroke: "white", "stroke-width": "2" }), index.h("line", { x1: "12", y1: "16", x2: "12.01", y2: "16", stroke: "white", "stroke-width": "2" })), this.promoError)), this.promoSuccess && (index.h("span", { class: "promo-message success" }, index.h("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14" }, index.h("circle", { cx: "12", cy: "12", r: "10" }), index.h("polyline", { points: "9 12 11 14 15 10", fill: "none", stroke: "white", "stroke-width": "2" })), "\u00A1Cup\u00F3n aplicado!"))));
    }
    renderPaymentSummary() {
        if (!this.cart)
            return null;
        const monthlyRent = this.cart.subTotalPerMonth || 0;
        const subtotal = this.cart.subTotalPrice || 0;
        const tax = this.cart.totalTax || 0;
        const total = this.cart.totalPrice || 0;
        const downPayment = this.cart.totalDownPayment || 0;
        // Discount is calculated from promo code application (stored locally if applied)
        const discount = 0; // Will be calculated when promo system is fully integrated
        return (index.h("div", { class: "summary-card payment-summary" }, monthlyRent > 0 && (index.h("div", { class: "rent-section" }, index.h("div", { class: "rent-row" }, index.h("span", { class: "rent-label" }, "Renta mensual"), index.h("span", { class: "rent-value" }, this.formatPrice(monthlyRent))), index.h("p", { class: "rent-note" }, "*No incluye cargos estatales y federales"))), index.h("div", { class: "payment-breakdown" }, index.h("h4", { class: "summary-card__title" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("rect", { x: "1", y: "4", width: "22", height: "16", rx: "2", ry: "2" }), index.h("line", { x1: "1", y1: "10", x2: "23", y2: "10" })), "Detalle del pago"), index.h("div", { class: "detail-rows" }, subtotal > 0 && (index.h("div", { class: "detail-row" }, index.h("span", { class: "label" }, "Subtotal equipos"), index.h("span", { class: "value" }, this.formatPrice(subtotal)))), downPayment > 0 && (index.h("div", { class: "detail-row" }, index.h("span", { class: "label" }, "Pago inicial"), index.h("span", { class: "value" }, this.formatPrice(downPayment)))), discount > 0, index.h("div", { class: "detail-row" }, index.h("span", { class: "label" }, "Cargos estatales y federales"), index.h("span", { class: "value" }, this.formatPrice(tax))), index.h("div", { class: "detail-row detail-row--shipping" }, index.h("span", { class: "label" }, "Costo de env\u00EDo"), index.h("span", { class: "value value--free" }, "GRATIS"))), index.h("div", { class: "total-section" }, index.h("div", { class: "total-row" }, index.h("span", { class: "total-label" }, "Paga hoy"), index.h("span", { class: "total-value" }, this.formatPrice(total)))))));
    }
    renderTermsCheckbox() {
        return (index.h("div", { class: "terms-section" }, index.h("label", { class: "terms-checkbox" }, index.h("input", { type: "checkbox", checked: this.termsAccepted, onChange: this.handleTermsChange }), index.h("span", { class: "checkmark" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3" }, index.h("polyline", { points: "20 6 9 17 4 12" }))), index.h("span", { class: "terms-text" }, "Acepto los ", index.h("a", { href: "#", onClick: (e) => e.preventDefault() }, "t\u00E9rminos y condiciones"), " de Claro Puerto Rico"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const itemCount = this.getItemCount();
        const hasItems = itemCount > 0;
        const canProceed = hasItems && this.termsAccepted;
        const equipmentItems = this.getEquipmentItems();
        const standalonePlans = this.getPlanItems().filter(p => !p.parentCartId);
        return (index.h(index.Host, { key: 'f3078779259454151b63caefbeebeb148f5732a8' }, index.h("div", { key: 'a09063862b6280f45f2d5d305ddcd640012bd4b1', class: "step-order-summary" }, index.h("header", { key: 'f0ca8385aa82fdda838145443541d7e65f6e4c1f', class: "header" }, index.h("button", { key: 'c3558e8d2c0db9f9af21e711ac6f428a4a49acd6', class: "btn-back", onClick: this.onBack }, index.h("svg", { key: '28558bb462310b7a6a23608c7467a9e8ce2ea3b2', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { key: 'd645c1e278c6cbab619f67818675df71827ac33d', d: "M19 12H5M12 19l-7-7 7-7" })), index.h("span", { key: 'af0c12aaec5c0221556e2b3b094a82741540417c' }, "Regresar")), index.h("div", { key: 'e6802e1f9159a00dd01c547d958bb5279838bc78', class: "header__title-group" }, index.h("h1", { key: '0ab7ef82ad47d7664b31cf24a945a88fd4cbdedf', class: "title" }, "Resumen de tu orden"), hasItems && (index.h("span", { key: '57bcf4371865e75eabce8a4da2f4bc5598a1cf43', class: "item-count" }, itemCount, " ", itemCount === 1 ? 'artículo' : 'artículos')))), this.isLoading && (index.h("div", { key: 'e8ec7673aa7331762e22728e12987534ee0b3f37', class: "state-container" }, index.h("div", { key: '976f03187aeb44f5f3eae498c8df312f477069c7', class: "spinner" }), index.h("p", { key: '5a06e8d94acabbcf0833472cd8cb37a1617e8db6' }, "Cargando tu carrito..."))), this.error && !this.isLoading && (index.h("div", { key: 'bc0914b1ab30fc1f57b2045467b3dcac859c0300', class: "state-container state-container--error" }, index.h("svg", { key: '8b855cfe9c88ee6b8fc2dd84a8f4c07664115022', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, index.h("circle", { key: 'f6356ee719d4c1f3c06c05dbf2b7205fde228b0b', cx: "12", cy: "12", r: "10" }), index.h("line", { key: '5e5aedc072e5199916363ada43e233ae9b85f015', x1: "12", y1: "8", x2: "12", y2: "12" }), index.h("line", { key: '6c03cd384b149c328b299d589ef78afdb360a403', x1: "12", y1: "16", x2: "12.01", y2: "16" })), index.h("p", { key: '9a0f64eda564cc5ff6fd67d1aa5261704e30f2e2' }, this.error), index.h("button", { key: '9256deb1eb125209c379b3049da7cc608dcbf9a8', class: "btn-retry", onClick: () => this.loadCart() }, "Reintentar"))), !this.isLoading && !this.error && !hasItems && (index.h("div", { key: '6956c7ac65ace723f08e25acba5f9dc8367f8656', class: "state-container state-container--empty" }, index.h("svg", { key: '15a42e13d01378aa83d52fff595b95608ee86960', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, index.h("circle", { key: '9b6f07f084390e8cbefdbca9d864d0395d192025', cx: "9", cy: "21", r: "1" }), index.h("circle", { key: '6db62811ec31fd409b01506226fa69419d01d1d5', cx: "20", cy: "21", r: "1" }), index.h("path", { key: 'c68a17a366dd168222b0e22b0d13e24ddc7c7a6d', d: "M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" })), index.h("h3", { key: 'f32baa1ad21d0726fe5142cb94c0e3814310ad90' }, "Tu carrito est\u00E1 vac\u00EDo"), index.h("p", { key: '3aa024bce7c2236936f10f81ffcefa23fca6fdca' }, "Agrega productos para continuar con tu compra"), index.h("button", { key: '6e9d8620d8b5c871102931f64da36ccb0854ef16', class: "btn-back-catalog", onClick: this.onBack }, "Ir al cat\u00E1logo"))), !this.isLoading && !this.error && hasItems && (index.h("div", { key: '40c508f97742927150f8b5b3d5119d2eb9d033bc', class: "content-layout" }, index.h("div", { key: 'abcdc24817a266417a2860d1d4e55d2d7171567b', class: "products-column" }, equipmentItems.map((item, index) => this.renderEquipmentItem(item, index)), standalonePlans.map(plan => this.renderStandalonePlan(plan))), index.h("div", { key: '6aa4ab795217930bdd493fec770503f4eba7fe5b', class: "summary-column" }, this.renderPromoCode(), this.renderPaymentSummary(), this.renderTermsCheckbox(), index.h("button", { key: 'a55359ecc577a012268835e3813ebcd5f76ba925', class: {
                'btn-proceed': true,
                'disabled': !canProceed,
            }, onClick: this.handleProceed, disabled: !canProceed }, index.h("span", { key: '28a482c024ac541c6e6925586a0ce2071b4adeea' }, "Procesar orden"), index.h("svg", { key: '5c28b25c13af19eac07b61a4ac3d62aa1db177cd', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { key: '4bdd38dee0876c05542c2b23ddd8c0e7125d6add', d: "M5 12h14M12 5l7 7-7 7" })))))))));
    }
};
StepOrderSummary.style = stepOrderSummaryCss();

const stepPaymentCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-payment{width:100%;max-width:800px;margin:0 auto;padding:1.5rem;min-height:100vh}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back-nav{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem}.header .btn-back-nav svg{width:20px;height:20px}.header .btn-back-nav:hover{text-decoration:underline}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;flex:1}.content{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.loading-container h3{font-size:1.5rem;color:#1A1A1A;margin:1rem 0 0.5rem 0}.loading-container p{color:#666666;margin:0 0 0.5rem 0}.loading-container .warning{color:#DA291C;font-weight:500;font-size:0.875rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.payment-container{display:flex;flex-direction:column;gap:1.5rem}.payment-summary{background:#FAFAFA;border-radius:0.5rem;padding:1rem}.payment-summary h3{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.amount-display{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #E5E5E5}.amount-display .label{font-size:1rem;color:#666666}.amount-display .value{font-size:1.5rem;font-weight:700;color:#DA291C}.payment-items{margin-top:1rem}.payment-items .payment-item{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0;font-size:0.875rem}.payment-items .payment-item .item-type{color:#666666}.payment-items .payment-item .item-amount{color:#1A1A1A;font-weight:500}.iframe-container{border:1px solid #E5E5E5;border-radius:0.5rem;overflow:hidden;min-height:400px}.iframe-container iframe{display:block;border:none;width:100%}.iframe-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;background:#FAFAFA}.iframe-placeholder p{color:#666666;margin-top:1rem}.success-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.success-container .success-icon{width:80px;height:80px;background:rgb(209.6296296296, 237.3703703704, 219.2222222222);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.success-container .success-icon svg{width:48px;height:48px;color:#44AF69}.success-container h3{font-size:1.5rem;color:#44AF69;margin:0 0 0.5rem 0}.success-container p{color:#666666;margin:0 0 0.5rem 0}.success-container .redirect-note{font-size:0.875rem;color:#808080}.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.error-container .error-icon{width:80px;height:80px;background:rgb(245.2682926829, 183.75, 179.2317073171);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.error-container .error-icon svg{width:48px;height:48px;color:#DA291C}.error-container h3{font-size:1.5rem;color:#DA291C;margin:0 0 0.5rem 0}.error-container p{color:#666666;margin:0 0 1.5rem 0;max-width:400px}.error-actions{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}.btn-retry{height:44px;padding:0 1.5rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back{height:44px;padding:0 1.5rem;background:white;color:#4D4D4D;border:1px solid #CCCCCC;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#FAFAFA;border-color:#999999}.btn-cancel{align-self:center;height:44px;padding:0 1.5rem;background:white;color:#666666;border:1px solid #CCCCCC;border-radius:9999px;font-size:0.875rem;cursor:pointer;transition:all 0.2s}.btn-cancel:hover{background:#FAFAFA;border-color:#999999}`;

const StepPayment = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    get el() { return index.getElement(this); }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // Optional: External payment iframe URL
    paymentIframeUrl;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    screen = 'loading';
    error = null;
    cart = null;
    orderBan = '';
    totalAmount = 0;
    paymentItems = [];
    iframeUrl = '';
    iframeHeight = '500px';
    paymentResult = null;
    // User info for payment
    userName = '';
    userLastName = '';
    userEmail = '';
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadCartAndPreparePayment();
    }
    componentDidLoad() {
        // Listen for payment iframe messages
        window.addEventListener('message', this.handleIframeMessage);
    }
    disconnectedCallback() {
        window.removeEventListener('message', this.handleIframeMessage);
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadCartAndPreparePayment() {
        this.screen = 'loading';
        this.error = null;
        try {
            // Get cart data
            const cartResponse = await cartService.getCart();
            if (cartResponse.hasError) {
                this.error = cartResponse.message || 'Error al cargar el carrito';
                this.screen = 'error';
                return;
            }
            if (!cartResponse.products || cartResponse.products.length === 0) {
                this.error = 'El carrito está vacío';
                this.screen = 'error';
                return;
            }
            this.cart = cartResponse;
            // Build payment items
            this.paymentItems = paymentService.buildPaymentItems({
                depositAmount: cartResponse.depositAmount,
                totalDownPayment: cartResponse.totalDownPayment,
                totalTax: cartResponse.totalTax,
                totalPrice: cartResponse.totalPrice,
                installmentAmount: cartResponse.installmentAmount,
                cartUpdateResponse: cartResponse.cartUpdateResponse,
            });
            // Calculate total
            this.totalAmount = this.paymentItems.length > 0
                ? paymentService.calculateTotalAmount(this.paymentItems)
                : cartResponse.totalPrice || 0;
            // Get user info from shipping
            const shippingAddress = shippingService.getStoredShippingAddress();
            if (shippingAddress) {
                const nameParts = shippingAddress.name.split(' ');
                this.userName = nameParts[0] || '';
                this.userLastName = nameParts.slice(1).join(' ') || '';
                this.userEmail = shippingAddress.email;
            }
            // Create the order
            await this.createOrder();
        }
        catch (err) {
            console.error('[StepPayment] Error:', err);
            this.error = 'Error de conexión';
            this.screen = 'error';
        }
    }
    async createOrder() {
        this.screen = 'creating-order';
        try {
            const zipCode = shippingService.getZipCode();
            const response = await paymentService.createOrder({
                flowId: '5', // CLARO HOGAR flow
                frontFlowId: '1',
                frontFlowName: 'CLARO HOGAR Purchase',
                amount: this.totalAmount.toString(),
                email: this.userEmail,
                zipCode: zipCode,
                deposit: (this.cart?.totalDownPayment || 0).toString(),
            });
            if (response.hasError) {
                this.error = response.errorDisplay || response.message || 'Error al crear la orden';
                this.screen = 'error';
                return;
            }
            this.orderBan = response.ban || '';
            // Now get the payment iframe
            await this.initializePaymentIframe();
        }
        catch (err) {
            console.error('[StepPayment] Create order error:', err);
            this.error = 'Error al crear la orden';
            this.screen = 'error';
        }
    }
    async initializePaymentIframe() {
        if (this.totalAmount <= 0) {
            // Free purchase - no payment needed
            await this.handleFreePayment();
            return;
        }
        try {
            const iframeRequest = {
                firstName: this.userName,
                lastName: this.userLastName,
                email: this.userEmail,
                amount: this.totalAmount,
                transactionType: this.paymentItems.length > 0 ? 'MULTIPLE' : 'payment',
                selectBan: this.orderBan,
                permissions: {
                    provision: true,
                    displayConfirmation: true,
                    emailNotification: true,
                    showInstrument: true,
                    stroeInstrument: true,
                    useBanZipCode: true,
                },
                paymentItems: this.paymentItems.length > 0 ? this.paymentItems : undefined,
            };
            const response = await paymentService.getPaymentIframe(iframeRequest);
            if (response.errorInfo?.hasError || !response.url) {
                this.error = response.errorInfo?.errorDisplay || 'Error al inicializar el pago';
                this.screen = 'error';
                return;
            }
            this.iframeUrl = response.url;
            this.screen = 'payment';
        }
        catch (err) {
            console.error('[StepPayment] Init iframe error:', err);
            this.error = 'Error al inicializar el formulario de pago';
            this.screen = 'error';
        }
    }
    handleIframeMessage = (event) => {
        if (typeof event.data !== 'string')
            return;
        try {
            const data = JSON.parse(atob(event.data));
            if (data.state === 'dimensions') {
                this.iframeHeight = data.data.height;
            }
            if (data.state === 'canceled') {
                this.handlePaymentCancel();
            }
            if (data.state === 'paymentResult') {
                if (data.data) {
                    const resultString = data.data;
                    const result = JSON.parse(resultString).paymentResult;
                    const paymentResult = JSON.parse(atob(result));
                    if (paymentResult.success) {
                        this.handlePaymentSuccess(paymentResult);
                    }
                    else {
                        this.handlePaymentError(paymentResult);
                    }
                }
            }
        }
        catch {
            // Ignore non-payment messages
        }
    };
    async handlePaymentSuccess(result) {
        this.screen = 'processing';
        this.paymentResult = result;
        try {
            const recordResponse = await paymentService.recordPayment({
                ban: this.orderBan,
                cardNumber: result.paymentCard || '',
                cardType: result.paymentMethod || '',
                authorizationNumber: result.authorizationNumber || '',
                referenceNumber: result.provisioning?.referenceNumber || '',
                description: result.description || '',
                operationId: result.operationId || '',
                amount: this.totalAmount.toString(),
                deposit: (this.cart?.totalDownPayment || 0).toString(),
            });
            if (recordResponse.hasError) {
                this.error = recordResponse.errorDisplay || 'Error al registrar el pago';
                this.screen = 'error';
                return;
            }
            // Store payment result and proceed
            paymentService.storePaymentResult(result);
            this.screen = 'success';
            // Auto-proceed after short delay
            setTimeout(() => {
                this.onNext?.();
            }, 2000);
        }
        catch (err) {
            console.error('[StepPayment] Record payment error:', err);
            this.error = 'Error al registrar el pago';
            this.screen = 'error';
        }
    }
    async handlePaymentError(result) {
        await paymentService.recordPaymentError(this.orderBan, '', result.description || 'Payment failed', result.operationId || '', (this.cart?.totalDownPayment || 0).toString(), result.paymentMethod || '', result.paymentCard || '', this.totalAmount.toString());
        this.error = result.description || 'El pago no pudo ser procesado';
        this.screen = 'error';
    }
    handlePaymentCancel() {
        this.onBack?.();
    }
    async handleFreePayment() {
        this.screen = 'processing';
        try {
            const operationId = Math.floor(Math.random() * 900000 + 100000).toString();
            const recordResponse = await paymentService.recordPayment({
                ban: this.orderBan,
                cardNumber: '1111',
                cardType: 'V',
                authorizationNumber: 'FREEPR',
                referenceNumber: 'FREEPROMO',
                description: 'Free promotion',
                operationId: operationId,
                amount: '0',
                deposit: '0',
            });
            if (recordResponse.hasError) {
                this.error = recordResponse.errorDisplay || 'Error al procesar';
                this.screen = 'error';
                return;
            }
            this.screen = 'success';
            setTimeout(() => {
                this.onNext?.();
            }, 2000);
        }
        catch (err) {
            console.error('[StepPayment] Free payment error:', err);
            this.error = 'Error al procesar';
            this.screen = 'error';
        }
    }
    handleRetry = () => {
        this.loadCartAndPreparePayment();
    };
    formatPrice(price) {
        return `$${(price || 0).toFixed(2)}`;
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    renderLoading() {
        return (index.h("div", { class: "loading-container" }, index.h("div", { class: "spinner" }), index.h("p", null, "Cargando informaci\u00F3n del pago...")));
    }
    renderCreatingOrder() {
        return (index.h("div", { class: "loading-container" }, index.h("div", { class: "spinner" }), index.h("h3", null, "Preparando tu orden"), index.h("p", null, "Por favor espera mientras procesamos tu solicitud..."), index.h("p", { class: "warning" }, "No cierres esta ventana ni navegues a otra p\u00E1gina.")));
    }
    renderPaymentForm() {
        return (index.h("div", { class: "payment-container" }, index.h("div", { class: "payment-summary" }, index.h("h3", null, "Resumen del pago"), index.h("div", { class: "amount-display" }, index.h("span", { class: "label" }, "Total a pagar:"), index.h("span", { class: "value" }, this.formatPrice(this.totalAmount))), this.paymentItems.length > 0 && (index.h("div", { class: "payment-items" }, this.paymentItems.map((item) => (index.h("div", { class: "payment-item" }, index.h("span", { class: "item-type" }, this.getPaymentTypeLabel(item.paymentType)), index.h("span", { class: "item-amount" }, this.formatPrice(item.amount)))))))), index.h("div", { class: "iframe-container" }, this.iframeUrl ? (index.h("iframe", { src: this.iframeUrl, width: "100%", height: this.iframeHeight, frameBorder: "0", title: "Payment Form" })) : (index.h("div", { class: "iframe-placeholder" }, index.h("div", { class: "spinner" }), index.h("p", null, "Cargando formulario de pago...")))), index.h("button", { class: "btn-cancel", onClick: () => this.handlePaymentCancel() }, "Cancelar")));
    }
    renderProcessing() {
        return (index.h("div", { class: "loading-container" }, index.h("div", { class: "spinner" }), index.h("h3", null, "Procesando pago"), index.h("p", null, "Por favor espera mientras confirmamos tu pago...")));
    }
    renderSuccess() {
        return (index.h("div", { class: "success-container" }, index.h("div", { class: "success-icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), index.h("polyline", { points: "22 4 12 14.01 9 11.01" }))), index.h("h3", null, "Pago exitoso"), index.h("p", null, "Tu pago ha sido procesado correctamente."), index.h("p", { class: "redirect-note" }, "Redirigiendo a la confirmaci\u00F3n...")));
    }
    renderError() {
        return (index.h("div", { class: "error-container" }, index.h("div", { class: "error-icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("circle", { cx: "12", cy: "12", r: "10" }), index.h("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), index.h("line", { x1: "9", y1: "9", x2: "15", y2: "15" }))), index.h("h3", null, "Error en el pago"), index.h("p", null, this.error), index.h("div", { class: "error-actions" }, index.h("button", { class: "btn-retry", onClick: this.handleRetry }, "Intentar nuevamente"), index.h("button", { class: "btn-back", onClick: () => this.onBack?.() }, "Volver"))));
    }
    getPaymentTypeLabel(type) {
        const labels = {
            DEPOSIT: 'Depósito',
            DOWNPAYMENT: 'Pago inicial',
            TAXES: 'Impuestos',
            INSTALLMENT: 'Cuotas',
            PASTDUEONLY: 'Balance pendiente',
        };
        return labels[type] || type;
    }
    render() {
        return (index.h(index.Host, { key: '244b9d9cfebdceabf3d3a3bdf632c909587dc300' }, index.h("div", { key: 'fe4eb660c01f29c76bba4d0e0fb3bf70093f9f48', class: "step-payment" }, index.h("div", { key: '6539d4c6899c638f8b7c1d752116746891995a0c', class: "header" }, this.screen !== 'processing' && this.screen !== 'success' && (index.h("button", { key: '7c544aef3f7fbfaaeda24e705a2e01b20fe91bcc', class: "btn-back-nav", onClick: () => this.onBack?.() }, index.h("svg", { key: '85e53558ee358a157bb99693e64ce1e9fbc4aae8', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { key: '5783eb28e66f54e2fd54d0c3e716265b23a57662', d: "M19 12H5M12 19l-7-7 7-7" })), "Regresar")), index.h("h1", { key: '4aa590ba3bb6c7dadc0669e82b357fcdbb824fe2', class: "title" }, "Pago")), index.h("div", { key: '8f4705155f8b553de4bc31e712041f91adebcbfd', class: "content" }, this.screen === 'loading' && this.renderLoading(), this.screen === 'creating-order' && this.renderCreatingOrder(), this.screen === 'payment' && this.renderPaymentForm(), this.screen === 'processing' && this.renderProcessing(), this.screen === 'success' && this.renderSuccess(), this.screen === 'error' && this.renderError()))));
    }
};
StepPayment.style = stepPaymentCss();

const stepPlansCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-plans{width:100%;min-height:100vh;padding:1.5rem;padding-bottom:180px}@media (min-width: 768px){.step-plans{padding:2rem;padding-bottom:140px}}.step-plans__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}.step-plans__title{font-size:1.5rem;font-weight:700;color:#333333;margin:0}@media (min-width: 768px){.step-plans__title{font-size:1.75rem}}.step-plans__btn-back{background:#FFFFFF;border:2px solid #0097A9;color:#0097A9;padding:0.5rem 1.5rem;border-radius:9999px;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.2s ease}.step-plans__btn-back:hover{background:#0097A9;color:#FFFFFF}.step-plans__loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__spinner{width:40px;height:40px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.step-plans__error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#DA291C}.step-plans__error button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__error button:disabled{opacity:0.5;cursor:not-allowed}.step-plans__error button{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-plans__error button:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-plans__error button:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-plans__error button{margin-top:1rem}.step-plans__carousel-container{padding:1rem 0 3rem}.step-plans__empty{display:flex;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__footer{position:fixed;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;padding:0.75rem 1.5rem;z-index:200;box-shadow:0 -4px 12px rgba(0, 0, 0, 0.1);display:flex;align-items:center;justify-content:space-between}@media (max-width: 767px){.step-plans__footer{flex-direction:column;gap:0.75rem;padding:1rem}}.step-plans__footer-left{display:flex;flex-direction:column}@media (max-width: 767px){.step-plans__footer-left{width:100%}}.step-plans__footer-info{display:flex;gap:1.5rem}.step-plans__footer-item{display:flex;flex-direction:column}.step-plans__footer-item--separator{padding-left:1.5rem;border-left:1px solid #E5E5E5}.step-plans__footer-label{font-size:0.75rem;color:#666666}.step-plans__footer-value{font-size:1.25rem;font-weight:700;color:#333333}.step-plans__footer-value--highlight{color:#DA291C}.step-plans__footer-note{font-size:0.75rem;color:#808080;margin:0.25rem 0 0}.step-plans__footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__footer-btn:disabled{opacity:0.5;cursor:not-allowed}.step-plans__footer-btn{height:48px;background-color:#DA291C;color:#FFFFFF}.step-plans__footer-btn:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-plans__footer-btn:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-plans__footer-btn{min-width:160px}@media (max-width: 767px){.step-plans__footer-btn{width:100%}}.plan-card{background:#FFFFFF;border-radius:16px;border:2px solid #0097A9;box-shadow:0 2px 12px rgba(0, 0, 0, 0.1);overflow:hidden;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;height:100%;min-height:340px}.plan-card:hover{box-shadow:0 6px 20px rgba(0, 151, 169, 0.25);transform:translateY(-2px)}.plan-card--selected{border-color:#0097A9;box-shadow:0 6px 24px rgba(0, 151, 169, 0.3)}.plan-card--processing{pointer-events:none;opacity:0.8}.plan-card__header{display:flex;justify-content:center;padding-top:0}.plan-card__name{background:#1a1a1a;color:#FFFFFF;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;padding:0.75rem 1rem;width:70%;text-align:center;border-radius:0 0 12px 12px}.plan-card__body{flex:1;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column}.plan-card__includes-label{font-size:1rem;color:#666666;margin:0 0 0.75rem;font-weight:500}.plan-card__features{list-style:none;padding:0;margin:0 0 1rem;text-align:center;flex:1}.plan-card__feature{margin-bottom:0.5rem;font-size:0.875rem;color:#333333;font-weight:600}.plan-card__feature:last-child{margin-bottom:0}.plan-card__price{font-size:1.75rem;font-weight:700;color:#0097A9;margin:1rem 0 0}.plan-card__footer{padding:1rem}.plan-card__btn{width:100%;padding:0.75rem 1rem;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;background:#0097A9;color:#FFFFFF;border:2px solid #0097A9}.plan-card__btn:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--selected{background:#0097A9;color:#FFFFFF;border-color:#0097A9}.plan-card__btn--selected:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--loading{cursor:wait;opacity:0.8}.plan-card__btn:disabled{cursor:not-allowed;opacity:0.6}.plan-card__btn-loading{display:inline-flex;align-items:center;gap:0.5rem}.plan-card__btn-spinner{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepPlans = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    plans = [];
    selectedPlan = null;
    isLoading = true;
    error = null;
    isAddingToCart = false;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentWillLoad() {
        await this.loadPlans();
        // Check if there's a previously selected plan in session
        const storedPlanId = plansService.getStoredPlanId();
        if (storedPlanId > 0) {
            const storedPlan = this.plans.find(p => p.planId === storedPlanId);
            if (storedPlan) {
                this.selectedPlan = storedPlan;
                flowActions.selectPlan(storedPlan);
            }
        }
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadPlans() {
        this.isLoading = true;
        this.error = null;
        try {
            const serviceType = state.location?.serviceType || 'GPON';
            // For CLARO HOGAR, get subcatalogId from productService (stored when product was selected)
            let catalogId = 0;
            if (serviceType === 'CLARO HOGAR') {
                // Use subcatalogId from session (set in step-catalogue when product was selected)
                catalogId = productService.getSubcatalogId();
                console.log('[StepPlans] CLARO HOGAR - using subcatalogId:', catalogId);
            }
            this.plans = await plansService.getPlans(serviceType, catalogId);
            this.plans = plansService.sortByPrice(this.plans);
        }
        catch (err) {
            this.error = 'Error al cargar los planes';
            console.error(err);
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Handles plan selection - following TEL's flow:
     * 1. Check if there's an existing different plan -> delete it
     * 2. Store plan in session
     * 3. Call addToCart API
     */
    handleSelectPlan = async (plan) => {
        // If clicking the same plan, do nothing
        if (this.selectedPlan?.planId === plan.planId) {
            return;
        }
        this.isAddingToCart = true;
        this.error = null;
        try {
            // Step 1: If there's a different plan already in cart, delete it first (TEL pattern)
            const currentPlanId = plansService.getStoredPlanId();
            const currentCartId = plansService.getCartId();
            if (currentPlanId > 0 && currentPlanId !== plan.planId && currentCartId > 0) {
                console.log('[StepPlans] Removing previous plan from cart:', currentPlanId);
                await plansService.deleteFromCart(currentCartId);
            }
            // Step 2: Add new plan to cart
            console.log('[StepPlans] Adding plan to cart:', plan.planId, plan.planName);
            await plansService.addToCart(plan);
            // Step 3: Update local state
            this.selectedPlan = plan;
            flowActions.selectPlan(plan);
            console.log('[StepPlans] Plan added successfully');
        }
        catch (err) {
            console.error('[StepPlans] Error adding plan to cart:', err);
            this.error = 'Error al agregar el plan. Por favor intente de nuevo.';
            // Still allow selection locally even if cart API fails
            // This way the user can continue the flow
            this.selectedPlan = plan;
            flowActions.selectPlan(plan);
        }
        finally {
            this.isAddingToCart = false;
        }
    };
    handleContinue = () => {
        if (this.selectedPlan && !this.isAddingToCart) {
            this.onNext?.();
        }
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderPlanCard(plan) {
        const isSelected = this.selectedPlan?.planId === plan.planId;
        const isProcessing = this.isAddingToCart && isSelected;
        const features = plansService.parsePlanFeatures(plan.planDesc || '');
        // Default features if none parsed
        const displayFeatures = features.length > 0 ? features : [
            'Internet fibra 1',
            'Internet 2',
            'Internet 3'
        ];
        return (index.h("div", { class: {
                'plan-card': true,
                'plan-card--selected': isSelected,
                'plan-card--processing': isProcessing,
            }, onClick: () => !this.isAddingToCart && this.handleSelectPlan(plan) }, index.h("div", { class: "plan-card__header" }, index.h("span", { class: "plan-card__name" }, plan.planName)), index.h("div", { class: "plan-card__body" }, index.h("p", { class: "plan-card__includes-label" }, "Plan incluye"), index.h("ul", { class: "plan-card__features" }, displayFeatures.slice(0, 4).map((feature) => (index.h("li", { class: "plan-card__feature" }, feature)))), index.h("p", { class: "plan-card__price" }, formatPrice(plan.decPrice))), index.h("div", { class: "plan-card__footer" }, index.h("button", { class: {
                'plan-card__btn': true,
                'plan-card__btn--selected': isSelected,
                'plan-card__btn--loading': isProcessing,
            }, disabled: this.isAddingToCart }, isProcessing ? (index.h("span", { class: "plan-card__btn-loading" }, index.h("span", { class: "plan-card__btn-spinner" }), "Agregando...")) : isSelected ? ('Plan seleccionado') : ('Solicitar plan')))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const monthlyPayment = this.selectedPlan ? this.selectedPlan.decPrice : 0;
        const totalToday = 0;
        return (index.h(index.Host, { key: '3b5f35cdfc65071e8812f2fed7ee34235d79f286' }, index.h("div", { key: '965c768228db89a86b0750530448f181e4c2df2c', class: "step-plans" }, index.h("header", { key: 'd25edd634609f7b234b7fae6eb240d296b015593', class: "step-plans__header" }, index.h("h1", { key: 'b1a105e2c2bbb544b4daab329c6912087cf62704', class: "step-plans__title" }, "Elige tu plan"), index.h("button", { key: '6ef1b13c36060d6fdb88a9cb58b723d99dc369f5', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (index.h("div", { key: '15df9d2b0979776f1a4b955fc24c6ea0d104dc62', class: "step-plans__loading" }, index.h("div", { key: 'da32e48865d242ac96eb417c9ca73c62c8d553fc', class: "step-plans__spinner" }), index.h("p", { key: '65718e3a2daf46185c69beb8904daf5738fbd271' }, "Cargando planes..."))), this.error && (index.h("div", { key: 'caaeda8da6c56994f58bb9ffe6330ea90ba8dd98', class: "step-plans__error" }, index.h("p", { key: '53dc7b6ebef2312749c01822d0a6fbfe800b0674' }, this.error), index.h("button", { key: '1aed81ca60266a511e186b474a373e5ba8ab551b', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (index.h("div", { key: 'aa59736d6519793c9d996640e983f2d506faf44c', class: "step-plans__carousel-container" }, index.h("ui-carousel", { key: '773cd7419cdc06d666b4758a9646937f536a6c23', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (index.h("div", { key: 'dfa93f76c6c720dba90390847c289252d9b1a5d0', class: "step-plans__empty" }, index.h("p", { key: 'df6e96c8d5569bb09dc5953488b648c4d425e862' }, "No hay planes disponibles para tu \u00E1rea."))), index.h("footer", { key: '8585e64071fbc151e90f9a383c66ba7c3f12a336', class: "step-plans__footer" }, index.h("div", { key: 'e105849c2d79c498031df5288a333be5a41f952c', class: "step-plans__footer-left" }, index.h("div", { key: 'eddebc80cd3fd9e7f15c2aa805d754ef1a17a5f9', class: "step-plans__footer-info" }, index.h("div", { key: 'f328fe8e1cdd693d62c9163abe19cd324bcd38af', class: "step-plans__footer-item" }, index.h("span", { key: 'e4b50fde1732f99b35223798c7c74a8942546269', class: "step-plans__footer-label" }, "Pago mensual"), index.h("span", { key: '69c4b91dfbe16817d57b7e426a1ea232a646e70b', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), index.h("div", { key: '3828030feced42fb91ea1fb0b58f0487c0a8fa7a', class: "step-plans__footer-item step-plans__footer-item--separator" }, index.h("span", { key: '2290f459bf81380569c371108abc6f3b32f6e5ff', class: "step-plans__footer-label" }, "Paga hoy"), index.h("span", { key: '32965be558fb02cef1fc19f583ca69c8641d3a74', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), index.h("p", { key: '8c5f8fcb67526111c82893455f4d39965e1baeee', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), index.h("button", { key: '545ccea3208a4968bb8ab903e880262407202612', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
    }
};
StepPlans.style = stepPlansCss();

const stepProductDetailCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-product-detail{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.loading-container,.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;padding:2rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:0.25rem;vertical-align:middle}@keyframes spin{to{transform:rotate(360deg)}}.error-container p{color:#DA291C;margin-bottom:1rem;font-size:1.25rem}.error-container button{margin:0.25rem}.btn-retry{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.breadcrumb{display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;font-size:0.875rem;color:#666666}.breadcrumb-item{cursor:pointer;transition:color 0.2s}.breadcrumb-item:hover{color:#0097A9}.breadcrumb-item.active{color:#1A1A1A;font-weight:500;cursor:default}.breadcrumb-item.active:hover{color:#1A1A1A}.breadcrumb-separator{color:#999999}.product-container{background:white;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:2rem}.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem}@media (max-width: 768px){.product-grid{grid-template-columns:1fr}}.product-image-section{display:flex;align-items:flex-start;justify-content:center;width:100%;max-width:450px;margin:0 auto}.product-image-section ui-image-carousel{width:100%}.image-container{width:100%;max-width:400px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#FAFAFA;border-radius:0.5rem;padding:1rem}.product-image{max-width:100%;max-height:100%;object-fit:contain}.product-details-section{display:flex;flex-direction:column;gap:1rem}.brand-name{font-size:0.875rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px}.product-name{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;line-height:1.2}.product-description{font-size:1rem;color:#666666;line-height:1.6;margin:0}.selector-section{padding:1rem 0;border-top:1px solid #F5F5F5}.selector-section:first-of-type{border-top:none}.selector-title{font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 0.5rem 0;text-transform:uppercase;letter-spacing:0.5px}.color-options{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem}.color-circle{width:40px;height:40px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0}.color-circle:hover{transform:scale(1.1)}.color-circle.selected{border-color:#0097A9;box-shadow:0 0 0 2px white, 0 0 0 4px #0097A9}.color-circle .check-icon{width:18px;height:18px}.selected-label{font-size:0.875rem;color:#666666}.storage-options{display:flex;gap:0.5rem;flex-wrap:wrap}.storage-button{padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;font-size:0.875rem;font-weight:500;color:#4D4D4D;transition:all 0.2s}.storage-button:hover{border-color:#0097A9;color:#0097A9}.storage-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1);color:#0097A9}.installment-options{display:flex;gap:0.5rem;flex-wrap:wrap}.installment-button{display:flex;flex-direction:column;align-items:center;padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;transition:all 0.2s;min-width:100px}.installment-button:hover{border-color:#0097A9}.installment-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1)}.installment-button.selected .months,.installment-button.selected .price{color:#0097A9}.installment-button .months{font-size:0.875rem;font-weight:600;color:#4D4D4D}.installment-button .price{font-size:0.75rem;color:#808080;margin-top:2px}.quantity-selector{display:flex;align-items:center;gap:1rem}.qty-button{width:36px;height:36px;border:2px solid #CCCCCC;border-radius:0.5rem;background:white;cursor:pointer;font-size:1.25rem;font-weight:600;color:#4D4D4D;display:flex;align-items:center;justify-content:center;transition:all 0.2s}.qty-button:hover:not(:disabled){border-color:#0097A9;color:#0097A9}.qty-button:disabled{opacity:0.4;cursor:not-allowed}.qty-value{font-size:1.25rem;font-weight:600;color:#1A1A1A;min-width:30px;text-align:center}.price-section{background:#FAFAFA;border-radius:0.5rem;padding:1rem;margin-top:0.5rem}.price-row{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0}.price-row.monthly .value{font-size:1.5rem;font-weight:700;color:#DA291C}.price-row.total{border-top:1px solid #E5E5E5;padding-top:0.5rem;margin-top:0.25rem}.price-row.total .value{font-weight:600}.price-row .label{font-size:0.875rem;color:#666666}.price-row .value{font-size:1rem;color:#1A1A1A}.btn-add-to-cart{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:1rem}.btn-add-to-cart:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-add-to-cart:disabled{opacity:0.7;cursor:not-allowed}.btn-add-to-cart.loading{background:#808080}.btn-add-to-cart .loading-text{display:flex;align-items:center;justify-content:center}.btn-back-link{background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.5rem;margin-top:0.25rem;transition:color 0.2s}.btn-back-link:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.btn-back{background:#E5E5E5;color:#4D4D4D;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:500}.btn-back:hover{background:#CCCCCC}.features-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.features-title,.specs-title{font-size:1.25rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.features-list{margin:0;padding:0 0 0 1.5rem}.features-list .feature-item{padding:0.25rem 0;color:#4D4D4D;line-height:1.5}.specs-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.specs-grid{display:grid;grid-template-columns:repeat(2, 1fr);gap:0.5rem}@media (max-width: 576px){.specs-grid{grid-template-columns:1fr}}.spec-item{display:flex;justify-content:space-between;padding:0.5rem;background:#FAFAFA;border-radius:0.25rem}.spec-item .spec-label{font-size:0.875rem;color:#666666}.spec-item .spec-value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.availability-status{display:flex;align-items:center;gap:0.25rem;padding:0.5rem 0}.availability-status--available{display:flex;align-items:center;gap:0.25rem;color:#44AF69;font-weight:500;font-size:0.875rem}.availability-status--unavailable{display:flex;align-items:center;gap:0.25rem;color:#DA291C;font-weight:500;font-size:0.875rem}.availability-icon{width:18px;height:18px}.unavailable-alert-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem}.unavailable-alert{background:white;border-radius:0.75rem;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);animation:alertSlideIn 0.3s ease-out}.unavailable-alert__icon{width:64px;height:64px;margin:0 auto 1rem;background:rgba(218, 41, 28, 0.1);border-radius:50%;display:flex;align-items:center;justify-content:center}.unavailable-alert__icon svg{width:32px;height:32px;color:#DA291C}.unavailable-alert__title{font-size:1.5rem;font-weight:700;color:#1A1A1A;margin:0 0 0.5rem 0}.unavailable-alert__message{font-size:1rem;color:#666666;line-height:1.6;margin:0 0 1.5rem 0}.unavailable-alert__btn{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.unavailable-alert__btn:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}@keyframes alertSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}.btn-add-to-cart.disabled{background:#999999;cursor:not-allowed}.btn-add-to-cart.disabled:hover{background:#999999}`;

const StepProductDetail = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    product = null;
    catalogueProduct = null;
    isLoading = true;
    error = null;
    isAddingToCart = false;
    // Selection states
    selectedColorIndex = 0;
    selectedStorageIndex = 0;
    selectedInstallments = 36;
    quantity = 1;
    // Availability state
    isAvailable = true;
    showUnavailableAlert = false;
    // Parsed options
    colorOptions = [];
    storageOptions = [];
    installmentOptions = [];
    // Product images for carousel
    productImages = [];
    // Stock threshold (TEL uses entryBarrier = 1, so stock > 1 means available)
    ENTRY_BARRIER = 1;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadProductDetail();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadProductDetail() {
        this.isLoading = true;
        this.error = null;
        try {
            // Get product from session (stored by step-catalogue)
            const storedProduct = catalogueService.getStoredProduct();
            if (!storedProduct) {
                this.error = 'No se encontró el producto seleccionado';
                this.isLoading = false;
                return;
            }
            this.catalogueProduct = storedProduct;
            // Fetch detailed product info from API
            const response = await productService.getEquipmentDetail(storedProduct.productId);
            if (response.hasError || !response.product) {
                // If API fails, use catalogue data as fallback
                console.warn('[StepProductDetail] API failed, using catalogue data');
                this.product = this.mapCatalogueToDetail(storedProduct);
            }
            else {
                this.product = response.product;
            }
            // Parse options
            this.parseColorOptions();
            this.parseStorageOptions();
            this.parseInstallmentOptions();
            // Build images array for carousel
            this.buildProductImages();
            // Check product availability (TEL pattern: stock > entryBarrier)
            this.checkAvailability();
            // Store in session
            productService.storeSelectedProduct(this.product);
            productService.storeDeviceType('home');
        }
        catch (err) {
            console.error('[StepProductDetail] Error:', err);
            this.error = 'Error al cargar el detalle del producto';
        }
        finally {
            this.isLoading = false;
        }
    }
    mapCatalogueToDetail(cat) {
        return {
            productId: cat.productId,
            productName: cat.productName,
            imgUrl: cat.imgUrl,
            regular_price: cat.regular_price,
            update_price: cat.update_price,
            installments: cat.installments,
            shortDescription: cat.shortDescription,
            colors: cat.colors?.map((c, i) => ({
                colorId: i,
                colorName: `Color ${i + 1}`,
                webColor: c.webColor,
            })),
            home: true,
            catalogId: 6,
        };
    }
    parseColorOptions() {
        if (!this.product?.colors || this.product.colors.length === 0) {
            // Default single color if none specified
            this.colorOptions = [{
                    colorId: 0,
                    colorName: 'Default',
                    webColor: '#333333',
                }];
            return;
        }
        this.colorOptions = this.product.colors.map((color, index) => ({
            colorId: color.colorId || index,
            colorName: color.colorName || `Color ${index + 1}`,
            webColor: color.webColor || '#333333',
            productId: color.productId,
            imgUrl: color.imgUrl,
        }));
    }
    parseStorageOptions() {
        if (!this.product?.storages || this.product.storages.length === 0) {
            // No storage options for this product
            this.storageOptions = [];
            return;
        }
        this.storageOptions = this.product.storages.map((storage, index) => ({
            storageId: storage.storageId || index,
            storageName: storage.storageName || storage.name || `${storage.size}GB`,
            productId: storage.productId,
            price: storage.price,
        }));
    }
    parseInstallmentOptions() {
        const totalPrice = this.product?.regular_price || 0;
        const defaultInstallments = this.product?.installments || 36;
        // Common installment options
        const options = [12, 24, 36];
        this.installmentOptions = options.map(months => ({
            months,
            monthlyPrice: Number((totalPrice / months).toFixed(2)),
            totalPrice,
        }));
        // Set default selection
        this.selectedInstallments = defaultInstallments;
    }
    /**
     * Builds the product images array for the carousel
     * Following TEL pattern: combines main image, detail image, and any additional images
     */
    buildProductImages() {
        if (!this.product) {
            this.productImages = [];
            return;
        }
        const images = [];
        // Add images from product.images if available (already processed by service)
        if (this.product.images?.length) {
            images.push(...this.product.images);
        }
        // Fallback: use single imgUrl if no images array
        else if (this.product.imgUrl) {
            images.push(this.product.imgUrl);
        }
        // Add color-specific images if available
        if (this.colorOptions?.length > 0) {
            this.colorOptions.forEach(color => {
                if (color.imgUrl && !images.includes(color.imgUrl)) {
                    images.push(color.imgUrl);
                }
            });
        }
        this.productImages = images;
        console.log('[StepProductDetail] Product images:', this.productImages.length);
    }
    /**
     * Checks product availability based on stock quantity
     * Following TEL pattern: hasStock = stock > entryBarrier
     *
     * TEL's product.service.ts uses:
     *   - entryBarrier = 1
     *   - hasStock = (stock > entryBarrier)
     *
     * The stock value comes from colors[].storages[].products[0].stock in the API response
     * which is now extracted by productService.getEquipmentDetail()
     */
    checkAvailability() {
        if (!this.product) {
            this.isAvailable = false;
            this.showUnavailableAlert = true;
            return;
        }
        // TEL Pattern: stock > entryBarrier (where entryBarrier = 1)
        // If stock is undefined, it means the colors structure wasn't present or no products found
        // In that case, we check if product has valid basic data and assume available
        if (this.product.stock === undefined || this.product.stock === null) {
            // No stock info from nested structure - assume available if product has basic data
            this.isAvailable = true;
            console.log('[StepProductDetail] Availability check - stock undefined (no colors structure), assuming available');
        }
        else {
            // TEL Pattern: hasStock = stock > entryBarrier (1)
            this.isAvailable = this.product.stock > this.ENTRY_BARRIER;
            console.log('[StepProductDetail] Availability check (TEL pattern) - stock:', this.product.stock, '> entryBarrier:', this.ENTRY_BARRIER, '=', this.isAvailable);
            if (!this.isAvailable) {
                this.showUnavailableAlert = true;
            }
        }
    }
    /**
     * Handles dismissing the unavailable alert and going back
     */
    handleGoBackFromAlert = () => {
        this.showUnavailableAlert = false;
        this.onBack?.();
    };
    handleColorSelect = (index) => {
        this.selectedColorIndex = index;
        const color = this.colorOptions[index];
        // Store selected color
        productService.storeSelectedColor(color.colorId, color.colorName, color.webColor);
        // Update product image if color has specific image
        if (color.imgUrl && this.product) {
            this.product = { ...this.product, imgUrl: color.imgUrl };
        }
    };
    handleStorageSelect = (index) => {
        this.selectedStorageIndex = index;
        const storage = this.storageOptions[index];
        // Store selected storage
        productService.storeSelectedStorage(storage.storageId, storage.storageName);
        // Update children ID if storage has specific product
        if (storage.productId) {
            productService.storeChildrenId(storage.productId);
        }
    };
    handleInstallmentSelect = (months) => {
        this.selectedInstallments = months;
    };
    // Quantity selector commented out - keeping function for future use
    // private handleQuantityChange = (delta: number) => {
    //   const newQty = this.quantity + delta;
    //   if (newQty >= 1 && newQty <= 5) {
    //     this.quantity = newQty;
    //   }
    // };
    handleAddToCart = async () => {
        if (!this.product || this.isAddingToCart)
            return;
        this.isAddingToCart = true;
        try {
            const response = await cartService.addToCart(this.product, this.selectedInstallments, this.quantity);
            if (response.hasError) {
                console.error('[StepProductDetail] Add to cart failed:', response.message);
                this.error = response.message || 'Error al agregar al carrito';
                return;
            }
            // Store mainId for next steps
            if (response.code) {
                cartService.storeMainId(response.code);
                productService.storeMainId(response.code);
            }
            console.log('[StepProductDetail] Added to cart, proceeding to plans');
            // Navigate to next step (plans selection)
            this.onNext?.();
        }
        catch (err) {
            console.error('[StepProductDetail] Error:', err);
            this.error = 'Error al agregar el producto al carrito';
        }
        finally {
            this.isAddingToCart = false;
        }
    };
    getCurrentMonthlyPrice() {
        const option = this.installmentOptions.find(o => o.months === this.selectedInstallments);
        return option?.monthlyPrice || this.product?.update_price || 0;
    }
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderBreadcrumb() {
        return (index.h("div", { class: "breadcrumb" }, index.h("span", { class: "breadcrumb-item", onClick: this.onBack }, "Cat\u00E1logo"), index.h("span", { class: "breadcrumb-separator" }, ">"), index.h("span", { class: "breadcrumb-item active" }, this.product?.productName || 'Detalle')));
    }
    renderColorSelector() {
        if (this.colorOptions.length <= 1)
            return null;
        return (index.h("div", { class: "selector-section" }, index.h("h4", { class: "selector-title" }, "Color"), index.h("div", { class: "color-options" }, this.colorOptions.map((color, index$1) => (index.h("button", { class: {
                'color-circle': true,
                'selected': this.selectedColorIndex === index$1,
            }, style: { backgroundColor: color.webColor }, onClick: () => this.handleColorSelect(index$1), title: color.colorName }, this.selectedColorIndex === index$1 && (index.h("svg", { class: "check-icon", viewBox: "0 0 24 24", fill: "none", stroke: "white", "stroke-width": "3" }, index.h("polyline", { points: "20 6 9 17 4 12" }))))))), index.h("span", { class: "selected-label" }, this.colorOptions[this.selectedColorIndex]?.colorName)));
    }
    renderStorageSelector() {
        if (this.storageOptions.length === 0)
            return null;
        return (index.h("div", { class: "selector-section" }, index.h("h4", { class: "selector-title" }, "Almacenamiento"), index.h("div", { class: "storage-options" }, this.storageOptions.map((storage, index$1) => (index.h("button", { class: {
                'storage-button': true,
                'selected': this.selectedStorageIndex === index$1,
            }, onClick: () => this.handleStorageSelect(index$1) }, storage.storageName))))));
    }
    renderInstallmentSelector() {
        return (index.h("div", { class: "selector-section" }, index.h("h4", { class: "selector-title" }, "Plazos de pago"), index.h("div", { class: "installment-options" }, this.installmentOptions.map(option => (index.h("button", { class: {
                'installment-button': true,
                'selected': this.selectedInstallments === option.months,
            }, onClick: () => this.handleInstallmentSelect(option.months) }, index.h("span", { class: "months" }, option.months, " meses"), index.h("span", { class: "price" }, this.formatPrice(option.monthlyPrice), "/mes")))))));
    }
    renderQuantitySelector() {
        return (index.h("div", { class: "selector-section" }));
    }
    renderPriceSection() {
        const monthlyPrice = this.getCurrentMonthlyPrice();
        const totalPrice = this.product?.regular_price || 0;
        return (index.h("div", { class: "price-section" }, index.h("div", { class: "price-row monthly" }, index.h("span", { class: "label" }, "Pago mensual"), index.h("span", { class: "value" }, this.formatPrice(monthlyPrice))), index.h("div", { class: "price-row total" }, index.h("span", { class: "label" }, "Precio total"), index.h("span", { class: "value" }, this.formatPrice(totalPrice))), index.h("div", { class: "price-row installments" }, index.h("span", { class: "label" }, "Financiado a"), index.h("span", { class: "value" }, this.selectedInstallments, " meses"))));
    }
    /**
     * Renders the availability status indicator (TEL pattern)
     */
    renderAvailabilityStatus() {
        return (index.h("div", { class: "availability-status" }, this.isAvailable ? (index.h("div", { class: "availability-status--available" }, index.h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), index.h("polyline", { points: "22 4 12 14.01 9 11.01" })), index.h("span", null, "Disponible"))) : (index.h("div", { class: "availability-status--unavailable" }, index.h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), index.h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), index.h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })), index.h("span", null, "No disponible")))));
    }
    /**
     * Renders the unavailable product alert modal
     */
    renderUnavailableAlert() {
        if (!this.showUnavailableAlert)
            return null;
        return (index.h("div", { class: "unavailable-alert-overlay" }, index.h("div", { class: "unavailable-alert" }, index.h("div", { class: "unavailable-alert__icon" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), index.h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), index.h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))), index.h("h3", { class: "unavailable-alert__title" }, "Producto no disponible"), index.h("p", { class: "unavailable-alert__message" }, "Lo sentimos, este equipo no est\u00E1 disponible actualmente. Por favor seleccione otro equipo del cat\u00E1logo."), index.h("button", { class: "unavailable-alert__btn", onClick: this.handleGoBackFromAlert }, "Volver al cat\u00E1logo"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (index.h(index.Host, { key: 'ec599c85df9634685dcbeca3bfb60545f3bbc818' }, index.h("div", { key: '0d3e46d8eb5b2100f52a4ada26c878bded73692f', class: "step-product-detail" }, this.renderUnavailableAlert(), this.isLoading && (index.h("div", { key: 'dab10545bbcc2adb16a87159398769f6b151cfd7', class: "loading-container" }, index.h("div", { key: '710724344c26776082e119b4de4be42e2c5260a8', class: "spinner" }), index.h("p", { key: '26e4b4161af289c2f0c91420283a68c05ed658da' }, "Cargando producto..."))), this.error && !this.isLoading && (index.h("div", { key: 'bfc3ba31d341423b392a0afafa8538574a591bed', class: "error-container" }, index.h("p", { key: 'd5cc0e1b010d142ef85014a40c23d2bd4ed5bb12' }, this.error), index.h("button", { key: '880499a8c6558ff4db1823e3baf0cad854929ac4', class: "btn-retry", onClick: () => this.loadProductDetail() }, "Reintentar"), index.h("button", { key: 'f865760a6a78223722efa6c731b7def3a3bc9e9d', class: "btn-back", onClick: this.onBack }, "Volver al cat\u00E1logo"))), !this.isLoading && !this.error && this.product && (index.h("div", { key: '4d9c73442ef5d090f535f34a941572cc78f742f2', class: "product-container" }, this.renderBreadcrumb(), index.h("div", { key: '6077f2a11b1c3ce8aa1c373e9b6d110be625fd09', class: "product-grid" }, index.h("div", { key: '463d15927e22751496d953176ce00a7eed06b6f0', class: "product-image-section" }, index.h("ui-image-carousel", { key: 'b0e7a63596a0499fc4dc193bc6e0c8aa27a8063d', images: this.productImages, loop: true, showNavigation: this.productImages.length > 1, showIndicators: this.productImages.length > 1, autoplayInterval: 0 })), index.h("div", { key: '91a693a7018965300fd066a3ff9d8d62426752c2', class: "product-details-section" }, this.product.brandName && (index.h("span", { key: 'afc011f6349fcebeba4a7228fd90546917b0aea1', class: "brand-name" }, this.product.brandName)), index.h("h1", { key: 'aead2118444e7f6e754378b17876d61cfb0b8105', class: "product-name" }, this.product.productName), this.product.shortDescription && (index.h("p", { key: 'dc329466d7b221a50512f97fe188e223ce9b2ca1', class: "product-description" }, productService.cleanDescription(this.product.shortDescription))), this.renderAvailabilityStatus(), this.renderColorSelector(), this.renderStorageSelector(), this.renderInstallmentSelector(), this.renderQuantitySelector(), this.renderPriceSection(), index.h("button", { key: 'd02a2be36a1880adba4e268acb9334f5c6b93baa', class: {
                'btn-add-to-cart': true,
                'loading': this.isAddingToCart,
                'disabled': !this.isAvailable,
            }, onClick: this.handleAddToCart, disabled: this.isAddingToCart || !this.isAvailable }, this.isAddingToCart ? (index.h("span", { class: "loading-text" }, index.h("span", { class: "spinner-small" }), "Agregando...")) : !this.isAvailable ? ('No disponible') : ('Continuar')), index.h("button", { key: '9a01af609867e908bd78542a3cdcfd19fb8b8ccd', class: "btn-back-link", onClick: this.onBack }, "\u2190 Volver al cat\u00E1logo"))), this.product.features && this.product.features.length > 0 && (index.h("div", { key: '8c45755e5f98347f38ce98a80922de8a525a7736', class: "features-section" }, index.h("h3", { key: '23a3da0edf2e5552b89d3c82d4ece5c9b9ccc075', class: "features-title" }, "Caracter\u00EDsticas"), index.h("ul", { key: 'ba70146cb1c6cdf4535b9fc741c88de5a528c1f8', class: "features-list" }, this.product.features.map(feature => (index.h("li", { class: "feature-item" }, feature)))))), this.product.specifications && this.product.specifications.length > 0 && (index.h("div", { key: '01be8aca98cd2d1b2083f2c23258033b06fb81e1', class: "specs-section" }, index.h("h3", { key: '191bcae475f50149aa2f0bd6277d2d0f04177347', class: "specs-title" }, "Especificaciones"), index.h("div", { key: '1064b960367de26d496fc82b2a24e8ffba345352', class: "specs-grid" }, this.product.specifications.map((spec) => (index.h("div", { class: "spec-item" }, index.h("span", { class: "spec-label" }, spec.name), index.h("span", { class: "spec-value" }, spec.value))))))))))));
    }
};
StepProductDetail.style = stepProductDetailCss();

const stepShippingCss = () => `:host{display:block;width:100%;min-height:100%;background-color:white}.step-shipping{width:100%;max-width:900px;margin:0 auto;padding:1.5rem 1rem}.info-message{font-size:0.875rem;color:#666666;margin:0 0 1.5rem 0;padding:0 !important;background:transparent !important;background-color:transparent !important;line-height:1.5;border:none !important;border-radius:0 !important}.error-alert{display:flex;align-items:center;gap:0.5rem;background:rgb(248.1707317073, 205, 201.8292682927);color:rgb(172.8048780488, 32.5, 22.1951219512);padding:1rem;border-radius:0.5rem;margin-bottom:1.5rem;font-size:0.875rem}.error-alert svg{width:20px;height:20px;flex-shrink:0}.form-container{width:100%}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem 1.5rem;margin-bottom:0.25rem}@media (max-width: 700px){.form-row{grid-template-columns:1fr}}.form-group{margin-bottom:1rem}.form-group.existing-customer{margin-top:0.5rem}.form-label{display:block;font-size:0.875rem;font-weight:500;color:#4D4D4D;margin-bottom:0.25rem}.form-label .required{color:#4D4D4D;margin-right:2px}.form-input{width:100%;padding:10px 12px;border:1px solid #CCCCCC;border-radius:0.25rem;font-size:0.875rem;color:#1A1A1A;background:white;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.form-input::placeholder{color:#999999}.form-input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 2px rgba(0, 151, 169, 0.1)}.form-input:disabled{background:#F5F5F5;color:#808080;cursor:not-allowed}.form-input.error{border-color:#DA291C}.form-input.error:focus{box-shadow:0 0 0 2px rgba(218, 41, 28, 0.1)}input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}.date-input-wrapper{position:relative}.error-message{display:block;font-size:0.75rem;color:#DA291C;margin-top:0.25rem}.id-field{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}.id-field .radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem;flex-shrink:0}.id-field .id-input{flex:1;min-width:150px}.radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem}.radio-group.horizontal{flex-direction:row}.radio-label{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.875rem}.radio-label input[type=radio]{display:none}.radio-label .radio-custom{width:16px;height:16px;border:2px solid #999999;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}.radio-label .radio-custom::after{content:"";width:8px;height:8px;border-radius:50%;background:transparent;transition:background 0.2s}.radio-label input[type=radio]:checked+.radio-custom{border-color:#666666}.radio-label input[type=radio]:checked+.radio-custom::after{background:#666666}.radio-label .radio-text{color:#4D4D4D;font-size:0.75rem;white-space:nowrap}.btn-container{display:flex;justify-content:center;margin-top:1.5rem;padding-top:1rem}.btn-submit{min-width:200px;height:44px;background:#666666;color:white;border:none;border-radius:9999px;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0 2rem}.btn-submit:hover:not(:disabled){background:#4D4D4D}.btn-submit:disabled{background:#CCCCCC;cursor:not-allowed}.btn-submit.loading{background:#999999}.btn-loading{display:flex;align-items:center;gap:0.5rem}.spinner{width:18px;height:18px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media (max-width: 500px){.step-shipping{padding:1rem}.id-field{flex-direction:column;align-items:flex-start}.id-field .radio-group{margin-bottom:0.25rem}.id-field .id-input{width:100%}}`;

const StepShipping = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    isLoading = false;
    error = null;
    // Form fields - Personal Info
    name = '';
    secondName = '';
    lastname = '';
    secondLastname = '';
    // Identification
    idType = '';
    idNumber = '';
    expirationDate = '';
    // Contact
    phone = '';
    phone2 = '';
    // Business
    businessName = '';
    position = '';
    // Address
    address = '';
    city = '';
    zipcode = '';
    email = '';
    // Existing customer
    existingCustomer = '';
    // Validation
    formErrors = {};
    touched = {};
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadStoredData();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    loadStoredData() {
        // Try to load previously stored shipping data
        const stored = shippingService.getStoredShippingAddress();
        if (stored) {
            const nameParts = stored.name.split(' ');
            this.name = nameParts[0] || '';
            this.lastname = nameParts.slice(1).join(' ') || '';
            this.email = stored.email;
            this.phone = this.formatPhoneDisplay(stored.phone);
            this.phone2 = stored.phone2 ? this.formatPhoneDisplay(stored.phone2) : '';
            this.address = stored.address1;
            this.zipcode = stored.zip;
            this.city = stored.city;
        }
    }
    formatPhoneDisplay(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }
    handleInputChange = (field) => (e) => {
        const target = e.target;
        let value = target.value;
        // Special handling for phone fields
        if (field === 'phone' || field === 'phone2') {
            value = this.formatPhoneInput(value);
        }
        // Special handling for zipcode
        if (field === 'zipcode') {
            value = value.replace(/\D/g, '').slice(0, 5);
            const municipality = shippingService.getMunicipalityByZip(value);
            if (municipality) {
                this.city = municipality;
            }
            else if (value.length === 5) {
                this.city = '';
            }
        }
        this[field] = value;
        this.touched[field] = true;
        this.validateField(field);
    };
    formatPhoneInput(value) {
        const cleaned = value.replace(/\D/g, '').slice(0, 10);
        if (cleaned.length === 0)
            return '';
        if (cleaned.length <= 3)
            return `(${cleaned}`;
        if (cleaned.length <= 6)
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    handleRadioChange = (field, value) => () => {
        this[field] = value;
        this.touched[field] = true;
        this.validateField(field);
    };
    validateField(field) {
        const errors = { ...this.formErrors };
        switch (field) {
            case 'name':
                if (!this.name.trim()) {
                    errors.name = 'El nombre es requerido';
                }
                else {
                    delete errors.name;
                }
                break;
            case 'lastname':
                if (!this.lastname.trim()) {
                    errors.lastname = 'El apellido es requerido';
                }
                else {
                    delete errors.lastname;
                }
                break;
            case 'secondLastname':
                if (!this.secondLastname.trim()) {
                    errors.secondLastname = 'El segundo apellido es requerido';
                }
                else {
                    delete errors.secondLastname;
                }
                break;
            case 'idType':
                if (!this.idType) {
                    errors.idType = 'Seleccione un tipo de identificación';
                }
                else {
                    delete errors.idType;
                }
                break;
            case 'idNumber':
                if (!this.idNumber.trim()) {
                    errors.idNumber = 'El número de identificación es requerido';
                }
                else {
                    delete errors.idNumber;
                }
                break;
            case 'expirationDate':
                if (!this.expirationDate) {
                    errors.expirationDate = 'La fecha de vencimiento es requerida';
                }
                else {
                    delete errors.expirationDate;
                }
                break;
            case 'phone':
                if (!this.phone.trim()) {
                    errors.phone = 'El teléfono es requerido';
                }
                else if (!shippingService.isValidPhone(this.phone)) {
                    errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
                }
                else {
                    delete errors.phone;
                }
                break;
            case 'businessName':
                if (!this.businessName.trim()) {
                    errors.businessName = 'El nombre del negocio es requerido';
                }
                else {
                    delete errors.businessName;
                }
                break;
            case 'position':
                if (!this.position.trim()) {
                    errors.position = 'La posición es requerida';
                }
                else {
                    delete errors.position;
                }
                break;
            case 'address':
                if (!this.address.trim()) {
                    errors.address = 'La dirección es requerida';
                }
                else {
                    delete errors.address;
                }
                break;
            case 'city':
                if (!this.city.trim()) {
                    errors.city = 'La ciudad es requerida';
                }
                else {
                    delete errors.city;
                }
                break;
            case 'zipcode':
                if (!this.zipcode.trim()) {
                    errors.zipcode = 'El código postal es requerido';
                }
                else if (!shippingService.validateZipCode(this.zipcode)) {
                    errors.zipcode = 'Código postal no válido para Puerto Rico';
                }
                else {
                    delete errors.zipcode;
                }
                break;
            case 'email':
                if (!this.email.trim()) {
                    errors.email = 'El correo es requerido';
                }
                else if (!shippingService.isValidEmail(this.email)) {
                    errors.email = 'Ingresa un correo válido';
                }
                else {
                    delete errors.email;
                }
                break;
            case 'existingCustomer':
                if (!this.existingCustomer) {
                    errors.existingCustomer = 'Seleccione una opción';
                }
                else {
                    delete errors.existingCustomer;
                }
                break;
        }
        this.formErrors = errors;
        return Object.keys(errors).length === 0;
    }
    validateForm() {
        // Mark all fields as touched
        this.touched = {
            name: true,
            lastname: true,
            secondLastname: true,
            idType: true,
            idNumber: true,
            expirationDate: true,
            phone: true,
            businessName: true,
            position: true,
            address: true,
            city: true,
            zipcode: true,
            email: true,
            existingCustomer: true,
        };
        // Validate all required fields
        const fields = [
            'name',
            'lastname',
            'secondLastname',
            'idType',
            'idNumber',
            'expirationDate',
            'phone',
            'businessName',
            'position',
            'address',
            'city',
            'zipcode',
            'email',
            'existingCustomer',
        ];
        fields.forEach((field) => this.validateField(field));
        return Object.keys(this.formErrors).length === 0;
    }
    handleSubmit = async () => {
        if (!this.validateForm()) {
            return;
        }
        this.isLoading = true;
        this.error = null;
        try {
            const shippingAddress = {
                name: `${this.name} ${this.secondName} ${this.lastname} ${this.secondLastname}`.replace(/\s+/g, ' ').trim(),
                email: this.email,
                phone: shippingService.cleanPhoneNumber(this.phone),
                phone2: this.phone2 ? shippingService.cleanPhoneNumber(this.phone2) : undefined,
                address1: this.address,
                city: this.city,
                state: 'PR',
                zip: this.zipcode,
            };
            const result = await shippingService.createAddress(shippingAddress);
            if (result.hasError) {
                this.error = result.message || result.errorDesc || 'Error al guardar la dirección';
                return;
            }
            console.log('[StepShipping] Address created, shipmentId:', result.response);
            this.onNext?.();
        }
        catch (err) {
            console.error('[StepShipping] Error:', err);
            this.error = 'Error de conexión. Intenta nuevamente.';
        }
        finally {
            this.isLoading = false;
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (index.h(index.Host, { key: '718b73e1181b51c1b3e711e2e9ad25f78e395697' }, index.h("div", { key: 'd8af1a7487a33ab08c01ff7d7f34ab65fa643220', class: "step-shipping" }, index.h("p", { key: 'a42d368e574aab14ca81930a72e8684335975d28', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (index.h("div", { key: '295254454ef1b074d38b2ca6263baaaacf15d078', class: "error-alert" }, index.h("svg", { key: 'b280338dc7160a79e4858f7f23f5e8dbf75ff7fb', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("circle", { key: '77d376a7a961b5a568b9f257e8585806ba686eee', cx: "12", cy: "12", r: "10" }), index.h("line", { key: '36cdf8c8efb858d7d729c2e700fa63bb9e33697f', x1: "12", y1: "8", x2: "12", y2: "12" }), index.h("line", { key: '347cbb94e4c4d306b7e7cda3654a40e562ee4b92', x1: "12", y1: "16", x2: "12.01", y2: "16" })), index.h("span", { key: 'f6023ef2714d00c89256680aab9e176529146bc0' }, this.error))), index.h("div", { key: 'b4b31b93d5e21253a4440f695e471398cadb8c89', class: "form-container" }, index.h("div", { key: 'd346ce734ea088b5b03c1f4727943cbbed43415b', class: "form-row" }, index.h("div", { key: '5b0b5e8d8aab86adbfc5d117ef66eb4fae90a64e', class: "form-group" }, index.h("label", { key: 'b61b9b1238390515b4cd0e9234f80ebf1c7fb81b', class: "form-label" }, index.h("span", { key: 'ac26adeb50bbd5da4b37642d2f945c4b27c6776e', class: "required" }, "*"), "Nombre:"), index.h("input", { key: '401badf6a5f1541130473c910e1b4c2115f9a37b', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && index.h("span", { key: '7fc1b8e118bb03d08deabcd56d52148a15b7247e', class: "error-message" }, this.formErrors.name)), index.h("div", { key: '2015a6fd830153e630219d2fac495e89f0218d5d', class: "form-group" }, index.h("label", { key: 'cd71a7559583fae6669c7c70337ec9a3e6c5d5f8', class: "form-label" }, "Segundo nombre:"), index.h("input", { key: '709901e72f344cb7a455cfa2c3b3cb0eff385d87', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), index.h("div", { key: 'a3951c5c49dd87283aeb93c081ef3fa401e74a43', class: "form-row" }, index.h("div", { key: '83e3a20ee3c9c9a9d16508c1d9a6e4e9c9a69a27', class: "form-group" }, index.h("label", { key: '7b944aacfd5eee6ce766b7809dad5721600c3cf4', class: "form-label" }, index.h("span", { key: '2ba1aa0d33e0735374809108168a6361349e3de7', class: "required" }, "*"), "Apellido:"), index.h("input", { key: '2059d5d7977ca24732a7f768c63d098e82af05ab', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && index.h("span", { key: 'cefe8d589f75acefda1832f21923bf49973eb4d2', class: "error-message" }, this.formErrors.lastname)), index.h("div", { key: 'cc8d0de7cc17a117281f18cb171f50966807c5b3', class: "form-group" }, index.h("label", { key: 'adc722b89df8973c4e192ec606feced3dfff9391', class: "form-label" }, index.h("span", { key: '5b29170455cf28dc3840cea46af49f9a2e7c0110', class: "required" }, "*"), "Segundo apellido:"), index.h("input", { key: '3054aba92319d3dc2a416a868519226ff19ea47a', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && index.h("span", { key: '21e64a8ea3c78c9fbd2afb4c36df150ec5caa8b9', class: "error-message" }, this.formErrors.secondLastname))), index.h("div", { key: '610e56a60267625fd26d21b69468deae26129c59', class: "form-row" }, index.h("div", { key: '52930f3d8d998db9758e8c76607a1f49632553db', class: "form-group" }, index.h("label", { key: 'e5dd284ae9eb4853d827012ec22e796fecb562b2', class: "form-label" }, index.h("span", { key: '17b14b8204f57d7b5c104d4872d5da94509b3e0a', class: "required" }, "*"), "Identificaci\u00F3n:"), index.h("div", { key: 'd71bb632960d3125c392da5e508029bc6e1983cd', class: "id-field" }, index.h("div", { key: '99fa7009d036ead87caf5ad2eeaf5573906efc4b', class: "radio-group" }, index.h("label", { key: 'e444924399dd8c642f20b329e1843b54723a4368', class: "radio-label" }, index.h("input", { key: '2852138132b113de22bf0b04e51749d0132ecfd6', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), index.h("span", { key: 'fa298c47cbdbe489d7321f39b1455863f42c33b7', class: "radio-custom" }), index.h("span", { key: '31383ead591fb73f782404ecf6ecb8a667327d9a', class: "radio-text" }, "Licencia de conducir")), index.h("label", { key: 'c0811288ed9eba4fb559a162937235cbb4ae255a', class: "radio-label" }, index.h("input", { key: '2c4e87c56913b4029c083998e3bae1df7485f55e', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), index.h("span", { key: '4744848d30ecf31c8ed1e9f04e0574c3da0d2f12', class: "radio-custom" }), index.h("span", { key: '2646a0c2781c18641f1a8e8a9d8172624acf58ba', class: "radio-text" }, "Pasaporte"))), index.h("input", { key: '1e6bf0f48a23b1e5cd13ec768c009d91bdd02d90', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && index.h("span", { key: '0986c281e0fb6984e33d41766b92c108fc5c33c4', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && index.h("span", { key: '31ba68eb5a57314b2f4bfec6c78e719b16a8dfa1', class: "error-message" }, this.formErrors.idNumber)), index.h("div", { key: 'ae004d8854393bd2aa71f01ec794cba821a052d0', class: "form-group" }, index.h("label", { key: '8f7867816b2ec18d04c34a0a3f3a56894a732b9a', class: "form-label" }, index.h("span", { key: 'aad1cd1f664679a91179cd76e75971f471f7ce7a', class: "required" }, "*"), "Fecha de vencimiento:"), index.h("div", { key: 'db49c6abe2f340b79d0900cedcdb18213eba3ae0', class: "date-input-wrapper" }, index.h("input", { key: '6335aeb8c9ab02b17da2214f38d2454bf29ef29e', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && index.h("span", { key: '7233da321a6a8cf89c711b2e42bf13d032726315', class: "error-message" }, this.formErrors.expirationDate))), index.h("div", { key: 'bd5b7e6fa4da78f2bb4f1432a5e552b4cd6cfc7b', class: "form-row" }, index.h("div", { key: 'e925a81118095dc618dedde2e3d6b778e559a3e1', class: "form-group" }, index.h("label", { key: '01b8c67903f8ffa127840607b2f48be8fc1aa32c', class: "form-label" }, index.h("span", { key: '5be19820108b503f3ffdb68a791841c2149480c2', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), index.h("input", { key: '44c862ea19da00540cc7323e866e1a81a0ba4c03', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && index.h("span", { key: '77c8a486d895cad1be3c5dc3d0fac425671dfa7a', class: "error-message" }, this.formErrors.phone)), index.h("div", { key: 'a1118302c9b1cd1842052c23c7b80a8e509cea78', class: "form-group" }, index.h("label", { key: 'b9f25472ed8ac5e1ebdb9e9ebabd1b0a0a49f382', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), index.h("input", { key: '0d702ff4d399eba12c75c7b84ec5efcc9553b16c', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), index.h("div", { key: 'bc21071f3b3b517fb7d4e372584118745a3a3e48', class: "form-row" }, index.h("div", { key: '11c673e65a5719b6acc97877324b0f11a31d7dd8', class: "form-group" }, index.h("label", { key: '924fbbb9683775f6822f4a2f3ac52da5d27554ad', class: "form-label" }, index.h("span", { key: '1c5efe973cc04643f75b69e8dde754ffc8636f44', class: "required" }, "*"), "Nombre del Negocio:"), index.h("input", { key: '8cca3452b7d497ac1be3b230e92b0747bf9f389e', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && index.h("span", { key: '2196e90ebb76aa3eb9117e79d0b6f13bed0bfdf1', class: "error-message" }, this.formErrors.businessName)), index.h("div", { key: 'e95f64e4859e051a0ef7b604b1b89de74e4e1756', class: "form-group" }, index.h("label", { key: '352c97731b333a9923993c3a7c890225f1d4d59d', class: "form-label" }, index.h("span", { key: '027d75ee2b490367739ebab4828548b11b7ef660', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), index.h("input", { key: 'f27e8ee053c1a737ef057f37c5ff404eeac80df2', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && index.h("span", { key: '430552ea612a2d8ace1048fcbdeeea4350b14375', class: "error-message" }, this.formErrors.position))), index.h("div", { key: '460af8c81d52f7915a60fa595f118aaa329f1dd7', class: "form-row" }, index.h("div", { key: '31dc4d7d955af9fd01728929b5d7e5cd25b942e5', class: "form-group" }, index.h("label", { key: '11b9433805505e55949fc2bcf07fbe1c7646b8c7', class: "form-label" }, index.h("span", { key: 'b7e3397f2be9609e0fdce42820b0d3d0cbd19350', class: "required" }, "*"), "Direcci\u00F3n:"), index.h("input", { key: 'a5eedc981cd7e1226ba5b20b7519bd3e9c4120d2', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && index.h("span", { key: 'ea6c9df9ef47f6d65271db7f3df4cc834566924b', class: "error-message" }, this.formErrors.address)), index.h("div", { key: '2764e0bb78417f52f032f3f9df0b9be4a81ba1c9', class: "form-group" }, index.h("label", { key: '91b25e249954af0de46f64a83d6498ee3727dac9', class: "form-label" }, index.h("span", { key: 'e91966ffc9dff717b4ebc004afcc9f0af292124a', class: "required" }, "*"), "Ciudad:"), index.h("input", { key: 'b747dfd09065cd0cc8381b8cea6a939e11a5a552', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && index.h("span", { key: '5f4f1966d747110bae5bf5612487500fb9fdb495', class: "error-message" }, this.formErrors.city))), index.h("div", { key: 'fdfd25752bef60d5ab42cf5dfd637158e261c4b9', class: "form-row" }, index.h("div", { key: 'bc173ee964743bc3325ec45a38362ea635047b77', class: "form-group" }, index.h("label", { key: '8bb0f1e94e363a48bb3b0758b78e1557a8b28df3', class: "form-label" }, index.h("span", { key: '87589fb593d56593dc514217336d67e3ed404d05', class: "required" }, "*"), "C\u00F3digo postal"), index.h("input", { key: '89e366675439a561dedbc2a6abb15af36aa853bb', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && index.h("span", { key: 'd8f07cef2095cb873a5cfda2de6cb2c9be012b09', class: "error-message" }, this.formErrors.zipcode)), index.h("div", { key: 'ddb647ea2aaba389684bcf5a703c5f7474e3848e', class: "form-group" }, index.h("label", { key: '1024047287d92d05d7e56e80d5af59466490645b', class: "form-label" }, index.h("span", { key: '9897af04d171afc2478e572b6e2032e91e907a32', class: "required" }, "*"), "Correo electr\u00F3nico:"), index.h("input", { key: '844260ef342d0847d258e07dfcc25ce4d10c5ad1', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && index.h("span", { key: '5d13f61791d1ed39f1d533ff1e52a2deae7043f3', class: "error-message" }, this.formErrors.email))), index.h("div", { key: '8d00d54fa241546180c3a2dad060603a85a2e8d1', class: "form-group existing-customer" }, index.h("label", { key: 'da50fe01eeed25cd83b91d6c94ae2d40d8bff0d9', class: "form-label" }, index.h("span", { key: 'c4cbdeeb7e12cc0c59c95ac9d8701ba92db883d6', class: "required" }, "*"), "Cliente existente de Claro PR:"), index.h("div", { key: '3249042dcc98fba664ad4d171d18f81bbd6c601e', class: "radio-group horizontal" }, index.h("label", { key: '0f120999ea298667750ff8cb0f7aaf9ef715544b', class: "radio-label" }, index.h("input", { key: '6248fa3f13e2453b40bb4b0ae74398f8c1d79dd2', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), index.h("span", { key: 'eccce11d742e2320ef45d812654e47abca7f7d93', class: "radio-custom" }), index.h("span", { key: '9f4973483c91c2b6c18fe5f067af379667c4c1c6', class: "radio-text" }, "S\u00ED")), index.h("label", { key: '65651fd1820ac5a613faa9e82efc3832c1ee1f47', class: "radio-label" }, index.h("input", { key: '9e4ddf271171fab4a6a12f4f6a01637cc41465ee', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), index.h("span", { key: '1af4c6c3b1df86972de0025e63727f3095ae5e1a', class: "radio-custom" }), index.h("span", { key: '09556a5f9f59e00e8e5f932b036fa4e643fd3a4e', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (index.h("span", { key: 'eafc255a4736ae3cbf877f86333f9a7337f37a99', class: "error-message" }, this.formErrors.existingCustomer))), index.h("div", { key: 'd81651a8d929f37ffc28d981ef8d504fd776c830', class: "btn-container" }, index.h("button", { key: '867d0f14a81d15d48762ba12adc2e6e08fbb1f97', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (index.h("span", { class: "btn-loading" }, index.h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
    }
};
StepShipping.style = stepShippingCss();

const uiCarouselCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-carousel{position:relative;width:100%;display:flex;align-items:center}.ui-carousel__viewport{flex:1;overflow:hidden;margin:0 0.5rem}@media (min-width: 768px){.ui-carousel__viewport{margin:0 1rem}}.ui-carousel__track{display:flex;transition:transform 0.3s ease-out;will-change:transform}.ui-carousel__track--dragging{transition:none;cursor:grabbing}.ui-carousel__nav{flex-shrink:0;width:40px;height:40px;border-radius:50%;background:#FFFFFF;border:2px solid #DA291C;color:#DA291C;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;z-index:2;box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.ui-carousel__nav svg{width:20px;height:20px}.ui-carousel__nav:hover:not(:disabled){background:#DA291C;color:#FFFFFF}.ui-carousel__nav:active:not(:disabled){transform:scale(0.95)}.ui-carousel__nav--disabled{opacity:0.3;cursor:not-allowed;pointer-events:none}@media (max-width: 599px){.ui-carousel__nav{width:32px;height:32px}.ui-carousel__nav svg{width:16px;height:16px}}.ui-carousel__pagination{position:absolute;bottom:-2rem;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:2}.ui-carousel__dot{width:10px;height:10px;border-radius:50%;border:none;background:#CCCCCC;cursor:pointer;padding:0;transition:all 0.2s ease}.ui-carousel__dot:hover{background:#999999}.ui-carousel__dot--active{background:#DA291C;transform:scale(1.2)}::slotted(*){box-sizing:border-box}`;

const UiCarousel = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    get el() { return index.getElement(this); }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Total number of items in the carousel
     */
    totalItems = 0;
    /**
     * Default number of slides per view
     */
    slidesPerView = 1;
    /**
     * Gap between slides in pixels
     */
    gap = 16;
    /**
     * Show navigation arrows
     */
    showNavigation = true;
    /**
     * Show pagination dots
     */
    showPagination = true;
    /**
     * Enable loop/circular mode
     */
    loop = false;
    /**
     * Auto-play interval in milliseconds (0 = disabled)
     */
    autoplay = 0;
    /**
     * Responsive breakpoints
     * Default: mobile=1, tablet=2, desktop=3, large=4
     */
    breakpoints = [
        { minWidth: 0, slidesPerView: 1 },
        { minWidth: 600, slidesPerView: 2 },
        { minWidth: 900, slidesPerView: 3 },
        { minWidth: 1200, slidesPerView: 4 },
    ];
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    currentIndex = 0;
    currentSlidesPerView = 1;
    isDragging = false;
    startX = 0;
    translateX = 0;
    // ------------------------------------------
    // REFS
    // ------------------------------------------
    trackEl;
    autoplayInterval;
    resizeObserver;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
    handleTotalItemsChange() {
        this.currentIndex = 0;
        this.updateTranslate();
    }
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentDidLoad() {
        this.updateSlidesPerView();
        this.setupResizeObserver();
        this.startAutoplay();
    }
    disconnectedCallback() {
        this.stopAutoplay();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
    // ------------------------------------------
    // RESIZE HANDLING
    // ------------------------------------------
    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateSlidesPerView();
        });
        this.resizeObserver.observe(this.el);
    }
    updateSlidesPerView() {
        const width = this.el.offsetWidth;
        // Find the appropriate breakpoint
        let slidesPerView = this.slidesPerView;
        for (const bp of this.breakpoints) {
            if (width >= bp.minWidth) {
                slidesPerView = bp.slidesPerView;
            }
        }
        this.currentSlidesPerView = slidesPerView;
        // Ensure currentIndex is valid
        const maxIndex = this.getMaxIndex();
        if (this.currentIndex > maxIndex) {
            this.currentIndex = maxIndex;
        }
        this.updateTranslate();
    }
    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    getMaxIndex() {
        return Math.max(0, this.totalItems - this.currentSlidesPerView);
    }
    goToSlide(index) {
        const maxIndex = this.getMaxIndex();
        if (this.loop) {
            if (index < 0) {
                index = maxIndex;
            }
            else if (index > maxIndex) {
                index = 0;
            }
        }
        else {
            index = Math.max(0, Math.min(index, maxIndex));
        }
        this.currentIndex = index;
        this.updateTranslate();
    }
    goToPrev = () => {
        this.goToSlide(this.currentIndex - 1);
    };
    goToNext = () => {
        this.goToSlide(this.currentIndex + 1);
    };
    updateTranslate() {
        if (!this.trackEl)
            return;
        const slideWidth = 100 / this.currentSlidesPerView;
        this.translateX = -(this.currentIndex * slideWidth);
    }
    // ------------------------------------------
    // AUTOPLAY
    // ------------------------------------------
    startAutoplay() {
        if (this.autoplay > 0) {
            this.autoplayInterval = setInterval(() => {
                this.goToNext();
            }, this.autoplay);
        }
    }
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
    // ------------------------------------------
    // TOUCH/DRAG HANDLING
    // ------------------------------------------
    handleTouchStart = (e) => {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.stopAutoplay();
    };
    handleTouchMove = (e) => {
        if (!this.isDragging)
            return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - this.startX;
        // Calculate temporary translate based on drag
        const slideWidth = this.el.offsetWidth / this.currentSlidesPerView;
        const dragPercent = (diff / slideWidth) * (100 / this.currentSlidesPerView);
        const baseTranslate = -(this.currentIndex * (100 / this.currentSlidesPerView));
        this.translateX = baseTranslate + dragPercent;
    };
    handleTouchEnd = (e) => {
        if (!this.isDragging)
            return;
        this.isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - this.startX;
        // Threshold for swipe (50px)
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.goToPrev();
            }
            else {
                this.goToNext();
            }
        }
        else {
            this.updateTranslate();
        }
        this.startAutoplay();
    };
    // ------------------------------------------
    // PAGINATION
    // ------------------------------------------
    getPaginationDots() {
        const totalDots = Math.ceil(this.totalItems / this.currentSlidesPerView);
        return Array.from({ length: totalDots }, (_, i) => i);
    }
    handleDotClick = (dotIndex) => {
        this.goToSlide(dotIndex * this.currentSlidesPerView);
    };
    getCurrentDot() {
        return Math.floor(this.currentIndex / this.currentSlidesPerView);
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const canGoPrev = this.loop || this.currentIndex > 0;
        const canGoNext = this.loop || this.currentIndex < this.getMaxIndex();
        const slideWidth = 100 / this.currentSlidesPerView;
        return (index.h(index.Host, { key: '1d71ded8170a2004929ada8d1401d18fbe5dcc0c' }, index.h("div", { key: '01d088bfc7590419709aa83850462f6b1fa6374c', class: "ui-carousel" }, this.showNavigation && (index.h("button", { key: 'a820df5e62634206f0d9f46092f84f84a724eb23', class: {
                'ui-carousel__nav': true,
                'ui-carousel__nav--prev': true,
                'ui-carousel__nav--disabled': !canGoPrev,
            }, onClick: this.goToPrev, disabled: !canGoPrev, "aria-label": "Anterior" }, index.h("svg", { key: '7ee40aa5fa9fd0c8ac38583ebeaf0c15b8b4c49e', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("polyline", { key: '882e3d293306f869bd4d8db82a1c0a8720d83d69', points: "15 18 9 12 15 6" })))), index.h("div", { key: '0bc0eef0e943585d9877ae832a33bac4813c33c1', class: "ui-carousel__viewport" }, index.h("div", { key: '8ce97b79d901f63c3e6da2e750926857d2dddbc9', class: {
                'ui-carousel__track': true,
                'ui-carousel__track--dragging': this.isDragging,
            }, ref: (el) => (this.trackEl = el), style: {
                transform: `translateX(${this.translateX}%)`,
                gap: `${this.gap}px`,
            }, onTouchStart: this.handleTouchStart, onTouchMove: this.handleTouchMove, onTouchEnd: this.handleTouchEnd }, index.h("slot", { key: 'bab876ce6a274ce53c476444694cef4e94bf39ad' }))), this.showNavigation && (index.h("button", { key: '286f8e40d9092b5d837566977e252c36e9fee843', class: {
                'ui-carousel__nav': true,
                'ui-carousel__nav--next': true,
                'ui-carousel__nav--disabled': !canGoNext,
            }, onClick: this.goToNext, disabled: !canGoNext, "aria-label": "Siguiente" }, index.h("svg", { key: '28eabda805720b3bb8c540b4126c000db8ff7433', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("polyline", { key: 'ad5d5d53067b22fe760c4e6499f027ac61105154', points: "9 18 15 12 9 6" })))), this.showPagination && this.totalItems > this.currentSlidesPerView && (index.h("div", { key: 'aab818d63c57cea9cfe25a91bb768f8be490cef5', class: "ui-carousel__pagination" }, this.getPaginationDots().map((dotIndex) => (index.h("button", { class: {
                'ui-carousel__dot': true,
                'ui-carousel__dot--active': dotIndex === this.getCurrentDot(),
            }, onClick: () => this.handleDotClick(dotIndex), "aria-label": `Ir a página ${dotIndex + 1}` })))))), index.h("style", { key: '927be72b1c508b1add09174d6402b4dfc5f1aece' }, `
            ::slotted(*) {
              flex: 0 0 calc(${slideWidth}% - ${this.gap * (this.currentSlidesPerView - 1) / this.currentSlidesPerView}px);
              max-width: calc(${slideWidth}% - ${this.gap * (this.currentSlidesPerView - 1) / this.currentSlidesPerView}px);
            }
          `)));
    }
    static get watchers() { return {
        "totalItems": ["handleTotalItemsChange"]
    }; }
};
UiCarousel.style = uiCarouselCss();

const uiImageCarouselCss = () => `:host{display:block;width:100%}.ui-image-carousel{position:relative;width:100%}.ui-image-carousel__main{position:relative;width:100%;aspect-ratio:1;background:#F5F5F5;border-radius:0.75rem;overflow:hidden;display:flex;align-items:center;justify-content:center}.ui-image-carousel__track{display:flex;width:100%;height:100%;transition:transform 0.4s ease-out;will-change:transform}.ui-image-carousel__slide{flex:0 0 100%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:1rem;box-sizing:border-box}.ui-image-carousel__image{max-width:100%;max-height:100%;object-fit:contain;opacity:0;transition:opacity 0.3s ease}.ui-image-carousel__image--loaded{opacity:1}.ui-image-carousel__nav{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:40px;height:40px;border-radius:50%;background:rgba(255, 255, 255, 0.95);border:1px solid #E5E5E5;color:#808080;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.ui-image-carousel__nav svg{width:20px;height:20px}.ui-image-carousel__nav:hover:not(:disabled){background:#DA291C;border-color:#DA291C;color:white;box-shadow:0 4px 12px rgba(218, 41, 28, 0.3)}.ui-image-carousel__nav:active:not(:disabled){transform:translateY(-50%) scale(0.95)}.ui-image-carousel__nav--prev{left:0.5rem}.ui-image-carousel__nav--next{right:0.5rem}.ui-image-carousel__nav--disabled{opacity:0.3;cursor:not-allowed;pointer-events:none}@media (max-width: 599px){.ui-image-carousel__nav{width:32px;height:32px}.ui-image-carousel__nav svg{width:16px;height:16px}}.ui-image-carousel__indicators{display:flex;justify-content:center;gap:0.5rem;margin-top:0.75rem}.ui-image-carousel__dot{width:8px;height:8px;border-radius:50%;border:none;background:#CCCCCC;cursor:pointer;padding:0;transition:all 0.2s ease}.ui-image-carousel__dot:hover{background:#999999}.ui-image-carousel__dot--active{background:#DA291C;width:24px;border-radius:4px}.ui-image-carousel__thumbnails{display:flex;justify-content:center;gap:0.5rem;margin-top:0.75rem;padding:0 0.5rem;overflow-x:auto}.ui-image-carousel__thumbnails::-webkit-scrollbar{display:none}.ui-image-carousel__thumbnails{-ms-overflow-style:none;scrollbar-width:none}.ui-image-carousel__thumbnail{flex-shrink:0;width:60px;height:60px;border-radius:0.5rem;border:2px solid #E5E5E5;background:#F5F5F5;cursor:pointer;padding:4px;overflow:hidden;transition:all 0.2s ease}.ui-image-carousel__thumbnail img{width:100%;height:100%;object-fit:contain}.ui-image-carousel__thumbnail:hover{border-color:#0097A9}.ui-image-carousel__thumbnail--active{border-color:#DA291C;box-shadow:0 0 0 2px rgba(218, 41, 28, 0.2)}@media (max-width: 599px){.ui-image-carousel__thumbnail{width:48px;height:48px}}.ui-image-carousel__placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;aspect-ratio:1;background:#F5F5F5;border-radius:0.75rem;color:#999999}.ui-image-carousel__placeholder svg{width:64px;height:64px;margin-bottom:0.5rem}.ui-image-carousel__placeholder span{font-size:0.875rem}`;

const UiImageCarousel = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Array of image URLs to display
     */
    images = [];
    /**
     * Enable circular/loop mode
     */
    loop = true;
    /**
     * Show navigation arrows
     */
    showNavigation = true;
    /**
     * Show indicator dots
     */
    showIndicators = true;
    /**
     * Auto-play interval in milliseconds (0 = disabled)
     */
    autoplayInterval = 0;
    /**
     * Fallback image URL when image fails to load
     */
    fallbackImage = '';
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    currentIndex = 0;
    loadedImages = new Set();
    failedImages = new Set();
    // ------------------------------------------
    // PRIVATE
    // ------------------------------------------
    autoplayTimer;
    touchStartX = 0;
    touchEndX = 0;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
    onImagesChange() {
        this.currentIndex = 0;
        this.loadedImages = new Set();
        this.failedImages = new Set();
        this.restartAutoplay();
    }
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentDidLoad() {
        this.startAutoplay();
    }
    disconnectedCallback() {
        this.stopAutoplay();
    }
    // ------------------------------------------
    // AUTOPLAY
    // ------------------------------------------
    startAutoplay() {
        if (this.autoplayInterval > 0 && this.images.length > 1) {
            this.autoplayTimer = setInterval(() => {
                this.goToNext();
            }, this.autoplayInterval);
        }
    }
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    goToSlide = (index) => {
        const total = this.images.length;
        if (total === 0)
            return;
        if (this.loop) {
            if (index < 0) {
                index = total - 1;
            }
            else if (index >= total) {
                index = 0;
            }
        }
        else {
            index = Math.max(0, Math.min(index, total - 1));
        }
        this.currentIndex = index;
        this.restartAutoplay();
    };
    goToPrev = () => {
        this.goToSlide(this.currentIndex - 1);
    };
    goToNext = () => {
        this.goToSlide(this.currentIndex + 1);
    };
    // ------------------------------------------
    // TOUCH HANDLING
    // ------------------------------------------
    handleTouchStart = (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.stopAutoplay();
    };
    handleTouchEnd = (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
        this.startAutoplay();
    };
    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        const threshold = 50; // Min swipe distance
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.goToNext();
            }
            else {
                this.goToPrev();
            }
        }
    }
    // ------------------------------------------
    // IMAGE HANDLING
    // ------------------------------------------
    handleImageLoad = (index) => {
        this.loadedImages = new Set([...this.loadedImages, index]);
    };
    handleImageError = (index, event) => {
        this.failedImages = new Set([...this.failedImages, index]);
        // Apply fallback image
        if (this.fallbackImage) {
            const img = event.target;
            img.src = this.fallbackImage;
        }
    };
    getImageSrc(index) {
        const src = this.images[index];
        if (!src && this.fallbackImage) {
            return this.fallbackImage;
        }
        return src || '';
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const total = this.images.length;
        const hasMultiple = total > 1;
        const canGoPrev = this.loop || this.currentIndex > 0;
        const canGoNext = this.loop || this.currentIndex < total - 1;
        // If no images, show placeholder
        if (total === 0) {
            return (index.h(index.Host, null, index.h("div", { class: "ui-image-carousel" }, index.h("div", { class: "ui-image-carousel__placeholder" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, index.h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }), index.h("circle", { cx: "8.5", cy: "8.5", r: "1.5" }), index.h("polyline", { points: "21 15 16 10 5 21" })), index.h("span", null, "Sin imagen")))));
        }
        return (index.h(index.Host, null, index.h("div", { class: "ui-image-carousel" }, index.h("div", { class: "ui-image-carousel__main", onTouchStart: this.handleTouchStart, onTouchEnd: this.handleTouchEnd }, this.showNavigation && hasMultiple && (index.h("button", { class: {
                'ui-image-carousel__nav': true,
                'ui-image-carousel__nav--prev': true,
                'ui-image-carousel__nav--disabled': !canGoPrev,
            }, onClick: this.goToPrev, disabled: !canGoPrev, "aria-label": "Imagen anterior" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("polyline", { points: "15 18 9 12 15 6" })))), index.h("div", { class: "ui-image-carousel__track", style: {
                transform: `translateX(-${this.currentIndex * 100}%)`,
            } }, this.images.map((_, index$1) => (index.h("div", { class: "ui-image-carousel__slide" }, index.h("img", { src: this.getImageSrc(index$1), alt: `Imagen ${index$1 + 1}`, class: {
                'ui-image-carousel__image': true,
                'ui-image-carousel__image--loaded': this.loadedImages.has(index$1),
            }, onLoad: () => this.handleImageLoad(index$1), onError: (e) => this.handleImageError(index$1, e), loading: index$1 === 0 ? 'eager' : 'lazy' }))))), this.showNavigation && hasMultiple && (index.h("button", { class: {
                'ui-image-carousel__nav': true,
                'ui-image-carousel__nav--next': true,
                'ui-image-carousel__nav--disabled': !canGoNext,
            }, onClick: this.goToNext, disabled: !canGoNext, "aria-label": "Imagen siguiente" }, index.h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("polyline", { points: "9 18 15 12 9 6" }))))), this.showIndicators && hasMultiple && (index.h("div", { class: "ui-image-carousel__indicators" }, this.images.map((_, index$1) => (index.h("button", { class: {
                'ui-image-carousel__dot': true,
                'ui-image-carousel__dot--active': index$1 === this.currentIndex,
            }, onClick: () => this.goToSlide(index$1), "aria-label": `Ir a imagen ${index$1 + 1}` }))))), hasMultiple && (index.h("div", { class: "ui-image-carousel__thumbnails" }, this.images.map((src, index$1) => (index.h("button", { class: {
                'ui-image-carousel__thumbnail': true,
                'ui-image-carousel__thumbnail--active': index$1 === this.currentIndex,
            }, onClick: () => this.goToSlide(index$1) }, index.h("img", { src: src || this.fallbackImage, alt: `Miniatura ${index$1 + 1}`, loading: "lazy" })))))))));
    }
    static get watchers() { return {
        "images": ["onImagesChange"]
    }; }
};
UiImageCarousel.style = uiImageCarouselCss();

const uiStepperCss = () => `.ui-stepper{display:flex;align-items:flex-start;justify-content:center;width:100%}.ui-stepper__step{display:flex;flex-direction:column;align-items:flex-start;position:relative}.ui-stepper__indicator{display:flex;align-items:center;position:relative}.ui-stepper__circle{width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.875rem;transition:all 250ms ease;flex-shrink:0}.ui-stepper__circle--pending{background-color:#FFFFFF;color:#999999;border:2px solid #CCCCCC}.ui-stepper__circle--active{background-color:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.ui-stepper__circle--completed{background-color:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.ui-stepper__number{line-height:1}.ui-stepper__check{width:16px;height:16px}.ui-stepper__connector{width:220px;height:2px;background-color:#CCCCCC;transition:background-color 250ms ease;margin-left:8px;margin-right:8px}.ui-stepper__connector--completed{background-color:#0097A9}.ui-stepper__label{position:relative;left:calc(32px / 2);transform:translateX(-50%);margin-top:0.5rem;font-size:0.75rem;font-weight:500;text-align:center;transition:color 250ms ease;white-space:nowrap}.ui-stepper__label--pending{color:#808080}.ui-stepper__label--active{color:#0097A9;font-weight:600}.ui-stepper__label--completed{color:#0097A9}.ui-stepper--sm .ui-stepper__circle{width:24px;height:24px;font-size:0.75rem}.ui-stepper--sm .ui-stepper__check{width:12px;height:12px}.ui-stepper--sm .ui-stepper__connector{width:30px}.ui-stepper--sm .ui-stepper__label{font-size:10px;left:calc(24px / 2)}@media (max-width: 576px){.ui-stepper__connector{width:80px}.ui-stepper__label{font-size:11px}}`;

const UiStepper = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Array of step items with labels
     */
    steps = [];
    /**
     * Current active step (1-indexed)
     */
    currentStep = 1;
    /**
     * Size variant
     */
    size = 'md';
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    getStepStatus(index) {
        const stepNumber = index + 1;
        if (stepNumber < this.currentStep) {
            return 'completed';
        }
        else if (stepNumber === this.currentStep) {
            return 'active';
        }
        return 'pending';
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const classes = {
            'ui-stepper': true,
            [`ui-stepper--${this.size}`]: true,
        };
        return (index.h(index.Host, { key: 'df6adc9763aed239c6eaf79af2f2d549f48579c6' }, index.h("div", { key: 'bfb747939107bdd62106748334c198a2fb50713b', class: classes }, this.steps.map((step, index$1) => {
            const status = this.getStepStatus(index$1);
            const isLast = index$1 === this.steps.length - 1;
            return (index.h("div", { class: "ui-stepper__step", key: index$1 }, index.h("div", { class: "ui-stepper__indicator" }, index.h("div", { class: {
                    'ui-stepper__circle': true,
                    [`ui-stepper__circle--${status}`]: true,
                } }, status === 'completed' ? (index.h("svg", { class: "ui-stepper__check", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3" }, index.h("polyline", { points: "20 6 9 17 4 12" }))) : (index.h("span", { class: "ui-stepper__number" }, index$1 + 1))), !isLast && (index.h("div", { class: {
                    'ui-stepper__connector': true,
                    'ui-stepper__connector--completed': status === 'completed',
                } }))), index.h("span", { class: {
                    'ui-stepper__label': true,
                    [`ui-stepper__label--${status}`]: true,
                } }, step.label)));
        }))));
    }
};
UiStepper.style = uiStepperCss();

exports.fixed_service_flow = FixedServiceFlow;
exports.step_catalogue = StepCatalogue;
exports.step_confirmation = StepConfirmation;
exports.step_contract = StepContract;
exports.step_form = StepForm;
exports.step_location = StepLocation;
exports.step_order_summary = StepOrderSummary;
exports.step_payment = StepPayment;
exports.step_plans = StepPlans;
exports.step_product_detail = StepProductDetail;
exports.step_shipping = StepShipping;
exports.ui_carousel = UiCarousel;
exports.ui_image_carousel = UiImageCarousel;
exports.ui_stepper = UiStepper;
//# sourceMappingURL=fixed-service-flow.step-catalogue.step-confirmation.step-contract.step-form.step-location.step-order-summary.step-payment.step-plans.step-product-detail.step-shipping.ui-carousel.ui-image-carousel.ui-stepper.entry.cjs.js.map
