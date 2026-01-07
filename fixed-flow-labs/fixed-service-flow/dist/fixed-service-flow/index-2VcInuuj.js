import { t as tokenService, h as httpService } from './token.service-RvrPTISp.js';
import { S as SERVICE_MESSAGES } from './interfaces-DIJ391iV.js';
import './cart.service-C3FR8Gpo.js';
import './shipping.service-Cs5hFbUT.js';
import './payment.service-BjkEFOi4.js';

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
        // Check for PR LIMIT (out of coverage range)
        if (serviceType === 'PR LIMIT') {
            console.log('[CoverageService] PR LIMIT detected - out of coverage range');
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: 'PR LIMIT',
                serviceMessage: SERVICE_MESSAGES.PR_LIMIT,
                isValid: false,
            };
        }
        // Check for CLARO HOGAR (wireless internet option)
        if (serviceType.toUpperCase() === 'CLARO HOGAR') {
            console.log('[CoverageService] CLARO HOGAR detected - wireless internet option');
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: 'CLARO HOGAR',
                serviceMessage: serviceMessage || SERVICE_MESSAGES.CLARO_HOGAR,
                isValid: true, // Valid but different flow (catalogue)
            };
        }
        // Validate that we have a valid fiber/DSL service type
        const validServiceTypes = ['GPON', 'VRAD'];
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
        console.log('[CoverageService] Returning valid coverage:', serviceType);
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
const API_ENDPOINTS = {
    TOKEN: 'api/Token/getToken',
    COVERAGE: 'api/Catalogue/getInternetPlans',
    PLANS: 'api/Plans/getPlansInternet',
    ADD_TO_CART: 'api/Plans/addToCartCurrentPlan',
    SUBMIT_REQUEST: 'api/Orders/internetServiceRequest',
};
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
// FLOW STEPS
// ------------------------------------------
const FLOW_STEPS = {
    LOCATION: 1,
    PLANS: 2,
    CONTRACT: 3,
    FORM: 4,
    CONFIRMATION: 5,
};
const STEP_TITLES = {
    1: 'Servicio fijo empresarial en tu área',
    2: 'Elige tu plan',
    3: 'Selecciona un tipo de contrato',
    4: 'Formulario de solicitud de servicio fijo',
    5: 'Confirmación de Solicitud',
};
// ------------------------------------------
// SERVICE TYPES
// ------------------------------------------
const SERVICE_TYPES = {
    GPON: 'GPON',
    VRAD: 'VRAD',
    CLARO_HOGAR: 'CLARO HOGAR',
};
const SERVICE_TYPE_LABELS = {
    GPON: 'Fibra Óptica',
    VRAD: 'Internet DSL',
    'CLARO HOGAR': 'Internet Inalámbrico',
};
// ------------------------------------------
// IDENTIFICATION TYPES
// ------------------------------------------
const IDENTIFICATION_TYPES = {
    LICENSE: 'license',
    PASSPORT: 'passport',
};
const IDENTIFICATION_TYPE_LABELS = {
    license: 'Licencia de conducir',
    passport: 'Pasaporte',
};
const IDENTIFICATION_TYPE_API_CODES = {
    license: '1',
    passport: '2',
};
// ------------------------------------------
// CONTRACT TYPES
// ------------------------------------------
const CONTRACT_TYPES = {
    WITH_CONTRACT: 1,
    WITHOUT_CONTRACT: 0,
};
const CONTRACT_TYPE_LABELS = {
    1: 'Con Contrato',
    0: 'Sin Contrato',
};
const CONTRACT_DURATIONS = {
    NO_CONTRACT: 0,
    TWELVE_MONTHS: 12,
    TWENTY_FOUR_MONTHS: 24,
};
// ------------------------------------------
// STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS$1 = {
    // Authentication
    TOKEN: 'token',
    CORRELATION_ID: 'correlationId',
    // Location
    LATITUDE: 'latitud',
    LONGITUDE: 'longitud',
    SERVICE_CODE: 'planCodeInternet',
    ASK_LOCATION: 'askLocation',
    // Plan
    PLAN_ID: 'planId',
    PLAN_PRICE: 'planPrice',
    PLAN: 'plan',
    // Contract
    CONTRACT_TYPE_ID: 'typeContractId',
    CONTRACT_INSTALLMENT: 'contractInstallment',
    CONTRACT_INSTALLATION: 'contractInstallation',
    CONTRACT_ACTIVATION: 'contractActivation',
    CONTRACT_MODEM: 'contractModen',
    // Global
    STORE_BUSINESSES: 'store-businesses',
    APP: 'app',
};
// ------------------------------------------
// VALIDATION LIMITS
// ------------------------------------------
const VALIDATION_LIMITS = {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 50,
    PHONE_LENGTH: 10,
    ZIP_CODE_LENGTH: 5,
    IDENTIFICATION_MIN_LENGTH: 10,
    IDENTIFICATION_MAX_LENGTH: 20,
    EMAIL_MAX_LENGTH: 100,
    ADDRESS_MAX_LENGTH: 200,
};
// ------------------------------------------
// ERROR MESSAGES
// ------------------------------------------
const ERROR_MESSAGES = {
    // Network
    NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
    TIMEOUT_ERROR: 'La solicitud ha tardado demasiado. Por favor, intenta de nuevo.',
    SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
    // Token
    TOKEN_ERROR: 'Error al obtener el token de autenticación.',
    // Coverage
    NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
    COVERAGE_ERROR: 'Error al verificar la cobertura. Por favor, intenta de nuevo.',
    // Plans
    PLANS_ERROR: 'Error al cargar los planes disponibles.',
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
// ------------------------------------------
// UI TEXT
// ------------------------------------------
const UI_TEXT = {
    // Buttons
    BTN_CONTINUE: 'Continuar',
    BTN_BACK: 'Regresar',
    BTN_VALIDATE: 'Validar',
    BTN_CLOSE: 'Cerrar',
    BTN_RETRY: 'Volver a intentar',
    BTN_USE_CURRENT_LOCATION: 'Utilizar Ubicación Actual',
    BTN_REQUEST_PLAN: 'Solicitar plan',
    // Labels
    LBL_MONTHLY_PAYMENT: 'Pago mensual',
    LBL_PAY_TODAY: 'Paga hoy',
    LBL_PLAN_INCLUDES: 'Plan incluye',
    LBL_REQUIRED: '*',
    // Form labels
    LBL_FIRST_NAME: 'Nombre',
    LBL_SECOND_NAME: 'Segundo nombre',
    LBL_LAST_NAME: 'Apellido',
    LBL_SECOND_LAST_NAME: 'Segundo apellido',
    LBL_IDENTIFICATION: 'Identificación',
    LBL_EXPIRATION_DATE: 'Fecha de vencimiento',
    LBL_PHONE_1: 'Teléfono de contacto 1',
    LBL_PHONE_2: 'Teléfono de contacto 2',
    LBL_BUSINESS_NAME: 'Nombre del Negocio',
    LBL_POSITION: 'Posición en la Empresa',
    LBL_ADDRESS: 'Dirección',
    LBL_CITY: 'Ciudad',
    LBL_ZIP_CODE: 'Código postal',
    LBL_EMAIL: 'Correo electrónico',
    LBL_EXISTING_CUSTOMER: 'Cliente existente de Claro PR',
    // Placeholders
    PH_ENTER_ADDRESS: 'Ingrese su dirección',
    PH_ENTER_NAME: 'Ingrese nombre',
    PH_ENTER_PHONE: 'Ingrese teléfono',
    PH_SELECT: 'Seleccionar',
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
     * @param coordinates - The marker position
     * @param verticalOffset - Pixels to shift the view up (positive = marker appears lower)
     */
    async setMarker(coordinates, verticalOffset = 0) {
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
        // Apply vertical offset to make marker appear lower on screen
        // Negative y value pans the map up, making the marker appear lower
        if (verticalOffset > 0) {
            this.map.panBy(0, -verticalOffset);
        }
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
        // Override Google Maps InfoWindow styles - wider modal with rounded corners
        const popStyle = `<style>
      .gm-ui-hover-effect { display: none !important; }
      .gm-style .gm-style-iw-c { padding: 0px !important; max-width: 400px !important; border-radius: 16px !important; overflow: visible !important; max-height: none !important; }
      .gm-style .gm-style-iw-d { padding: 0px !important; overflow: visible !important; max-width: 400px !important; max-height: none !important; overflow-y: visible !important; }
      .gm-style .gm-style-iw-d > div { overflow: visible !important; }
      .gm-style .gm-style-iw-tc { display: none !important; }
      .gm-style-iw { max-width: 400px !important; overflow: visible !important; max-height: none !important; }
      .gm-style-iw-chr { display: none !important; }
      .gm-style .gm-style-iw-d::-webkit-scrollbar { display: none !important; }
    </style>`;
        // Create InfoWindow with wider design
        this.infoWindow = new google.maps.InfoWindow({
            content: popStyle + content,
            maxWidth: 400,
        });
        // Open InfoWindow at marker position
        this.infoWindow.open({
            anchor: this.marker,
            map: this.map,
        });
        // Adjust InfoWindow styles after DOM is ready
        this.infoWindow.addListener('domready', () => {
            setTimeout(() => {
                const iwc = document.querySelector('.gm-style-iw-c');
                const iwd = document.querySelector('.gm-style-iw-d');
                if (iwc) {
                    iwc.style.setProperty('max-width', '400px', 'important');
                    iwc.style.setProperty('padding', '0', 'important');
                    iwc.style.setProperty('border-radius', '16px', 'important');
                    iwc.style.setProperty('box-shadow', '0 4px 20px rgba(0,0,0,0.15)', 'important');
                }
                if (iwd) {
                    iwd.style.setProperty('max-width', '400px', 'important');
                    iwd.style.setProperty('overflow', 'visible', 'important');
                }
            }, 50);
        });
        // Store callback reference for external access
        if (onContinueClick) {
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
// PRODUCT SERVICE - Equipment Detail for CLARO HOGAR
// Fixed Service Flow Web Component
// Based on TEL: product.service.ts
// ============================================
// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS = {
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
            sessionStorage.setItem(STORAGE_KEYS.MAIN_ID, String(productId));
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
            const value = sessionStorage.getItem(STORAGE_KEYS.MAIN_ID);
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
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_PRODUCT, JSON.stringify(product));
            sessionStorage.setItem(STORAGE_KEYS.PRODUCT_ID, String(product.productId));
            if (subcatalogId) {
                sessionStorage.setItem(STORAGE_KEYS.SUBCATALOG_ID, String(subcatalogId));
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
            sessionStorage.setItem(STORAGE_KEYS.SUBCATALOG_ID, String(subcatalogId));
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
            const value = sessionStorage.getItem(STORAGE_KEYS.SUBCATALOG_ID);
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
            const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_PRODUCT);
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
            const value = sessionStorage.getItem(STORAGE_KEYS.PRODUCT_ID);
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
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_COLOR, JSON.stringify(colorData));
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
            const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_COLOR);
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
            sessionStorage.setItem(STORAGE_KEYS.SELECTED_STORAGE, JSON.stringify(storageData));
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
            const data = sessionStorage.getItem(STORAGE_KEYS.SELECTED_STORAGE);
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
            sessionStorage.setItem(STORAGE_KEYS.CHILDREN_ID, String(childrenId));
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
            const value = sessionStorage.getItem(STORAGE_KEYS.CHILDREN_ID);
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
            sessionStorage.setItem(STORAGE_KEYS.PARENT_ID, String(parentId));
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
            const value = sessionStorage.getItem(STORAGE_KEYS.PARENT_ID);
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
            sessionStorage.setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
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
            return sessionStorage.getItem(STORAGE_KEYS.DEVICE_TYPE);
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
            Object.values(STORAGE_KEYS).forEach(key => {
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
// SERVICES INDEX
// Fixed Service Flow Web Component
// ============================================

export { ERROR_MESSAGES as E, SUCCESS_MESSAGES as S, plansService as a, coverageService as b, catalogueService as c, mapsService as m, productService as p, requestService as r };
//# sourceMappingURL=index-2VcInuuj.js.map

//# sourceMappingURL=index-2VcInuuj.js.map