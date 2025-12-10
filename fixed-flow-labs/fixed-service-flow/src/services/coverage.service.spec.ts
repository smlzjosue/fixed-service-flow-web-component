// ============================================
// COVERAGE SERVICE - Unit Tests
// ============================================

import { coverageService } from './coverage.service';
import { SERVICE_MESSAGES } from '../store/interfaces';

// Mock dependencies
jest.mock('./http.service', () => ({
  httpService: {
    post: jest.fn(),
  },
}));

jest.mock('./token.service', () => ({
  tokenService: {
    ensureToken: jest.fn(),
  },
}));

import { httpService } from './http.service';
import { tokenService } from './token.service';

describe('CoverageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenService.ensureToken as jest.Mock).mockResolvedValue(undefined);
  });

  describe('validateCoverage', () => {
    it('should validate coverage for given coordinates', async () => {
      const mockResponse = {
        hasError: false,
        priorityService: 'GPON',
        attributes: [
          { servicE_NAME: 'GPON', servicE_MESSAGE: 'Service available' },
        ],
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await coverageService.validateCoverage(18.333, -66.416);

      expect(tokenService.ensureToken).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalledWith(
        'api/Catalogue/getInternetPlans',
        {
          latitud: '18.333',
          longitud: '-66.416',
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkCoverage', () => {
    it('should return valid location for GPON service', async () => {
      const mockResponse = {
        hasError: false,
        priorityService: 'GPON',
        attributes: [
          { servicE_NAME: 'GPON', servicE_MESSAGE: 'Fibra óptica disponible' },
        ],
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await coverageService.checkCoverage(
        18.333,
        -66.416,
        '123 Main St',
        'San Juan',
        '00901',
      );

      expect(result.isValid).toBe(true);
      expect(result.serviceType).toBe('GPON');
      expect(result.latitude).toBe(18.333);
      expect(result.longitude).toBe(-66.416);
    });

    it('should return invalid location when no coverage', async () => {
      const mockResponse = {
        hasError: true,
        priorityService: '',
        attributes: [],
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await coverageService.checkCoverage(
        18.333,
        -66.416,
        '123 Main St',
        'San Juan',
        '00901',
      );

      expect(result.isValid).toBe(false);
      expect(result.serviceMessage).toBe(SERVICE_MESSAGES.NO_COVERAGE);
    });

    it('should return invalid for unsupported service types', async () => {
      const mockResponse = {
        hasError: false,
        priorityService: 'UNKNOWN_SERVICE',
        attributes: [],
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await coverageService.checkCoverage(
        18.333,
        -66.416,
        '123 Main St',
        'San Juan',
        '00901',
      );

      expect(result.isValid).toBe(false);
    });
  });

  describe('getServiceDisplayName', () => {
    it('should return display name for GPON', () => {
      expect(coverageService.getServiceDisplayName('GPON')).toBe('Fibra Óptica');
    });

    it('should return display name for VRAD', () => {
      expect(coverageService.getServiceDisplayName('VRAD')).toBe('Internet DSL');
    });

    it('should return display name for CLARO HOGAR', () => {
      expect(coverageService.getServiceDisplayName('CLARO HOGAR')).toBe(
        'Internet Inalámbrico',
      );
    });

    it('should return original name for unknown service', () => {
      expect(coverageService.getServiceDisplayName('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('isClaroHogar', () => {
    it('should return true for CLARO HOGAR', () => {
      expect(coverageService.isClaroHogar('CLARO HOGAR')).toBe(true);
      expect(coverageService.isClaroHogar('claro hogar')).toBe(true);
    });

    it('should return false for other services', () => {
      expect(coverageService.isClaroHogar('GPON')).toBe(false);
      expect(coverageService.isClaroHogar('VRAD')).toBe(false);
    });
  });
});
