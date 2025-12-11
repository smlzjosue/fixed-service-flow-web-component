// ============================================
// TYPESCRIPT INTERFACES
// Fixed Service Flow Web Component
// ============================================

// ------------------------------------------
// API RESPONSE INTERFACES
// ------------------------------------------

export interface ApiResponse<T = unknown> {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  errorDesc?: string;
  errorNum?: number;
  errorSubject?: string;
  data?: T;
}

export interface TokenResponse {
  token: string;
  correlationId: string;
  hasError: boolean;
  message?: string;
}

export interface CoverageResponse {
  priorityService: string; // 'GPON' | 'VRAD' | 'CLARO HOGAR'
  attributes: ServiceAttribute[];
  hasError: boolean;
  errorDisplay?: string;
  errorDesc?: string;
  errorNum?: number;
  message?: string;
}

export interface ServiceAttribute {
  servicE_ID: number;
  servicE_NAME: string; // 'GPON' | 'VRAD' | 'CLARO HOGAR'
  servicE_MESSAGE: string;
  servicE_PRIORITY: number;
  servicE_DEFAULT: string; // 'Y' | 'N'
  polygoN_URL?: string;
  polygoN_TYPE?: number;
  polygoN_SHAPE?: string;
  createD_BY?: string;
  creatioN_DATE?: string;
  updateD_BY?: string;
  updateD_DATE?: string;
  expiratioN_DATE?: string | null;
}

export interface PlansResponse {
  planList: Plan[];
  hasError: boolean;
  message?: string;
}

export interface Plan {
  planId: number;
  planName: string;
  planSoc: string;
  planDesc?: string;
  decPrice: number;
  decSalePrice?: number;
  bitPromotion: boolean;
  features?: string[];
  suggestedPlan?: boolean; // Added for carousel - marks recommended plan
  broadband?: boolean; // For banda ancha (fixed internet)
}

export interface RequestResponse {
  hasError: boolean;
  orderId?: string;
  message?: string;
  errorDisplay?: string;
  errorDesc?: string;
  errorNum?: number;
}

export interface OrderDetailsResponse {
  hasError: boolean;
  orderId?: string;
  orderNumber?: string;
  status?: string;
  createdAt?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  plan?: {
    planId: number;
    planName: string;
    price: number;
  };
  message?: string;
  errorDisplay?: string;
  errorDesc?: string;
  errorNum?: number;
}

export interface ConfirmationResponse {
  hasError: boolean;
  sent: boolean;
  message?: string;
  errorDisplay?: string;
  errorDesc?: string;
  errorNum?: number;
}

// ------------------------------------------
// LOCATION DATA
// ------------------------------------------

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  zipCode: string;
  serviceType: string; // 'GPON' | 'VRAD' | 'CLARO HOGAR'
  serviceMessage: string;
  isValid: boolean;
}

// ------------------------------------------
// CONTRACT TYPES
// ------------------------------------------

export type ContractTypeId = 0 | 1; // 0 = Sin contrato, 1 = Con contrato

export interface ContractOption {
  contractId: number;
  deadlines: number; // 0, 12, or 24 months
  installation: number;
  activation: number;
  modem: number;
}

export interface ContractType {
  typeId: ContractTypeId;
  type: string; // 'Con Contrato' | 'Sin Contrato'
  contract: ContractOption[];
}

export interface SelectedContract {
  typeId: ContractTypeId;
  typeName: string;
  deadlines: number;
  installation: number;
  activation: number;
  modem: number;
}

// ------------------------------------------
// FORM DATA
// ------------------------------------------

export type IdentificationType = 'license' | 'passport';

export interface PersonalData {
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  identificationExpiration: string;
  phone1: string;
  phone2?: string;
  email: string;
  birthDate?: string; // Opcional - requerido por backend pero no siempre recolectado en flujo empresarial
}

export interface BusinessData {
  businessName: string;
  position: string;
}

export interface AddressData {
  address: string;
  city: string;
  zipCode: string;
}

export interface FormData {
  personal: PersonalData;
  business: BusinessData;
  address: AddressData;
  isExistingCustomer: boolean;
}

// ------------------------------------------
// REQUEST PAYLOAD
// ------------------------------------------

export interface ServiceRequestPayload {
  type: ContractTypeId;
  name: string;
  second_name: string;
  last_name: string;
  second_surname: string;
  date_birth: string;
  email: string;
  telephone1: string;
  telephone2: string;
  zipCode: string;
  address: string;
  city: string;
  id_type: string; // '1' = License, '2' = Passport
  id: string;
  identification_expiration: string;
  frontFlowId: string;
  plan_id: string;
  plan_name: string;
  deadlines: string;
  installation: string;
  activation: string;
  moden: string;
  claro_customer: boolean; // Backend espera booleano
  latitud: string;
  longitud: string;
  business_name?: string;
  business_position?: string;
}

// ------------------------------------------
// FLOW STATE
// ------------------------------------------

export type FlowStep = 1 | 2 | 3 | 4 | 5;

export interface FlowState {
  // Navigation
  currentStep: FlowStep;

  // Authentication
  token: string | null;
  correlationId: string | null;

  // Step 1: Location
  location: LocationData | null;

  // Step 2: Plans
  availablePlans: Plan[];
  selectedPlan: Plan | null;

  // Step 3: Contract
  selectedContract: SelectedContract | null;

  // Step 4: Form
  formData: FormData | null;

  // Step 5: Confirmation
  orderId: string | null;
  requestError: string | null;

  // UI State
  isLoading: boolean;
  error: string | null;
}

// ------------------------------------------
// COMPONENT PROPS
// ------------------------------------------

export interface FlowConfig {
  apiUrl: string;
  googleMapsKey: string;
  correlationId?: string;
  initialStep?: FlowStep;
  debug?: boolean;
}

// ------------------------------------------
// EVENT PAYLOADS
// ------------------------------------------

export interface FlowCompleteEvent {
  orderId: string;
  plan: Plan;
  contract: SelectedContract;
  customer: FormData;
  location: LocationData;
}

export interface FlowErrorEvent {
  step: FlowStep;
  error: Error | string;
  recoverable: boolean;
}

export interface StepChangeEvent {
  from: FlowStep;
  to: FlowStep;
  direction: 'forward' | 'backward';
}

// ------------------------------------------
// CONSTANTS
// ------------------------------------------

/**
 * Valor base del modem (usado en cálculos de Sin Contrato)
 * Fuente: TEL/frondend/src/app/shared/const/appConst.ts
 */
export const VALUE_MODEM = 40;

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
export const CONTRACT_OPTIONS: ContractType[] = [
  {
    typeId: 1,
    type: 'Con Contrato',
    contract: [
      {
        contractId: 3,
        deadlines: 24,
        installation: 0,
        activation: 0,
        modem: 0,
      },
      {
        contractId: 2,
        deadlines: 12,
        installation: 25,
        activation: 20, // Corregido: era 25, debe ser 20 (según TEL)
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

export const SERVICE_MESSAGES: Record<string, string> = {
  GPON: 'Tenemos fibra óptica en tu área y podrás navegar con velocidades de hasta 1,000 megas.',
  VRAD: 'Tenemos servicio de internet DSL disponible en tu área.',
  'CLARO HOGAR': 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
  NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
};
