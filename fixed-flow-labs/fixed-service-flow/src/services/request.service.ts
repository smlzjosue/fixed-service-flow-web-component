// ============================================
// REQUEST SERVICE - Service Request Submission
// Fixed Service Flow Web Component
// ============================================

import { httpService } from './http.service';
import { tokenService } from './token.service';
import {
  RequestResponse,
  ServiceRequestPayload,
  FormData as CustomerFormData,
  SelectedContract,
  Plan,
  LocationData,
} from '../store/interfaces';

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
  async submitRequest(payload: ServiceRequestPayload): Promise<RequestResponse> {
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

    const response = await httpService.postFormData<RequestResponse>(
      'api/Orders/internetServiceRequest',
      formData,
    );

    return response;
  }

  // ------------------------------------------
  // BUILD PAYLOAD
  // ------------------------------------------

  /**
   * Builds the request payload from flow data
   */
  buildPayload(
    formData: CustomerFormData,
    contract: SelectedContract,
    plan: Plan,
    location: LocationData,
  ): ServiceRequestPayload {
    return {
      // Contract type
      type: contract.typeId,

      // Personal data
      name: formData.personal.firstName,
      second_name: formData.personal.secondName || '',
      last_name: formData.personal.lastName,
      second_surname: formData.personal.secondLastName,
      date_birth: '', // Not collected in current form
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

      // Customer status
      claro_customer: formData.isExistingCustomer ? 'Si' : 'No',

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
  private generateFlowId(): string {
    return `FSF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validates that all required data is present before submission
   */
  validateSubmissionData(
    formData: CustomerFormData | null,
    contract: SelectedContract | null,
    plan: Plan | null,
    location: LocationData | null,
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

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
    } else {
      // Validate personal data
      if (!formData.personal.firstName) missingFields.push('firstName');
      if (!formData.personal.lastName) missingFields.push('lastName');
      if (!formData.personal.secondLastName) missingFields.push('secondLastName');
      if (!formData.personal.identificationNumber) missingFields.push('identificationNumber');
      if (!formData.personal.identificationExpiration) missingFields.push('identificationExpiration');
      if (!formData.personal.phone1) missingFields.push('phone1');
      if (!formData.personal.email) missingFields.push('email');

      // Validate business data
      if (!formData.business.businessName) missingFields.push('businessName');
      if (!formData.business.position) missingFields.push('position');

      // Validate address
      if (!formData.address.address) missingFields.push('address');
      if (!formData.address.city) missingFields.push('city');
      if (!formData.address.zipCode) missingFields.push('zipCode');
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

export const requestService = new RequestService();
export default requestService;
