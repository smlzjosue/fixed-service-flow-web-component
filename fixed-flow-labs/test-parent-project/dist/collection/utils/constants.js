// ============================================
// CONSTANTS - Application Constants
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// API ENDPOINTS
// ------------------------------------------
export const API_ENDPOINTS = {
    TOKEN: 'api/Token/getToken',
    COVERAGE: 'api/Catalogue/getInternetPlans',
    PLANS: 'api/Plans/getPlansInternet',
    ADD_TO_CART: 'api/Plans/addToCartCurrentPlan',
    SUBMIT_REQUEST: 'api/Orders/internetServiceRequest',
};
// ------------------------------------------
// GOOGLE MAPS
// ------------------------------------------
export const GOOGLE_MAPS_CONFIG = {
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
export const FLOW_STEPS = {
    LOCATION: 1,
    PLANS: 2,
    CONTRACT: 3,
    FORM: 4,
    CONFIRMATION: 5,
};
export const STEP_TITLES = {
    1: 'Servicio fijo empresarial en tu área',
    2: 'Elige tu plan',
    3: 'Selecciona un tipo de contrato',
    4: 'Formulario de solicitud de servicio fijo',
    5: 'Confirmación de Solicitud',
};
// ------------------------------------------
// SERVICE TYPES
// ------------------------------------------
export const SERVICE_TYPES = {
    GPON: 'GPON',
    VRAD: 'VRAD',
    CLARO_HOGAR: 'CLARO HOGAR',
};
export const SERVICE_TYPE_LABELS = {
    GPON: 'Fibra Óptica',
    VRAD: 'Internet DSL',
    'CLARO HOGAR': 'Internet Inalámbrico',
};
// ------------------------------------------
// IDENTIFICATION TYPES
// ------------------------------------------
export const IDENTIFICATION_TYPES = {
    LICENSE: 'license',
    PASSPORT: 'passport',
};
export const IDENTIFICATION_TYPE_LABELS = {
    license: 'Licencia de conducir',
    passport: 'Pasaporte',
};
export const IDENTIFICATION_TYPE_API_CODES = {
    license: '1',
    passport: '2',
};
// ------------------------------------------
// CONTRACT TYPES
// ------------------------------------------
export const CONTRACT_TYPES = {
    WITH_CONTRACT: 1,
    WITHOUT_CONTRACT: 0,
};
export const CONTRACT_TYPE_LABELS = {
    1: 'Con Contrato',
    0: 'Sin Contrato',
};
export const CONTRACT_DURATIONS = {
    NO_CONTRACT: 0,
    TWELVE_MONTHS: 12,
    TWENTY_FOUR_MONTHS: 24,
};
// ------------------------------------------
// STORAGE KEYS
// ------------------------------------------
export const STORAGE_KEYS = {
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
export const VALIDATION_LIMITS = {
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
export const ERROR_MESSAGES = {
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
export const SUCCESS_MESSAGES = {
    REQUEST_SUCCESS: '¡Tu solicitud fue enviada con éxito!',
    REQUEST_SUCCESS_SUBTITLE: 'Pronto nos comunicaremos contigo.',
};
// ------------------------------------------
// UI TEXT
// ------------------------------------------
export const UI_TEXT = {
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
//# sourceMappingURL=constants.js.map
