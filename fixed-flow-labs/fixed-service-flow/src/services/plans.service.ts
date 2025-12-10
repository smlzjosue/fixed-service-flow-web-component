// ============================================
// PLANS SERVICE - Internet Plans Management
// Fixed Service Flow Web Component
// ============================================

import { httpService } from './http.service';
import { tokenService } from './token.service';
import { PlansResponse, Plan } from '../store/interfaces';

// ------------------------------------------
// PLANS SERVICE CLASS
// ------------------------------------------

class PlansService {
  // ------------------------------------------
  // GET PLANS
  // ------------------------------------------

  /**
   * Fetches available internet plans for a service type
   * Endpoint: POST api/Plans/getPlansInternet
   */
  async getPlans(serviceType: string, catalogId: number = 0): Promise<Plan[]> {
    // Ensure token exists before making the call
    await tokenService.ensureToken();

    const response = await httpService.post<PlansResponse>('api/Plans/getPlansInternet', {
      catalogID: catalogId,
      type: serviceType,
    });

    if (response.hasError) {
      throw new Error(response.message || 'Failed to fetch plans');
    }

    return response.planList || [];
  }

  // ------------------------------------------
  // ADD TO CART
  // ------------------------------------------

  /**
   * Adds a plan to the cart
   * Endpoint: POST api/Plans/addToCartCurrentPlan
   */
  async addToCart(productId: number, cartId: number): Promise<void> {
    // Ensure token exists before making the call
    await tokenService.ensureToken();

    const formData = new FormData();
    formData.append('productId', String(productId));
    formData.append('cartId', String(cartId));

    await httpService.postFormData('api/Plans/addToCartCurrentPlan', formData);
  }

  // ------------------------------------------
  // HELPER METHODS
  // ------------------------------------------

  /**
   * Formats price for display
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  /**
   * Parses plan description HTML to extract features
   */
  parsePlanFeatures(description: string): string[] {
    if (!description) return [];

    // Extract text from <li> tags
    const liRegex = /<li[^>]*>([^<]+)<\/li>/gi;
    const features: string[] = [];
    let match;

    while ((match = liRegex.exec(description)) !== null) {
      features.push(match[1].trim());
    }

    return features;
  }

  /**
   * Gets the discount percentage if there's a sale price
   */
  getDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (!salePrice || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  /**
   * Checks if plan has a promotion
   */
  hasPromotion(plan: Plan): boolean {
    return plan.bitPromotion || (plan.decSalePrice && plan.decSalePrice < plan.decPrice);
  }

  /**
   * Gets the effective price (sale price if available, otherwise regular price)
   */
  getEffectivePrice(plan: Plan): number {
    if (plan.decSalePrice && plan.decSalePrice < plan.decPrice) {
      return plan.decSalePrice;
    }
    return plan.decPrice;
  }

  /**
   * Sorts plans by price (ascending)
   */
  sortByPrice(plans: Plan[], ascending: boolean = true): Plan[] {
    return [...plans].sort((a, b) => {
      const priceA = this.getEffectivePrice(a);
      const priceB = this.getEffectivePrice(b);
      return ascending ? priceA - priceB : priceB - priceA;
    });
  }
}

// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------

export const plansService = new PlansService();
export default plansService;
