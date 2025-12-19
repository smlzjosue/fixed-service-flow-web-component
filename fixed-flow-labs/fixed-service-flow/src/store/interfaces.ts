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
// CATALOGUE INTERFACES (CLARO HOGAR)
// ------------------------------------------

export interface CatalogueResponse {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  errorDesc?: string;
  errorNum?: number;
  products?: CatalogueProduct[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface CatalogueProduct {
  productId: number;
  productName: string;
  imgUrl: string;
  update_price: number; // Monthly installment price
  regular_price: number; // Full price
  installments: number; // Number of installments (e.g., 36)
  shortDescription?: string;
  colors?: ProductColor[];
  offer?: ProductOffer | null;
  offerData?: ProductOfferData | null;
  promoImg?: string;
  checkCompare?: boolean; // For compare checkbox state
}

export interface ProductColor {
  webColor: string;
}

export interface ProductOffer {
  nameDesingn: string; // 'normal' | 'cyberweek'
}

export interface ProductOfferData {
  installmentOffer: number;
}

export interface CatalogueFilter {
  value: string;
  label: string;
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

// Standard flow: 1-5, CLARO HOGAR flow: 1-8
export type FlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
 *
 * CON CONTRATO:
 * - 12 meses: Instalación $80.00
 * - 24 meses: Instalación $0.00 (sin costo)
 *
 * SIN CONTRATO:
 * - Instalación $160.00
 */
export const CONTRACT_OPTIONS: ContractType[] = [
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

export const SERVICE_MESSAGES: Record<string, string> = {
  GPON: 'Tenemos fibra óptica en tu área y podrás navegar con velocidades de hasta 1,000 megas.',
  VRAD: 'Tenemos servicio de internet DSL disponible en tu área.',
  'CLARO HOGAR': 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
  NO_COVERAGE: '¡Fuera de área! Por el momento no contamos con cobertura en tu zona.',
};

// ------------------------------------------
// PRODUCT DETAIL INTERFACES (CLARO HOGAR)
// ------------------------------------------

export interface ProductDetailResponse {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  product?: ProductDetail;
}

export interface ProductDetail {
  productId: number;
  productName: string;
  brandName?: string;
  imgUrl: string;
  detailImage?: string;
  images?: string[]; // Array of product images for carousel
  shortDescription?: string;
  longDescription?: string;
  regular_price: number;
  update_price: number;
  installments: number;
  decDownPayment?: number;
  decDeposit?: number;
  creditClass?: string;
  colors?: ProductColorDetail[];
  storages?: ProductStorage[];
  specifications?: ProductSpecification[];
  features?: string[];
  catalogId?: number;
  home?: boolean; // Flag for CLARO HOGAR products
  stock?: number; // Stock quantity for availability check
}

export interface ProductColorDetail {
  colorId: number;
  colorName: string;
  webColor: string;
  imgUrl?: string;
  available?: boolean;
}

export interface ProductStorage {
  storageId: number;
  storageName: string;
  storageValue: string;
  priceDiff?: number;
  available?: boolean;
}

export interface ProductSpecification {
  name: string;
  value: string;
  category?: string;
}

// ------------------------------------------
// CART INTERFACES
// ------------------------------------------

export interface CartResponse {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  products?: CartItem[];
  subTotalPrice?: number;
  subTotalPerMonth?: number;
  totalPrice?: number;
  depositAmount?: number;
  totalDownPayment?: number;
  totalTax?: number;
  installmentAmount?: number;
  cartUpdateResponse?: CartUpdateResponse;
}

export interface CartItem {
  cartId: number;
  productId: number;
  parentProductId?: number;
  parentCartId?: number;
  productName: string;
  qty: number;
  decPrice: number;
  decTotalPerMonth?: number;
  decTotalPrice?: number;
  installments: number;
  plan?: boolean;
  catalogId?: number;
  equipment?: boolean;
  accesory?: boolean;
  home?: boolean;
  internet?: boolean;
  storage?: string;
  storageName?: string;
  webColor?: string;
  colorName?: string;
  brand?: string;
  detailImage?: string;
  imgUrl?: string;
  color?: string;
  stock?: string;
  catalogName?: string;
}

export interface CartUpdateResponse {
  decCurrentPlanPrice?: number;
  locationId?: string;
  invoiceNumber?: string;
  pendingAccelerated?: number;
  acceletartedAmount?: number;
}

export interface AddToCartRequest {
  token: string;
  productId: number;
  notificationDetailID?: number;
  chvSource?: string;
  promoCode?: string;
  installments: number;
  decPrice: number;
  decDeposit?: number;
  decDownPayment?: number;
  decTotalPrice: number;
  Qty: number;
  flowId?: number;
  ssoToken?: string;
  userID?: string;
  parentProductId?: number;
  parentCartId?: number;
  creditClass?: string;
  downgradeAllowed?: boolean;
  pendingAccelerated?: number;
  acceletartedAmount?: number;
  pastDueAmount?: number;
  delicuency?: boolean;
}

export interface AddToCartResponse {
  code: number; // mainId returned
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
}

export interface DeleteCartItemRequest {
  cartId: number;
  productId: number;
}

// ------------------------------------------
// SHIPPING INTERFACES
// ------------------------------------------

export interface ShippingAddressRequest {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;
  phone: string;
  email?: string;
  instructions?: string;
}

export interface ShippingAddressResponse {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  shipmentId?: number;
}

export interface DeliveryMethod {
  id: number;
  name: string;
  description?: string;
  cost: number;
  estimatedDays?: number;
  available?: boolean;
}

export interface DeliveryMethodsResponse {
  hasError: boolean;
  message?: string;
  deliveryMethods?: DeliveryMethod[];
}

// ------------------------------------------
// ORDER INTERFACES
// ------------------------------------------

export interface OrderCreateRequest {
  flowId?: number;
  frontFlowId?: string;
  zipCode: string;
  shipmentId?: number;
  deliveryMethodId?: number;
  customerInfo?: CustomerInfo;
  paymentType?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identificationType: string;
  identificationNumber: string;
}

export interface OrderCreateResponse {
  hasError: boolean;
  message?: string;
  errorDisplay?: string;
  code?: string; // Order ID
  orderId?: string;
  bitPayment?: boolean;
  bitPortability?: boolean;
  bitAuthenticated?: boolean;
  bitAddressValidate?: boolean;
  bitEquifaxValidate?: boolean;
}

export interface OrderSummary {
  orderId: string;
  orderNumber?: string;
  status: string;
  createdAt: string;
  products: CartItem[];
  plan?: Plan;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customer: CustomerInfo;
  shippingAddress?: ShippingAddressRequest;
  deliveryMethod?: DeliveryMethod;
}

// ------------------------------------------
// PAYMENT INTERFACES
// ------------------------------------------

export interface PaymentIframeRequest {
  ssoToken?: string;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  transactionType: string; // 'payment' | 'MULTIPLE'
  selectBan?: string;
  currentSubscriber?: string;
  permissions?: PaymentPermissions;
  installments?: PaymentInstallments;
  paymentItems?: PaymentItem[];
}

export interface PaymentPermissions {
  provision?: boolean;
  displayConfirmation?: boolean;
  emailNotification?: boolean;
  showInstrument?: boolean;
  storeInstrument?: boolean;
  useBanZipCode?: boolean;
}

export interface PaymentInstallments {
  locationId?: string;
  invoiceNumber?: string;
  installmentCount: number;
}

export interface PaymentItem {
  type: 'INSTALLMENT' | 'DEPOSIT' | 'DOWNPAYMENT' | 'TAXES' | 'PASTDUEONLY';
  amount: number;
}

export interface PaymentIframeResponse {
  hasError: boolean;
  message?: string;
  url?: string;
  errorInfo?: {
    hasError: boolean;
    message?: string;
  };
}

export interface PaymentResult {
  state: string; // 'paymentResult'
  data: PaymentResultData;
}

export interface PaymentResultData {
  success: boolean;
  authorizationNumber?: string;
  code?: string;
  date?: string;
  description?: string;
  operationId?: string;
  operationType?: string;
  paymentMethod?: string;
  provisioning?: any;
  storedInstrument?: any;
  paymentCard?: any;
}

export interface PaymentRecordRequest {
  orderId: string;
  operationId: string;
  authCode: string;
  responseCode: string;
  amount: number;
}

export interface PaymentErrorRequest {
  orderId: string;
  operationId: string;
  responseCode: string;
  errorMessage?: string;
}

// ------------------------------------------
// CONFIRMATION INTERFACES
// ------------------------------------------

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  customer: CustomerInfo;
  products: CartItem[];
  plan?: Plan;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  lastFourDigits?: string;
}
