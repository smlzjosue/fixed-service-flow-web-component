// ============================================
// PLANS SERVICE - Unit Tests
// ============================================

import { plansService } from './plans.service';

// Mock dependencies
jest.mock('./http.service', () => ({
  httpService: {
    post: jest.fn(),
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

describe('PlansService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenService.ensureToken as jest.Mock).mockResolvedValue(undefined);
  });

  describe('getPlans', () => {
    it('should fetch plans for service type', async () => {
      const mockPlans = [
        { planId: 1, planName: 'Basic', decPrice: 50 },
        { planId: 2, planName: 'Plus', decPrice: 100 },
      ];

      (httpService.post as jest.Mock).mockResolvedValue({
        hasError: false,
        planList: mockPlans,
      });

      const result = await plansService.getPlans('GPON');

      expect(tokenService.ensureToken).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalledWith(
        'api/Plans/getPlansInternet',
        {
          catalogID: 0,
          type: 'GPON',
        },
      );
      expect(result).toEqual(mockPlans);
    });

    it('should throw error when API returns error', async () => {
      (httpService.post as jest.Mock).mockResolvedValue({
        hasError: true,
        message: 'Plans error',
      });

      await expect(plansService.getPlans('GPON')).rejects.toThrow('Plans error');
    });

    it('should return empty array when no plans', async () => {
      (httpService.post as jest.Mock).mockResolvedValue({
        hasError: false,
        planList: null,
      });

      const result = await plansService.getPlans('GPON');

      expect(result).toEqual([]);
    });
  });

  describe('formatPrice', () => {
    it('should format price with two decimals', () => {
      expect(plansService.formatPrice(50)).toBe('$50.00');
      expect(plansService.formatPrice(99.99)).toBe('$99.99');
      expect(plansService.formatPrice(0)).toBe('$0.00');
    });
  });

  describe('parsePlanFeatures', () => {
    it('should extract features from HTML list', () => {
      const html = '<ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>';
      const features = plansService.parsePlanFeatures(html);

      expect(features).toEqual(['Feature 1', 'Feature 2', 'Feature 3']);
    });

    it('should return empty array for empty description', () => {
      expect(plansService.parsePlanFeatures('')).toEqual([]);
      expect(plansService.parsePlanFeatures(null as any)).toEqual([]);
    });
  });

  describe('getDiscountPercentage', () => {
    it('should calculate discount percentage', () => {
      expect(plansService.getDiscountPercentage(100, 80)).toBe(20);
      expect(plansService.getDiscountPercentage(50, 40)).toBe(20);
    });

    it('should return 0 when no discount', () => {
      expect(plansService.getDiscountPercentage(100, 100)).toBe(0);
      expect(plansService.getDiscountPercentage(100, 120)).toBe(0);
      expect(plansService.getDiscountPercentage(100, 0)).toBe(0);
    });
  });

  describe('hasPromotion', () => {
    it('should return true when bitPromotion is true', () => {
      const plan = { bitPromotion: true, decPrice: 100, decSalePrice: 100 } as any;
      expect(plansService.hasPromotion(plan)).toBe(true);
    });

    it('should return true when sale price is lower', () => {
      const plan = { bitPromotion: false, decPrice: 100, decSalePrice: 80 } as any;
      expect(plansService.hasPromotion(plan)).toBe(true);
    });

    it('should return false when no promotion', () => {
      const plan = { bitPromotion: false, decPrice: 100, decSalePrice: 0 } as any;
      expect(plansService.hasPromotion(plan)).toBe(false);
    });
  });

  describe('getEffectivePrice', () => {
    it('should return sale price when lower than regular', () => {
      const plan = { decPrice: 100, decSalePrice: 80 } as any;
      expect(plansService.getEffectivePrice(plan)).toBe(80);
    });

    it('should return regular price when no sale', () => {
      const plan = { decPrice: 100, decSalePrice: 0 } as any;
      expect(plansService.getEffectivePrice(plan)).toBe(100);
    });
  });

  describe('sortByPrice', () => {
    const plans = [
      { decPrice: 100, decSalePrice: 0 },
      { decPrice: 50, decSalePrice: 0 },
      { decPrice: 75, decSalePrice: 60 },
    ] as any[];

    it('should sort plans by price ascending', () => {
      const sorted = plansService.sortByPrice(plans, true);
      expect(sorted[0].decPrice).toBe(50);
      expect(sorted[1].decPrice).toBe(75);
      expect(sorted[2].decPrice).toBe(100);
    });

    it('should sort plans by price descending', () => {
      const sorted = plansService.sortByPrice(plans, false);
      expect(sorted[0].decPrice).toBe(100);
      expect(sorted[2].decPrice).toBe(50);
    });

    it('should not mutate original array', () => {
      const original = [...plans];
      plansService.sortByPrice(plans, true);
      expect(plans).toEqual(original);
    });
  });
});
