export declare const API_ENDPOINTS: {
    readonly TOKEN: "api/Token/getToken";
    readonly COVERAGE: "api/Catalogue/getInternetPlans";
    readonly PLANS: "api/Plans/getPlansInternet";
    readonly ADD_TO_CART: "api/Plans/addToCartCurrentPlan";
    readonly SUBMIT_REQUEST: "api/Orders/internetServiceRequest";
};
export declare const GOOGLE_MAPS_CONFIG: {
    readonly DEFAULT_CENTER: {
        readonly lat: 18.333036;
        readonly lng: -66.4161211;
    };
    readonly DEFAULT_ZOOM: 17;
    readonly MAP_ID: "8481b97098c495ab";
    readonly DEFAULT_MAP_TYPE: "satellite";
};
export declare const FLOW_STEPS: {
    readonly LOCATION: 1;
    readonly PLANS: 2;
    readonly CONTRACT: 3;
    readonly FORM: 4;
    readonly CONFIRMATION: 5;
};
export declare const STEP_TITLES: {
    readonly 1: "Servicio fijo empresarial en tu área";
    readonly 2: "Elige tu plan";
    readonly 3: "Selecciona un tipo de contrato";
    readonly 4: "Formulario de solicitud de servicio fijo";
    readonly 5: "Confirmación de Solicitud";
};
export declare const SERVICE_TYPES: {
    readonly GPON: "GPON";
    readonly VRAD: "VRAD";
    readonly CLARO_HOGAR: "CLARO HOGAR";
};
export declare const SERVICE_TYPE_LABELS: {
    readonly GPON: "Fibra Óptica";
    readonly VRAD: "Internet DSL";
    readonly 'CLARO HOGAR': "Internet Inalámbrico";
};
export declare const IDENTIFICATION_TYPES: {
    readonly LICENSE: "license";
    readonly PASSPORT: "passport";
};
export declare const IDENTIFICATION_TYPE_LABELS: {
    readonly license: "Licencia de conducir";
    readonly passport: "Pasaporte";
};
export declare const IDENTIFICATION_TYPE_API_CODES: {
    readonly license: "1";
    readonly passport: "2";
};
export declare const CONTRACT_TYPES: {
    readonly WITH_CONTRACT: 1;
    readonly WITHOUT_CONTRACT: 0;
};
export declare const CONTRACT_TYPE_LABELS: {
    readonly 1: "Con Contrato";
    readonly 0: "Sin Contrato";
};
export declare const CONTRACT_DURATIONS: {
    readonly NO_CONTRACT: 0;
    readonly TWELVE_MONTHS: 12;
    readonly TWENTY_FOUR_MONTHS: 24;
};
export declare const STORAGE_KEYS: {
    readonly TOKEN: "token";
    readonly CORRELATION_ID: "correlationId";
    readonly LATITUDE: "latitud";
    readonly LONGITUDE: "longitud";
    readonly SERVICE_CODE: "planCodeInternet";
    readonly ASK_LOCATION: "askLocation";
    readonly PLAN_ID: "planId";
    readonly PLAN_PRICE: "planPrice";
    readonly PLAN: "plan";
    readonly CONTRACT_TYPE_ID: "typeContractId";
    readonly CONTRACT_INSTALLMENT: "contractInstallment";
    readonly CONTRACT_INSTALLATION: "contractInstallation";
    readonly CONTRACT_ACTIVATION: "contractActivation";
    readonly CONTRACT_MODEM: "contractModen";
    readonly STORE_BUSINESSES: "store-businesses";
    readonly APP: "app";
};
export declare const VALIDATION_LIMITS: {
    readonly NAME_MIN_LENGTH: 3;
    readonly NAME_MAX_LENGTH: 50;
    readonly PHONE_LENGTH: 10;
    readonly ZIP_CODE_LENGTH: 5;
    readonly IDENTIFICATION_MIN_LENGTH: 10;
    readonly IDENTIFICATION_MAX_LENGTH: 20;
    readonly EMAIL_MAX_LENGTH: 100;
    readonly ADDRESS_MAX_LENGTH: 200;
};
export declare const ERROR_MESSAGES: {
    readonly NETWORK_ERROR: "Error de conexión. Por favor, verifica tu conexión a internet.";
    readonly TIMEOUT_ERROR: "La solicitud ha tardado demasiado. Por favor, intenta de nuevo.";
    readonly SERVER_ERROR: "Error del servidor. Por favor, intenta más tarde.";
    readonly TOKEN_ERROR: "Error al obtener el token de autenticación.";
    readonly NO_COVERAGE: "¡Fuera de área! Por el momento no contamos con cobertura en tu zona.";
    readonly COVERAGE_ERROR: "Error al verificar la cobertura. Por favor, intenta de nuevo.";
    readonly PLANS_ERROR: "Error al cargar los planes disponibles.";
    readonly REQUEST_ERROR: "¡Lo sentimos, ha ocurrido un error en el proceso de solicitud! En este momento estamos presentando inconvenientes en nuestro sistema. Por favor, inténtalo nuevamente.";
    readonly GEOLOCATION_DENIED: "Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.";
    readonly GEOLOCATION_UNAVAILABLE: "No se pudo obtener tu ubicación. Por favor, ingresa tu dirección manualmente.";
    readonly GEOLOCATION_TIMEOUT: "Tiempo de espera agotado al obtener tu ubicación.";
};
export declare const SUCCESS_MESSAGES: {
    readonly REQUEST_SUCCESS: "¡Tu solicitud fue enviada con éxito!";
    readonly REQUEST_SUCCESS_SUBTITLE: "Pronto nos comunicaremos contigo.";
};
export declare const UI_TEXT: {
    readonly BTN_CONTINUE: "Continuar";
    readonly BTN_BACK: "Regresar";
    readonly BTN_VALIDATE: "Validar";
    readonly BTN_CLOSE: "Cerrar";
    readonly BTN_RETRY: "Volver a intentar";
    readonly BTN_USE_CURRENT_LOCATION: "Utilizar Ubicación Actual";
    readonly BTN_REQUEST_PLAN: "Solicitar plan";
    readonly LBL_MONTHLY_PAYMENT: "Pago mensual";
    readonly LBL_PAY_TODAY: "Paga hoy";
    readonly LBL_PLAN_INCLUDES: "Plan incluye";
    readonly LBL_REQUIRED: "*";
    readonly LBL_FIRST_NAME: "Nombre";
    readonly LBL_SECOND_NAME: "Segundo nombre";
    readonly LBL_LAST_NAME: "Apellido";
    readonly LBL_SECOND_LAST_NAME: "Segundo apellido";
    readonly LBL_IDENTIFICATION: "Identificación";
    readonly LBL_EXPIRATION_DATE: "Fecha de vencimiento";
    readonly LBL_PHONE_1: "Teléfono de contacto 1";
    readonly LBL_PHONE_2: "Teléfono de contacto 2";
    readonly LBL_BUSINESS_NAME: "Nombre del Negocio";
    readonly LBL_POSITION: "Posición en la Empresa";
    readonly LBL_ADDRESS: "Dirección";
    readonly LBL_CITY: "Ciudad";
    readonly LBL_ZIP_CODE: "Código postal";
    readonly LBL_EMAIL: "Correo electrónico";
    readonly LBL_EXISTING_CUSTOMER: "Cliente existente de Claro PR";
    readonly PH_ENTER_ADDRESS: "Ingrese su dirección";
    readonly PH_ENTER_NAME: "Ingrese nombre";
    readonly PH_ENTER_PHONE: "Ingrese teléfono";
    readonly PH_SELECT: "Seleccionar";
};
