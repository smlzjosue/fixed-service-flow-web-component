import { r as registerInstance, c as createEvent, h, H as Host, a as getElement } from './index-CYQeQM-n.js';
import { t as tokenService, h as httpService, f as flowActions, s as state } from './token.service-B9M544XN.js';
import { c as catalogueService, p as productService } from './product.service-CxMpvjWC.js';
import { c as cartService } from './cart.service-CwbA0HJy.js';
import { s as shippingService } from './shipping.service-HG5G08q9.js';
import { p as paymentService } from './payment.service-CcDo2zXl.js';

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
    CLARO_HOGAR: 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
    NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
    PR_LIMIT: 'Actualmente usted se encuentra fuera del rango de cobertura, si usted desea contratar el servicio para otra locación utilice la barra de dirección.',
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

const fixedServiceFlowCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;color:#333333;line-height:1.5}.fsf-container{width:100%}.fsf-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:2rem}.fsf-loading__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.fsf-loading__text{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.fsf-error{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:2rem;text-align:center}.fsf-error__icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;font-size:1.75rem;font-weight:700;color:#FFFFFF;background-color:#DA291C;border-radius:50%}.fsf-error__title{margin-top:1rem;font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333}.fsf-error__message{margin-top:0.5rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666;max-width:400px}.fsf-error__button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.fsf-error__button:disabled{opacity:0.5;cursor:not-allowed}.fsf-error__button{height:48px;background-color:#DA291C;color:#FFFFFF}.fsf-error__button:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.fsf-error__button:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.fsf-error__button{margin-top:1.5rem}.step-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:2rem;text-align:center;background:#FFFFFF;border-radius:0.75rem;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);margin:1rem}.step-placeholder h2{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333;margin-bottom:1rem}.step-placeholder p{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-placeholder button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-placeholder button:disabled{opacity:0.5;cursor:not-allowed}.step-placeholder button{height:48px;background-color:#DA291C;color:#FFFFFF}.step-placeholder button:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-placeholder button:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-placeholder button{margin:0.5rem}.step-placeholder button:last-child{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-placeholder button:last-child:disabled{opacity:0.5;cursor:not-allowed}.step-placeholder button:last-child{height:48px;background-color:#0097A9;color:#FFFFFF}.step-placeholder button:last-child:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-placeholder button:last-child:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;

/**
 * CLARO HOGAR step names for clarity
 * New simplified flow: Location → Catalogue → Plans → Contract → Form → Confirmation
 * (step-product-detail eliminated - products shown in carousel with summary bar)
 */
