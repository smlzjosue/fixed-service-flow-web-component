// ============================================
// REQUEST SERVICE - Unit Tests
// ============================================

import { requestService } from './request.service';

// Mock dependencies
jest.mock('./http.service', () => ({
  httpService: {
    postFormData: jest.fn(),
  },
}));

jest.mock('./token.service', () => ({
  tokenService: {
    ensureToken: jest.fn(),
  },
}));

import { httpService } from './http.service';
import { tokenService } from './token.service';

describe('RequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenService.ensureToken as jest.Mock).mockResolvedValue(undefined);
  });

  describe('submitRequest', () => {
    it('should submit request as FormData', async () => {
      const mockResponse = { hasError: false, requestId: '12345' };
      (httpService.postFormData as jest.Mock).mockResolvedValue(mockResponse);

      const payload = {
        type: 1,
        name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      const result = await requestService.submitRequest(payload as any);

      expect(tokenService.ensureToken).toHaveBeenCalled();
      expect(httpService.postFormData).toHaveBeenCalledWith(
        'api/Orders/internetServiceRequest',
        expect.any(FormData),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('buildPayload', () => {
    const mockFormData = {
      personal: {
        firstName: 'John',
        secondName: '',
        lastName: 'Doe',
        secondLastName: 'Smith',
        identificationType: 'license',
        identificationNumber: '1234567890',
        identificationExpiration: '2025-12-31',
        phone1: '7875551234',
        phone2: '',
        email: 'john@example.com',
      },
      business: {
        businessName: 'My Company',
        position: 'Manager',
      },
      address: {
        address: '123 Main St',
        city: 'San Juan',
        zipCode: '00901',
      },
      isExistingCustomer: false,
    };

    const mockContract = {
      typeId: 1,
      deadlines: 24,
      installation: 0,
      activation: 25,
      modem: 0,
    };

    const mockPlan = {
      planId: 123,
      planName: 'Basic Plan',
    };

    const mockLocation = {
      latitude: 18.333,
      longitude: -66.416,
    };

    it('should build correct payload', () => {
      const payload = requestService.buildPayload(
        mockFormData as any,
        mockContract as any,
        mockPlan as any,
        mockLocation as any,
      );

      expect(payload.name).toBe('John');
      expect(payload.last_name).toBe('Doe');
      expect(payload.second_surname).toBe('Smith');
      expect(payload.email).toBe('john@example.com');
      expect(payload.telephone1).toBe('7875551234');
      expect(payload.business_name).toBe('My Company');
      expect(payload.business_position).toBe('Manager');
      expect(payload.plan_id).toBe('123');
      expect(payload.plan_name).toBe('Basic Plan');
      expect(payload.deadlines).toBe('24');
      expect(payload.latitud).toBe('18.333');
      expect(payload.longitud).toBe('-66.416');
      expect(payload.type).toBe(1);
      expect(payload.id_type).toBe('1'); // license
      expect(payload.claro_customer).toBe('No');
    });

    it('should set correct id_type for passport', () => {
      const formDataWithPassport = {
        ...mockFormData,
        personal: {
          ...mockFormData.personal,
          identificationType: 'passport',
        },
      };

      const payload = requestService.buildPayload(
        formDataWithPassport as any,
        mockContract as any,
        mockPlan as any,
        mockLocation as any,
      );

      expect(payload.id_type).toBe('2');
    });

    it('should set claro_customer to Si for existing customers', () => {
      const formDataExisting = {
        ...mockFormData,
        isExistingCustomer: true,
      };

      const payload = requestService.buildPayload(
        formDataExisting as any,
        mockContract as any,
        mockPlan as any,
        mockLocation as any,
      );

      expect(payload.claro_customer).toBe('Si');
    });
  });

  describe('validateSubmissionData', () => {
    it('should return valid when all data is present', () => {
      const formData = {
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          secondLastName: 'Smith',
          identificationNumber: '1234567890',
          identificationExpiration: '2025-12-31',
          phone1: '7875551234',
          email: 'john@example.com',
        },
        business: {
          businessName: 'Company',
          position: 'Manager',
        },
        address: {
          address: '123 Main St',
          city: 'San Juan',
          zipCode: '00901',
        },
      };

      const result = requestService.validateSubmissionData(
        formData as any,
        { typeId: 1 } as any,
        { planId: 1 } as any,
        { latitude: 18 } as any,
      );

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should return missing fields when data is incomplete', () => {
      const result = requestService.validateSubmissionData(
        null,
        null,
        null,
        null,
      );

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('location');
      expect(result.missingFields).toContain('plan');
      expect(result.missingFields).toContain('contract');
      expect(result.missingFields).toContain('formData');
    });

    it('should identify missing form fields', () => {
      const incompleteFormData = {
        personal: {
          firstName: '',
          lastName: '',
          secondLastName: '',
          identificationNumber: '',
          identificationExpiration: '',
          phone1: '',
          email: '',
        },
        business: {
          businessName: '',
          position: '',
        },
        address: {
          address: '',
          city: '',
          zipCode: '',
        },
      };

      const result = requestService.validateSubmissionData(
        incompleteFormData as any,
        { typeId: 1 } as any,
        { planId: 1 } as any,
        { latitude: 18 } as any,
      );

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('firstName');
      expect(result.missingFields).toContain('email');
      expect(result.missingFields).toContain('businessName');
    });
  });
});
