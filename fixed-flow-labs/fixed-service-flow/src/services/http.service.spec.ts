// ============================================
// HTTP SERVICE - Unit Tests
// ============================================

import { httpService, HttpError } from './http.service';

// Mock fetch
global.fetch = jest.fn();

// Mock flowState
jest.mock('../store/flow.store', () => ({
  flowState: {
    token: 'mock-token',
    correlationId: 'mock-correlation-id',
  },
}));

describe('HttpService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    httpService.setBaseUrl('https://api.example.com');
  });

  describe('setBaseUrl', () => {
    it('should set base URL without trailing slash', () => {
      httpService.setBaseUrl('https://api.example.com/');
      expect(httpService.getBaseUrl()).toBe('https://api.example.com');
    });

    it('should keep URL without trailing slash', () => {
      httpService.setBaseUrl('https://api.example.com');
      expect(httpService.getBaseUrl()).toBe('https://api.example.com');
    });
  });

  describe('request', () => {
    it('should make GET request successfully', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await httpService.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST request with body', async () => {
      const mockData = { id: 1 };
      const body = { name: 'test' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await httpService.post('/test', body);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should include authorization headers when token exists', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      });

      await httpService.get('/test');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers.get('Authorization')).toBe('Bearer mock-token');
      expect(headers.get('X-Correlation-ID')).toBe('mock-correlation-id');
      expect(headers.get('App')).toBe('shop');
      expect(headers.get('Platform')).toBe('web');
    });

    it('should throw HttpError on failed response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      await expect(httpService.get('/test')).rejects.toThrow(HttpError);
      await expect(httpService.get('/test')).rejects.toMatchObject({
        status: 404,
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(httpService.get('/test')).rejects.toThrow(HttpError);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });
    });

    it('should make GET request', async () => {
      await httpService.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should make POST request', async () => {
      await httpService.post('/test', { data: 'value' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should make PUT request', async () => {
      await httpService.put('/test', { data: 'value' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('should make DELETE request', async () => {
      await httpService.delete('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});