const CLARO_HOGAR_STEPS = {
    LOCATION: 1, // Ubicación/Cobertura
    CATALOGUE: 2, // Catálogo de productos (carrusel + summary bar)
    PLANS: 3, // Planes de internet
    CONTRACT: 4, // Tipo de contrato
    FORM: 5, // Formulario de datos
    CONFIRMATION: 6, // Confirmación
};
// Max step per flow type
const MAX_STEP_STANDARD = 5;
const MAX_STEP_CLARO_HOGAR = 6;
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
     * Renders steps for CLARO HOGAR Flow (simplified)
     * Steps: 1.Location -> 2.Catalogue (carousel+summary) -> 3.Plans ->
     *        4.Contract -> 5.Form -> 6.Confirmation
     * Note: step-product-detail was eliminated - products now in carousel with inline selection
     */
    renderClaroHogarStep(stepProps) {
        switch (this.currentStep) {
            case CLARO_HOGAR_STEPS.LOCATION:
                return h("step-location", { ...stepProps });
            case CLARO_HOGAR_STEPS.CATALOGUE:
                // Carousel with product cards + summary bar (new design)
                return h("step-catalogue", { ...stepProps });
            case CLARO_HOGAR_STEPS.PLANS:
                // Plans for the selected modem/product
                return h("step-plans", { ...stepProps });
            case CLARO_HOGAR_STEPS.CONTRACT:
                return h("step-contract", { ...stepProps });
            case CLARO_HOGAR_STEPS.FORM:
                return h("step-form", { ...stepProps });
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

const stepCatalogueCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-catalogue{width:100%;min-height:100vh;display:flex;flex-direction:column;background:#FFFFFF}.step-catalogue__header{width:100%;background:#FFFFFF;padding:1rem 1.5rem;box-sizing:border-box}@media (max-width: 767px){.step-catalogue__header{padding:0.75rem 1rem}}.step-catalogue__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-catalogue__back-link svg{width:20px;height:20px}.step-catalogue__back-link:hover{opacity:0.8}.step-catalogue__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-catalogue__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-catalogue__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-catalogue__divider{margin:0 -1rem}}.step-catalogue__loading,.step-catalogue__error,.step-catalogue__empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}.step-catalogue__loading p,.step-catalogue__error p,.step-catalogue__empty p{margin-top:1rem;font-size:1rem;color:#666666}.step-catalogue__loading button,.step-catalogue__error button,.step-catalogue__empty button{margin-top:1rem;padding:0.5rem 1.5rem;background:#0097A9;color:#FFFFFF;border:none;border-radius:20px;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background 150ms ease}.step-catalogue__loading button:hover,.step-catalogue__error button:hover,.step-catalogue__empty button:hover{background:rgb(0, 114.5455621302, 128.2)}.step-catalogue__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-catalogue__carousel-container{flex:1;padding:1.5rem;overflow:hidden}@media (max-width: 767px){.step-catalogue__carousel-container{padding:1rem}}.step-catalogue__summary-bar{width:100%;position:sticky;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;box-shadow:0 -4px 16px rgba(0, 0, 0, 0.08);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;z-index:10;box-sizing:border-box}@media (max-width: 1199px){.step-catalogue__summary-bar{flex-direction:column;gap:1rem}}@media (max-width: 767px){.step-catalogue__summary-bar{padding:0.75rem 1rem}}.step-catalogue__summary-content{display:grid;grid-template-columns:repeat(5, 1fr);gap:1rem;flex:1}@media (max-width: 1199px){.step-catalogue__summary-content{width:100%;grid-template-columns:repeat(3, 1fr)}}@media (max-width: 767px){.step-catalogue__summary-content{grid-template-columns:repeat(2, 1fr);gap:0.5rem}}.step-catalogue__summary-item{display:flex;flex-direction:column;gap:0.25rem}.step-catalogue__summary-item--highlight .step-catalogue__summary-label{color:#333333;font-weight:700}.step-catalogue__summary-label{font-size:0.75rem;font-weight:500;color:#666666;text-transform:uppercase;letter-spacing:0.5px}.step-catalogue__summary-value{font-size:0.875rem;font-weight:600;color:#333333}.step-catalogue__summary-value--red{color:#DA291C;font-weight:700}.step-catalogue__continue-btn{padding:0.75rem 2rem;background:#DA291C;color:#FFFFFF;border:none;border-radius:30px;font-size:1rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:all 150ms ease;min-width:160px}.step-catalogue__continue-btn:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-catalogue__continue-btn:disabled,.step-catalogue__continue-btn--disabled{background:#999999;cursor:not-allowed}@media (max-width: 1199px){.step-catalogue__continue-btn{width:100%;padding:1rem}}.product-card{background:#FFFFFF;border:2px solid #E5E5E5;border-radius:12px;overflow:hidden;cursor:pointer;transition:all 150ms ease;position:relative;height:100%;min-height:220px;display:flex;flex-direction:column}.product-card:hover{border-color:#CCCCCC;box-shadow:0 4px 16px rgba(0, 0, 0, 0.1);transform:translateY(-2px)}.product-card--selected{border-color:#0097A9;box-shadow:0 4px 16px rgba(0, 151, 169, 0.2)}.product-card--selected:hover{border-color:#0097A9}.product-card--loading{opacity:0.7;pointer-events:none}.product-card__content{display:grid;grid-template-columns:120px 1fr;gap:1rem;padding:1rem;flex:1}@media (max-width: 767px){.product-card__content{grid-template-columns:100px 1fr;gap:0.75rem;padding:0.75rem}}.product-card__image{display:flex;align-items:center;justify-content:center;background:#FFFFFF;border-radius:8px;padding:0.5rem}.product-card__image img{max-width:100%;max-height:100px;object-fit:contain}.product-card__info{display:flex;flex-direction:column;gap:0.5rem}.product-card__name{margin:0;font-size:1rem;font-weight:700;color:#333333;line-height:1.3}@media (max-width: 767px){.product-card__name{font-size:0.875rem}}.product-card__financed{display:flex;flex-direction:column;gap:2px}.product-card__financed-label{font-size:0.75rem;font-weight:600;color:#333333}.product-card__financed-price{font-size:1.25rem;font-weight:700;color:#DA291C}.product-card__installments{font-size:0.75rem;color:#666666}.product-card__regular-price{margin:0;font-size:0.75rem;color:#666666}.product-card__description{margin:0.5rem 0 0;font-size:0.75rem;color:#666666;line-height:1.4}@media (max-width: 767px){.product-card__description{display:none}}.product-card__processing{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.8);display:flex;align-items:center;justify-content:center}.product-card__spinner{width:32px;height:32px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.product-card__footer{border-top:1px solid #E5E5E5;padding:0.75rem 1rem;margin-top:auto}.product-card__footer-text{margin:0;font-size:0.75rem;color:#666666;text-align:left;line-height:1.4}.unavailable-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;animation:fadeIn 0.2s ease-out}.unavailable-modal{background:#FFFFFF;border-radius:16px;padding:2rem;max-width:400px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0, 0, 0, 0.2);animation:modalSlideIn 0.3s ease-out}.unavailable-modal__icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;margin:0 auto 1rem;background:#FFF3CD;border-radius:50%}.unavailable-modal__icon svg{width:32px;height:32px;color:#856404}.unavailable-modal__title{margin:0 0 0.75rem;font-size:20px;font-weight:700;color:#333333}.unavailable-modal__message{margin:0 0 1.5rem;font-size:1rem;color:#666666;line-height:1.5}.unavailable-modal__button{padding:0.75rem 2rem;background:#DA291C;color:#FFFFFF;border:none;border-radius:30px;font-size:1rem;font-weight:700;cursor:pointer;transition:background 150ms ease;min-width:160px}.unavailable-modal__button:hover{background:rgb(181.843902439, 34.2, 23.356097561)}@keyframes spin{to{transform:rotate(360deg)}}@keyframes modalSlideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`;

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
    // Products from catalogue
    products = [];
    isLoading = true;
    error = null;
    // Product details cache (loaded in parallel)
    productsWithDetails = new Map();
    loadingDetails = new Set();
    // Selection state
    selectedProduct = null;
    selectedProductDetail = null;
    isAddingToCart = false;
    // Unavailable modal
    showUnavailableModal = false;
    // Summary bar data
    summaryData = null;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        // isLoading is already true by default, so loader will show immediately
    }
    componentDidLoad() {
        // Load products after component renders
        this.loadProducts();
    }
    // ------------------------------------------
    // DATA LOADING METHODS
    // ------------------------------------------
    /**
     * Loads products from catalogue API
     * Uses "Internet Inalámbrico" filter by default
     */
    async loadProducts() {
        this.isLoading = true;
        this.error = null;
        try {
            // Default to "Internet Inalámbrico" subcatalog
            const subcatalogId = catalogueService.FILTER_INTERNET_INALAMBRICO;
            const response = await catalogueService.listCatalogue(subcatalogId, 1, '');
            this.products = response.products || [];
            // After loading products, load details for visible ones
            if (this.products.length > 0) {
                await this.loadProductsDetails(this.products);
            }
        }
        catch (err) {
            console.error('[StepCatalogue] Error loading products:', err);
            this.error = 'Error al cargar el catálogo de productos';
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Loads product details in parallel for faster UX
     * @param products - Products to load details for
     */
    async loadProductsDetails(products) {
        // Load details for first 6 products in parallel
        const productsToLoad = products.slice(0, 6);
        const detailPromises = productsToLoad.map(async (product) => {
            // Skip if already loaded
            if (this.productsWithDetails.has(product.productId)) {
                return;
            }
            // Mark as loading
            this.loadingDetails = new Set([...this.loadingDetails, product.productId]);
            try {
                const response = await productService.getEquipmentDetail(product.productId);
                if (!response.hasError && response.product) {
                    const newMap = new Map(this.productsWithDetails);
                    newMap.set(product.productId, response.product);
                    this.productsWithDetails = newMap;
                }
            }
            catch (err) {
                console.error(`[StepCatalogue] Error loading details for ${product.productId}:`, err);
            }
            finally {
                const newSet = new Set(this.loadingDetails);
                newSet.delete(product.productId);
                this.loadingDetails = newSet;
            }
        });
        await Promise.allSettled(detailPromises);
    }
    // ------------------------------------------
    // SELECTION & CART METHODS
    // ------------------------------------------
    /**
     * Handles product selection
     * - Loads details if not cached
     * - Updates summary bar
     * - Calls addToCart API
     */
    handleSelectProduct = async (product) => {
        // If clicking the same product, do nothing
        if (this.selectedProduct?.productId === product.productId) {
            return;
        }
        this.isAddingToCart = true;
        this.error = null;
        try {
            // Get product detail (from cache or API)
            let productDetail = this.productsWithDetails.get(product.productId);
            if (!productDetail) {
                // Load detail on demand
                console.log('[StepCatalogue] Loading detail for:', product.productId);
                const response = await productService.getEquipmentDetail(product.productId);
                if (response.hasError || !response.product) {
                    throw new Error('Error al cargar detalles del producto');
                }
                productDetail = response.product;
                // Cache it
                const newMap = new Map(this.productsWithDetails);
                newMap.set(product.productId, productDetail);
                this.productsWithDetails = newMap;
            }
            // Check availability BEFORE proceeding (stock must be > 1)
            const ENTRY_BARRIER = 1;
            if (productDetail.stock === undefined || productDetail.stock <= ENTRY_BARRIER) {
                console.log('[StepCatalogue] Product unavailable, stock:', productDetail.stock);
                this.showUnavailableModal = true;
                this.isAddingToCart = false;
                return;
            }
            // Update selection
            this.selectedProduct = product;
            this.selectedProductDetail = productDetail;
            // Update summary bar
            this.updateSummaryData(product, productDetail);
            // Store product in session for next steps
            const subcatalogId = parseInt(catalogueService.FILTER_INTERNET_INALAMBRICO, 10);
            catalogueService.storeProductInSession(product);
            productService.storeSelectedProduct(product, subcatalogId);
            // Add to cart
            console.log('[StepCatalogue] Adding to cart:', product.productName);
            const cartResponse = await cartService.addToCart(productDetail, product.installments || 24, 1);
            if (cartResponse.hasError) {
                console.error('[StepCatalogue] Cart error:', cartResponse.message);
                // Still allow selection even if cart fails
            }
            else {
                console.log('[StepCatalogue] Added to cart, mainId:', cartResponse.code);
            }
        }
        catch (err) {
            console.error('[StepCatalogue] Selection error:', err);
            this.error = 'Error al seleccionar el producto. Por favor intente de nuevo.';
        }
        finally {
            this.isAddingToCart = false;
        }
    };
    /**
     * Updates the summary bar data based on selected product
     */
    updateSummaryData(product, detail) {
        // Calculate "Paga hoy" = regular_price (down payment + any initial costs)
        const payToday = product.regular_price || detail.decDownPayment || 0;
        this.summaryData = {
            productName: product.productName,
            planPrice: 0, // Will be set in step-plans
            svaPrice: 0, // No SVA at this point
            equipmentPrice: product.update_price || 0, // Monthly equipment payment
            payToday: payToday,
        };
    }
    /**
     * Handles continue button click
     * Proceeds to step-plans
     */
    handleContinue = () => {
        if (this.selectedProduct && !this.isAddingToCart) {
            this.onNext?.();
        }
    };
    /**
     * Closes the unavailable product modal
     */
    handleCloseUnavailableModal = () => {
        this.showUnavailableModal = false;
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    /**
     * Renders the unavailable product modal
     */
    renderUnavailableModal() {
        if (!this.showUnavailableModal) {
            return null;
        }
        return (h("div", { class: "unavailable-modal-overlay", onClick: this.handleCloseUnavailableModal }, h("div", { class: "unavailable-modal", onClick: (e) => e.stopPropagation() }, h("div", { class: "unavailable-modal__icon" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { cx: "12", cy: "12", r: "10" }), h("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }))), h("h3", { class: "unavailable-modal__title" }, "Producto no disponible"), h("p", { class: "unavailable-modal__message" }, "Lo sentimos, este producto no est\u00E1 disponible en este momento. Por favor, seleccione otro equipo."), h("button", { class: "unavailable-modal__button", onClick: this.handleCloseUnavailableModal }, "Entendido"))));
    }
    /**
     * Renders a product card for the carousel
     */
    renderProductCard(product) {
        const isSelected = this.selectedProduct?.productId === product.productId;
        const isLoadingDetail = this.loadingDetails.has(product.productId);
        const isProcessing = this.isAddingToCart && isSelected;
        return (h("div", { class: {
                'product-card': true,
                'product-card--selected': isSelected,
                'product-card--loading': isLoadingDetail,
            }, onClick: () => !this.isAddingToCart && this.handleSelectProduct(product) }, h("div", { class: "product-card__content" }, h("div", { class: "product-card__image" }, h("img", { src: product.imgUrl, alt: product.productName, loading: "lazy" })), h("div", { class: "product-card__info" }, h("h3", { class: "product-card__name" }, product.productName), product.installments > 0 && (h("div", { class: "product-card__financed" }, h("span", { class: "product-card__financed-label" }, "Financiado"), h("span", { class: "product-card__financed-price" }, formatPrice(product.update_price || 0), "/mes"), h("span", { class: "product-card__installments" }, product.installments, " plazos"))), h("p", { class: "product-card__regular-price" }, "Precio regular: ", formatPrice(product.regular_price || 0)))), h("div", { class: "product-card__footer" }, h("p", { class: "product-card__footer-text" }, "\u00A1Mantente conectado en todo momento!")), isProcessing && (h("div", { class: "product-card__processing" }, h("div", { class: "product-card__spinner" })))));
    }
    /**
     * Renders the summary bar footer
     */
    renderSummaryBar() {
        const productName = this.summaryData?.productName || '-';
        const planPrice = this.summaryData?.planPrice || 0;
        const svaPrice = this.summaryData?.svaPrice || 0;
        const equipmentPrice = this.summaryData?.equipmentPrice || 0;
        const payToday = this.summaryData?.payToday || 0;
        return (h("footer", { class: "step-catalogue__summary-bar" }, h("div", { class: "step-catalogue__summary-content" }, h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "PCD"), h("span", { class: "step-catalogue__summary-value" }, productName)), h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "Plan"), h("span", { class: "step-catalogue__summary-value" }, formatPrice(planPrice), " / mes")), h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "SVA"), h("span", { class: "step-catalogue__summary-value" }, formatPrice(svaPrice), " / mes")), h("div", { class: "step-catalogue__summary-item" }, h("span", { class: "step-catalogue__summary-label" }, "Equipo / Accesorio"), h("span", { class: "step-catalogue__summary-value" }, formatPrice(equipmentPrice), " / mes")), h("div", { class: "step-catalogue__summary-item step-catalogue__summary-item--highlight" }, h("span", { class: "step-catalogue__summary-label" }, "Paga hoy"), h("span", { class: "step-catalogue__summary-value step-catalogue__summary-value--red" }, formatPrice(payToday), " + IVU"))), h("button", { class: {
                'step-catalogue__continue-btn': true,
                'step-catalogue__continue-btn--disabled': !this.selectedProduct || this.isAddingToCart,
            }, onClick: this.handleContinue, disabled: !this.selectedProduct || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: '2b2178714bf18ddc2ba4f740f02a497f0fc48cd3' }, h("div", { key: '4f0911c50ecf8ca8ddc684bc929b6e060ffee845', class: "step-catalogue" }, h("header", { key: 'b07d68d064922ec0865b0979bdc6d5089f99a32c', class: "step-catalogue__header" }, h("button", { key: 'f25d525aad09fc9a035eb392a15b0daf93660933', class: "step-catalogue__back-link", onClick: this.onBack }, h("svg", { key: 'b70e76e40ad960548eacc463843c74c691c8f83b', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '9dd0933e00919947e9ff88a3a357b44a9c84df21', points: "15 18 9 12 15 6" })), h("span", { key: 'bfbed9c9e07a1af489b32b1f879c72658ea06aa3' }, "Regresar")), h("h1", { key: 'b34ef77b46519546c79805005bb993d603611f1f', class: "step-catalogue__title" }, "Escoger modem para servicio fijo"), h("div", { key: 'efa87d6abfee8c5bdf9c9e6939cd780c9e361d9c', class: "step-catalogue__divider" })), this.isLoading && (h("div", { key: '0b1f7eae78137f06b40c9a21963966609228163f', class: "step-catalogue__loading" }, h("div", { key: '3ee83aee91e59f653df07a6cf7a6bc4c2204b8bc', class: "step-catalogue__spinner" }), h("p", { key: 'c2f831a70c458d6fbbc42f8c3d53e9ca31fa7639' }, "Cargando productos..."))), this.error && !this.isLoading && (h("div", { key: '07542ca156af5ff975beeb2442e6e8bf89d4ebeb', class: "step-catalogue__error" }, h("p", { key: '0900d3a0bef57fe7a15c7a44eefa9313e72b1d8a' }, this.error), h("button", { key: 'c4a2fd0a2f495364206eb770d6124a017246abca', onClick: () => this.loadProducts() }, "Reintentar"))), !this.isLoading && !this.error && this.products.length > 0 && (h("div", { key: 'daddeff0755c68c6770e39e1aeb021d1c453cd2a', class: "step-catalogue__carousel-container" }, h("ui-carousel", { key: '4cc8bb014d046c04722ae0d9afb36db54d4a0047', totalItems: this.products.length, gap: 24, showNavigation: false, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 600, slidesPerView: 2 },
                { minWidth: 900, slidesPerView: 3 },
            ] }, this.products.map((product) => this.renderProductCard(product))))), !this.isLoading && !this.error && this.products.length === 0 && (h("div", { key: '1c3584c9a7aeb3604e8dfb97aebf4dd76a12db8c', class: "step-catalogue__empty" }, h("p", { key: 'fe9abd7e12b80df5d3eecf6ab423faca88c01664' }, "No hay productos disponibles en este momento."))), this.renderSummaryBar(), this.renderUnavailableModal())));
    }
};
StepCatalogue.style = stepCatalogueCss();

const stepConfirmationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-confirmation{width:100%}.step-confirmation__header{margin-bottom:1.5rem;padding-bottom:1rem;position:relative}.step-confirmation__header::after{content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:100vw;height:1px;background:#E5E5E5}.step-confirmation__header-title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-confirmation__content{background-color:#FFFFFF;border:1px solid #E5E5E5;border-radius:0.75rem;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);transition:box-shadow 150ms ease, border-color 150ms ease;padding:3rem 2rem;text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading{display:flex;flex-direction:column;align-items:center;justify-content:center}.step-confirmation__loading p{margin-top:1rem;font-size:1rem;font-weight:400;line-height:1.5;color:#666666}.step-confirmation__spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-confirmation__result{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:500px}.step-confirmation__icon{display:flex;align-items:center;justify-content:center;margin-bottom:1rem}.step-confirmation__icon img{width:48px;height:48px}.step-confirmation__icon svg{width:40px;height:40px}.step-confirmation__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;margin-bottom:0.5rem}.step-confirmation__title--success{color:#15A045}.step-confirmation__title--error{color:#E00814}.step-confirmation__message{font-size:1rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem}.step-confirmation__order-id{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0.5rem 1rem;background:#FAFAFA;border-radius:0.5rem}.step-confirmation__actions{margin-top:1.5rem;text-align:center}.step-confirmation__btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-confirmation__btn:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-confirmation__btn:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-confirmation__btn{min-width:180px}.step-confirmation__btn--error{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-confirmation__btn--error:disabled{opacity:0.5;cursor:not-allowed}.step-confirmation__btn--error{height:48px;background-color:#DA291C;color:#FFFFFF}.step-confirmation__btn--error:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-confirmation__btn--error:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}@keyframes spin{to{transform:rotate(360deg)}}`;

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
        return (h("div", { class: "step-confirmation__result step-confirmation__result--success" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--success" }, h("svg", { width: "49", height: "48", viewBox: "0 0 49 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M24.4237 2C12.0492 2 2 11.8441 2 23.9661C2 36.0881 12.0492 45.9322 24.4237 45.9322C36.7983 45.9322 46.8475 36.0881 46.8475 23.9661", stroke: "#0EA651", "stroke-width": "4", "stroke-miterlimit": "10", "stroke-linecap": "round", "stroke-linejoin": "round" }), h("path", { d: "M44.5225 4.19666L21.1852 30.8L12.3818 22.2577", stroke: "#0EA651", "stroke-width": "4", "stroke-miterlimit": "10", "stroke-linecap": "round", "stroke-linejoin": "round" }))), h("h2", { class: "step-confirmation__title step-confirmation__title--success" }, SUCCESS_MESSAGES.REQUEST_SUCCESS), h("p", { class: "step-confirmation__message" }, SUCCESS_MESSAGES.REQUEST_SUCCESS_SUBTITLE), displayOrderId && (h("p", { class: "step-confirmation__order-id" }, "N\u00FAmero de orden: ", displayOrderId)), this.confirmationSent && (h("p", { class: "step-confirmation__email-sent" }, "Se ha enviado un correo de confirmaci\u00F3n a tu email."))));
    }
    renderError() {
        return (h("div", { class: "step-confirmation__result step-confirmation__result--error" }, h("div", { class: "step-confirmation__icon step-confirmation__icon--error" }, h("svg", { width: "49", height: "49", viewBox: "0 0 49 49", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M24.5 0C38.0096 9.05167e-07 49 10.9899 49 24.5C49 38.0101 38.0096 49 24.5 49C10.9904 49 0 38.0101 0 24.5C0 10.9899 10.99 0 24.5 0ZM24.5 3.78516C13.0775 3.78516 3.78418 13.0774 3.78418 24.5C3.78418 35.9215 13.0774 45.2148 24.5 45.2148C35.9225 45.2148 45.2158 35.922 45.2158 24.5C45.2158 13.078 35.9225 3.78516 24.5 3.78516ZM24.5 31.8809C25.5449 31.8809 26.3915 32.7276 26.3916 33.7725V35.3486C26.3916 36.3936 25.5449 37.2412 24.5 37.2412C23.4551 37.2412 22.6084 36.3936 22.6084 35.3486V33.7725C22.6085 32.7276 23.4551 31.8809 24.5 31.8809ZM24.5 11.7588C25.5449 11.7588 26.3915 12.6055 26.3916 13.6504V27.7725C26.3916 28.8174 25.5449 29.6641 24.5 29.6641C23.4551 29.6641 22.6084 28.8174 22.6084 27.7725V13.6504C22.6085 12.6055 23.4551 11.7588 24.5 11.7588Z", fill: "#B41E13" }))), h("h2", { class: "step-confirmation__title step-confirmation__title--error" }, "\u00A1Lo sentimos, ha ocurrido un error en el proceso de solicitud!"), h("p", { class: "step-confirmation__message" }, "En este momento estamos presentando inconvenientes en nuestro sistema.", h("br", null), "Por favor, int\u00E9ntalo nuevamente.")));
    }
    render() {
        return (h(Host, { key: '449778ed0f375ee034a3df3b8b6e8f533f8cb0db' }, h("div", { key: 'a1bdb548476effe70f6f35b72fe1b6e5b8d1baf3', class: "step-confirmation" }, h("header", { key: '45ea030ea6ed2731d6c4b9e6f5da0f6396a77740', class: "step-confirmation__header" }, h("h1", { key: '1c79e21c0f27fc6bdd26f107a6f8a40956804b68', class: "step-confirmation__header-title" }, "Confirmaci\u00F3n de Solicitud")), h("div", { key: 'd772325d6bb91350a9004def2044985a9c222ca9', class: "step-confirmation__content" }, this.status === 'loading' && this.renderLoading(), this.status === 'success' && this.renderSuccess(), this.status === 'error' && this.renderError()), this.status === 'success' && (h("div", { key: '723bb7a27e30753b5b886630094e0bc9524d69fa', class: "step-confirmation__actions" }, h("button", { key: '49ddcbb3a848dc86c575bc58f16570fede2dd478', class: "step-confirmation__btn", onClick: this.handleClose }, "Cerrar"))), this.status === 'error' && (h("div", { key: '8660a2a85187276b0b530844bf96d03c3b6e6414', class: "step-confirmation__actions" }, h("button", { key: '633987a833750a44047650b84c47168cfbad0a04', class: "step-confirmation__btn step-confirmation__btn--error", onClick: this.handleRetry }, "Volver a intentar"))))));
    }
};
StepConfirmation.style = stepConfirmationCss();

const stepContractCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-contract{width:100%}.step-contract__header{width:100%;background:#FFFFFF;padding:1rem 0;box-sizing:border-box}@media (max-width: 767px){.step-contract__header{padding:0.75rem 0}}.step-contract__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-contract__back-link svg{width:20px;height:20px}.step-contract__back-link:hover{opacity:0.8}.step-contract__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-contract__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-contract__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-contract__divider{margin:0 -1rem}}.step-contract__tabs{display:flex;margin-bottom:1.5rem;background:#FFFFFF;border-radius:0 0 0.75rem 0.75rem;box-shadow:0 2px 4px rgba(0, 0, 0, 0.08);overflow:hidden}.step-contract__tab{flex:1;padding:1.25rem 1rem;background:transparent;border:none;cursor:pointer;text-align:center;position:relative;transition:all 150ms ease}.step-contract__tab:first-child{border-right:1px solid #E5E5E5}.step-contract__tab::after{content:"";position:absolute;bottom:0;left:0;right:0;height:4px;background:transparent;transition:background-color 150ms ease}.step-contract__tab--active::after{background:#0097A9}.step-contract__tab:hover:not(.step-contract__tab--active){background:#FAFAFA}.step-contract__tab-title{display:block;font-size:1rem;font-weight:700;color:#333333;margin-bottom:0.25rem}.step-contract__tab-subtitle{display:block;font-size:0.875rem;color:#666666;line-height:1.5}.step-contract__options{display:flex;flex-direction:column;gap:1rem;align-items:center}@media (min-width: 768px){.step-contract__options{flex-direction:row;justify-content:center}}.step-contract__options--single{justify-content:center}.step-contract__option{flex:0 0 auto;width:280px;display:flex;align-items:center;padding:1rem 1.25rem;background:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.75rem;cursor:pointer;transition:all 150ms ease;position:relative;overflow:hidden}@media (max-width: 767px){.step-contract__option{width:100%;max-width:320px}}.step-contract__option::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#CCCCCC;border-radius:0.75rem 0 0 0.75rem;transition:background-color 150ms ease}.step-contract__option input[type=radio]{width:20px;height:20px;margin-right:0.75rem;accent-color:#0097A9;flex-shrink:0}.step-contract__option:hover{border-color:#999999}.step-contract__option--selected::before{background:#0097A9}.step-contract__option-content{flex:1;display:flex;flex-direction:column;gap:0.25rem}.step-contract__option-title{display:block;font-size:1rem;font-weight:600;color:#333333;line-height:1.35}.step-contract__option-price{display:block;font-size:0.875rem;color:#666666}.step-contract__option-price strong,.step-contract__option-price b{font-weight:600}.step-contract__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-contract__btn-continue{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-contract__btn-continue:disabled{opacity:0.5;cursor:not-allowed}.step-contract__btn-continue{height:48px;background-color:#DA291C;color:#FFFFFF}.step-contract__btn-continue:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-contract__btn-continue:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-contract__btn-continue{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-contract__btn-continue:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-contract__btn-continue:disabled:hover{background-color:#999999;border-color:#999999}.step-contract__btn-back-mobile{display:none;width:100%;margin-top:1rem;padding:0.5rem;background:transparent;border:none;color:#0097A9;font-size:1rem;cursor:pointer;text-decoration:none;text-align:center}.step-contract__btn-back-mobile:hover{text-decoration:underline}@media (max-width: 767px){.step-contract{padding:0 1rem}.step-contract__tabs{margin-bottom:1rem}.step-contract__tab{padding:0.75rem 0.5rem}.step-contract__tab-title{font-size:0.875rem}.step-contract__tab-subtitle{font-size:0.75rem;line-height:1.35}.step-contract__options{padding:0}.step-contract__option{width:100%;max-width:none}.step-contract__actions{margin-top:1rem;padding-top:1rem}.step-contract__btn-continue{width:100%;min-width:auto}.step-contract__btn-back-mobile{display:none}}`;

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
        return (h(Host, { key: '2f9c47b6c246b9276582b054d4acd5b5b93d120b' }, h("div", { key: '5b1aeb54cb7a37e15c577c024eac0f55c15304ad', class: "step-contract" }, h("header", { key: '8124ea48b7f4b7275506d5eb641fcdce708b6c53', class: "step-contract__header" }, h("button", { key: '138d75285752b27f2f9e662d39375ac9bc193050', class: "step-contract__back-link", onClick: this.onBack }, h("svg", { key: 'f28c0e80865b2a51790c673fa7942dd897cc2441', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '9e3dbb79939c6c0bc29d70eb1da75f17ab36abb4', points: "15 18 9 12 15 6" })), h("span", { key: 'cec0ed519992936daa1dcf6dcd61bf5da2954ccd' }, "Regresar")), h("h1", { key: '2d1c112d4c5e095717c75fab9bf1636220326aa2', class: "step-contract__title" }, "Selecciona un tipo de contrato"), h("div", { key: '15bfa6bca6b65dd8c594adeb91bd6d8e8bd24c26', class: "step-contract__divider" })), h("div", { key: 'b3a66f3ae45e8083dcbf5582d210860bbc8b4633', class: "step-contract__tabs" }, h("button", { key: '8d854b7de5b09a69114ca120df8b63ee207adb94', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 1,
            }, onClick: () => this.handleTabChange(1) }, h("span", { key: '34a87eebe3a6ea8cbeb78e4a837678ac2ee95688', class: "step-contract__tab-title" }, "Con contrato"), h("span", { key: 'bcc3e9b40f4dab3e24ef58e4003dd7faceaf071f', class: "step-contract__tab-subtitle" }, "12 y 24 meses de contrato")), h("button", { key: '9864095499d6c08890a6c4515cf12c40a2967d2f', class: {
                'step-contract__tab': true,
                'step-contract__tab--active': this.activeTab === 0,
            }, onClick: () => this.handleTabChange(0) }, h("span", { key: '1a4c205a92d04fc91c94b23275be60b44928483e', class: "step-contract__tab-title" }, "Sin contrato"), h("span", { key: '8665ee734b582701bd7cf1ee2a9c4f1977c508c5', class: "step-contract__tab-subtitle" }, "Plan mensual con pago por adelantado"))), h("div", { key: 'ac54bf034d79f713ea0c41586925d68515e60b55', class: "step-contract__content" }, this.activeTab === 1 && withContract && (h("div", { key: '9ee6ddd69a8ff11ad53042d57038869f2e535319', class: "step-contract__options" }, withContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.deadlines === option.deadlines &&
                        this.selectedOption?.typeId === 1,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.deadlines === option.deadlines &&
                    this.selectedOption?.typeId === 1, onChange: () => this.handleSelectOption(1, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, this.formatContractLabel(option.deadlines)), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", totalCost > 0 ? formatPrice(totalCost) : '$0.00'))));
        }))), this.activeTab === 0 && withoutContract && (h("div", { key: '4ee8ead6d43fb11e43334d819f3a2472724d17ac', class: "step-contract__options step-contract__options--single" }, withoutContract.contract.map((option) => {
            const totalCost = this.getTotalInstallationCost(option);
            return (h("label", { class: {
                    'step-contract__option': true,
                    'step-contract__option--selected': this.selectedOption?.typeId === 0,
                } }, h("input", { type: "radio", name: "contract", checked: this.selectedOption?.typeId === 0, onChange: () => this.handleSelectOption(0, option) }), h("div", { class: "step-contract__option-content" }, h("span", { class: "step-contract__option-title" }, "Sin contrato"), h("span", { class: "step-contract__option-price" }, "Instalaci\u00F3n: ", formatPrice(totalCost)))));
        })))), h("div", { key: '1e67eac597810d31136d1ae7fbd373fa52fdeb52', class: "step-contract__actions" }, h("button", { key: '3a99d0c5e08de4e256b0e3827ddf79299199347e', class: "step-contract__btn-continue", onClick: this.handleContinue, disabled: !this.selectedOption }, "Continuar")))));
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

const stepFormCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-form{width:100%;max-width:1100px;margin:0 auto;padding:0 1.5rem}@media (min-width: 768px){.step-form{padding:0 2rem}}.step-form__header{width:100%;background:#FFFFFF;padding:1rem 0;box-sizing:border-box}@media (max-width: 767px){.step-form__header{padding:0.75rem 0}}.step-form__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-form__back-link svg{width:20px;height:20px}.step-form__back-link:hover{opacity:0.8}.step-form__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-form__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-form__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-form__divider{margin:0 -1rem}}.step-form__stepper{display:none;margin-bottom:1.5rem;padding:1rem 0}@media (max-width: 767px){.step-form__stepper{display:block}}.step-form form{border:1px solid #E5E5E5;border-radius:0.75rem;padding:1.5rem;background:white}@media (min-width: 768px){.step-form form{padding:2rem 2.5rem}}.step-form__instructions{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0;background:transparent}.step-form__section{margin-bottom:1.5rem;padding-bottom:0.5rem}.step-form__row{display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1rem}@media (min-width: 768px){.step-form__row{grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.25rem}}.step-form__row:last-child{margin-bottom:0}.step-form__field{display:flex;flex-direction:column}@media (min-width: 768px){.step-form__field--id{grid-column:span 1}}.step-form__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.step-form__label .required{color:#DA291C}.step-form__required{color:#333333;margin-right:0.25rem}.step-form__input{width:100%;height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease}.step-form__input::placeholder{color:#999999}.step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__input:disabled{background-color:#F5F5F5;cursor:not-allowed}.step-form__input.error{border-color:#DA291C}.step-form__input.error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__input--error{border-color:#DA291C}.step-form__input--error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__error{margin-top:0.25rem;font-size:0.75rem;color:#DA291C}.step-form__id-row{display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 768px){.step-form__id-row{flex-direction:row;align-items:flex-start}.step-form__id-row input[type=text].step-form__input{flex:1}}.step-form__id-row input[type=text].step-form__input{margin-top:4px;width:100%;height:44px;min-height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;box-sizing:border-box;appearance:none;-webkit-appearance:none}.step-form__id-row input[type=text].step-form__input::placeholder{color:#999999}.step-form__id-row input[type=text].step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__radio-group{display:flex;flex-direction:row;align-items:flex-start;gap:1rem}.step-form__radio-group--horizontal{flex-direction:row;gap:1rem}.step-form__radio{display:flex;align-items:flex-start;gap:0.25rem;font-size:0.875rem;font-weight:400;line-height:1.5;color:#333333;cursor:pointer;max-width:90px;line-height:1.2;margin-top:14px}.step-form__radio input[type=radio]{accent-color:#0097A9;margin-top:2px;flex-shrink:0}.step-form__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-form__btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-submit:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-submit{height:48px;background-color:#DA291C;color:#FFFFFF}.step-form__btn-submit:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-form__btn-submit:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-form__btn-submit{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-form__btn-submit:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-form__btn-submit:disabled:hover{background-color:#999999;border-color:#999999}@media (max-width: 767px){.step-form__btn-submit{width:100%;min-width:auto}}.step-form__btn-back-mobile{display:none;width:100%;margin-top:1rem;padding:0.5rem;background:transparent;border:none;color:#0097A9;font-size:1rem;cursor:pointer;text-decoration:none;text-align:center}.step-form__btn-back-mobile:hover{text-decoration:underline}@media (max-width: 767px){.step-form form{padding:1rem}.step-form__instructions{font-size:0.875rem}.step-form__row{grid-template-columns:1fr}.step-form__id-row{flex-direction:column;gap:0.75rem}.step-form__id-row .step-form__input{width:100%;margin-top:0}.step-form__actions{padding-top:1rem;margin-top:1rem}.step-form__btn-back-mobile{display:none}}`;

// Mobile breakpoint (matches $breakpoint-md in variables.scss)
const MOBILE_BREAKPOINT = 768;
// Steps configuration for ui-stepper
const FORM_STEPS = [
    { label: 'Identificación' },
    { label: 'Contacto' },
];
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
        return (h("div", { class: "step-form__field" }, h("label", { class: "step-form__label" }, required && h("span", { class: "step-form__required" }, "*"), label, ":"), h("input", { type: type, class: { 'step-form__input': true, 'step-form__input--error': !!hasError }, value: displayValue, placeholder: placeholder, disabled: disabled, onInput: this.handleInput(section, field) }), hasError && h("span", { class: "step-form__error" }, this.errors[field])));
    }
    // ------------------------------------------
    // SECTION RENDERERS
    // ------------------------------------------
    /** Render identification section (mobile step 1) */
    renderIdentificationSection() {
        return (h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
            placeholder: 'Ingrese nombre',
            required: true,
        }), this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
            placeholder: 'Ingrese segundo nombre (Opcional)',
        })), h("div", { class: "step-form__row" }, this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
            placeholder: 'Ingrese apellido',
            required: true,
        }), this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
            placeholder: 'Ingrese segundo apellido',
            required: true,
        })), h("div", { class: "step-form__row" }, h("div", { class: "step-form__field step-form__field--id" }, h("label", { class: "step-form__label" }, h("span", { class: "step-form__required" }, "*"), "Identificaci\u00F3n:"), h("div", { class: "step-form__id-row" }, h("div", { class: "step-form__radio-group" }, h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'license', onChange: () => this.handleRadioChange('identificationType', 'license') }), "Licencia de conducir"), h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'passport', onChange: () => this.handleRadioChange('identificationType', 'passport') }), "Pasaporte")), h("input", { type: "text", class: { 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }, value: this.formData.personal.identificationNumber, placeholder: "Ingrese nro de identificaci\u00F3n", onInput: this.handleInput('personal', 'identificationNumber') })), this.touched['identificationNumber'] && this.errors['identificationNumber'] && (h("span", { class: "step-form__error" }, this.errors['identificationNumber']))), this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
            type: 'date',
            required: true,
        }))));
    }
    /** Render contact section (mobile step 2) */
    renderContactSection() {
        return [
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
                type: 'tel',
                placeholder: 'Ingrese nro de teléfono',
                required: true,
            }), this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
                type: 'tel',
                placeholder: 'Ingrese nro de teléfono',
            }))),
            /* Business Information */
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Nombre legal de Empresa (según IRS)', 'businessName', 'business', this.formData.business.businessName, {
                placeholder: 'Ingresar nombre legal de empresa',
                required: true,
            }), this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
                placeholder: 'Ingrese posición actual',
                required: true,
            }))),
            /* Address */
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
                placeholder: 'Ingrese dirección',
                required: true,
            }), this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
                placeholder: 'Ingrese ciudad',
                required: true,
            })), h("div", { class: "step-form__row" }, this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
                placeholder: 'Ingrese código postal',
                required: true,
            }), this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
                type: 'email',
                placeholder: 'Ingrese correo electrónico',
                required: true,
            }))),
            /* Existing Customer */
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__field" }, h("label", { class: "step-form__label" }, h("span", { class: "step-form__required" }, "*"), "Cliente existente de Claro PR:"), h("div", { class: "step-form__radio-group step-form__radio-group--horizontal" }, h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === true, onChange: () => this.handleRadioChange('isExistingCustomer', true) }), "S\u00ED"), h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === false, onChange: () => this.handleRadioChange('isExistingCustomer', false) }), "No")))),
        ];
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const currentStepNumber = this.getCurrentStepNumber();
        return (h(Host, { key: '052a17c0714cde57a903b9101514376f3b2d3512' }, h("div", { key: 'feb6abb25ea09b5e8c1fe352de0bb09cf9844c22', class: "step-form" }, h("header", { key: '7368db5e199f05b74ffef1aad5b6af2755c97d4b', class: "step-form__header" }, h("button", { key: '3754d869f636700320f388f6454d936b324099bb', type: "button", class: "step-form__back-link", onClick: this.handleBack }, h("svg", { key: 'a8d9dd2906d47801c6072c410f17622afe6d75b0', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'cde115fd0288b6e23fbaf2029ef59313d9dae969', points: "15 18 9 12 15 6" })), h("span", { key: '9ace2f7b98003ea34671e95b66fe901fc0cce127' }, "Regresar")), h("h1", { key: '00af145de0cfb2340e1e4fc690f63d60032896e7', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), h("div", { key: 'e4416415e9d1db86242194cd62364a04a92f34c7', class: "step-form__divider" })), this.isMobile && (h("div", { key: '0c522c33e3b51c45b621b6f177690ef23a06abb5', class: "step-form__stepper" }, h("ui-stepper", { key: '9e3e1d3f51c2f7628d8a5e82bdd62ce36a86e7f7', steps: FORM_STEPS, currentStep: currentStepNumber }))), h("form", { key: 'b68783bd19a1ebe5eaf1de5123c1d308bbe27e73', onSubmit: this.handleSubmit }, h("p", { key: 'eecb49ec1edb1495f5dc076878ff279949de8017', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), !this.isMobile && ([
            this.renderIdentificationSection(),
            ...this.renderContactSection(),
        ]), this.isMobile && this.currentSection === 'identification' && (this.renderIdentificationSection()), this.isMobile && this.currentSection === 'contact' && (this.renderContactSection()), h("div", { key: 'f02f79569143c69bc842f3704d4f028893b85513', class: "step-form__actions" }, h("button", { key: '46f2d379c4ac03714fe207704521ef6699bc8276', type: "submit", class: "step-form__btn-submit", disabled: !this.isCurrentSectionValid() }, "Continuar"))))));
    }
};
StepForm.style = stepFormCss();

const stepLocationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-location{width:100%;position:relative}.step-location__validating-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.9);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn 0.2s ease-out}.step-location__validating-content{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem;background:#FFFFFF;border-radius:16px;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__validating-spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}.step-location__validating-text{margin:0;font-size:18px;font-weight:600;color:#333333}.step-location__header{text-align:center;margin-bottom:1rem}.step-location__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;font-weight:400}.step-location__title--highlight{color:#DA291C;font-weight:700}.step-location__map-container{position:relative;border-radius:0.75rem;overflow:hidden;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08)}.step-location__controls{position:absolute;top:3.5rem;left:0.75rem;right:0.75rem;z-index:1;display:flex;flex-direction:column;gap:0}@media (min-width: 576px){.step-location__controls{left:120px;right:50px}}@media (min-width: 768px){.step-location__controls{top:3.5rem;left:130px;right:60px}}.step-location__input-group{display:flex;align-items:center;background:#FFFFFF;border-radius:10px 10px 0 0;overflow:hidden;border:1px solid #E5E5E5;border-bottom:none}.step-location__location-container{background:#FFFFFF;border-radius:0 0 10px 10px;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:0.2rem 0.75rem;border:1px solid #E5E5E5;border-top:1px solid #E5E5E5}.step-location__input-icon{display:flex;align-items:center;justify-content:center;padding-left:0.75rem;color:#999999}.step-location__input-icon svg{width:20px;height:20px}.step-location__input{flex:1;padding:0.75rem 0.75rem;border:none;font-size:0.875rem;outline:none;background:transparent;min-width:0}.step-location__input::placeholder{color:#999999}.step-location__btn-validate{padding:0.75rem 1.25rem;background:#DA291C;color:#FFFFFF;border:none;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background-color 150ms ease;white-space:nowrap;min-width:100px}.step-location__btn-validate:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-location__btn-validate:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-validate--loading{pointer-events:none}.step-location__btn-validate-content{display:inline-flex;align-items:center;gap:0.5rem}.step-location__btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:btn-spin 0.8s linear infinite}@keyframes btn-spin{to{transform:rotate(360deg)}}.step-location__btn-location{display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0;background:transparent;color:#0097A9;border:none;border-radius:0;font-size:0.75rem;font-weight:500;cursor:pointer;box-shadow:none;transition:opacity 150ms ease;white-space:nowrap;align-self:flex-start}.step-location__btn-location:hover:not(:disabled){opacity:0.8}.step-location__btn-location:disabled{opacity:0.5;cursor:not-allowed}.step-location__btn-location-icon{width:14px;height:14px}.step-location__map{position:relative;width:100%;height:400px;background:#E5E5E5}@media (min-width: 768px){.step-location__map{height:500px}}.step-location__map-canvas{width:100%;height:100%}.step-location__map-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5}.step-location__map-loading p{font-size:1rem;font-weight:400;line-height:1.5;margin-top:1rem}.step-location__map-error{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5;padding:1rem;text-align:center}.step-location__map-error p{font-size:1rem;font-weight:400;line-height:1.5;color:#DA291C}.step-location__map-error small{margin-top:0.5rem;font-size:0.75rem}.step-location__spinner{width:40px;height:40px;border:3px solid #CCCCCC;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-location__map-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:#666666}.step-location__map-placeholder p{font-size:1rem;font-weight:400;line-height:1.5}.step-location__map-placeholder small{margin-top:0.5rem;font-size:0.75rem}.step-location__modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);z-index:400;display:flex;align-items:center;justify-content:center}.step-location__modal{position:relative;width:90%;max-width:400px;background:#FFFFFF;border-radius:0.75rem;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__modal--error .step-location__modal-error-bar{display:block}.step-location__modal-close{position:absolute;top:0.75rem;right:0.75rem;width:32px;height:32px;background:transparent;border:none;font-size:1.5rem;color:#666666;cursor:pointer;line-height:1}.step-location__modal-close:hover{color:#333333}.step-location__modal-error-bar{display:none;background:#DA291C;color:#FFFFFF;padding:0.5rem 1rem;margin:-2rem -1.5rem 1rem;font-weight:600}.step-location__modal-success-icon{width:60px;height:60px;margin:0 auto 1rem;color:#44AF69}.step-location__modal-success-icon svg{width:100%;height:100%}.step-location__modal-message{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;margin-bottom:1.5rem}.step-location__modal-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-location__modal-btn:disabled{opacity:0.5;cursor:not-allowed}.step-location__modal-btn{height:48px;background-color:#0097A9;color:#FFFFFF}.step-location__modal-btn:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-location__modal-btn:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}.step-location__modal-btn{min-width:150px}`;

// Offset to shift the map view so marker appears lower (InfoWindow visible above search bar)
const MAP_VERTICAL_OFFSET = 150;
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
            // Update map marker with offset so InfoWindow appears below search bar
            mapsService.setMarker(result.coordinates, MAP_VERTICAL_OFFSET);
        }
        else {
            // If reverse geocode fails, still set coordinates
            this.currentCoordinates = coordinates;
            mapsService.setMarker(coordinates, MAP_VERTICAL_OFFSET);
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
                    // Update map with offset so InfoWindow appears below search bar
                    mapsService.setMarker(coords, MAP_VERTICAL_OFFSET);
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
            // Determine coverage result type
            if (location.isValid) {
                if (location.serviceType.toUpperCase() === 'CLARO HOGAR') {
                    // CLARO HOGAR - show "Fuera de área" with options
                    this.showCoverageInfoWindow(location.serviceMessage, 'claro-hogar');
                }
                else {
                    // GPON/VRAD - show success
                    this.showCoverageInfoWindow(location.serviceMessage, 'success');
                }
            }
            else if (location.serviceType === 'PR LIMIT') {
                // PR LIMIT - show out of range message (no continue option)
                this.showCoverageInfoWindow(location.serviceMessage, 'pr-limit');
            }
            else {
                // Generic no coverage error
                this.showCoverageInfoWindow(ERROR_MESSAGES.NO_COVERAGE, 'no-coverage');
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
     * Shows coverage result in InfoWindow on the marker
     * New design based on capturas 1.png and 2.png
     * @param message - The message to display
     * @param resultType - 'success' | 'claro-hogar' | 'pr-limit' | 'no-coverage'
     */
    showCoverageInfoWindow(message, resultType) {
        // SVG icon from covertura.svg (torre de transmisión con señal WiFi) - only for success
        const coverageIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.58325 19.5815L10.9873 4.5376" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M17.875 19.582L11.4707 4.53809" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M7.06067 14.8589L16.9086 18.3631" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M15.3981 14.8547L5.55017 18.3589" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M8.31006 11.8936L15.1257 14.3188" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M9.56519 8.60864L13.8695 11.4782" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M14.0804 11.8904L7.26477 14.3156" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M12.913 8.60864L8.60864 11.4782" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M11.2291 4.67082C11.8228 4.67082 12.3041 4.18951 12.3041 3.59579C12.3041 3.00206 11.8228 2.52075 11.2291 2.52075C10.6354 2.52075 10.1541 3.00206 10.1541 3.59579C10.1541 4.18951 10.6354 4.67082 11.2291 4.67082Z" fill="#FC4646" stroke="black" stroke-width="0.956522"/>
      <path d="M15.5457 5.24186C16.2939 4.22535 16.2939 2.70912 15.5457 1.69263" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M17.1342 6.11041C18.2923 4.62825 18.2923 2.32834 17.1342 0.846191" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M13.9615 4.3841C14.3 3.84461 14.3 3.10638 13.9615 2.56689" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M6.68811 5.24186C5.93984 4.22535 5.93984 2.70912 6.68811 1.69263" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M5.09949 6.11041C3.94132 4.62825 3.94132 2.32834 5.09949 0.846191" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M8.27209 4.3841C7.93361 3.84461 7.93361 3.10638 8.27209 2.56689" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
    </svg>`;
        // Configure content based on result type
        let titleHtml;
        let displayMessage;
        let buttonHtml;
        switch (resultType) {
            case 'success':
                // GPON/VRAD - Full coverage
                titleHtml = `<span style="flex-shrink: 0; margin-top: 2px;">${coverageIcon}</span>
           <span>¡Tu área posee nuestro servicio!</span>`;
                displayMessage = message;
                buttonHtml = `<button
          onclick="if(window.__infoWindowContinueCallback) window.__infoWindowContinueCallback();"
          style="
            background: #DA291C;
            color: #ffffff;
            border: none;
            padding: 12px 36px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            min-width: 150px;
          "
        >¡Lo quiero!</button>`;
                break;
            case 'claro-hogar':
                // CLARO HOGAR - Wireless internet option
                // TODO: Flujo CLARO HOGAR deshabilitado temporalmente. Restaurar cuando se habilite.
                titleHtml = `<span style="color: #DA291C; font-weight: 700;">¡Fuera de área!</span>`;
                // displayMessage = 'Escoge entre nuestra selección de modems.'; // Original - restaurar cuando se habilite
                displayMessage = 'No poseemos servicios en tu área'; // Provisional
                // TODO: Restaurar botón cuando se habilite el flujo CLARO HOGAR
                /*
                buttonHtml = `<button
                  onclick="if(window.__infoWindowContinueCallback) window.__infoWindowContinueCallback();"
                  style="
                    background: #DA291C;
                    color: #ffffff;
                    border: none;
                    padding: 12px 36px;
                    font-size: 14px;
                    font-weight: 600;
                    border-radius: 50px;
                    cursor: pointer;
                    min-width: 150px;
                  "
                >Ver opciones</button>`;
                */
                buttonHtml = ''; // Botón oculto temporalmente
                break;
            case 'pr-limit':
                // PR LIMIT - Out of coverage range (no continue option)
                titleHtml = `<span style="color: #DA291C; font-weight: 700;">¡Fuera de área!</span>`;
                displayMessage = message;
                buttonHtml = ''; // No action button for PR LIMIT
                break;
            case 'no-coverage':
            default:
                // Generic no coverage
                titleHtml = `<span style="color: #DA291C; font-weight: 700;">¡Fuera de área!</span>`;
                displayMessage = message;
                buttonHtml = ''; // No action button
                break;
        }
        const infoWindowContent = `
      <div style="
        font-family: 'Open Sans', Arial, sans-serif;
        width: 100%;
        min-width: 340px;
        box-sizing: border-box;
        background: #ffffff;
        padding: 16px 20px 20px 20px;
        text-align: center;
        position: relative;
        border-radius: 16px;
      ">
        <!-- Close button -->
        <button
          onclick="if(window.__infoWindowCloseCallback) window.__infoWindowCloseCallback();"
          style="
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            background: transparent;
            border: none;
            font-size: 18px;
            color: #666;
            cursor: pointer;
            line-height: 1;
            padding: 0;
          "
        >×</button>

        <!-- Title -->
        <div style="
          margin: 0 0 10px 0;
          padding-right: 20px;
          font-size: 15px;
          font-weight: 700;
          color: #333;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 6px;
        ">
          ${titleHtml}
        </div>

        <!-- Message -->
        <p style="
          margin: 0 ${buttonHtml ? '0 16px 0' : '0 0 0'};
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        ">${displayMessage}</p>

        ${buttonHtml}
      </div>
    `;
        // Set up close callback
        window.__infoWindowCloseCallback = () => {
            mapsService.closeInfoWindow();
        };
        mapsService.showInfoWindow(infoWindowContent, () => {
            switch (resultType) {
                case 'success':
                    this.handleInfoWindowContinue();
                    break;
                case 'claro-hogar':
                    this.handleNoConverageWithOptions();
                    break;
                default:
                    // PR LIMIT and no-coverage - just close
                    mapsService.closeInfoWindow();
                    break;
            }
        });
    }
    /**
     * Handles "Ver opciones" action when no coverage but CLARO HOGAR is available
     */
    handleNoConverageWithOptions = () => {
        mapsService.closeInfoWindow();
        // Create location data for CLARO HOGAR flow
        if (this.currentCoordinates) {
            const claroHogarLocation = {
                latitude: this.currentCoordinates.lat,
                longitude: this.currentCoordinates.lng,
                address: this.address || this.geocodeResult?.address || '',
                city: this.geocodeResult?.city || '',
                zipCode: this.geocodeResult?.zipCode || '',
                serviceType: 'CLARO HOGAR',
                serviceMessage: 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
                isValid: true,
            };
            // Store in session and state
            this.storeLocationInSession(claroHogarLocation);
            flowActions.setLocation(claroHogarLocation);
            // Navigate to next step (catalogue)
            this.onNext?.();
        }
    };
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
        return (h(Host, { key: 'a277c65d6f7cde73682ce009dfe64f99b33625bb' }, h("div", { key: 'f00353c6dfcbcfc3836342ad3c2c5d381106f8b1', class: "step-location" }, this.isValidating && (h("div", { key: '9a34be5eac8ccc560e8d2da86cacbea1c97e4b45', class: "step-location__validating-overlay" }, h("div", { key: 'c80ef7ec8645849010e98e839f6b1219e9b90309', class: "step-location__validating-content" }, h("div", { key: '2ccc798f4428d95fe26cb6f7cb1a2c3dc36b96be', class: "step-location__validating-spinner" }), h("p", { key: '34ebb862679139420d7f3b32444fe1e88214c15a', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: '8647775f5792b425d5ba16ad1a8c4a8c214cebdb', class: "step-location__header" }, h("h1", { key: '3ee52c05e8e89260f4592d944a8fa95331ab2002', class: "step-location__title" }, h("span", { key: 'b34d3156c80ed7063a71fdacd827dbca5a76cd08', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '72407fb0ae165412c6458f73c8b2264787d67e63', class: "step-location__map-container" }, h("div", { key: 'bcc1e45a5bc782ef34c4ab0cdb599f1759ab85f9', class: "step-location__controls" }, h("div", { key: '8eeb6651e6bd8d816807ebf445feef71536fa8a4', class: "step-location__input-group" }, h("span", { key: 'cb801b24e2d0d1b47610f020a93cdb2d0aee3de8', class: "step-location__input-icon" }, h("svg", { key: '03058476c09fedb579f29881bab5f70e0a48d0ae', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'e35449e03553f32589953e4e852d1b4a2f372b6b', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: 'faf9d798c9b013e8feba55983fa9ee7a120331ba', cx: "12", cy: "10", r: "3" }))), h("input", { key: 'b917469ffc983c38ef23c5a8598eb98015f868ac', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: '4c3202666dd4877aa3e7f39dbb8368740ea6c3c1', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("div", { key: '3c6e604950eb7a88816cab297a043dc8a72b3af1', class: "step-location__location-container" }, h("button", { key: '6a9bcd5c4c344f7e91b9ce233ab3c85a85e4d809', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: '8aea5e38394da1b7c86acfa8622bf9b046931cee', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "currentColor", stroke: "none" }, h("path", { key: '5985f65e567d22f4d32aa6cfc30a2266aa5a6311', d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual'))), h("div", { key: 'f10c38d5f3bd13581f8320b1f04ea9627b014167', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: '133b0e2e407c71d800897290d5a509e343264461', class: "step-location__map-loading" }, h("div", { key: '9d920b95c0490bf7714843b41bbcf6e736ffa376', class: "step-location__spinner" }), h("p", { key: '856e550515254cfd86aeceb32152368a2fd71224' }, "Cargando mapa..."))), this.mapError && (h("div", { key: 'd7d40cf0157461f7e6b4fb35f617b8c364d848fc', class: "step-location__map-error" }, h("p", { key: 'af873c95809968e2ce24f86db7be0704eb4cc972' }, this.mapError), !this.googleMapsKey && (h("small", { key: '2aee4f15642716404901765b8f91f6aa08656cc9' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '4f45f8222fe2351c5aea27052849dac227513c65', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: '4885ff4d073000fa62e0a651e36931755639ba3e', class: "step-location__modal-backdrop" }, h("div", { key: 'f24eb86b71643b6a4af0e11ea40ed9063a364644', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'd59dbeff27d1ffb29b5d24ae6c153f00ed49ce1c', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: '4dc63bc763cedb2f305985b867be54e031f7c6a9', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: 'abcd81b8349b00b2ecf623dfb402ec3072cc4220', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '8157f3342e2e79faa3187042768f84b67c385315', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
    }
};
StepLocation.style = stepLocationCss();

const stepPlansCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-plans{width:100%;min-height:100vh;padding:1.5rem;padding-bottom:180px}@media (min-width: 768px){.step-plans{padding:2rem;padding-bottom:140px}}.step-plans__header{width:100%;background:#FFFFFF;padding:1rem 0;box-sizing:border-box}@media (max-width: 767px){.step-plans__header{padding:0.75rem 0}}.step-plans__back-link{display:inline-flex;align-items:center;gap:0.25rem;padding:0.5rem 0;background:transparent;border:none;color:#0097A9;font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 150ms ease}.step-plans__back-link svg{width:20px;height:20px}.step-plans__back-link:hover{opacity:0.8}.step-plans__title{margin:0.75rem 0 1rem;font-size:24px;font-weight:700;color:#333333;line-height:1.2}@media (max-width: 767px){.step-plans__title{font-size:20px;margin:0.5rem 0 0.75rem}}.step-plans__divider{height:1px;background:#E5E5E5;margin:0 -1.5rem}@media (max-width: 767px){.step-plans__divider{margin:0 -1rem}}.step-plans__loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__spinner{width:40px;height:40px;border:3px solid #E5E5E5;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}.step-plans__error{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;color:#DA291C}.step-plans__error button{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__error button:disabled{opacity:0.5;cursor:not-allowed}.step-plans__error button{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-plans__error button:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-plans__error button:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-plans__error button{margin-top:1rem}.step-plans__carousel-container{padding:1rem 0 3rem}.step-plans__empty{display:flex;align-items:center;justify-content:center;padding:3rem;color:#666666}.step-plans__footer{position:fixed;bottom:0;left:0;right:0;background:#FFFFFF;border-top:1px solid #E5E5E5;padding:0.75rem 1.5rem;z-index:200;box-shadow:0 -4px 12px rgba(0, 0, 0, 0.1);display:flex;align-items:center;justify-content:space-between}@media (max-width: 767px){.step-plans__footer{flex-direction:column;gap:0.75rem;padding:1rem}}.step-plans__footer-left{display:flex;flex-direction:column}@media (max-width: 767px){.step-plans__footer-left{width:100%}}.step-plans__footer-info{display:flex;gap:1.5rem}.step-plans__footer-item{display:flex;flex-direction:column}.step-plans__footer-item--separator{padding-left:1.5rem;border-left:1px solid #E5E5E5}.step-plans__footer-label{font-size:0.75rem;color:#666666}.step-plans__footer-value{font-size:1.25rem;font-weight:700;color:#333333}.step-plans__footer-value--highlight{color:#DA291C}.step-plans__footer-note{font-size:0.75rem;color:#808080;margin:0.25rem 0 0}.step-plans__footer-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-plans__footer-btn:disabled{opacity:0.5;cursor:not-allowed}.step-plans__footer-btn{height:48px;background-color:#DA291C;color:#FFFFFF}.step-plans__footer-btn:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-plans__footer-btn:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-plans__footer-btn{min-width:160px}@media (max-width: 767px){.step-plans__footer-btn{width:100%}}.plan-card{background:#FFFFFF;border-radius:16px;border:2px solid transparent;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08);overflow:hidden;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;min-height:340px}.plan-card:hover{box-shadow:0 4px 16px rgba(0, 0, 0, 0.12);transform:translateY(-2px)}.plan-card--selected{border-color:#0097A9;box-shadow:0 6px 24px rgba(0, 151, 169, 0.25)}.plan-card--processing{pointer-events:none;opacity:0.8}.plan-card__header{display:flex;justify-content:center;padding-top:0}.plan-card__name{background:#1a1a1a;color:#FFFFFF;font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;padding:0.75rem 1rem;width:70%;text-align:center;border-radius:0 0 12px 12px}.plan-card__body{flex:1;padding:1.25rem 1rem;text-align:center;display:flex;flex-direction:column}.plan-card__includes-label{font-size:1rem;color:#666666;margin:0 0 0.75rem;font-weight:500}.plan-card__features{list-style:none;padding:0;margin:0 0 1rem;text-align:center;flex:1}.plan-card__feature{margin-bottom:0.5rem;font-size:0.875rem;color:#333333;font-weight:600}.plan-card__feature:last-child{margin-bottom:0}.plan-card__price{font-size:1.75rem;font-weight:700;color:#0097A9;margin:1rem 0 0}.plan-card__footer{padding:1rem}.plan-card__btn{width:100%;padding:0.75rem 1rem;border-radius:25px;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;background:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.plan-card__btn:hover{background:rgba(0, 151, 169, 0.1)}.plan-card__btn--selected{background:#0097A9;color:#FFFFFF;border-color:#0097A9}.plan-card__btn--selected:hover{background:rgb(0, 114.5455621302, 128.2)}.plan-card__btn--loading{cursor:wait;opacity:0.8}.plan-card__btn:disabled{cursor:not-allowed;opacity:0.6}.plan-card__btn-loading{display:inline-flex;align-items:center;gap:0.5rem}.plan-card__btn-spinner{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;

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
        return (h(Host, { key: '71c916044e88e63578e0093f15ddcbe0287a0449' }, h("div", { key: 'b451804ab60176a01dbe351e61a4d6699936ffba', class: "step-plans" }, h("header", { key: '3a9885fb7071d80ee8f6f60cce18c3bd67dc6fef', class: "step-plans__header" }, h("button", { key: 'ddfa2321981cd0a4468d1a5a7fa7345139ec342c', class: "step-plans__back-link", onClick: this.onBack }, h("svg", { key: 'd7b8ef58798169dea02f7ffa16085761713d60c6', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'fecc51fcec60640d6d0133cd6511a85420290544', points: "15 18 9 12 15 6" })), h("span", { key: '71e56cec810389d4c8dc6020ef018f15d9082696' }, "Regresar")), h("h1", { key: 'ff70c76faf831a80dce5e844e556614d00d8f720', class: "step-plans__title" }, "Elige tu plan"), h("div", { key: '89c8c48112081ae1cfdc1b7ac38ad08bef23ec91', class: "step-plans__divider" })), this.isLoading && (h("div", { key: 'dd3ee1883c99148424a4afb47b186d5f0c26a9cd', class: "step-plans__loading" }, h("div", { key: '1b85359c971e156c68c6ae6a26a2a0e7af96e901', class: "step-plans__spinner" }), h("p", { key: 'ed08b8a31592da0bcdf3ae373373d4c7b44977f2' }, "Cargando planes..."))), this.error && (h("div", { key: '860ef48d0c1b48b8be08565c3d3c3e166fe17bc8', class: "step-plans__error" }, h("p", { key: 'd4819934b6a45838e8112c1bcd20496554b247a4' }, this.error), h("button", { key: '85f71600e4dab0a8e29514360867aee5395a8a79', onClick: () => this.loadPlans() }, "Reintentar"))), !this.isLoading && !this.error && this.plans.length > 0 && (h("div", { key: '92528629d3d40596f32e9c0099e7ce26f1723cb9', class: "step-plans__carousel-container" }, h("ui-carousel", { key: 'd3f02d81bd4faa661ef52ec4f098e9ed1db82775', totalItems: this.plans.length, gap: 24, showNavigation: false, showPagination: true, breakpoints: [
                { minWidth: 0, slidesPerView: 1 },
                { minWidth: 500, slidesPerView: 2 },
                { minWidth: 800, slidesPerView: 3 },
                { minWidth: 1100, slidesPerView: 4 },
            ] }, this.plans.map((plan) => this.renderPlanCard(plan))))), !this.isLoading && !this.error && this.plans.length === 0 && (h("div", { key: '2e0947419e26a6d5b662fa234e1874df48a75120', class: "step-plans__empty" }, h("p", { key: 'bbe9e5d84363c6ae3ab81dc34d43d1b82b34a46b' }, "No hay planes disponibles para tu \u00E1rea."))), h("footer", { key: 'b14a72d1ac25fee9325801f2019f05a5c370dd63', class: "step-plans__footer" }, h("div", { key: '1aa9e2de4ccff26772475de2478772f759b48558', class: "step-plans__footer-left" }, h("div", { key: 'b317441bffd781f7bb2ce96598615f9b2def1c44', class: "step-plans__footer-info" }, h("div", { key: 'c2bd471a1c366ea382ada43b342963c0ce226302', class: "step-plans__footer-item" }, h("span", { key: '8131b6c6794d88b03e9b18811bae54fe1d1043b1', class: "step-plans__footer-label" }, "Pago mensual"), h("span", { key: 'f2a7817042d267aba146d281d871123939506e84', class: "step-plans__footer-value" }, formatPrice(monthlyPayment))), h("div", { key: '679047174259006b71821fcc208521224ef0127e', class: "step-plans__footer-item step-plans__footer-item--separator" }, h("span", { key: '32deed61a01762e549679834564a3d3baafc18ae', class: "step-plans__footer-label" }, "Paga hoy"), h("span", { key: '5a5a62b56fc9bedacb36865cb3a4a169b2ca4415', class: "step-plans__footer-value step-plans__footer-value--highlight" }, formatPrice(totalToday)))), h("p", { key: '7c10e8cbcbcc334d8ae9ede73b00d9cb47212b45', class: "step-plans__footer-note" }, "Renta mensual aproximada no incluye cargos estatales, federales, ni otros impuestos.")), h("button", { key: 'd772ec9082de9536b94c7609f04e7299d2d87a17', class: "step-plans__footer-btn", onClick: this.handleContinue, disabled: !this.selectedPlan || this.isAddingToCart }, this.isAddingToCart ? 'Procesando...' : 'Continuar')))));
    }
};
StepPlans.style = stepPlansCss();

const uiCarouselCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-carousel{position:relative;width:100%;display:flex;align-items:center}.ui-carousel__viewport{flex:1;overflow:hidden;margin:0 0.5rem}@media (min-width: 768px){.ui-carousel__viewport{margin:0 1rem}}.ui-carousel__track{display:flex;align-items:stretch;transition:transform 0.3s ease-out;will-change:transform}.ui-carousel__track--dragging{transition:none;cursor:grabbing}.ui-carousel__nav{flex-shrink:0;width:40px;height:40px;border-radius:50%;background:#FFFFFF;border:2px solid #DA291C;color:#DA291C;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;z-index:2;box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.ui-carousel__nav svg{width:20px;height:20px}.ui-carousel__nav:hover:not(:disabled){background:#DA291C;color:#FFFFFF}.ui-carousel__nav:active:not(:disabled){transform:scale(0.95)}.ui-carousel__nav--disabled{opacity:0.3;cursor:not-allowed;pointer-events:none}@media (max-width: 599px){.ui-carousel__nav{width:32px;height:32px}.ui-carousel__nav svg{width:16px;height:16px}}.ui-carousel__pagination{position:absolute;bottom:-2rem;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:2}.ui-carousel__dot{width:10px;height:10px;border-radius:50%;border:none;background:#CCCCCC;cursor:pointer;padding:0;transition:all 0.2s ease}.ui-carousel__dot:hover{background:#999999}.ui-carousel__dot--active{background:#DA291C;transform:scale(1.2)}::slotted(*){box-sizing:border-box}`;

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
              /* height handled by align-items: stretch on track */
            }
          `)));
    }
    static get watchers() { return {
        "totalItems": ["handleTotalItemsChange"]
    }; }
};
UiCarousel.style = uiCarouselCss();

const uiStepperCss = () => `.ui-stepper{display:flex;align-items:flex-start;justify-content:center;width:100%}.ui-stepper__step{display:flex;flex-direction:column;align-items:flex-start;position:relative}.ui-stepper__indicator{display:flex;align-items:center;position:relative}.ui-stepper__circle{width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.875rem;transition:all 250ms ease;flex-shrink:0}.ui-stepper__circle--pending{background-color:#FFFFFF;color:#999999;border:2px solid #CCCCCC}.ui-stepper__circle--active{background-color:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.ui-stepper__circle--completed{background-color:#FFFFFF;color:#0097A9;border:2px solid #0097A9}.ui-stepper__number{line-height:1}.ui-stepper__check{width:16px;height:16px}.ui-stepper__connector{width:220px;height:2px;background-color:#CCCCCC;transition:background-color 250ms ease;margin-left:8px;margin-right:8px}.ui-stepper__connector--completed{background-color:#0097A9}.ui-stepper__label{position:relative;left:calc(32px / 2);transform:translateX(-50%);margin-top:0.5rem;font-size:0.75rem;font-weight:500;text-align:center;transition:color 250ms ease;white-space:nowrap}.ui-stepper__label--pending{color:#808080}.ui-stepper__label--active{color:#0097A9;font-weight:600}.ui-stepper__label--completed{color:#0097A9}.ui-stepper--sm .ui-stepper__circle{width:24px;height:24px;font-size:0.75rem}.ui-stepper--sm .ui-stepper__check{width:12px;height:12px}.ui-stepper--sm .ui-stepper__connector{width:30px}.ui-stepper--sm .ui-stepper__label{font-size:10px;left:calc(24px / 2)}@media (max-width: 576px){.ui-stepper__connector{width:80px}.ui-stepper__label{font-size:11px}}`;

const UiStepper = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h(Host, { key: 'df6adc9763aed239c6eaf79af2f2d549f48579c6' }, h("div", { key: 'bfb747939107bdd62106748334c198a2fb50713b', class: classes }, this.steps.map((step, index) => {
            const status = this.getStepStatus(index);
            const isLast = index === this.steps.length - 1;
            return (h("div", { class: "ui-stepper__step", key: index }, h("div", { class: "ui-stepper__indicator" }, h("div", { class: {
                    'ui-stepper__circle': true,
                    [`ui-stepper__circle--${status}`]: true,
                } }, status === 'completed' ? (h("svg", { class: "ui-stepper__check", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "3" }, h("polyline", { points: "20 6 9 17 4 12" }))) : (h("span", { class: "ui-stepper__number" }, index + 1))), !isLast && (h("div", { class: {
                    'ui-stepper__connector': true,
                    'ui-stepper__connector--completed': status === 'completed',
                } }))), h("span", { class: {
                    'ui-stepper__label': true,
                    [`ui-stepper__label--${status}`]: true,
                } }, step.label)));
        }))));
    }
};
UiStepper.style = uiStepperCss();

export { FixedServiceFlow as fixed_service_flow, StepCatalogue as step_catalogue, StepConfirmation as step_confirmation, StepContract as step_contract, StepForm as step_form, StepLocation as step_location, StepPlans as step_plans, UiCarousel as ui_carousel, UiStepper as ui_stepper };
//# sourceMappingURL=fixed-service-flow.step-catalogue.step-confirmation.step-contract.step-form.step-location.step-plans.ui-carousel.ui-stepper.entry.js.map
