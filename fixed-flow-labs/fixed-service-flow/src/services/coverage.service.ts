// ============================================
// COVERAGE SERVICE - Location Coverage Validation
// Fixed Service Flow Web Component
// ============================================

import { httpService } from './http.service';
import { tokenService } from './token.service';
import { CoverageResponse, LocationData, SERVICE_MESSAGES } from '../store/interfaces';

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
  async validateCoverage(latitude: number, longitude: number): Promise<CoverageResponse> {
    // Ensure token exists before making the call
    await tokenService.ensureToken();

    const response = await httpService.post<CoverageResponse>('api/Catalogue/getInternetPlans', {
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
  async checkCoverage(
    latitude: number,
    longitude: number,
    address: string,
    city: string,
    zipCode: string,
  ): Promise<LocationData> {
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
      const priorityAttribute = response.attributes.find(
        attr => attr.servicE_NAME === serviceType,
      );
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
  getServiceDisplayName(serviceType: string): string {
    const displayNames: Record<string, string> = {
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
  isClaroHogar(serviceType: string): boolean {
    return serviceType.toLowerCase() === 'claro hogar';
  }
}

// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------

export const coverageService = new CoverageService();
export default coverageService;
