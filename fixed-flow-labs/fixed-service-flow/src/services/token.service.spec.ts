// ============================================
// TOKEN SERVICE - Unit Tests
// ============================================

import { tokenService } from './token.service';
import { flowActions } from '../store/flow.store';

// Mock the http service
jest.mock('./http.service', () => ({
  httpService: {
    post: jest.fn(),
  },
}));

// Mock flow actions
jest.mock('../store/flow.store', () => ({
  flowActions: {
    getStoredToken: jest.fn(),
    setToken: jest.fn(),
    clearToken: jest.fn(),
    hasToken: jest.fn(),
    setError: jest.fn(),
  },
  flowState: {},
}));

import { httpService } from './http.service';

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchToken', () => {
    it('should fetch token from API', async () => {
      const mockResponse = {
        token: 'test-token',
        correlationId: 'test-correlation-id',
        hasError: false,
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tokenService.fetchToken();

      expect(httpService.post).toHaveBeenCalledWith('api/Token/getToken', {
        agentName: '',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API returns error', async () => {
      const mockResponse = {
        token: '',
        correlationId: '',
        hasError: true,
        message: 'Token error',
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(tokenService.fetchToken()).rejects.toThrow('Token error');
    });
  });

  describe('initialize', () => {
    it('should use existing token from storage', async () => {
      (flowActions.getStoredToken as jest.Mock).mockReturnValue({
        token: 'existing-token',
        correlationId: 'existing-correlation-id',
      });

      const result = await tokenService.initialize();

      expect(result).toBe(true);
      expect(flowActions.setToken).toHaveBeenCalledWith(
        'existing-token',
        'existing-correlation-id',
      );
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should fetch new token when none exists', async () => {
      (flowActions.getStoredToken as jest.Mock).mockReturnValue({
        token: null,
        correlationId: null,
      });

      const mockResponse = {
        token: 'new-token',
        correlationId: 'new-correlation-id',
        hasError: false,
      };

      (httpService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tokenService.initialize();

      expect(result).toBe(true);
      expect(httpService.post).toHaveBeenCalled();
      expect(flowActions.setToken).toHaveBeenCalledWith(
        'new-token',
        'new-correlation-id',
      );
    });
  });

  describe('hasToken', () => {
    it('should delegate to flowActions', () => {
      (flowActions.hasToken as jest.Mock).mockReturnValue(true);

      const result = tokenService.hasToken();

      expect(result).toBe(true);
      expect(flowActions.hasToken).toHaveBeenCalled();
    });
  });

  describe('clearToken', () => {
    it('should delegate to flowActions', () => {
      tokenService.clearToken();

      expect(flowActions.clearToken).toHaveBeenCalled();
    });
  });
});
