import { a as getRenderingRef, f as forceUpdate, r as registerInstance, c as createEvent, h, H as Host, d as getElement } from './index-X-V47bix.js';

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
 * Fuente: TEL/frondend/src/app/shared/const/appConst.ts (INTERNET constant)
 *
 * CON CONTRATO:
 * - 24 meses: Todo sin costo (instalación, activación, modem)
 * - 12 meses: Instalación $25, Activación $20, Modem sin costo
 *
 * SIN CONTRATO:
 * - Instalación $50, Activación $40, Modem $40
 */
const CONTRACT_OPTIONS = [
    {
        typeId: 1,
        type: 'Con Contrato',
        contract: [
            {
                contractId: 2,
                deadlines: 12,
                installation: 25,
                activation: 20,
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
                installation: 50,
                activation: 40, // Corregido: era 0, debe ser 40 (según TEL)
                modem: 40,
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
        registerInstance(this, hostRef);
        this.flowComplete = createEvent(this, "flowComplete");
        this.flowError = createEvent(this, "flowError");
        this.flowCancel = createEvent(this, "flowCancel");
        this.stepChange = createEvent(this, "stepChange");
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
                return h("step-location", { ...stepProps });
            case 2:
                return h("step-plans", { ...stepProps });
            case 3:
                return h("step-contract", { ...stepProps });
            case 4:
                return h("step-form", { ...stepProps });
            case 5:
                return h("step-confirmation", { ...stepProps, onCancel: this.handleFlowCancel });
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
                return h("step-location", { ...stepProps });
            case CLARO_HOGAR_STEPS.CATALOGUE:
                return h("step-catalogue", { ...stepProps });
            case CLARO_HOGAR_STEPS.PRODUCT_DETAIL:
                return h("step-product-detail", { ...stepProps });
            case CLARO_HOGAR_STEPS.PLANS:
                // Plans for the selected product
                return h("step-plans", { ...stepProps });
            case CLARO_HOGAR_STEPS.ORDER_SUMMARY:
                return h("step-order-summary", { ...stepProps });
            case CLARO_HOGAR_STEPS.SHIPPING:
                return h("step-shipping", { ...stepProps });
            case CLARO_HOGAR_STEPS.PAYMENT:
                return h("step-payment", { ...stepProps });
            case CLARO_HOGAR_STEPS.CONFIRMATION:
                return h("step-confirmation", { ...stepProps, onCancel: this.handleFlowCancel });
            default:
                return null;
        }
    }
    renderLoading() {
        return (h("div", { class: "fsf-loading" }, h("div", { class: "fsf-loading__spinner" }), h("p", { class: "fsf-loading__text" }, "Cargando...")));
    }
    renderError() {
        return (h("div", { class: "fsf-error" }, h("div", { class: "fsf-error__icon" }, "!"), h("h3", { class: "fsf-error__title" }, "Error"), h("p", { class: "fsf-error__message" }, this.error), h("button", { class: "fsf-error__button", onClick: () => this.initializeToken() }, "Reintentar")));
    }
    render() {
        // Show loading state
        if (this.isLoading) {
            return (h(Host, null, this.renderLoading()));
        }
        // Show error state
        if (this.error && !this.isInitialized) {
            return (h(Host, null, this.renderError()));
        }
        // Render flow
        return (h(Host, null, h("div", { class: "fsf-container" }, this.renderStep())));
    }
    static get watchers() { return {
        "apiUrl": ["handleApiUrlChange"]
    }; }
};
FixedServiceFlow.style = fixedServiceFlowCss();

const stepCatalogueCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-catalogue{width:100%;padding:0 1rem}.container-filter{display:grid;grid-gap:10px;padding:20px 0;align-items:center;justify-content:space-between;border-bottom:1px solid #DBDBDB;grid-template-columns:auto 1fr auto}@media (max-width: 991px){.container-filter{grid-template-columns:1fr;gap:15px}}.filter-title-main{margin:0;font-size:24px;font-weight:700;color:#333333}@media (max-width: 991px){.filter-title-main{font-size:20px}}.filter-content{display:flex;gap:10px;align-items:center;justify-content:flex-end}@media (max-width: 991px){.filter-content{width:100%}}.input-filter-wrapper{position:relative;display:flex;align-items:center;width:300px}@media (max-width: 991px){.input-filter-wrapper{flex:1;width:auto}}.search-icon{position:absolute;left:12px;width:20px;height:20px;color:#999999}.input-filter{width:100%;height:40px;padding:8px 12px 8px 40px;font-size:16px;border:1px solid #DBDBDB;border-radius:12px;outline:none;transition:border-color 0.2s}.input-filter:focus{border-color:#DA291C}.input-filter::placeholder{color:#999999}.btn-search{height:40px;padding:0 24px;background:#DA291C;color:#FFFFFF;border:none;border-radius:22px;font-size:16px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background-color 0.2s}.btn-search:hover{background:rgb(181.843902439, 34.2, 23.356097561)}@media (max-width: 767px){.btn-search{padding:0 16px;font-size:14px}}.btn-hidden-filter{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;background:transparent;color:#0097A9;border:1px solid #0097A9;border-radius:22px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-hidden-filter:hover{background:rgba(0, 151, 169, 0.1)}.btn-hidden-filter .filter-icon{width:16px;height:16px}@media (max-width: 991px){.btn-hidden-filter{display:none}}.catalogue-content{display:grid;grid-template-columns:280px 1fr;gap:24px;padding:20px 0}@media (max-width: 1199px){.catalogue-content{grid-template-columns:240px 1fr}}@media (max-width: 991px){.catalogue-content{grid-template-columns:1fr}}.filter-container{border-radius:12px;border:1px solid #DBDBDB;background:#FFFFFF;height:fit-content}@media (max-width: 991px){.filter-container{display:none !important}}.filter-header{padding:20px;display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #DBDBDB}.filter-title{margin:0;font-size:24px;font-weight:700;color:#333333}.reset-filter{margin:0;color:#0097A9;cursor:pointer;font-size:14px;font-weight:700;text-decoration:none}.reset-filter:hover{text-decoration:underline}.filter-result{padding:20px;border-bottom:1px solid #DBDBDB}.filter-result .result{margin:0;font-size:14px;font-weight:700;color:#666666}.filter-type-product{border-bottom:1px solid #DBDBDB}.filter-type-product:last-child{border-bottom:none}.filter-type-title{display:flex;padding:20px;cursor:pointer;align-items:center;justify-content:space-between}.filter-title-section{margin:0;font-size:16px;font-weight:700;color:#333333}.chevron-icon{width:20px;height:20px;color:#666666}.slot-radio{padding:0 20px 20px}.radio-group{display:flex;flex-direction:column;gap:12px}.radio-button{display:flex;align-items:center;gap:10px;cursor:pointer}.radio-button input[type=radio]{width:18px;height:18px;accent-color:#0097A9;cursor:pointer}.radio-button .radio-label{font-size:14px;color:#333333}.products-section{min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:2rem;background:rgba(255, 255, 255, 0.95);border-radius:16px}.loading-container p{margin-top:1rem;font-size:18px;font-weight:600;color:#333333}.error-container,.empty-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;color:#666666}.error-container p,.empty-container p{margin-top:1rem;font-size:16px}.error-container button,.empty-container button{margin-top:1rem;padding:8px 24px;background:#0097A9;color:#FFFFFF;border:none;border-radius:20px;cursor:pointer}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.container-product{display:grid;grid-gap:1.5rem;align-items:stretch;grid-template-columns:1fr 1fr 1fr}@media (max-width: 1399px){.container-product{grid-template-columns:1fr 1fr}}@media (max-width: 767px){.container-product{grid-template-columns:1fr}}.container-product-filter-off{grid-template-columns:1fr 1fr 1fr 1fr}@media (max-width: 1399px){.container-product-filter-off{grid-template-columns:1fr 1fr 1fr}}@media (max-width: 1199px){.container-product-filter-off{grid-template-columns:1fr 1fr}}@media (max-width: 767px){.container-product-filter-off{grid-template-columns:1fr}}.new-product-item{width:100%;height:100%;overflow:hidden;position:relative;border-radius:12px;border:solid 1px #dbdbdb;background:#FFFFFF;box-shadow:2px 3px 27px -3px rgb(211, 211, 211);transition:transform 0.2s, box-shadow 0.2s;display:flex;flex-direction:column}.new-product-item:hover{transform:translateY(-2px);box-shadow:2px 6px 32px -3px rgb(180, 180, 180)}.new-product-item__top{display:grid;margin-top:20px;position:relative;grid-column-gap:16px;padding:16px 16px 8px;grid-template-columns:1fr 2fr}@media (max-width: 1199px){.new-product-item__top{display:flex;flex-direction:column}}.new-product-item__img{display:flex;align-items:center;justify-content:center}.new-product-item__img img{max-width:100%;max-height:120px;object-fit:contain}@media (max-width: 1199px){.new-product-item__img{width:100px;margin:0 auto 16px}}.new-product-item__info .title{margin-top:10px;color:#3c3c3c;font-size:18px;font-weight:700;line-height:24px;margin-bottom:16px;font-family:Roboto, sans-serif}@media (max-width: 1199px){.new-product-item__info .title{margin-top:0;font-size:16px;min-height:48px}}.new-product-item__info .financed-price .financed-price-text{margin-top:4px;color:#3c3c3c;font-size:16px;font-weight:700;line-height:16px}.new-product-item__info .financed-price .financed-price__value{color:#DA291C;font-size:18px;font-weight:700;line-height:24px}.new-product-item__info .financed-price .installments-text{color:#3c3c3c;font-size:14px;font-weight:700;line-height:16px}.new-product-item__info .regular-price{color:#6c6c6c;font-size:14px;font-weight:400;margin-top:10px;line-height:16px}.container-colors{display:flex;gap:8px;padding:10px 25px 15px;flex-wrap:wrap}.color-dot{width:14px;height:14px;border-radius:50%;border:1px solid #3c3c3c;cursor:pointer}.color-dot:active{transform:scale(0.95)}.new-product-item__middle{padding:15px;color:#3c3c3c;min-height:65px;font-size:14px;line-height:1.4;border-top:2px solid #dbdbdb;border-bottom:2px solid #dbdbdb;flex-grow:1}.new-product-item__middle .description-text{display:block}.new-product-item__middle .see-detail{display:inline-block;margin-top:8px;font-size:14px;color:#0097A9;cursor:pointer;text-decoration:underline}.new-product-item__bottom{padding:1rem;display:flex;justify-content:center;align-items:center}.action-button{color:#DA291C;text-align:center;font-size:16px;font-weight:700;line-height:16px;border:solid 1px #DA291C;border-radius:30px;padding:0.5rem 2.5rem;background:transparent;cursor:pointer;transition:all 0.2s}.action-button:hover{background-color:#DA291C;color:#FFFFFF}.back-button-container{display:flex;justify-content:center;padding:24px 0 40px}.btn-back{padding:12px 32px;background:transparent;color:#0097A9;border:2px solid #0097A9;border-radius:30px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#0097A9;color:#FFFFFF}.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}.modal-content{position:relative;background:#FFFFFF;border-radius:12px;max-width:500px;width:100%;max-height:80vh;overflow:hidden;box-shadow:0 4px 20px rgba(0, 0, 0, 0.15);animation:modalFadeIn 0.2s ease-out}@keyframes modalFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}.modal-close{position:absolute;top:12px;right:12px;width:32px;height:32px;background:transparent;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}.modal-close svg{width:20px;height:20px;color:#3c3c3c}.modal-close:hover{background:#f0f0f0}.modal-title{padding:20px;padding-right:50px;border-bottom:1px solid #dbdbdb;color:#3c3c3c;font-size:20px;font-weight:700;line-height:1.3}.modal-title .modal-subtitle{font-size:14px;font-weight:500;color:#6c6c6c;margin-bottom:8px}@media (max-width: 767px){.modal-title{font-size:18px;padding:16px;padding-right:45px}}.modal-body{padding:20px;max-height:300px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#ccc transparent}.modal-body::-webkit-scrollbar{width:6px}.modal-body::-webkit-scrollbar-track{background:transparent}.modal-body::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}.modal-text{margin:0;color:#3c3c3c;font-size:16px;font-weight:400;line-height:1.5;text-align:justify}@media (max-width: 767px){.modal-text{font-size:14px}}`;

const StepCatalogue = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h("aside", { class: "filter-container", style: { display: this.showFilters ? 'block' : 'none' } }, h("div", { class: "filter-header" }, h("span", { class: "filter-title" }, "Filtrar por:"), h("a", { class: "reset-filter", onClick: this.clearFilters }, "Limpiar filtros")), h("div", { class: "filter-result" }, h("p", { class: "result" }, filterCount > 0
            ? `filtros seleccionados (${filterCount})`
            : 'Ningún filtro seleccionado')), h("div", { class: "filter-type-product" }, h("div", { class: "filter-type-title" }, h("h4", { class: "filter-title-section" }, "Tipo de producto"), h("svg", { class: "chevron-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { points: "6 9 12 15 18 9" }))), h("div", { class: "slot-radio" }, h("div", { class: "radio-group" }, this.filterOptions.map((option) => (h("label", { class: "radio-button" }, h("input", { type: "radio", name: "productType", value: option.value, checked: this.selectedFilter === option.value, onChange: () => this.handleFilterChange(option.value) }), h("span", { class: "radio-label" }, option.label)))))))));
    }
    renderProductCard(product) {
        const description = this.cleanHTML(product.shortDescription || '');
        const truncatedDesc = catalogueService.truncateText(description, 80);
        return (h("div", { class: "new-product-item" }, h("div", { class: "new-product-item__top" }, h("div", { class: "new-product-item__img" }, h("img", { src: product.imgUrl, alt: product.productName, loading: "lazy" })), h("div", { class: "new-product-item__info" }, h("div", { class: "title" }, product.productName), product.installments > 0 && (h("div", { class: "financed-price" }, h("div", { class: "financed-price-text" }, "Financiado"), h("div", { class: "financed-price__value" }, "$", product.update_price?.toFixed(2) || '0.00', "/mes"), h("div", { class: "installments-text" }, product.installments, " Plazos"))), h("div", { class: "regular-price" }, "Precio regular: $", product.regular_price?.toFixed(2) || '0.00'))), product.colors && product.colors.length > 0 && (h("div", { class: "container-colors" }, product.colors.map((color) => (h("div", { class: "color-dot", style: { backgroundColor: color.webColor } }))))), h("div", { class: "new-product-item__middle" }, description ? (h("span", { class: "description-text" }, truncatedDesc, description.length > 80 && (h("a", { class: "see-detail", onClick: (e) => { e.stopPropagation(); this.handleSeeDetail(product); } }, "Ver detalle")))) : (h("span", { class: "description-text" }, "\u00A0"))), h("div", { class: "new-product-item__bottom" }, h("button", { class: "action-button", onClick: () => this.handleViewMore(product) }, "Ver m\u00E1s"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        // Get title based on selected filter
        const title = this.selectedFilter === catalogueService.FILTER_INTERNET_INALAMBRICO
            ? 'Internet Inalámbrico'
            : 'Internet + Telefonía';
        return (h(Host, { key: '633cab4f89f3e79907cb5db33eb2897e114ecf97' }, h("div", { key: '9390e25d97abc32a1ad7c303b1460f310f6f05ab', class: "step-catalogue" }, h("div", { key: '02e7d0c13069e26f9a07ea6e0c307f5bb699954c', class: "container-filter" }, h("h1", { key: 'ccded62f26e8b1cb8719a5e85965cbb87a793689', class: "filter-title-main" }, title), h("div", { key: '2e8b8d5966728504b0c9a35953d2734cfc9d2166', class: "filter-content" }, h("div", { key: 'c7b44c9803036ea915e916276935c123e1ae6394', class: "input-filter-wrapper" }, h("svg", { key: 'fc68b3c733ac05a3d72f3242281495b1a4d195dd', class: "search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '465cf04a8bac926218930455360383f4ce76d4d2', cx: "11", cy: "11", r: "8" }), h("path", { key: '94880ba619fba184c09735fb5dee50a2dc9e2638', d: "m21 21-4.35-4.35" })), h("input", { key: '96e070ad2f6913c5dac4f32a0331f9c8452c5ca4', type: "text", class: "input-filter", placeholder: "Buscar articulo", value: this.searchText, onInput: this.handleSearchInput, onKeyPress: this.handleKeyPress })), h("button", { key: '3ed9a4be367b1daded8e20f9d04876a5cceaddf4', class: "btn-search", onClick: this.handleSearch }, "Buscar"))), h("div", { key: '31dedbc72907c038675e86e69610d656dfb1933c', class: "catalogue-content" }, this.renderFilterSidebar(), h("div", { key: '5fc3589a28fc81d2fa105d2ab68a8645c3e16d3c', class: "products-section" }, this.isLoading && (h("div", { key: '292cb80c0714438e041805d2250be61c4db7a0e1', class: "loading-container" }, h("div", { key: 'e58b5e87f3092109d7ebb87f9ad4827d17e9527a', class: "spinner" }), h("p", { key: 'd8ea4899e95713de1acb4d5c9e1df3d0da6f00bc' }, "Cargando productos..."))), this.error && !this.isLoading && (h("div", { key: 'd12da3b185d76e74f3b195a7bc95115502d50801', class: "error-container" }, h("p", { key: 'bd2d3bbdd3a22d41d90760af4103fcd413858551' }, this.error), h("button", { key: 'aecf413d4416c536d035453741ccf0b10f07ddc5', onClick: () => this.loadProducts() }, "Reintentar"))), !this.isLoading && !this.error && (h("div", { key: 'ab42f43d608c13216bee78a5f6979bb883908434', class: {
                'container-product': true,
                'container-product-filter-off': !this.showFilters,
            } }, this.filteredProducts.map((product) => this.renderProductCard(product)))), !this.isLoading && !this.error && this.filteredProducts.length === 0 && (h("div", { key: 'fe07cc32a053431c0f5624669646ed95d52b2014', class: "empty-container" }, h("p", { key: '354f47fce91aa5d8e7d09127119fcfcad12c6a49' }, "No hay productos disponibles para esta categor\u00EDa"))))), h("div", { key: '9edaae5bf982ec881e74353e952ae4158ce9e87c', class: "back-button-container" }, h("button", { key: 'ccb3b1dcafbf7a0f4938e5192874a4c59087a6d1', class: "btn-back", onClick: this.onBack }, "Regresar"))), this.showDetailModal && (h("div", { key: '3c3d144571de958f77d47a1d2077e6914f758ec2', class: "modal-overlay", onClick: this.closeDetailModal }, h("div", { key: '6e0ea7baa3b102322a025c316276f50468ec1e5f', class: "modal-content", onClick: (e) => e.stopPropagation() }, h("button", { key: '3f9017ff359a09a6f56ab2b998b64f12f408712d', class: "modal-close", onClick: this.closeDetailModal }, h("svg", { key: '8b5debf990dfba49121bc00557ff8787b98766b0', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("line", { key: '73e21236ccdc9be42e65ada13b224dfeed689247', x1: "18", y1: "6", x2: "6", y2: "18" }), h("line", { key: 'e54bf79a62b785719755ee4e0e906e8540dc2001', x1: "6", y1: "6", x2: "18", y2: "18" }))), h("div", { key: 'af62534c7dbdbe94508f0f177200e3362828b595', class: "modal-title" }, h("div", { key: '2e867881616c387d65681cf3cc0e9d097e64568a', class: "modal-subtitle" }, "Descripci\u00F3n completa"), this.modalTitle), h("div", { key: '5361636aec7839c921dc8d48d2bb5432aff0a876', class: "modal-body" }, h("p", { key: '51f2c1a26f1ada39a8e3543dd2b0c4006f566773', class: "modal-text" }, this.modalContent)))))));
    }
};
StepCatalogue.style = stepCatalogueCss();

const stepConfirmationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-confirmation{width:100%}.step-confirmation__header{margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #E5E5E5}.step-confirmation__header-title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-confirmation__content{background-color:#FFFFFF;border:1px solid #E5E5E5;border-radius:0.75rem;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);transition:box-shadow 150ms ease, border-color 150ms ease;padding:3rem 2rem;text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading{display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading p{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.step-confirmation__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-confirmation__result{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:500px}.step-confirmation__icon{display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.step-confirmation__icon img{width:48px;height:48px}.step-confirmation__icon svg{width:40px;height:40px}.step-confirmation__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;margin-bottom:0.5rem}.step-confirmation__title--success{color:#15A045}.step-confirmation__title--error{color:#E00814}.step-confirmation__message{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-confirmation__order-id{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0.5rem 1rem;background:#FAFAFA;border-radius:0.5rem}.step-confirmation__actions{margin-top:1.5rem;text-align:center}.step-confirmation__btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-confirmation__btn:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-confirmation__btn:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-confirmation__btn{min-width:180px}.step-confirmation__btn--error{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn--error:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn--error{height:48px;background-color:#DA291C;color:#FFFFFF}.step-confirmation__btn--error:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-confirmation__btn--error:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepConfirmation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h("div", { class: "step-confirmation__loading" }, h("div", { class: "step-confirmation__spinner" }), h("p", null, "Procesando tu solicitud...")));
    }
    renderSuccess() {
        // Prefer orderNumber from getOrder API, fallback to orderId from submit response
        const displayOrderId = this.orderNumber || this.orderId;
        return (h("div", { class: "step-confirmation__result step-confirmation__result--success" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--success" }, h("img", { src: "/assets/images/ok-check.svg", alt: "\u00C9xito" })), h("h2", { class: "step-confirmation__title step-confirmation__title--success" }, SUCCESS_MESSAGES.REQUEST_SUCCESS), h("p", { class: "step-confirmation__message" }, SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE), displayOrderId && (h("p", { class: "step-confirmation__order-id" }, "N\u00FAmero de orden: ", displayOrderId)), this.confirmationSent && (h("p", { class: "step-confirmation__email-sent" }, "Se ha enviado un correo de confirmaci\u00F3n a tu email."))));
    }
    renderError() {
        return (h("div", { class: "step-confirmation__result step-confirmation__result--error" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--error" }, h("img", { src: "/assets/images/error-check.svg", alt: "Error" })), h("h2", { class: "step-confirmation__title step-confirmation__title--error" }, "\u00A1Lo sentimos, ha ocurrido un error en el proceso de solicitud!"), h("p", { class: "step-confirmation__message" }, "En este momento estamos presentando inconvenientes en nuestro sistema.", h("br", null), "Por favor, int\u00E9ntalo nuevamente.")));
    }
    render() {
        return (h(Host, { key: '5215f0878f1df6b712acc38537e948ce3425b759' }, h("div", { key: '9e12c496833250df2608be2b17d6281df49b4a81', class: "step-confirmation" }, h("header", { key: '59751a8125cfa08dbffe6ede377909dee0dc36b9', class: "step-confirmation__header" }, h("h1", { key: 'e3dcbfa01d585cb8a927e5f65d3f3c3be7882e5e', class: "step-confirmation__header-title" }, "Confirmaci\u00F3n de Solicitud")), h("div", { key: '8c19786bfe36d066a46185738e4d23ca2ffc205b', class: "step-confirmation__content" }, this.status === 'loading' && this.renderLoading(), this.status === 'success' && this.renderSuccess(), this.status === 'error' && this.renderError()), this.status === 'success' && (h("div", { key: '82a95ae0d94faf62ce1274059cc34bd0343e299c', class: "step-confirmation__actions" }, h("button", { key: '1a3e1d2a74e0ad18f5934ab9a872c1d8975708ed', class: "step-confirmation__btn", onClick: this.handleClose }, "Cerrar"))), this.status === 'error' && (h("div", { key: '32cbebb3bbd7de33beb7ab6f956032e77232443d', class: "step-confirmation__actions" }, h("button", { key: '1e2a9b4e0919322310e234db3222a023eb46a3c4', class: "step-confirmation__btn step-confirmation__btn--error", onClick: this.handleRetry }, "Volver a intentar"))))));
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

const stepContractCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-contract{width:100%}.step-contract__header{display:flex;align-items:center;justify-content:space-between;padding-bottom:1rem;margin-bottom:1rem;border-bottom:1px solid #CCCCCC;box-shadow:0 1px 2px rgba(0, 0, 0, 0.05)}.step-contract__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-contract__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-contract__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-contract__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-contract__btn-back{height:40px}.step-contract__tabs{display:flex;margin-bottom:1.5rem;background:#FFFFFF;border-radius:0 0 0.75rem 0.75rem;box-shadow:0 2px 4px rgba(0, 0, 0, 0.08);overflow:hidden}.step-contract__tab{flex:1;padding:1.25rem 1rem;background:transparent;border:none;cursor:pointer;text-align:center;position:relative;transition:all 150ms ease}.step-contract__tab:first-child{border-right:1px solid #E5E5E5}.step-contract__tab::after{content:"";position:absolute;bottom:0;left:0;right:0;height:4px;background:transparent;transition:background-color 150ms ease}.step-contract__tab--active::after{background:#0097A9}.step-contract__tab:hover:not(.step-contract__tab--active){background:#FAFAFA}.step-contract__tab-title{display:block;font-size:1rem;font-weight:700;color:#333333;margin-bottom:0.25rem}.step-contract__tab-subtitle{display:block;font-size:0.875rem;color:#666666;line-height:1.5}.step-contract__options{display:flex;flex-direction:column;gap:1rem;align-items:center}@media (min-width: 768px){.step-contract__options{flex-direction:row;justify-content:center}}.step-contract__options--single{justify-content:center}.step-contract__option{flex:0 0 auto;width:280px;display:flex;align-items:center;padding:1rem 1.25rem;background:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;position:relative;overflow:hidden}@media (max-width: 767px){.step-contract__option{width:100%;max-width:320px}}.step-contract__option::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#CCCCCC;border-radius:0.75rem 0 0 0.75rem;transition:background-color 150ms ease}.step-contract__option input[type=radio]{width:20px;height:20px;margin-right:0.75rem;accent-color:#0097A9;flex-shrink:0}.step-contract__option:hover{border-color:#999999}.step-contract__option--selected::before{background:#0097A9}.step-contract__option-content{flex:1;display:flex;flex-direction:column;gap:0.25rem}.step-contract__option-title{display:block;font-size:1rem;font-weight:600;color:#333333;line-height:1.35}.step-contract__option-price{display:block;font-size:0.875rem;color:#666666}.step-contract__option-price strong,.step-contract__option-price b{font-weight:600}.step-contract__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-contract__btn-continue{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-continue:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-continue{height:48px;background-color:#DA291C;color:#FFFFFF}.step-contract__btn-continue:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-contract__btn-continue:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-contract__btn-continue{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-contract__btn-continue:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-contract__btn-continue:disabled:hover{background-color:#999999;border-color:#999999}`;

const StepContract = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h(Host, { key: '29cf3d679c2803ea1fb5529f32a39b1a8f186003' }, h("div", { key: '994e15bc052c3be582ad3d7579898a7a26581049', class: "step-contract" }, h("header", { key: '5bddb4e258c2c1f838893ae8f150ec797c628917', class: "step-contract__header" }, h("h1", { key: 'e9127bb729aed221bc75a3e9d20e407c5cd5748b', class: "step-contract__title" }, "Selecciona un tipo de contrato"), h("button", { key: '94071b93852ac46d1edf123239a0a5e7939808ef', class: "step-contract__btn-back", onClick: this.onBack }, "Regresar")), h("div", { key: '269d9627d831b10e781b6d91d6b287ae84e82eeb', class: "step-contract__tabs" }, h("button", { key: '3301c449db74fdffdc7c5dc9f8127c44a6b4ab1a', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
            }, onClick: () => this.handleTabChange(1) }, h("span", { key: 'f2a2e40945863a78571c9b58b6f80949fbb4d79f', class: "step-contract__tab-title" }, "Con contrato"), h("span", { key: 'bae82158d5c45aa2aaf2ea343333b60709d8286e', class: "step-contract__tab-subtitle" }, "12 y 24 meses de contrato")), h("button", { key: 'ee4e9bfc3f250456330e43f0043360918e1808b3', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
            }, onClick: () => this.handleTabChange(0) }, h("span", { key: 'a1238ac61cd15563f582d1d4eaf10244788d1a75', class: "step-contract__tab-title" }, "Sin contrato"), h("span", { key: '86c1e3e51c3e487243a2da65446dffababaeeb69', class: "step-contract__tab-subtitle" }, "Plan mensual con pago por adelantado"))), h("div", { key: '1ca6835907555e07c7088dfbcb0a8a8354ff436f', class: "step-contract__content" }, this.activeTab === 1 && withContract && (h("div", { key: 'f741a4f0224c6b84e32697be48f11808f1a65874', class: "step-contract__options" }, withContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.deadlines === option.deadlines &&
                        this.selectedOption?.typeId === 1,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.deadlines === option.deadlines &&
                    this.selectedOption?.typeId === 1, onChange: () => this.handleSelectOption(1, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, this.formatContractLabel(option.deadlines)), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", totalCost > 0 ? formatPrice(totalCost) : '$0.00'))));
        }))), this.activeTab === 0 && withoutContract && (h("div", { key: 'ea88719ac616f6d0495ffeb627a413d27e949813', class: "step-contract__options step-contract__options--single" }, withoutContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.typeId === 0,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.typeId === 0, onChange: () => this.handleSelectOption(0, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, "Sin contrato"), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", formatPrice(totalCost)))));
        })))), h("div", { key: '031b0a7d971f934de6078801d809538352d621f8', class: "step-contract__actions" }, h("button", { key: 'ebfb477a49e9c19f29201ba2e89dc59c706f4b3a', class: "step-contract__btn-continue", onClick: this.handleContinue, disabled: !this.selectedOption }, "Continuar")))));
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

const stepFormCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-form{width:100%;max-width:800px;margin:0 auto}.step-form__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #E5E5E5}.step-form__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-form__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-form__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-form__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-form__btn-back{height:40px}.step-form form{border:1px solid #E5E5E5;border-radius:0.75rem;padding:1.5rem;background:white}.step-form__instructions{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0;background:transparent}.step-form__section{margin-bottom:1.5rem;padding-bottom:0.5rem}.step-form__row{display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1rem}@media (min-width: 768px){.step-form__row{grid-template-columns:1fr 1fr}}.step-form__row:last-child{margin-bottom:0}.step-form__field{display:flex;flex-direction:column}@media (min-width: 768px){.step-form__field--id{grid-column:span 1}}.step-form__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.step-form__label .required{color:#DA291C}.step-form__required{color:#DA291C;margin-right:0.25rem}.step-form__input{width:100%;height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease}.step-form__input::placeholder{color:#999999}.step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__input:disabled{background-color:#F5F5F5;cursor:not-allowed}.step-form__input.error{border-color:#DA291C}.step-form__input.error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__input--error{border-color:#DA291C}.step-form__input--error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__error{margin-top:0.25rem;font-size:0.75rem;color:#DA291C}.step-form__id-row{display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 768px){.step-form__id-row{flex-direction:row;align-items:flex-start}}.step-form__id-row .step-form__input{flex:1;margin-top:4px}.step-form__radio-group{display:flex;flex-direction:row;align-items:flex-start;gap:1rem}.step-form__radio-group--horizontal{flex-direction:row;gap:1rem}.step-form__radio{display:flex;align-items:flex-start;gap:0.25rem;font-size:0.875rem;font-weight:400;line-height:1.5;color:#333333;cursor:pointer;max-width:90px;line-height:1.2;margin-top:14px}.step-form__radio input[type=radio]{accent-color:#0097A9;margin-top:2px;flex-shrink:0}.step-form__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-form__btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-submit:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-submit{height:48px;background-color:#DA291C;color:#FFFFFF}.step-form__btn-submit:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-form__btn-submit:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-form__btn-submit{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-form__btn-submit:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-form__btn-submit:disabled:hover{background-color:#999999;border-color:#999999}`;

const StepForm = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderInput(label, field, section, value, options = {}) {
        const { type = 'text', placeholder = '', required = false, disabled = false } = options;
        const hasError = this.touched[field] && this.errors[field];
        const displayValue = (field === 'phone1' || field === 'phone2') ? formatPhone(value) : value;
        return (h("div", { class: "step-form__field" }, h("label", { class: "step-form__label" }, required && h("span", { class: "step-form__required" }, "*"), label, ":"), h("input", { type: type, class: { 'step-form__input': true, 'step-form__input--error': !!hasError }, value: displayValue, placeholder: placeholder, disabled: disabled, onInput: this.handleInput(section, field) }), hasError && h("span", { class: "step-form__error" }, this.errors[field])));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: '0b2f99bd94e1adbf650f44a55db6525c6899cf46' }, h("div", { key: 'bab002c14860341264211f063160759ab37934d0', class: "step-form" }, h("header", { key: '3ff52f43ce12b47c99b459924a7c412c4ae31937', class: "step-form__header" }, h("h1", { key: '5415a1edaefe1dbcf6c15b37199381ea3780386d', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), h("button", { key: 'a2a97733267d9816f59646e2c49cca3fc1d2a87a', class: "step-form__btn-back", onClick: this.onBack }, "Regresar")), h("form", { key: '17f59261ae81fca827a728f72152b1a2e135071c', onSubmit: this.handleSubmit }, h("p", { key: '267f119a14581b2201e7a24d3fb0d10295b12206', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), h("div", { key: '324437746373bc40a75c7cc24520ec49bbe2a3fb', class: "step-form__section" }, h("div", { key: '510e1e8bca4554f2a8577df839f77bb6433e57b1', class: "step-form__row" }, this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
            placeholder: 'Ingrese nombre',
            required: true,
        }), this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
            placeholder: 'Ingrese segundo nombre (Opcional)',
        })), h("div", { key: 'b4ad26b6b1f4b8ccfe0149c5fef93e89e6ebebcf', class: "step-form__row" }, this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
            placeholder: 'Ingrese apellido',
            required: true,
        }), this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
            placeholder: 'Ingrese segundo apellido',
            required: true,
        })), h("div", { key: '559571d64825f3d68d41ac65f288dc59ee635759', class: "step-form__row" }, h("div", { key: '920720d8ea94f7ce5abe8262a03bc50d83db92bb', class: "step-form__field step-form__field--id" }, h("label", { key: 'a7b2e8574c96e3c772ba52d997f8054a2d44102a', class: "step-form__label" }, h("span", { key: '884b499ce30bfbbf703c204f5d0965bf109caaa2', class: "step-form__required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: '720f30ea432fd5ef746007154559d61d66217d55', class: "step-form__id-row" }, h("div", { key: '684aa154a379c5e4022989f4cf9b77048f50c87c', class: "step-form__radio-group" }, h("label", { key: 'b30a8b648b875b4b1cea14e3ab5b73260e147b6a', class: "step-form__radio" }, h("input", { key: '6faee17560e5d8cb0b376a61a4532a6d4ab74afa', type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'license', onChange: () => this.handleRadioChange('identificationType', 'license') }), "Licencia de conducir"), h("label", { key: 'dfb0c00309925bdab56701e648e4dd402bf527e4', class: "step-form__radio" }, h("input", { key: '7a4fbfdbcf1e25b87dcf0f4c18d5d801556da806', type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'passport', onChange: () => this.handleRadioChange('identificationType', 'passport') }), "Pasaporte")), h("input", { key: 'fe262abad7767ca9f677d5c208e026828bbdeb46', type: "text", class: { 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }, value: this.formData.personal.identificationNumber, placeholder: "Ingrese nro de identificaci\u00F3n", onInput: this.handleInput('personal', 'identificationNumber') })), this.touched['identificationNumber'] && this.errors['identificationNumber'] && (h("span", { key: 'f6cc1b9a9034fbe3868a25d4ba24071005b4fcb2', class: "step-form__error" }, this.errors['identificationNumber']))), this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
            type: 'date',
            required: true,
        })), h("div", { key: '9ac276afc5c1a29c8829819475c9d5018baf1055', class: "step-form__row" }, this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
            type: 'tel',
            placeholder: 'Ingrese nro de teléfono',
            required: true,
        }), this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
            type: 'tel',
            placeholder: 'Ingrese nro de teléfono',
        }))), h("div", { key: 'ae2a5883df29772e1de14b8ea1db1ebda264712d', class: "step-form__section" }, h("div", { key: '81820f7fdae07c99fc9de3127fa88856655beac1', class: "step-form__row" }, this.renderInput('Nombre legal de Empresa (según IRS)', 'businessName', 'business', this.formData.business.businessName, {
            placeholder: 'Ingresar nombre legal de empresa',
            required: true,
        }), this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
            placeholder: 'Ingrese posición actual',
            required: true,
        }))), h("div", { key: 'a3d96e10f02fc2e8badaf1e0055dcd5dfb881287', class: "step-form__section" }, h("div", { key: '9d72e0baedfd021596fa0bd4f8a730c566742c6d', class: "step-form__row" }, this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
            placeholder: 'Ingrese dirección',
            required: true,
        }), this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
            placeholder: 'Ingrese ciudad',
            required: true,
        })), h("div", { key: '996c0aab4c1c57f4014bfdb30e202342243db058', class: "step-form__row" }, this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
            placeholder: 'Ingrese código postal',
            required: true,
        }), this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
            type: 'email',
            placeholder: 'Ingrese correo electrónico',
            required: true,
        }))), h("div", { key: '8b7aeacdd37fc6b98797b498628ab9d129f10bd6', class: "step-form__section" }, h("div", { key: 'fde1815a479609bf7ae45bc6b780efa2431e8a1e', class: "step-form__field" }, h("label", { key: 'faea036119860ca1b8bbaca80986587c7438594a', class: "step-form__label" }, h("span", { key: '70c30d45a29a996f153642f778d172d6f5ee0cf0', class: "step-form__required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: 'c096231cc8d69b9b0d2c7ed343977f48cc99b810', class: "step-form__radio-group step-form__radio-group--horizontal" }, h("label", { key: 'c06ddf0911aaf06571cb12135d160768236b82b0', class: "step-form__radio" }, h("input", { key: '93242f3fcaf0b45d60d3cf593b6c75ad9a0901a9', type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === true, onChange: () => this.handleRadioChange('isExistingCustomer', true) }), "S\u00ED"), h("label", { key: '4739e30de1341859773c3f51b47172f49f7597a1', class: "step-form__radio" }, h("input", { key: '9dfd6b22495955d9fb4a8b3593df08768cf73b81', type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === false, onChange: () => this.handleRadioChange('isExistingCustomer', false) }), "No")))), h("div", { key: '2656e64fb81fb912b4176749118b8dc5fcddcae1', class: "step-form__actions" }, h("button", { key: 'e6156b9570363d80d6e9c6101fe063af41962b8f', type: "submit", class: "step-form__btn-submit", disabled: !this.isFormValid() }, "Continuar"))))));
    }
};
StepForm.style = stepFormCss();

const stepLocationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-location{width:100%;position:relative}.step-location__validating-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.9);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn 0.2s ease-out}.step-location__validating-content{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem;background:#FFFFFF;border-radius:16px;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__validating-spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}.step-location__validating-text{margin:0;font-size:18px;font-weight:600;color:#333333}.step-location__header{text-align:center;margin-bottom:1rem}.step-location__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;font-weight:400}.step-location__title--highlight{color:#DA291C;font-weight:700}.step-location__map-container{position:relative;border-radius:0.75rem;overflow:hidden;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08)}.step-location__controls{position:absolute;top:3.5rem;left:120px;right:50px;z-index:1;display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 768px){.step-location__controls{top:3.5rem;left:130px;right:60px}}.step-location__input-group{display:flex;align-items:center;background:#FFFFFF;border-radius:10px;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);overflow:hidden;border:1px solid #E5E5E5}.step-location__input-icon{display:flex;align-items:center;justify-content:center;padding-left:0.75rem;color:#999999}.step-location__input-icon svg{width:20px;height:20px}.step-location__input{flex:1;padding:0.75rem 0.75rem;border:none;font-size:0.875rem;outline:none;background:transparent;min-width:0}.step-location__input::placeholder{color:#999999}.step-location__btn-validate{padding:0.75rem 1.25rem;background:#DA291C;color:#FFFFFF;border:none;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background-color 150ms ease;white-space:nowrap;min-width:100px}.step-location__btn-validate:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-location__btn-validate:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-validate--loading{pointer-events:none}.step-location__btn-validate-content{display:inline-flex;align-items:center;gap:0.5rem}.step-location__btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:btn-spin 0.8s linear infinite}@keyframes btn-spin{to{transform:rotate(360deg)}}.step-location__btn-location{display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;background:#0097A9;color:#FFFFFF;border:none;border-radius:0.25rem;font-size:0.75rem;font-weight:500;cursor:pointer;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);transition:background-color 150ms ease;white-space:nowrap;align-self:flex-start}.step-location__btn-location:hover:not(:disabled){background:rgb(0, 114.5455621302, 128.2)}.step-location__btn-location:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-location-icon{width:16px;height:16px}.step-location__map{position:relative;width:100%;height:400px;background:#E5E5E5}@media (min-width: 768px){.step-location__map{height:500px}}.step-location__map-canvas{width:100%;height:100%}.step-location__map-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5}.step-location__map-loading p{font-size:1rem;font-weight:400;line-height:1.5;margin-top:1rem}.step-location__map-error{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5;padding:1rem;text-align:center}.step-location__map-error p{font-size:1rem;font-weight:400;line-height:1.5;color:#DA291C}.step-location__map-error small{margin-top:0.5rem;font-size:0.75rem}.step-location__spinner{width:40px;height:40px;border:3px solid #CCCCCC;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-location__map-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:#666666}.step-location__map-placeholder p{font-size:1rem;font-weight:400;line-height:1.5}.step-location__map-placeholder small{margin-top:0.5rem;font-size:0.75rem}.step-location__modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);z-index:400;display:flex;align-items:center;justify-content:center}.step-location__modal{position:relative;width:90%;max-width:400px;background:#FFFFFF;border-radius:0.75rem;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__modal--error .step-location__modal-error-bar{display:block}.step-location__modal-close{position:absolute;top:0.75rem;right:0.75rem;width:32px;height:32px;background:transparent;border:none;font-size:1.5rem;color:#666666;cursor:pointer;line-height:1}.step-location__modal-close:hover{color:#333333}.step-location__modal-error-bar{display:none;background:#DA291C;color:#FFFFFF;padding:0.5rem 1rem;margin:-2rem -1.5rem 1rem;font-weight:600}.step-location__modal-success-icon{width:60px;height:60px;margin:0 auto 1rem;color:#44AF69}.step-location__modal-success-icon svg{width:100%;height:100%}.step-location__modal-message{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;margin-bottom:1.5rem}.step-location__modal-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-location__modal-btn:disabled{opacity:0.5;cursor:not-allowed}.step-location__modal-btn{height:48px;background-color:#0097A9;color:#FFFFFF}.step-location__modal-btn:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-location__modal-btn:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}.step-location__modal-btn{min-width:150px}`;

const StepLocation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
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
        return (h(Host, { key: '2c8f6a961a85b824e9a85de70ead29a534d4a897' }, h("div", { key: 'ac1ec34f9bfdb2a7ab540d2cae3e4b67160b4bb3', class: "step-location" }, this.isValidating && (h("div", { key: '44197f1334c1616bf16ebea6aaa4ee62d2df829e', class: "step-location__validating-overlay" }, h("div", { key: 'bedfaea659d06328993affdebef2ca37ace38be4', class: "step-location__validating-content" }, h("div", { key: 'a25b48d4a9f0794b4e85454265fe1bc6f8508964', class: "step-location__validating-spinner" }), h("p", { key: '1a709e4f309c48a56768884881f38d1288d890ca', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: '2a947717ce26017638f68116480513fecf2c5951', class: "step-location__header" }, h("h1", { key: '8a5140fae64e91dfb144fe1404743c45816692c7', class: "step-location__title" }, h("span", { key: '8c16e083469cdef3723c9e6c78898da2dfaba1a9', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '472964ddd2d2c172f0548fb063304816f42677e6', class: "step-location__map-container" }, h("div", { key: '111c1efc7a8a95135b66af71625cbae8bb564e3d', class: "step-location__controls" }, h("div", { key: 'f18da275ca833e889c2d91f9cd28f8823d67a746', class: "step-location__input-group" }, h("span", { key: '8cd1fb816216a1879b9d9b06835378fac83617ad', class: "step-location__input-icon" }, h("svg", { key: '38e3f02c3d1d29c00725f528f9301fcfc990b5c5', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'a82af2add5969cd72bf4b3760ce84c2e6f50ae37', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: '9c80df77d6d577d00f0b24a0e43916c5e653e378', cx: "12", cy: "10", r: "3" }))), h("input", { key: 'a446b9596a4c3ae4e9f29d88ce9a4bea1b2529c0', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: 'df44398539d6a09f1397c0e01131afa022fb3451', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("button", { key: '9be446cda265a74c4be684f77096d769df4e3dcd', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: 'd26386c0e5968088b4ce26ee43e6e344edecc159', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '305ed4421540682debf2166c69a51fd2204139c9', cx: "12", cy: "12", r: "10" }), h("circle", { key: '2098fb87a1c5a7ebd09fff005d281dd368b07415', cx: "12", cy: "12", r: "3" }), h("line", { key: '6e705969a5e5cf5275d757bf459e9fd2647514ac', x1: "12", y1: "2", x2: "12", y2: "6" }), h("line", { key: '0f864276a49d685158eeb462c9068e7aabd69ab3', x1: "12", y1: "18", x2: "12", y2: "22" }), h("line", { key: 'd65b42ba47f577d24130316a0b3014e69187fd7b', x1: "2", y1: "12", x2: "6", y2: "12" }), h("line", { key: 'dcd3fad6259de3c80eddc8e32ef30dbcff16a615', x1: "18", y1: "12", x2: "22", y2: "12" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual')), h("div", { key: '95c0fa349a5b7119cae4c0bca80ad966b4bf9c82', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: 'f8821e1c39018185236c98552adc592d49b17365', class: "step-location__map-loading" }, h("div", { key: '61d546024598f25914d61d24c4e639e9ff844e16', class: "step-location__spinner" }), h("p", { key: '1e9e8b9f9383cc88deb506d4e714f98600c9b314' }, "Cargando mapa..."))), this.mapError && (h("div", { key: '933fe3aedd72d139717fab3978df9a4f777d5203', class: "step-location__map-error" }, h("p", { key: '863824c972c6ff52c31b9b6c49ac8c7aaf7a893f' }, this.mapError), !this.googleMapsKey && (h("small", { key: 'c811bd149f780af33606609edcc99fc7c91341a6' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '9728b428e75641db9d16b9c450b55edd92b74c6e', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: '39957723559961bfdb693886c16e2e2610d7d1d3', class: "step-location__modal-backdrop" }, h("div", { key: '8860113883786c78b4d45e9006fca9bb8499e47f', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'cbf18a9ea4117b97a3e50b26a95f9b0727b272a7', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: 'a1cf84a852d23fe278fc1e114311dafac42fb915', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: '8cf60d6e9cc5bec9900314838bf660a12927461f', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '1f8588f361058ae98f36d048babc8b16f82bfa5d', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
    }
};
StepLocation.style = stepLocationCss();

const stepOrderSummaryCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-order-summary{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem;transition:color 0.2s}.header .btn-back svg{width:20px;height:20px}.header .btn-back:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.header__title-group{display:flex;align-items:center;gap:1rem;flex:1}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0}.header .item-count{font-size:0.875rem;color:#666666;background:#E5E5E5;padding:0.25rem 0.5rem;border-radius:9999px;font-weight:500}.state-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;background:white;border-radius:0.75rem;padding:2rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.state-container .state-icon{width:80px;height:80px;color:#999999;margin-bottom:1rem}.state-container h3{font-size:1.5rem;color:#4D4D4D;margin:0 0 0.5rem 0}.state-container p{color:#808080;margin:0 0 1.5rem 0}.state-container--error .state-icon{color:#DA291C}.state-container--error p{color:#DA291C}.state-container--empty .state-icon{color:#CCCCCC}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:currentColor;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.btn-retry,.btn-back-catalog{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600;transition:background 0.2s}.btn-retry:hover,.btn-back-catalog:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back-catalog{background:#0097A9}.btn-back-catalog:hover{background:rgb(0, 105.4319526627, 118)}.content-layout{display:grid;grid-template-columns:1fr 380px;gap:1.5rem}@media (max-width: 992px){.content-layout{grid-template-columns:1fr}}.products-column{display:flex;flex-direction:column;gap:1rem}.summary-column{display:flex;flex-direction:column;gap:1rem}@media (max-width: 992px){.summary-column{order:-1}}.product-card{background:white;border-radius:0.75rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);overflow:hidden}.product-card__badge{display:flex;gap:0.25rem;padding:0.5rem 1rem;background:#FAFAFA;border-bottom:1px solid #F5F5F5}.product-card__main{display:grid;grid-template-columns:100px 1fr auto auto;gap:1rem;padding:1rem;align-items:center}@media (max-width: 768px){.product-card__main{grid-template-columns:80px 1fr auto;grid-template-rows:auto auto}}.product-card__main--plan{grid-template-columns:60px 1fr auto auto}@media (max-width: 768px){.product-card__main--plan{grid-template-columns:60px 1fr auto}}.product-card__image{width:100px;height:100px;background:#FAFAFA;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;overflow:hidden}@media (max-width: 768px){.product-card__image{width:80px;height:80px}}.product-card__image img{max-width:90%;max-height:90%;object-fit:contain}.product-card__image--plan{width:60px;height:60px;background:linear-gradient(135deg, #DA291C 0%, rgb(150.2073170732, 28.25, 19.2926829268) 100%);border-radius:0.5rem}.product-card__image--plan img{filter:brightness(0) invert(1);width:40px;height:40px}.product-card__details{display:flex;flex-direction:column;gap:0.25rem}.product-card__pricing{display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem}@media (max-width: 768px){.product-card__pricing{grid-column:2/-1;flex-direction:row;justify-content:space-between;align-items:center;width:100%}}.product-card__actions{display:flex;align-items:center}.product-card--plan .product-card__main{grid-template-columns:60px 1fr auto auto}.section-header{display:flex;align-items:center;gap:0.5rem;padding:1rem 1.5rem;border-bottom:1px solid #F5F5F5}.section-header__icon{width:36px;height:36px;border-radius:0.5rem;display:flex;align-items:center;justify-content:center}.section-header__icon svg{width:20px;height:20px}.section-header__text{display:flex;align-items:center;gap:0.5rem;flex:1}.section-header__label{font-size:0.875rem;font-weight:700;letter-spacing:0.5px}.section-header__badge{font-size:0.75rem;font-weight:600;padding:2px 0.5rem;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px}.section-header--equipment{background:linear-gradient(135deg, rgba(0, 151, 169, 0.08) 0%, rgba(0, 151, 169, 0.02) 100%);border-left:4px solid #0097A9}.section-header--equipment .section-header__icon{background:#0097A9;color:white}.section-header--equipment .section-header__label{color:#0097A9}.section-header--equipment .section-header__badge{background:rgba(218, 41, 28, 0.15);color:#DA291C}.section-header--plan{background:linear-gradient(135deg, rgba(218, 41, 28, 0.08) 0%, rgba(218, 41, 28, 0.02) 100%);border-left:4px solid #DA291C}.section-header--plan .section-header__icon{background:#DA291C;color:white}.section-header--plan .section-header__label{color:#DA291C}.badge{display:inline-flex;align-items:center;padding:2px 0.5rem;border-radius:9999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}.badge--equipment{background:rgba(0, 151, 169, 0.15);color:#0097A9}.badge--main{background:rgba(218, 41, 28, 0.15);color:#DA291C}.badge--plan{background:rgba(68, 175, 105, 0.15);color:#44AF69}.product-name{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0;line-height:1.3}.product-specs{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center}.spec-item{display:flex;align-items:center;gap:4px}.spec-label{font-size:0.875rem;color:#666666}.plan-type{font-size:0.875rem;color:#808080}.financing-info{display:flex;flex-direction:column;gap:2px;margin-top:0.25rem;padding-top:0.25rem;border-top:1px dashed #E5E5E5}.financing-label{font-size:0.75rem;font-weight:600;color:#4D4D4D}.financing-detail{font-size:0.75rem;color:#808080}.color-circle{display:inline-block;width:16px;height:16px;border-radius:50%;border:2px solid #E5E5E5;box-shadow:inset 0 0 0 1px rgba(0, 0, 0, 0.1)}.storage-badge{display:inline-flex;align-items:center;padding:2px 0.25rem;background:#F5F5F5;border-radius:0.25rem;font-size:0.75rem;font-weight:600;color:#4D4D4D}.qty-label{font-size:0.875rem;color:#808080}.price-financing,.price-single{text-align:right}@media (max-width: 768px){.price-financing,.price-single{text-align:left}}.price-monthly{font-size:1.25rem;font-weight:700;color:#DA291C}.price-period{font-size:0.875rem;color:#808080}.price-installments{display:block;font-size:0.75rem;color:#808080;margin-top:2px}.price-total{font-size:1.25rem;font-weight:700;color:#1A1A1A}.price-full{display:flex;gap:0.25rem;font-size:0.875rem}.price-full .label{color:#808080}.price-full .value{font-weight:600;color:#4D4D4D}.btn-action{background:none;border:none;cursor:pointer;padding:0.25rem;transition:all 0.2s;display:flex;align-items:center;justify-content:center}.btn-action svg{width:20px;height:20px}.btn-action--delete{color:#999999;border-radius:0.5rem}.btn-action--delete:hover:not(:disabled){color:#DA291C;background:rgba(218, 41, 28, 0.1)}.btn-action--delete:disabled{opacity:0.5;cursor:not-allowed}.btn-action--delete-small{color:#999999}.btn-action--delete-small svg{width:16px;height:16px}.btn-action--delete-small:hover:not(:disabled){color:#DA291C}.btn-action--delete-small:disabled{opacity:0.5;cursor:not-allowed}.plan-section{border-top:none}.plan-section .section-header--plan{margin:0;border-radius:0;border-left-width:0;padding-left:calc(1.5rem + 4px);border-top:1px dashed #E5E5E5}.plan-section__content{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:linear-gradient(to right, rgba(218, 41, 28, 0.03), white)}.plan-section .plan-label{font-size:0.75rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px;font-weight:600}.plan-section .plan-info{flex:1;display:flex;flex-direction:column;gap:2px}.plan-section .plan-name{font-size:0.875rem;font-weight:600;color:#333333}.plan-section .plan-type{font-size:0.75rem;color:#808080}.plan-section .plan-price{display:flex;align-items:baseline;gap:2px}.plan-section .plan-price .price{font-size:1.25rem;font-weight:700;color:#DA291C}.plan-section .plan-price .period{font-size:0.875rem;color:#808080}.summary-card{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.summary-card__title{display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 1rem 0;text-transform:uppercase;letter-spacing:0.5px}.summary-card__title svg{width:18px;height:18px;color:#999999}.promo-section .promo-input-group{display:flex;gap:0.5rem}.promo-section .promo-input{flex:1;height:44px;border:1px solid #CCCCCC;border-radius:0.5rem;padding:0 1rem;font-size:0.875rem;transition:border-color 0.2s}.promo-section .promo-input:focus{outline:none;border-color:#0097A9}.promo-section .promo-input.error{border-color:#DA291C}.promo-section .promo-input.success{border-color:#44AF69}.promo-section .promo-input:disabled{background:#F5F5F5;cursor:not-allowed}.promo-section .promo-button{height:44px;padding:0 1.5rem;background:#E5E5E5;color:#4D4D4D;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;min-width:90px;display:flex;align-items:center;justify-content:center}.promo-section .promo-button:hover:not(:disabled){background:#CCCCCC}.promo-section .promo-button:disabled{opacity:0.5;cursor:not-allowed}.promo-section .promo-message{display:flex;align-items:center;gap:0.25rem;font-size:0.875rem;margin-top:0.5rem}.promo-section .promo-message svg{width:14px;height:14px;flex-shrink:0}.promo-section .promo-message.error{color:#DA291C}.promo-section .promo-message.success{color:#44AF69}.payment-summary{padding:0;overflow:hidden}.rent-section{background:linear-gradient(135deg, #DA291C 0%, rgb(172.8048780488, 32.5, 22.1951219512) 100%);padding:1.5rem;color:white}.rent-section .rent-row{display:flex;justify-content:space-between;align-items:center}.rent-section .rent-label{font-size:1rem;font-weight:500}.rent-section .rent-value{font-size:1.75rem;font-weight:700}.rent-section .rent-note{font-size:0.75rem;opacity:0.8;margin:0.25rem 0 0 0}.payment-breakdown{padding:1.5rem}.payment-breakdown .detail-rows{margin-bottom:1rem}.detail-row{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #F5F5F5}.detail-row:last-child{border-bottom:none}.detail-row .label{font-size:0.875rem;color:#666666}.detail-row .value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.detail-row .value--free{color:#44AF69;font-weight:700;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px}.detail-row--discount .label{color:#44AF69}.detail-row--discount .value{color:#44AF69;font-weight:600}.detail-row--shipping{background:rgba(68, 175, 105, 0.05);margin:0 -1.5rem;padding:0.5rem 1.5rem;border-bottom:none}.total-section{background:#FAFAFA;margin:0 -1.5rem -1.5rem;padding:1.5rem;border-top:2px solid #E5E5E5}.total-row{display:flex;justify-content:space-between;align-items:center}.total-label{font-size:1rem;font-weight:600;color:#1A1A1A}.total-value{font-size:1.75rem;font-weight:700;color:#DA291C}.terms-section{background:white;border-radius:0.75rem;padding:1rem 1.5rem;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05)}.terms-checkbox{display:flex;align-items:flex-start;gap:0.5rem;cursor:pointer}.terms-checkbox input[type=checkbox]{display:none}.terms-checkbox .checkmark{width:22px;height:22px;border:2px solid #CCCCCC;border-radius:0.25rem;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;background:white}.terms-checkbox .checkmark svg{width:14px;height:14px;stroke:white;opacity:0;transition:opacity 0.2s}.terms-checkbox input[type=checkbox]:checked+.checkmark{background:#0097A9;border-color:#0097A9}.terms-checkbox input[type=checkbox]:checked+.checkmark svg{opacity:1}.terms-checkbox .terms-text{font-size:0.875rem;color:#666666;line-height:1.5}.terms-checkbox .terms-text a{color:#0097A9;text-decoration:none;font-weight:500}.terms-checkbox .terms-text a:hover{text-decoration:underline}.btn-proceed{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;height:56px;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(218, 41, 28, 0.3)}.btn-proceed svg{width:20px;height:20px;transition:transform 0.2s}.btn-proceed:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512);box-shadow:0 6px 16px rgba(218, 41, 28, 0.4)}.btn-proceed:hover:not(:disabled) svg{transform:translateX(4px)}.btn-proceed:disabled,.btn-proceed.disabled{background:#CCCCCC;box-shadow:none;cursor:not-allowed}.btn-proceed:disabled svg,.btn-proceed.disabled svg{transform:none}`;

const StepOrderSummary = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
    renderEquipmentItem(item, index) {
        const isDeleting = this.deletingItemId === item.cartId;
        const planItem = this.getPlanItems().find(p => p.parentCartId === item.cartId);
        return (h("div", { class: "product-card", key: `equip-${item.cartId}` }, h("div", { class: "section-header section-header--equipment" }, h("div", { class: "section-header__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" }), h("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" }))), h("div", { class: "section-header__text" }, h("span", { class: "section-header__label" }, "EQUIPO"), index === 0 && h("span", { class: "section-header__badge" }, "Principal"))), h("div", { class: "product-card__main" }, h("div", { class: "product-card__image" }, h("img", { src: item.imgUrl || item.detailImage || '/assets/placeholder.png', alt: item.productName, onError: (e) => e.target.src = '/assets/placeholder.png' })), h("div", { class: "product-card__details" }, h("h3", { class: "product-name" }, item.productName), h("div", { class: "product-specs" }, item.colorName && (h("div", { class: "spec-item" }, h("span", { class: "color-circle", style: { backgroundColor: item.webColor || '#ccc' } }), h("span", { class: "spec-label" }, item.colorName))), item.storageName && item.storage && (h("div", { class: "spec-item" }, h("span", { class: "storage-badge" }, item.storage, "GB"))), h("div", { class: "spec-item" }, h("span", { class: "qty-label" }, "Cant: ", item.qty))), item.installments > 1 && (h("div", { class: "financing-info" }, h("span", { class: "financing-label" }, "Financiamiento de Equipo:"), h("span", { class: "financing-detail" }, "T\u00E9rmino de pago (", item.installments, " meses)")))), h("div", { class: "product-card__pricing" }, item.installments > 1 ? (h("div", { class: "price-financing" }, h("span", { class: "price-monthly" }, this.formatPrice(item.decTotalPerMonth || item.decPrice)), h("span", { class: "price-period" }, "/mes"))) : (h("div", { class: "price-single" }, h("span", { class: "price-total" }, this.formatPrice(item.decTotalPrice || item.decPrice))))), h("div", { class: "product-card__actions" }, h("button", { class: "btn-action btn-action--delete", onClick: () => this.handleRemoveItem(item), disabled: isDeleting, title: "Eliminar" }, isDeleting ? (h("span", { class: "spinner-small" })) : (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" }), h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), h("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))))), planItem && this.renderAssociatedPlan(planItem)));
    }
    renderAssociatedPlan(plan) {
        const isDeleting = this.deletingItemId === plan.cartId;
        return (h("div", { class: "plan-section" }, h("div", { class: "section-header section-header--plan" }, h("div", { class: "section-header__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }))), h("div", { class: "section-header__text" }, h("span", { class: "section-header__label" }, "TU PLAN"))), h("div", { class: "plan-section__content" }, h("div", { class: "plan-info" }, h("span", { class: "plan-name" }, plan.productName), h("span", { class: "plan-type" }, "Plan de Internet")), h("div", { class: "plan-price" }, h("span", { class: "price" }, this.formatPrice(plan.decPrice || plan.decTotalPerMonth)), h("span", { class: "period" }, "/mes")), h("button", { class: "btn-action btn-action--delete-small", onClick: () => this.handleRemoveItem(plan), disabled: isDeleting, title: "Eliminar plan" }, isDeleting ? (h("span", { class: "spinner-small" })) : (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })))))));
    }
    renderStandalonePlan(plan) {
        const isDeleting = this.deletingItemId === plan.cartId;
        return (h("div", { class: "product-card product-card--plan", key: `plan-${plan.cartId}` }, h("div", { class: "section-header section-header--plan" }, h("div", { class: "section-header__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 12h-4l-3 9L9 3l-3 9H2" }))), h("div", { class: "section-header__text" }, h("span", { class: "section-header__label" }, "PLAN DE INTERNET"))), h("div", { class: "product-card__main product-card__main--plan" }, h("div", { class: "product-card__image product-card__image--plan" }, h("img", { src: plan.imgUrl || plan.detailImage || '/assets/placeholder.png', alt: plan.productName, onError: (e) => e.target.src = '/assets/placeholder.png' })), h("div", { class: "product-card__details" }, h("h3", { class: "product-name" }, plan.productName), h("span", { class: "plan-type" }, "Renta mensual")), h("div", { class: "product-card__pricing" }, h("div", { class: "price-financing" }, h("span", { class: "price-monthly" }, this.formatPrice(plan.decPrice || plan.decTotalPerMonth)), h("span", { class: "price-period" }, "/mes"))), h("div", { class: "product-card__actions" }, h("button", { class: "btn-action btn-action--delete", onClick: () => this.handleRemoveItem(plan), disabled: isDeleting, title: "Eliminar" }, isDeleting ? (h("span", { class: "spinner-small" })) : (h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" }))))))));
    }
    renderPromoCode() {
        return (h("div", { class: "summary-card promo-section" }, h("h4", { class: "summary-card__title" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" }), h("line", { x1: "7", y1: "7", x2: "7.01", y2: "7" })), "Cup\u00F3n de descuento"), h("div", { class: "promo-input-group" }, h("input", { type: "text", class: {
                'promo-input': true,
                'error': !!this.promoError,
                'success': this.promoSuccess,
            }, placeholder: "Ingresa tu c\u00F3digo", value: this.promoCode, onInput: this.handlePromoCodeChange, disabled: this.isApplyingPromo }), h("button", { class: "promo-button", onClick: this.handleApplyPromo, disabled: this.isApplyingPromo || !this.promoCode.trim() }, this.isApplyingPromo ? (h("span", { class: "spinner-small" })) : ('Aplicar'))), this.promoError && (h("span", { class: "promo-message error" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("line", { x1: "12", y1: "8", x2: "12", y2: "12", stroke: "white", "stroke-width": "2" }), h("line", { x1: "12", y1: "16", x2: "12.01", y2: "16", stroke: "white", "stroke-width": "2" })), this.promoError)), this.promoSuccess && (h("span", { class: "promo-message success" }, h("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("polyline", { points: "9 12 11 14 15 10", fill: "none", stroke: "white", "stroke-width": "2" })), "\u00A1Cup\u00F3n aplicado!"))));
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
        return (h("div", { class: "summary-card payment-summary" }, monthlyRent > 0 && (h("div", { class: "rent-section" }, h("div", { class: "rent-row" }, h("span", { class: "rent-label" }, "Renta mensual"), h("span", { class: "rent-value" }, this.formatPrice(monthlyRent))), h("p", { class: "rent-note" }, "*No incluye cargos estatales y federales"))), h("div", { class: "payment-breakdown" }, h("h4", { class: "summary-card__title" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("rect", { x: "1", y: "4", width: "22", height: "16", rx: "2", ry: "2" }), h("line", { x1: "1", y1: "10", x2: "23", y2: "10" })), "Detalle del pago"), h("div", { class: "detail-rows" }, subtotal > 0 && (h("div", { class: "detail-row" }, h("span", { class: "label" }, "Subtotal equipos"), h("span", { class: "value" }, this.formatPrice(subtotal)))), downPayment > 0 && (h("div", { class: "detail-row" }, h("span", { class: "label" }, "Pago inicial"), h("span", { class: "value" }, this.formatPrice(downPayment)))), discount > 0, h("div", { class: "detail-row" }, h("span", { class: "label" }, "Cargos estatales y federales"), h("span", { class: "value" }, this.formatPrice(tax))), h("div", { class: "detail-row detail-row--shipping" }, h("span", { class: "label" }, "Costo de env\u00EDo"), h("span", { class: "value value--free" }, "GRATIS"))), h("div", { class: "total-section" }, h("div", { class: "total-row" }, h("span", { class: "total-label" }, "Paga hoy"), h("span", { class: "total-value" }, this.formatPrice(total)))))));
    }
    renderTermsCheckbox() {
        return (h("div", { class: "terms-section" }, h("label", { class: "terms-checkbox" }, h("input", { type: "checkbox", checked: this.termsAccepted, onChange: this.handleTermsChange }), h("span", { class: "checkmark" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3" }, h("polyline", { points: "20 6 9 17 4 12" }))), h("span", { class: "terms-text" }, "Acepto los ", h("a", { href: "#", onClick: (e) => e.preventDefault() }, "t\u00E9rminos y condiciones"), " de Claro Puerto Rico"))));
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
        return (h(Host, { key: 'a90ce12970a97524223087434a6b77d85ce634c8' }, h("div", { key: 'b727124f7f3252d24575970bf911b1c9e637effe', class: "step-order-summary" }, h("header", { key: '602f59b8270ceb018e0a400c6986a65a88865e4a', class: "header" }, h("button", { key: '1c83f3ba699283a86334c3ed149539c13807ded4', class: "btn-back", onClick: this.onBack }, h("svg", { key: '9bf02da90358f3e3d68cc01225ab400602a2eb1e', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'b0dcba4a227a811ac8e69b3e90d467b25a9ebc82', d: "M19 12H5M12 19l-7-7 7-7" })), h("span", { key: '438a01d513f5c8415083ec432f61b8b8d2e8a743' }, "Regresar")), h("div", { key: '04355f7b5b9d42dde8e7f19d2c5a5ea108d3e009', class: "header__title-group" }, h("h1", { key: 'f8ec57bf3420be3e30064dc4be1e50a7c7360b91', class: "title" }, "Resumen de tu orden"), hasItems && (h("span", { key: '29872cb74bbc89d6846de91ebdb118d8d0a061ce', class: "item-count" }, itemCount, " ", itemCount === 1 ? 'artículo' : 'artículos')))), this.isLoading && (h("div", { key: '40566bb773821ee0d3e3682ac9029de8e05c37ad', class: "state-container" }, h("div", { key: '975992d517381260b50022f05d4075ee20677bff', class: "spinner" }), h("p", { key: '84e7dbb0f25a1772554e9d4312bef5112ebe110f' }, "Cargando tu carrito..."))), this.error && !this.isLoading && (h("div", { key: '79e8bc44213cbca07a6faae8b3e7260e9018775e', class: "state-container state-container--error" }, h("svg", { key: '6c8cc2fc074098a61691b467a45000fae3ab1993', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("circle", { key: '2284e1c63dc9ccb41899e5d4989c229f95d87575', cx: "12", cy: "12", r: "10" }), h("line", { key: '90ecdc71a197f7fd479f2c6993fbf5ff5b725472', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: 'efb1f329a57bc1ee273de85b2648e9e8f0457a21', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("p", { key: '1b4cb065642cac4b33730c900536f81a4ffd0e81' }, this.error), h("button", { key: '1959a6acd158821b58fca0dfacc3df3415188df2', class: "btn-retry", onClick: () => this.loadCart() }, "Reintentar"))), !this.isLoading && !this.error && !hasItems && (h("div", { key: 'b3cf27058be42bbf42e5d266e095d10412363de1', class: "state-container state-container--empty" }, h("svg", { key: 'd68a2a215f90a5544922281f9ecd348f062dd114', class: "state-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("circle", { key: '2e77b8310660f7785f5fb1b8a78ec73157396121', cx: "9", cy: "21", r: "1" }), h("circle", { key: '2e3cbed8df1799c9610611a8e4adabdaabace295', cx: "20", cy: "21", r: "1" }), h("path", { key: '62dff73663a07aa5f867eda99835ae9ead1431e4', d: "M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" })), h("h3", { key: '1b728e21a6ecb2191cba302373d9c38820b4ec3f' }, "Tu carrito est\u00E1 vac\u00EDo"), h("p", { key: '4eb1d9492e9bd775e852784efe203a059e521dc8' }, "Agrega productos para continuar con tu compra"), h("button", { key: 'f6cbdf76e1db89141c2c711df1d102d38343319f', class: "btn-back-catalog", onClick: this.onBack }, "Ir al cat\u00E1logo"))), !this.isLoading && !this.error && hasItems && (h("div", { key: '0d28ec3b275b76e938079602243f18bddc7e99ba', class: "content-layout" }, h("div", { key: '71b346dc3a421614691702e2b4155d4ce5fb0817', class: "products-column" }, equipmentItems.map((item, index) => this.renderEquipmentItem(item, index)), standalonePlans.map(plan => this.renderStandalonePlan(plan))), h("div", { key: 'ed74aaf2ae1667a9de77c39cb59c862fa50bf74f', class: "summary-column" }, this.renderPromoCode(), this.renderPaymentSummary(), this.renderTermsCheckbox(), h("button", { key: '34e19e459da25d0e23506f9ee797c7638bbc7fe6', class: {
                'btn-proceed': true,
                'disabled': !canProceed,
            }, onClick: this.handleProceed, disabled: !canProceed }, h("span", { key: 'afb6046899d156a13607a613c460ae6426acd49b' }, "Procesar orden"), h("svg", { key: '120807274eb2f466743270e6dd2099f32c140e5d', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: '6a784ebb04afa593f1ab8b5825c1d4421cb1face', d: "M5 12h14M12 5l7 7-7 7" })))))))));
    }
};
StepOrderSummary.style = stepOrderSummaryCss();

const stepPaymentCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-payment{width:100%;max-width:800px;margin:0 auto;padding:1.5rem;min-height:100vh}.header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}.header .btn-back-nav{display:flex;align-items:center;gap:0.25rem;background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.25rem}.header .btn-back-nav svg{width:20px;height:20px}.header .btn-back-nav:hover{text-decoration:underline}.header .title{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;flex:1}.content{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.loading-container h3{font-size:1.5rem;color:#1A1A1A;margin:1rem 0 0.5rem 0}.loading-container p{color:#666666;margin:0 0 0.5rem 0}.loading-container .warning{color:#DA291C;font-weight:500;font-size:0.875rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.payment-container{display:flex;flex-direction:column;gap:1.5rem}.payment-summary{background:#FAFAFA;border-radius:0.5rem;padding:1rem}.payment-summary h3{font-size:1rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.amount-display{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid #E5E5E5}.amount-display .label{font-size:1rem;color:#666666}.amount-display .value{font-size:1.5rem;font-weight:700;color:#DA291C}.payment-items{margin-top:1rem}.payment-items .payment-item{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0;font-size:0.875rem}.payment-items .payment-item .item-type{color:#666666}.payment-items .payment-item .item-amount{color:#1A1A1A;font-weight:500}.iframe-container{border:1px solid #E5E5E5;border-radius:0.5rem;overflow:hidden;min-height:400px}.iframe-container iframe{display:block;border:none;width:100%}.iframe-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;background:#FAFAFA}.iframe-placeholder p{color:#666666;margin-top:1rem}.success-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.success-container .success-icon{width:80px;height:80px;background:rgb(209.6296296296, 237.3703703704, 219.2222222222);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.success-container .success-icon svg{width:48px;height:48px;color:#44AF69}.success-container h3{font-size:1.5rem;color:#44AF69;margin:0 0 0.5rem 0}.success-container p{color:#666666;margin:0 0 0.5rem 0}.success-container .redirect-note{font-size:0.875rem;color:#808080}.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:2rem}.error-container .error-icon{width:80px;height:80px;background:rgb(245.2682926829, 183.75, 179.2317073171);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.error-container .error-icon svg{width:48px;height:48px;color:#DA291C}.error-container h3{font-size:1.5rem;color:#DA291C;margin:0 0 0.5rem 0}.error-container p{color:#666666;margin:0 0 1.5rem 0;max-width:400px}.error-actions{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}.btn-retry{height:44px;padding:0 1.5rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-back{height:44px;padding:0 1.5rem;background:white;color:#4D4D4D;border:1px solid #CCCCCC;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#FAFAFA;border-color:#999999}.btn-cancel{align-self:center;height:44px;padding:0 1.5rem;background:white;color:#666666;border:1px solid #CCCCCC;border-radius:9999px;font-size:0.875rem;cursor:pointer;transition:all 0.2s}.btn-cancel:hover{background:#FAFAFA;border-color:#999999}`;

const StepPayment = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
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
        return (h("div", { class: "loading-container" }, h("div", { class: "spinner" }), h("p", null, "Cargando informaci\u00F3n del pago...")));
    }
    renderCreatingOrder() {
        return (h("div", { class: "loading-container" }, h("div", { class: "spinner" }), h("h3", null, "Preparando tu orden"), h("p", null, "Por favor espera mientras procesamos tu solicitud..."), h("p", { class: "warning" }, "No cierres esta ventana ni navegues a otra p\u00E1gina.")));
    }
    renderPaymentForm() {
        return (h("div", { class: "payment-container" }, h("div", { class: "payment-summary" }, h("h3", null, "Resumen del pago"), h("div", { class: "amount-display" }, h("span", { class: "label" }, "Total a pagar:"), h("span", { class: "value" }, this.formatPrice(this.totalAmount))), this.paymentItems.length > 0 && (h("div", { class: "payment-items" }, this.paymentItems.map((item) => (h("div", { class: "payment-item" }, h("span", { class: "item-type" }, this.getPaymentTypeLabel(item.paymentType)), h("span", { class: "item-amount" }, this.formatPrice(item.amount)))))))), h("div", { class: "iframe-container" }, this.iframeUrl ? (h("iframe", { src: this.iframeUrl, width: "100%", height: this.iframeHeight, frameBorder: "0", title: "Payment Form" })) : (h("div", { class: "iframe-placeholder" }, h("div", { class: "spinner" }), h("p", null, "Cargando formulario de pago...")))), h("button", { class: "btn-cancel", onClick: () => this.handlePaymentCancel() }, "Cancelar")));
    }
    renderProcessing() {
        return (h("div", { class: "loading-container" }, h("div", { class: "spinner" }), h("h3", null, "Procesando pago"), h("p", null, "Por favor espera mientras confirmamos tu pago...")));
    }
    renderSuccess() {
        return (h("div", { class: "success-container" }, h("div", { class: "success-icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), h("polyline", { points: "22 4 12 14.01 9 11.01" }))), h("h3", null, "Pago exitoso"), h("p", null, "Tu pago ha sido procesado correctamente."), h("p", { class: "redirect-note" }, "Redirigiendo a la confirmaci\u00F3n...")));
    }
    renderError() {
        return (h("div", { class: "error-container" }, h("div", { class: "error-icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), h("line", { x1: "9", y1: "9", x2: "15", y2: "15" }))), h("h3", null, "Error en el pago"), h("p", null, this.error), h("div", { class: "error-actions" }, h("button", { class: "btn-retry", onClick: this.handleRetry }, "Intentar nuevamente"), h("button", { class: "btn-back", onClick: () => this.onBack?.() }, "Volver"))));
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
        return (h(Host, { key: '74ccd06f102429de79883621c555d5a056feda61' }, h("div", { key: 'd8c04ad1eae1fdc56ee8a600c01cc1c20a946d85', class: "step-payment" }, h("div", { key: '47d79f3225761ab9479f10e9cfe387928d1a6c98', class: "header" }, this.screen !== 'processing' && this.screen !== 'success' && (h("button", { key: 'adf923db5bef8388e923f5838be48de5994d4b37', class: "btn-back-nav", onClick: () => this.onBack?.() }, h("svg", { key: 'f8d58bfbe12680e97751dcd14faf9b2f31c6d2f1', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'da87ca559951c74c0c7cb783560de50e146ce5e8', d: "M19 12H5M12 19l-7-7 7-7" })), "Regresar")), h("h1", { key: '5575483ecc2e67ce4d267ff1a0a62349c9b2bb46', class: "title" }, "Pago")), h("div", { key: '749c3334f95e76b9b0733cb07426c8f0fddd2618', class: "content" }, this.screen === 'loading' && this.renderLoading(), this.screen === 'creating-order' && this.renderCreatingOrder(), this.screen === 'payment' && this.renderPaymentForm(), this.screen === 'processing' && this.renderProcessing(), this.screen === 'success' && this.renderSuccess(), this.screen === 'error' && this.renderError()))));
    }
};
StepPayment.style = stepPaymentCss();

const stepPlansCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-plans{width:100%;min-height:100vh;padding:1.5rem;padding-bottom:180px}@media (min-width: 768px){.step-plans{padding:2rem;padding-bottom:140px}}.step-plans__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}.step-plans__title{font-size:1.5rem;font-weight:700;color:#333333;margin:0}@media (min-width: 768px){.step-plans__title{font-size:1.75rem}}.step-plans__btn-back{background:#FFFFFF;border:2px solid #0097A9;color:#0097A9;padding:0.5rem 1.5rem;border-radius:9999px;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.2s ease}.step-plans__btn-back:hover{background:#0097A9;color:#FFFFFF}.step-plans__loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__spinner{width:40px;height:40px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.step-plans__error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#DA291C}.step-plans__error button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__error button:disabled{opacity:0.5;cursor:not-allowed}.step-plans__error button{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-plans__error button:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-plans__error button:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-plans__error button{margin-top:1rem}.step-plans__carousel-container{padding:1rem 0 3rem}.step-plans__empty{display:flex;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__footer{position:fixed;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;padding:0.75rem 1.5rem;z-index:200;box-shadow:0 -4px 12px rgba(0, 0, 0, 0.1);display:flex;align-items:center;justify-content:space-between}@media (max-width: 767px){.step-plans__footer{flex-direction:column;gap:0.75rem;padding:1rem}}.step-plans__footer-left{display:flex;flex-direction:column}@media (max-width: 767px){.step-plans__footer-left{width:100%}}.step-plans__footer-info{display:flex;gap:1.5rem}.step-plans__footer-item{display:flex;flex-direction:column}.step-plans__footer-item--separator{padding-left:1.5rem;border-left:1px solid #E5E5E5}.step-plans__footer-label{font-size:0.75rem;color:#666666}.step-plans__footer-value{font-size:1.25rem;font-weight:700;color:#333333}.step-plans__footer-value--highlight{color:#DA291C}.step-plans__footer-note{font-size:0.75rem;color:#808080;margin:0.25rem 0 0}.step-plans__footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__footer-btn:disabled{opacity:0.5;cursor:not-allowed}.step-plans__footer-btn{height:48px;background-color:#DA291C;color:#FFFFFF}.step-plans__footer-btn:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-plans__footer-btn:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-plans__footer-btn{min-width:160px}@media (max-width: 767px){.step-plans__footer-btn{width:100%}}.plan-card{background:#FFFFFF;border-radius:16px;border:2px solid #0097A9;box-shadow:0 2px 12px rgba(0, 0, 0, 0.1);overflow:hidden;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;height:100%;min-height:340px}.plan-card:hover{box-shadow:0 6px 20px rgba(0, 151, 169, 0.25);transform:translateY(-2px)}.plan-card--selected{border-color:#0097A9;box-shadow:0 6px 24px rgba(0, 151, 169, 0.3)}.plan-card--processing{pointer-events:none;opacity:0.8}.plan-card__header{display:flex;justify-content:center;padding-top:0}.plan-card__name{background:#1a1a1a;color:#FFFFFF;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;padding:0.75rem 1rem;width:70%;text-align:center;border-radius:0 0 12px 12px}.plan-card__body{flex:1;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column}.plan-card__includes-label{font-size:1rem;color:#666666;margin:0 0 0.75rem;font-weight:500}.plan-card__features{list-style:none;padding:0;margin:0 0 1rem;text-align:center;flex:1}.plan-card__feature{margin-bottom:0.5rem;font-size:0.875rem;color:#333333;font-weight:600}.plan-card__feature:last-child{margin-bottom:0}.plan-card__price{font-size:1.75rem;font-weight:700;color:#0097A9;margin:1rem 0 0}.plan-card__footer{padding:1rem}.plan-card__btn{width:100%;padding:0.75rem 1rem;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;background:#0097A9;color:#FFFFFF;border:2px solid #0097A9}.plan-card__btn:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--selected{background:#0097A9;color:#FFFFFF;border-color:#0097A9}.plan-card__btn--selected:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--loading{cursor:wait;opacity:0.8}.plan-card__btn:disabled{cursor:not-allowed;opacity:0.6}.plan-card__btn-loading{display:inline-flex;align-items:center;gap:0.5rem}.plan-card__btn-spinner{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

const StepPlans = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h("div", { class: {
                'plan-card': true,
                'plan-card--selected': isSelected,
                'plan-card--processing': isProcessing,
            }, onClick: () => !this.isAddingToCart && this.handleSelectPlan(plan) }, h("div", { class: "plan-card__header" }, h("span", { class: "plan-card__name" }, plan.planName)), h("div", { class: "plan-card__body" }, h("p", { class: "plan-card__includes-label" }, "Plan incluye"), h("ul", { class: "plan-card__features" }, displayFeatures.slice(0, 4).map((feature) => (h("li", { class: "plan-card__feature" }, feature)))), h("p", { class: "plan-card__price" }, formatPrice(plan.decPrice))), h("div", { class: "plan-card__footer" }, h("button", { class: {
                'plan-card__btn': true,
                'plan-card__btn--selected': isSelected,
                'plan-card__btn--loading': isProcessing,
            }, disabled: this.isAddingToCart }, isProcessing ? (h("span", { class: "plan-card__btn-loading" }, h("span", { class: "plan-card__btn-spinner" }), "Agregando...")) : isSelected ? ('Plan seleccionado') : ('Solicitar plan')))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const monthlyPayment = this.selectedPlan ? this.selectedPlan.decPrice : 0;
        const totalToday = 0;
        return (h(Host, { key: '34415fdf7adb297e19ec23088ff3a18c0dad752d' }, h("div", { key: '01a17e6dfdf182be2e91948dd41cc7e8cdebdbed', class: "step-plans" }, h("header", { key: '1b2878eced9e68c6e4bdfe41b62f23d18af32ed6', class: "step-plans__header" }, h("h1", { key: '43fcc4ec973e63948086d8df50bc0e4375d942d0', class: "step-plans__title" }, "Elige tu plan"), h("button", { key: 'cdf623d6c3fa87308e953a11633ff824c17787d6', class: "step-plans__btn-back", onClick: this.onBack }, "Regresar")), this.isLoading && (h("div", { key: '1063f032dace3e9a201c924026e58a0721fa3bff', class: "step-plans__loading" }, h("div", { key: '8ec36dd95782b585185d6aab76a0aea0a3d395b4', class: "step-plans__spinner" }), h("p", { key: 'b69b09cd82b4b1553b2f53e7b1e4dcfdb0425dab' }, "Cargando planes..."))), this.error && (h("div", { key: '5c9f07f02dd42c73db057def4696fc5e7094f892', class: "step-plans__error" }, h("p", { key: '297ce470626c998458513731f8e7f886e7b4c07b' }, this.error), h("button", { key: '8eeb4f9e22d9cccde344af09444c3e60c81161d8', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: 'eb7511e871ba573950643455f98d98537383018a', class: "step-plans__carousel-container" }, h("ui-carousel", { key: 'd0125b09b6926ac69eda3bbb2891b4aee5634bc2', totalItems: this.plans.length, gap: 24, showNavigation: true, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: '8964acaed4e35d38baed0e8e7382221278086493', class: "step-plans__empty" }, h("p", { key: 'efaadbf685e9dfb551848bc6ddcd8110fb451740' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'f9148a21e40798c573876ca0a1eb4277d837bc53', class: "step-plans__footer" }, h("div", { key: 'df04a8b4b6e39c1e960fc972d05961c62a7391e4', class: "step-plans__footer-left" }, h("div", { key: 'e83bdfd77bd8c242d903d29009962c2fd9db2cb7', class: "step-plans__footer-info" }, h("div", { key: 'd7d9dc8fab38bba5b3012157df8cb2382744e6bf', class: "step-plans__footer-item" }, h("span", { key: '6a254189a1ff389fe15110480bf7d0eae6745a99', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: '625152a0ad5524c43e8e4822de708d3f78a2261b', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '4581b080ffffb7a263b5c9c09b35c71d8f210030', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '66081e71fd0eb8682645a6df58010b3ebd194c53', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '471b0051747f3e1955441684c3e4cd6b14ddf175', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: 'f33f49cd46ae1a496212c1ea03454d84d3d0e82e', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: '1d165145af48d1646d397e837171ca6196d3344e', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
    }
};
StepPlans.style = stepPlansCss();

const stepProductDetailCss = () => `:host{display:block;width:100%;min-height:100%;background-color:#FAFAFA}.step-product-detail{width:100%;max-width:1200px;margin:0 auto;padding:1.5rem}.loading-container,.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;padding:2rem}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.spinner-small{display:inline-block;width:16px;height:16px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:0.25rem;vertical-align:middle}@keyframes spin{to{transform:rotate(360deg)}}.error-container p{color:#DA291C;margin-bottom:1rem;font-size:1.25rem}.error-container button{margin:0.25rem}.btn-retry{background:#DA291C;color:white;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:600}.btn-retry:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}.breadcrumb{display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;font-size:0.875rem;color:#666666}.breadcrumb-item{cursor:pointer;transition:color 0.2s}.breadcrumb-item:hover{color:#0097A9}.breadcrumb-item.active{color:#1A1A1A;font-weight:500;cursor:default}.breadcrumb-item.active:hover{color:#1A1A1A}.breadcrumb-separator{color:#999999}.product-container{background:white;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:2rem}.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem}@media (max-width: 768px){.product-grid{grid-template-columns:1fr}}.product-image-section{display:flex;align-items:flex-start;justify-content:center;width:100%;max-width:450px;margin:0 auto}.product-image-section ui-image-carousel{width:100%}.image-container{width:100%;max-width:400px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#FAFAFA;border-radius:0.5rem;padding:1rem}.product-image{max-width:100%;max-height:100%;object-fit:contain}.product-details-section{display:flex;flex-direction:column;gap:1rem}.brand-name{font-size:0.875rem;color:#808080;text-transform:uppercase;letter-spacing:0.5px}.product-name{font-size:1.75rem;font-weight:700;color:#1A1A1A;margin:0;line-height:1.2}.product-description{font-size:1rem;color:#666666;line-height:1.6;margin:0}.selector-section{padding:1rem 0;border-top:1px solid #F5F5F5}.selector-section:first-of-type{border-top:none}.selector-title{font-size:0.875rem;font-weight:600;color:#4D4D4D;margin:0 0 0.5rem 0;text-transform:uppercase;letter-spacing:0.5px}.color-options{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem}.color-circle{width:40px;height:40px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0}.color-circle:hover{transform:scale(1.1)}.color-circle.selected{border-color:#0097A9;box-shadow:0 0 0 2px white, 0 0 0 4px #0097A9}.color-circle .check-icon{width:18px;height:18px}.selected-label{font-size:0.875rem;color:#666666}.storage-options{display:flex;gap:0.5rem;flex-wrap:wrap}.storage-button{padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;font-size:0.875rem;font-weight:500;color:#4D4D4D;transition:all 0.2s}.storage-button:hover{border-color:#0097A9;color:#0097A9}.storage-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1);color:#0097A9}.installment-options{display:flex;gap:0.5rem;flex-wrap:wrap}.installment-button{display:flex;flex-direction:column;align-items:center;padding:0.5rem 1rem;border:2px solid #E5E5E5;border-radius:0.5rem;background:white;cursor:pointer;transition:all 0.2s;min-width:100px}.installment-button:hover{border-color:#0097A9}.installment-button.selected{border-color:#0097A9;background:rgba(0, 151, 169, 0.1)}.installment-button.selected .months,.installment-button.selected .price{color:#0097A9}.installment-button .months{font-size:0.875rem;font-weight:600;color:#4D4D4D}.installment-button .price{font-size:0.75rem;color:#808080;margin-top:2px}.quantity-selector{display:flex;align-items:center;gap:1rem}.qty-button{width:36px;height:36px;border:2px solid #CCCCCC;border-radius:0.5rem;background:white;cursor:pointer;font-size:1.25rem;font-weight:600;color:#4D4D4D;display:flex;align-items:center;justify-content:center;transition:all 0.2s}.qty-button:hover:not(:disabled){border-color:#0097A9;color:#0097A9}.qty-button:disabled{opacity:0.4;cursor:not-allowed}.qty-value{font-size:1.25rem;font-weight:600;color:#1A1A1A;min-width:30px;text-align:center}.price-section{background:#FAFAFA;border-radius:0.5rem;padding:1rem;margin-top:0.5rem}.price-row{display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0}.price-row.monthly .value{font-size:1.5rem;font-weight:700;color:#DA291C}.price-row.total{border-top:1px solid #E5E5E5;padding-top:0.5rem;margin-top:0.25rem}.price-row.total .value{font-weight:600}.price-row .label{font-size:0.875rem;color:#666666}.price-row .value{font-size:1rem;color:#1A1A1A}.btn-add-to-cart{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:1rem}.btn-add-to-cart:hover:not(:disabled){background:rgb(172.8048780488, 32.5, 22.1951219512)}.btn-add-to-cart:disabled{opacity:0.7;cursor:not-allowed}.btn-add-to-cart.loading{background:#808080}.btn-add-to-cart .loading-text{display:flex;align-items:center;justify-content:center}.btn-back-link{background:none;border:none;color:#0097A9;font-size:0.875rem;cursor:pointer;padding:0.5rem;margin-top:0.25rem;transition:color 0.2s}.btn-back-link:hover{color:rgb(0, 105.4319526627, 118);text-decoration:underline}.btn-back{background:#E5E5E5;color:#4D4D4D;border:none;padding:0.5rem 1.5rem;border-radius:9999px;cursor:pointer;font-weight:500}.btn-back:hover{background:#CCCCCC}.features-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.features-title,.specs-title{font-size:1.25rem;font-weight:600;color:#1A1A1A;margin:0 0 1rem 0}.features-list{margin:0;padding:0 0 0 1.5rem}.features-list .feature-item{padding:0.25rem 0;color:#4D4D4D;line-height:1.5}.specs-section{margin-top:2rem;padding-top:2rem;border-top:1px solid #E5E5E5}.specs-grid{display:grid;grid-template-columns:repeat(2, 1fr);gap:0.5rem}@media (max-width: 576px){.specs-grid{grid-template-columns:1fr}}.spec-item{display:flex;justify-content:space-between;padding:0.5rem;background:#FAFAFA;border-radius:0.25rem}.spec-item .spec-label{font-size:0.875rem;color:#666666}.spec-item .spec-value{font-size:0.875rem;font-weight:500;color:#1A1A1A}.availability-status{display:flex;align-items:center;gap:0.25rem;padding:0.5rem 0}.availability-status--available{display:flex;align-items:center;gap:0.25rem;color:#44AF69;font-weight:500;font-size:0.875rem}.availability-status--unavailable{display:flex;align-items:center;gap:0.25rem;color:#DA291C;font-weight:500;font-size:0.875rem}.availability-icon{width:18px;height:18px}.unavailable-alert-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem}.unavailable-alert{background:white;border-radius:0.75rem;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);animation:alertSlideIn 0.3s ease-out}.unavailable-alert__icon{width:64px;height:64px;margin:0 auto 1rem;background:rgba(218, 41, 28, 0.1);border-radius:50%;display:flex;align-items:center;justify-content:center}.unavailable-alert__icon svg{width:32px;height:32px;color:#DA291C}.unavailable-alert__title{font-size:1.5rem;font-weight:700;color:#1A1A1A;margin:0 0 0.5rem 0}.unavailable-alert__message{font-size:1rem;color:#666666;line-height:1.6;margin:0 0 1.5rem 0}.unavailable-alert__btn{width:100%;padding:1rem;background:#DA291C;color:white;border:none;border-radius:9999px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s}.unavailable-alert__btn:hover{background:rgb(172.8048780488, 32.5, 22.1951219512)}@keyframes alertSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}.btn-add-to-cart.disabled{background:#999999;cursor:not-allowed}.btn-add-to-cart.disabled:hover{background:#999999}`;

const StepProductDetail = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h("div", { class: "breadcrumb" }, h("span", { class: "breadcrumb-item", onClick: this.onBack }, "Cat\u00E1logo"), h("span", { class: "breadcrumb-separator" }, ">"), h("span", { class: "breadcrumb-item active" }, this.product?.productName || 'Detalle')));
    }
    renderColorSelector() {
        if (this.colorOptions.length <= 1)
            return null;
        return (h("div", { class: "selector-section" }, h("h4", { class: "selector-title" }, "Color"), h("div", { class: "color-options" }, this.colorOptions.map((color, index) => (h("button", { class: {
                'color-circle': true,
                'selected': this.selectedColorIndex === index,
            }, style: { backgroundColor: color.webColor }, onClick: () => this.handleColorSelect(index), title: color.colorName }, this.selectedColorIndex === index && (h("svg", { class: "check-icon", viewBox: "0 0 24 24", fill: "none", stroke: "white", "stroke-width": "3" }, h("polyline", { points: "20 6 9 17 4 12" }))))))), h("span", { class: "selected-label" }, this.colorOptions[this.selectedColorIndex]?.colorName)));
    }
    renderStorageSelector() {
        if (this.storageOptions.length === 0)
            return null;
        return (h("div", { class: "selector-section" }, h("h4", { class: "selector-title" }, "Almacenamiento"), h("div", { class: "storage-options" }, this.storageOptions.map((storage, index) => (h("button", { class: {
                'storage-button': true,
                'selected': this.selectedStorageIndex === index,
            }, onClick: () => this.handleStorageSelect(index) }, storage.storageName))))));
    }
    renderInstallmentSelector() {
        return (h("div", { class: "selector-section" }, h("h4", { class: "selector-title" }, "Plazos de pago"), h("div", { class: "installment-options" }, this.installmentOptions.map(option => (h("button", { class: {
                'installment-button': true,
                'selected': this.selectedInstallments === option.months,
            }, onClick: () => this.handleInstallmentSelect(option.months) }, h("span", { class: "months" }, option.months, " meses"), h("span", { class: "price" }, this.formatPrice(option.monthlyPrice), "/mes")))))));
    }
    renderQuantitySelector() {
        return (h("div", { class: "selector-section" }));
    }
    renderPriceSection() {
        const monthlyPrice = this.getCurrentMonthlyPrice();
        const totalPrice = this.product?.regular_price || 0;
        return (h("div", { class: "price-section" }, h("div", { class: "price-row monthly" }, h("span", { class: "label" }, "Pago mensual"), h("span", { class: "value" }, this.formatPrice(monthlyPrice))), h("div", { class: "price-row total" }, h("span", { class: "label" }, "Precio total"), h("span", { class: "value" }, this.formatPrice(totalPrice))), h("div", { class: "price-row installments" }, h("span", { class: "label" }, "Financiado a"), h("span", { class: "value" }, this.selectedInstallments, " meses"))));
    }
    /**
     * Renders the availability status indicator (TEL pattern)
     */
    renderAvailabilityStatus() {
        return (h("div", { class: "availability-status" }, this.isAvailable ? (h("div", { class: "availability-status--available" }, h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), h("polyline", { points: "22 4 12 14.01 9 11.01" })), h("span", null, "Disponible"))) : (h("div", { class: "availability-status--unavailable" }, h("svg", { class: "availability-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })), h("span", null, "No disponible")))));
    }
    /**
     * Renders the unavailable product alert modal
     */
    renderUnavailableAlert() {
        if (!this.showUnavailableAlert)
            return null;
        return (h("div", { class: "unavailable-alert-overlay" }, h("div", { class: "unavailable-alert" }, h("div", { class: "unavailable-alert__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))), h("h3", { class: "unavailable-alert__title" }, "Producto no disponible"), h("p", { class: "unavailable-alert__message" }, "Lo sentimos, este equipo no est\u00E1 disponible actualmente. Por favor seleccione otro equipo del cat\u00E1logo."), h("button", { class: "unavailable-alert__btn", onClick: this.handleGoBackFromAlert }, "Volver al cat\u00E1logo"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: 'af187d60d6c4cee216e9993c8a02b86c903bd1ea' }, h("div", { key: '3a619111d42da7044010e8243f3844c69d80227f', class: "step-product-detail" }, this.renderUnavailableAlert(), this.isLoading && (h("div", { key: '5a1bdf8f07f4320e8eda25ea92dedde11d382c66', class: "loading-container" }, h("div", { key: '435f31c32e0dae1726ce5d18ff4c7a4a9781efb3', class: "spinner" }), h("p", { key: '3719de9dae95c3999f910a1e2755eaed815f9e57' }, "Cargando producto..."))), this.error && !this.isLoading && (h("div", { key: 'f6eb3ebc3cb46822ec9f26306e973c2091368457', class: "error-container" }, h("p", { key: 'bb77b8c765c79f51a39e5fb553344150b9e820af' }, this.error), h("button", { key: '85574f4cd2f925b3eceee56860d09f74d287ebf6', class: "btn-retry", onClick: () => this.loadProductDetail() }, "Reintentar"), h("button", { key: '3b811a94a1876a48be25f95857f1723fecaad538', class: "btn-back", onClick: this.onBack }, "Volver al cat\u00E1logo"))), !this.isLoading && !this.error && this.product && (h("div", { key: 'a909b2e7baa56e0900956c624fd3108e6924559f', class: "product-container" }, this.renderBreadcrumb(), h("div", { key: 'dbd2e612fa6c37b276e2f13d8b52b6f92bd2f03f', class: "product-grid" }, h("div", { key: '6a0d55b1bdd3645b588095abc114532965ac8a3e', class: "product-image-section" }, h("ui-image-carousel", { key: 'b956a928f422f82da0fdbfbff1ca3e92425a9681', images: this.productImages, loop: true, showNavigation: this.productImages.length > 1, showIndicators: this.productImages.length > 1, autoplayInterval: 0 })), h("div", { key: '78cfddd2a432b8772b827e1bbf2117672e00339a', class: "product-details-section" }, this.product.brandName && (h("span", { key: '53cc708e01bf36693c650dbd09fa826e889c3a06', class: "brand-name" }, this.product.brandName)), h("h1", { key: 'b311030defc58424fca609da87452288c9691f4b', class: "product-name" }, this.product.productName), this.product.shortDescription && (h("p", { key: '8a3084855d07a17cb1b54aec9f74459334b34a4e', class: "product-description" }, productService.cleanDescription(this.product.shortDescription))), this.renderAvailabilityStatus(), this.renderColorSelector(), this.renderStorageSelector(), this.renderInstallmentSelector(), this.renderQuantitySelector(), this.renderPriceSection(), h("button", { key: '8d8fa0387b3e71394e59563c1b5305fbd3c439a8', class: {
                'btn-add-to-cart': true,
                'loading': this.isAddingToCart,
                'disabled': !this.isAvailable,
            }, onClick: this.handleAddToCart, disabled: this.isAddingToCart || !this.isAvailable }, this.isAddingToCart ? (h("span", { class: "loading-text" }, h("span", { class: "spinner-small" }), "Agregando...")) : !this.isAvailable ? ('No disponible') : ('Continuar')), h("button", { key: '961aabd7b04c48e9dc80a6e0b30838bcbec77a45', class: "btn-back-link", onClick: this.onBack }, "\u2190 Volver al cat\u00E1logo"))), this.product.features && this.product.features.length > 0 && (h("div", { key: '3cdecc1e0edb59a8ce2a2e9b5f19f2e2c20deaf8', class: "features-section" }, h("h3", { key: '718e3635682061f79462614889b7b5cb78ed12bd', class: "features-title" }, "Caracter\u00EDsticas"), h("ul", { key: 'e0ecd30e6f5f208d25b7c0f3e49986af672db36c', class: "features-list" }, this.product.features.map(feature => (h("li", { class: "feature-item" }, feature)))))), this.product.specifications && this.product.specifications.length > 0 && (h("div", { key: '648bf2a0297e7a410d91faabe7dc80e135e684bc', class: "specs-section" }, h("h3", { key: '12e80ac827eefb9d03ab61c7b2ec7541532dc083', class: "specs-title" }, "Especificaciones"), h("div", { key: '216b9c886b144c65b51547b7a7176222e59fc746', class: "specs-grid" }, this.product.specifications.map((spec) => (h("div", { class: "spec-item" }, h("span", { class: "spec-label" }, spec.name), h("span", { class: "spec-value" }, spec.value))))))))))));
    }
};
StepProductDetail.style = stepProductDetailCss();

const stepShippingCss = () => `:host{display:block;width:100%;min-height:100%;background-color:white}.step-shipping{width:100%;max-width:900px;margin:0 auto;padding:1.5rem 1rem}.info-message{font-size:0.875rem;color:#666666;margin:0 0 1.5rem 0;padding:0 !important;background:transparent !important;background-color:transparent !important;line-height:1.5;border:none !important;border-radius:0 !important}.error-alert{display:flex;align-items:center;gap:0.5rem;background:rgb(248.1707317073, 205, 201.8292682927);color:rgb(172.8048780488, 32.5, 22.1951219512);padding:1rem;border-radius:0.5rem;margin-bottom:1.5rem;font-size:0.875rem}.error-alert svg{width:20px;height:20px;flex-shrink:0}.form-container{width:100%}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem 1.5rem;margin-bottom:0.25rem}@media (max-width: 700px){.form-row{grid-template-columns:1fr}}.form-group{margin-bottom:1rem}.form-group.existing-customer{margin-top:0.5rem}.form-label{display:block;font-size:0.875rem;font-weight:500;color:#4D4D4D;margin-bottom:0.25rem}.form-label .required{color:#4D4D4D;margin-right:2px}.form-input{width:100%;padding:10px 12px;border:1px solid #CCCCCC;border-radius:0.25rem;font-size:0.875rem;color:#1A1A1A;background:white;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.form-input::placeholder{color:#999999}.form-input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 2px rgba(0, 151, 169, 0.1)}.form-input:disabled{background:#F5F5F5;color:#808080;cursor:not-allowed}.form-input.error{border-color:#DA291C}.form-input.error:focus{box-shadow:0 0 0 2px rgba(218, 41, 28, 0.1)}input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}.date-input-wrapper{position:relative}.error-message{display:block;font-size:0.75rem;color:#DA291C;margin-top:0.25rem}.id-field{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}.id-field .radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem;flex-shrink:0}.id-field .id-input{flex:1;min-width:150px}.radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem}.radio-group.horizontal{flex-direction:row}.radio-label{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.875rem}.radio-label input[type=radio]{display:none}.radio-label .radio-custom{width:16px;height:16px;border:2px solid #999999;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}.radio-label .radio-custom::after{content:"";width:8px;height:8px;border-radius:50%;background:transparent;transition:background 0.2s}.radio-label input[type=radio]:checked+.radio-custom{border-color:#666666}.radio-label input[type=radio]:checked+.radio-custom::after{background:#666666}.radio-label .radio-text{color:#4D4D4D;font-size:0.75rem;white-space:nowrap}.btn-container{display:flex;justify-content:center;margin-top:1.5rem;padding-top:1rem}.btn-submit{min-width:200px;height:44px;background:#666666;color:white;border:none;border-radius:9999px;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0 2rem}.btn-submit:hover:not(:disabled){background:#4D4D4D}.btn-submit:disabled{background:#CCCCCC;cursor:not-allowed}.btn-submit.loading{background:#999999}.btn-loading{display:flex;align-items:center;gap:0.5rem}.spinner{width:18px;height:18px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media (max-width: 500px){.step-shipping{padding:1rem}.id-field{flex-direction:column;align-items:flex-start}.id-field .radio-group{margin-bottom:0.25rem}.id-field .id-input{width:100%}}`;

const StepShipping = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h(Host, { key: 'c07553bdbaa3372ca94591fb13dd23ca919fd7cd' }, h("div", { key: '4ed5a61e3b9453c946c1ee251c7af433632b1a47', class: "step-shipping" }, h("p", { key: '56af6226a93d1b721250595712dc9ae388fe6352', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (h("div", { key: 'ade2b1dde278061611862e1935b593d74aa18a08', class: "error-alert" }, h("svg", { key: '36b884150ff4815eaae6f5b8e8b8d9cde3febcbe', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '2c90b3776ae3c35643ee0384436e174f198fa84a', cx: "12", cy: "12", r: "10" }), h("line", { key: 'a13513e527287809096b473428adc9eb620306a1', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: 'f1ead6eed9d8e258952321364ee504f3ea8a90b6', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("span", { key: 'edc327fe90f09aea6b449ea1d85e4212921826e6' }, this.error))), h("div", { key: '8ca4e304db4fe381fcb3908f3cde5fb4b74141ac', class: "form-container" }, h("div", { key: '76cb518d3b890f3a122bf78a9d90e46781bf41b7', class: "form-row" }, h("div", { key: '7ae1d427963f6387bda0696f5eab053fe40722d5', class: "form-group" }, h("label", { key: 'd6a23ccea5367a19035116b16c7bda1e9de09fe5', class: "form-label" }, h("span", { key: '99de19d5c3dde6c267a513c55d582dd0f7bf5410', class: "required" }, "*"), "Nombre:"), h("input", { key: 'ac5dfa6dff61b5e4b3e8abd308b94d2a0fd46144', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && h("span", { key: 'f7a28376fc546336a36f5d12d80c094dd60d9e2c', class: "error-message" }, this.formErrors.name)), h("div", { key: '8deff41d097263f18f578d84c6b40b1c69982bf4', class: "form-group" }, h("label", { key: '41400f13d2bdaa85480b155d07e193eb980001a2', class: "form-label" }, "Segundo nombre:"), h("input", { key: '67573cc53af5d658c7b705c8f2ea47f387e9ea83', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), h("div", { key: '7edcd4d93e14526ba432d9b4d21846b04f140596', class: "form-row" }, h("div", { key: '16520203d44a9f23a04bd93fd1445dedd8e24978', class: "form-group" }, h("label", { key: '3dfae7e516e9798cdb460c580fc7442f46fdfc75', class: "form-label" }, h("span", { key: 'da03d5edba574af10137aa40fdd40214e7426ec2', class: "required" }, "*"), "Apellido:"), h("input", { key: '68fbc627ed84ab9695b135ade5ab0335009d1bf7', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && h("span", { key: 'c63dda9d8efb56c73b0fb294c8882363b45453e3', class: "error-message" }, this.formErrors.lastname)), h("div", { key: '20b2308f610fe8f7ffac7c83b467fbf9830bd29c', class: "form-group" }, h("label", { key: '32c03703d5089dfbaea81bc13b10f99f30cb505c', class: "form-label" }, h("span", { key: '5b26734a7289e0f7bdbd7f12c0a58f2454c6b90a', class: "required" }, "*"), "Segundo apellido:"), h("input", { key: '16118423cb334b85379553359d25e44324cbf02d', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && h("span", { key: 'aa062fa68bc1b44be0ed56e8450dc09c7ccb940c', class: "error-message" }, this.formErrors.secondLastname))), h("div", { key: 'f32bda48060872b868097b663299e218f8db2344', class: "form-row" }, h("div", { key: '91e11d90e279c45d57716ad7e57a8ff101f7f5eb', class: "form-group" }, h("label", { key: '90ce229b347974b7d5f5e7f834b78c899fe2d3f2', class: "form-label" }, h("span", { key: '3ab365d6756c952d10f70a3e31d4a692b042c32a', class: "required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: 'b2bcd6c4a185f30664e9a46c5c4068d2a0bf601a', class: "id-field" }, h("div", { key: '1851ff3305e49e344208e49e99a7276f7c779b91', class: "radio-group" }, h("label", { key: '5a7954738f7ea0f896e4a38afd431f1beb14b176', class: "radio-label" }, h("input", { key: 'ef932dd61bcc37c75519c3d1e0505bfa1fed4f38', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), h("span", { key: '3a7b8f96a9b321d135d54f8e35a108f22c3d6c55', class: "radio-custom" }), h("span", { key: 'd890af48f323ab67b6b254a48a92f9b099a1d930', class: "radio-text" }, "Licencia de conducir")), h("label", { key: '01670f605ec76a8386116b88048db54973be8d47', class: "radio-label" }, h("input", { key: '573798d590a46ee6c83178a71fdbe68c4baac8cf', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), h("span", { key: 'bcb4e2dc3fdb8bacfe86f04a508c10a42ff9903d', class: "radio-custom" }), h("span", { key: 'aee5b52e256597d9414f08ad49977be65ac07d3c', class: "radio-text" }, "Pasaporte"))), h("input", { key: '1c388b898cfa13659b04abd6892faee39b0df6d1', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && h("span", { key: 'b2427fffb3a111384d5c946b6f6e2aeec279129f', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && h("span", { key: '05d4b92beacd9b41c9f9de3b047c92633a9d8b3a', class: "error-message" }, this.formErrors.idNumber)), h("div", { key: '3821bcea062c63dcddf5626071d3690238192c6f', class: "form-group" }, h("label", { key: '52be2efd130820f13f057229923732e31d7050b7', class: "form-label" }, h("span", { key: '28e1d4c8c838235d3ab7b58feefc339570106081', class: "required" }, "*"), "Fecha de vencimiento:"), h("div", { key: '103969c96a32758608896967caff011b148fdf5f', class: "date-input-wrapper" }, h("input", { key: 'bf9e5b53ee5cfb8df18ff8dbd9b60572f9b764bb', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && h("span", { key: '311fb163a8c986be979d998e17b3870b512901e9', class: "error-message" }, this.formErrors.expirationDate))), h("div", { key: '111588d4c1726e20a2b9783b4d08d52e97147ec2', class: "form-row" }, h("div", { key: '986224ced53c65a7144b1da6c0c3be98ca295156', class: "form-group" }, h("label", { key: '2d9fd90d956b0c5e2f0bf2395bbbd423c6a4aac7', class: "form-label" }, h("span", { key: 'd840a52b6d6cdd7e3133672b2e692e2cbdc7cccb', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), h("input", { key: '693860bdf028bef79ea5c09c03466a0f3b47159f', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && h("span", { key: 'ff7b3ea2c2ca470c122e923f9b91c8c6e4c0fec5', class: "error-message" }, this.formErrors.phone)), h("div", { key: '2155e49b260846cfb8327b8461f2718b7b49674a', class: "form-group" }, h("label", { key: 'bc1854ca36aa98dc5292eafea366350b0ecdc80f', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), h("input", { key: 'ba461ffe0cf3a2048f44ff2428f0537361fc098c', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), h("div", { key: '2e2f49470951085e9bf8c4ed38e8460dae7b9156', class: "form-row" }, h("div", { key: 'f60814966ea372a28cbabbbbc4b41ba3af10a21e', class: "form-group" }, h("label", { key: 'c71e46f2f78573c923a25960789910f370c27ce1', class: "form-label" }, h("span", { key: '11bb1896bb6915efc677b3ce754049468c8f7cdf', class: "required" }, "*"), "Nombre del Negocio:"), h("input", { key: '969838eae6fc87103469153f0e5f2c5083271179', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && h("span", { key: '9646b721d08f29cde95cf78dbc1001abb934836d', class: "error-message" }, this.formErrors.businessName)), h("div", { key: 'd45bd7f5cca0a2ad58df815d756d60cb4b38e7f9', class: "form-group" }, h("label", { key: '71734e73b70775a0c7d22b699ff4a5e3056da0b6', class: "form-label" }, h("span", { key: 'efe7dee11cf6da58edef0e55fd819bfef1df73e4', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), h("input", { key: '13aacdcbe0fba647b8089bf9501b6876d8c07d62', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && h("span", { key: 'a76d5d2ecc698e2d5c2213825a57d8f97f1a450f', class: "error-message" }, this.formErrors.position))), h("div", { key: '6532f090127fa795374ca8de3d5e0d13f2207289', class: "form-row" }, h("div", { key: '1c61342e3a30ca3b2c6e11e207a041d4d99ee031', class: "form-group" }, h("label", { key: '8a9ad21933e56287f96c2ae34452852eeb578aa4', class: "form-label" }, h("span", { key: 'c55ed9cbacc909c8f7381d152407ad090ca8289d', class: "required" }, "*"), "Direcci\u00F3n:"), h("input", { key: '7de7c7e9a8e765dedb2ed471dbfc172b98825d03', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && h("span", { key: '79b209b7c6af74362fc467965feafd62a0a3120e', class: "error-message" }, this.formErrors.address)), h("div", { key: '4dda998d4b27d4917ba9863bae3d07515f1b0f53', class: "form-group" }, h("label", { key: '4f8a2929520eeeebd71c908b86e0f95693214a9d', class: "form-label" }, h("span", { key: 'bd125c14674af3b003fad1433883380a88117d9b', class: "required" }, "*"), "Ciudad:"), h("input", { key: '29fcaf0d0009f9cd02c179f74ec23e0d8f7a6047', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && h("span", { key: '87d40db52764bbd0cadfe3442d831979f3f91a13', class: "error-message" }, this.formErrors.city))), h("div", { key: '43cd8a11b5aaccd906dcce39336bf82e5404d41d', class: "form-row" }, h("div", { key: '0264f0507d4e424e20ab50334ba4ab7b47b09a21', class: "form-group" }, h("label", { key: '9edd52e8be58ce08fbcc2a41131eedb873118ed6', class: "form-label" }, h("span", { key: '3cf11c65ee0b5dd7c8292198643d560a07cd0dae', class: "required" }, "*"), "C\u00F3digo postal"), h("input", { key: '27d4e2778d959edbf41b929af2b9d42768d7970b', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && h("span", { key: '4aa0b6d39a97406dfe46fd9552aba92f01b75575', class: "error-message" }, this.formErrors.zipcode)), h("div", { key: 'f8f23653a2702f1907bce04cf300f6c384e25606', class: "form-group" }, h("label", { key: '539fcbb8c4272ade2545e6d3e0f192cf3f2807a4', class: "form-label" }, h("span", { key: '0d343d4f6c0a8c3dd4ba8b00e2d1af87d732e969', class: "required" }, "*"), "Correo electr\u00F3nico:"), h("input", { key: 'cc13283c527c53f54808aed96ada16f3b9daf6a7', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && h("span", { key: '1b1bd7846f05f11d894550d0a0fa22d8fc8c6ba4', class: "error-message" }, this.formErrors.email))), h("div", { key: '236feb774283965aaf4038e8c34b79c20467b64d', class: "form-group existing-customer" }, h("label", { key: 'da698ad0d7fc2c10318c061763f4523546eae390', class: "form-label" }, h("span", { key: '7e05e2afc564ae6d9f0685aa959b73e4b08c6ebf', class: "required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: '36d6dc1fa3276487c90c4f7dc0e57dcb2be0ac0d', class: "radio-group horizontal" }, h("label", { key: 'b4f5b27abf98cd81c33b8cdbcb1c9b001ed66bbe', class: "radio-label" }, h("input", { key: '95b4bd907ce7c6e711fb29a6c9f564d490b53447', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), h("span", { key: '4658a0a02dad4910abcb1558418ac43005e7cbea', class: "radio-custom" }), h("span", { key: '99c0626890d48aff3e5d3c2c64bad27d774b0dcb', class: "radio-text" }, "S\u00ED")), h("label", { key: '6ac7653c1263c60adb2e11310a76bb16fff697db', class: "radio-label" }, h("input", { key: 'ecc6b2c0c2b293407fea5197aa999dd12527b181', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), h("span", { key: '2337987d047019faa419de4db247dcaadd892710', class: "radio-custom" }), h("span", { key: '59e68d9372cb5b1a8b3639cef1d6d6d73cee0c52', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (h("span", { key: 'a0bd452e77948bae5aef81715346b910889ea5fa', class: "error-message" }, this.formErrors.existingCustomer))), h("div", { key: '276b369032ecf9d25836be9fbe91ac806fc65c1a', class: "btn-container" }, h("button", { key: 'f03d5bbe83a5d16741cd63fd77234db38c340197', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (h("span", { class: "btn-loading" }, h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
    }
};
StepShipping.style = stepShippingCss();

const uiCarouselCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-carousel{position:relative;width:100%;display:flex;align-items:center}.ui-carousel__viewport{flex:1;overflow:hidden;margin:0 0.5rem}@media (min-width: 768px){.ui-carousel__viewport{margin:0 1rem}}.ui-carousel__track{display:flex;transition:transform 0.3s ease-out;will-change:transform}.ui-carousel__track--dragging{transition:none;cursor:grabbing}.ui-carousel__nav{flex-shrink:0;width:40px;height:40px;border-radius:50%;background:#FFFFFF;border:2px solid #DA291C;color:#DA291C;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;z-index:2;box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.ui-carousel__nav svg{width:20px;height:20px}.ui-carousel__nav:hover:not(:disabled){background:#DA291C;color:#FFFFFF}.ui-carousel__nav:active:not(:disabled){transform:scale(0.95)}.ui-carousel__nav--disabled{opacity:0.3;cursor:not-allowed;pointer-events:none}@media (max-width: 599px){.ui-carousel__nav{width:32px;height:32px}.ui-carousel__nav svg{width:16px;height:16px}}.ui-carousel__pagination{position:absolute;bottom:-2rem;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:2}.ui-carousel__dot{width:10px;height:10px;border-radius:50%;border:none;background:#CCCCCC;cursor:pointer;padding:0;transition:all 0.2s ease}.ui-carousel__dot:hover{background:#999999}.ui-carousel__dot--active{background:#DA291C;transform:scale(1.2)}::slotted(*){box-sizing:border-box}`;

const UiCarousel = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
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
        return (h(Host, { key: '1d71ded8170a2004929ada8d1401d18fbe5dcc0c' }, h("div", { key: '01d088bfc7590419709aa83850462f6b1fa6374c', class: "ui-carousel" }, this.showNavigation && (h("button", { key: 'a820df5e62634206f0d9f46092f84f84a724eb23', class: {
                'ui-carousel__nav': true,
                'ui-carousel__nav--prev': true,
                'ui-carousel__nav--disabled': !canGoPrev,
            }, onClick: this.goToPrev, disabled: !canGoPrev, "aria-label": "Anterior" }, h("svg", { key: '7ee40aa5fa9fd0c8ac38583ebeaf0c15b8b4c49e', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '882e3d293306f869bd4d8db82a1c0a8720d83d69', points: "15 18 9 12 15 6" })))), h("div", { key: '0bc0eef0e943585d9877ae832a33bac4813c33c1', class: "ui-carousel__viewport" }, h("div", { key: '8ce97b79d901f63c3e6da2e750926857d2dddbc9', class: {
                'ui-carousel__track': true,
                'ui-carousel__track--dragging': this.isDragging,
            }, ref: (el) => (this.trackEl = el), style: {
                transform: `translateX(${this.translateX}%)`,
                gap: `${this.gap}px`,
            }, onTouchStart: this.handleTouchStart, onTouchMove: this.handleTouchMove, onTouchEnd: this.handleTouchEnd }, h("slot", { key: 'bab876ce6a274ce53c476444694cef4e94bf39ad' }))), this.showNavigation && (h("button", { key: '286f8e40d9092b5d837566977e252c36e9fee843', class: {
                'ui-carousel__nav': true,
                'ui-carousel__nav--next': true,
                'ui-carousel__nav--disabled': !canGoNext,
            }, onClick: this.goToNext, disabled: !canGoNext, "aria-label": "Siguiente" }, h("svg", { key: '28eabda805720b3bb8c540b4126c000db8ff7433', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'ad5d5d53067b22fe760c4e6499f027ac61105154', points: "9 18 15 12 9 6" })))), this.showPagination && this.totalItems > this.currentSlidesPerView && (h("div", { key: 'aab818d63c57cea9cfe25a91bb768f8be490cef5', class: "ui-carousel__pagination" }, this.getPaginationDots().map((dotIndex) => (h("button", { class: {
                'ui-carousel__dot': true,
                'ui-carousel__dot--active': dotIndex === this.getCurrentDot(),
            }, onClick: () => this.handleDotClick(dotIndex), "aria-label": `Ir a página ${dotIndex + 1}` })))))), h("style", { key: '927be72b1c508b1add09174d6402b4dfc5f1aece' }, `
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
        registerInstance(this, hostRef);
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
            return (h(Host, null, h("div", { class: "ui-image-carousel" }, h("div", { class: "ui-image-carousel__placeholder" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }), h("circle", { cx: "8.5", cy: "8.5", r: "1.5" }), h("polyline", { points: "21 15 16 10 5 21" })), h("span", null, "Sin imagen")))));
        }
        return (h(Host, null, h("div", { class: "ui-image-carousel" }, h("div", { class: "ui-image-carousel__main", onTouchStart: this.handleTouchStart, onTouchEnd: this.handleTouchEnd }, this.showNavigation && hasMultiple && (h("button", { class: {
                'ui-image-carousel__nav': true,
                'ui-image-carousel__nav--prev': true,
                'ui-image-carousel__nav--disabled': !canGoPrev,
            }, onClick: this.goToPrev, disabled: !canGoPrev, "aria-label": "Imagen anterior" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { points: "15 18 9 12 15 6" })))), h("div", { class: "ui-image-carousel__track", style: {
                transform: `translateX(-${this.currentIndex * 100}%)`,
            } }, this.images.map((_, index) => (h("div", { class: "ui-image-carousel__slide" }, h("img", { src: this.getImageSrc(index), alt: `Imagen ${index + 1}`, class: {
                'ui-image-carousel__image': true,
                'ui-image-carousel__image--loaded': this.loadedImages.has(index),
            }, onLoad: () => this.handleImageLoad(index), onError: (e) => this.handleImageError(index, e), loading: index === 0 ? 'eager' : 'lazy' }))))), this.showNavigation && hasMultiple && (h("button", { class: {
                'ui-image-carousel__nav': true,
                'ui-image-carousel__nav--next': true,
                'ui-image-carousel__nav--disabled': !canGoNext,
            }, onClick: this.goToNext, disabled: !canGoNext, "aria-label": "Imagen siguiente" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { points: "9 18 15 12 9 6" }))))), this.showIndicators && hasMultiple && (h("div", { class: "ui-image-carousel__indicators" }, this.images.map((_, index) => (h("button", { class: {
                'ui-image-carousel__dot': true,
                'ui-image-carousel__dot--active': index === this.currentIndex,
            }, onClick: () => this.goToSlide(index), "aria-label": `Ir a imagen ${index + 1}` }))))), hasMultiple && (h("div", { class: "ui-image-carousel__thumbnails" }, this.images.map((src, index) => (h("button", { class: {
                'ui-image-carousel__thumbnail': true,
                'ui-image-carousel__thumbnail--active': index === this.currentIndex,
            }, onClick: () => this.goToSlide(index) }, h("img", { src: src || this.fallbackImage, alt: `Miniatura ${index + 1}`, loading: "lazy" })))))))));
    }
    static get watchers() { return {
        "images": ["onImagesChange"]
    }; }
};
UiImageCarousel.style = uiImageCarouselCss();

export { FixedServiceFlow as fixed_service_flow, StepCatalogue as step_catalogue, StepConfirmation as step_confirmation, StepContract as step_contract, StepForm as step_form, StepLocation as step_location, StepOrderSummary as step_order_summary, StepPayment as step_payment, StepPlans as step_plans, StepProductDetail as step_product_detail, StepShipping as step_shipping, UiCarousel as ui_carousel, UiImageCarousel as ui_image_carousel };
//# sourceMappingURL=fixed-service-flow.step-catalogue.step-confirmation.step-contract.step-form.step-location.step-order-summary.step-payment.step-plans.step-product-detail.step-shipping.ui-carousel.ui-image-carousel.entry.js.map
