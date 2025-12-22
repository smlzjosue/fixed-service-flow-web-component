// ============================================
// PLANS SERVICE - Internet Plans Management
// Fixed Service Flow Web Component
// ============================================

import { httpService } from './http.service';
import { tokenService } from './token.service';
import { PlansResponse, Plan, ApiResponse } from '../store/interfaces';

// ------------------------------------------
// INTERFACES
// ------------------------------------------

interface AddToCartResponse extends ApiResponse {
  code?: number; // cartId returned from backend
}

interface CartItem {
  token: string;
  productId: number;
  notificationDetailID: number;
  chvSource: string;
  promoCode: string;
  installments: number;
  decPrice: number;
  decDeposit: number;
  decDownPayment: number;
  decTotalPrice: number;
  Qty: number;
  flowId: number;
  ssoToken: string;
  userID: string;
  parentProductId: number;
  parentCartId: number;
  creditClass: string;
  downgradeAllowed: boolean;
  pendingAccelerated: number;
  acceletartedAmount: number;
  pastDueAmount: number;
  delicuency: boolean;
}

// ------------------------------------------
// PLANS SERVICE CLASS
// ------------------------------------------

class PlansService {
  // Track current plan in cart
  private currentCartId: number = 0;

  // ------------------------------------------
  // GET PLANS
  // ------------------------------------------

  /**
   * Fetches available internet plans for a service type
   * Endpoint: POST api/Plans/getPlansInternet
   *
   * For CLARO HOGAR, the type should be "internet" (following TEL pattern)
   */
  async getPlans(serviceType: string, catalogId: number = 0): Promise<Plan[]> {
    // Ensure token exists before making the call
    await tokenService.ensureToken();

    // Map service type to API type parameter
    // TEL uses 'internet' for CLARO HOGAR products
    let apiType = serviceType;
    if (serviceType === 'CLARO HOGAR') {
      apiType = 'internet';
    }

    console.log('[PlansService] Fetching plans for type:', apiType, 'catalogId:', catalogId);

    const response = await httpService.post<PlansResponse>('api/Plans/getPlansInternet', {
      catalogID: catalogId,
      type: apiType,
    });

    console.log('[PlansService] Response:', response);

    if (response.hasError) {
      console.error('[PlansService] API error:', response.message);
      throw new Error(response.message || 'Failed to fetch plans');
    }

    console.log('[PlansService] Plans found:', response.planList?.length || 0);
    return response.planList || [];
  }

  // ------------------------------------------
  // ADD TO CART (Main method - like TEL's api/Card/addToCart)
  // ------------------------------------------

  /**
   * Adds a plan to the cart
   * This replicates TEL's Card.pushAddToCart + Card.addToCart flow
   * Endpoint: POST api/Card/addToCart
   */
  async addToCart(
    plan: Plan,
    parentCartId: number = 0,
    parentProductId: number = 0,
    installments: number = 0,
    creditClass: string = ''
  ): Promise<AddToCartResponse> {
    // Ensure token exists before making the call
    await tokenService.ensureToken();

    const token = tokenService.getToken() || '';
    const price = this.getEffectivePrice(plan);

    // Build cart item following TEL's pushAddToCart structure
    const cartItem: CartItem = {
      token: token,
      productId: plan.planId,
      notificationDetailID: 0,
      chvSource: '',
      promoCode: sessionStorage.getItem('discountCoupon') || '',
      installments: installments,
      decPrice: price,
      decDeposit: 0,
      decDownPayment: 0,
      decTotalPrice: price,
      Qty: 1,
      flowId: 1,
      ssoToken: '',
      userID: '0',
      parentProductId: parentProductId,
      parentCartId: parentCartId,
      creditClass: creditClass,
      downgradeAllowed: false,
      pendingAccelerated: 0,
      acceletartedAmount: 0,
      pastDueAmount: 0,
      delicuency: false,
    };

    // POST to api/Card/addToCart with cartItems as JSON string array
    const response = await httpService.post<AddToCartResponse>('api/Card/addToCart', {
      cartItems: JSON.stringify([cartItem]),
    });

    if (response.hasError) {
      throw new Error(response.message || 'Failed to add plan to cart');
    }

    // Store cart info for later operations
    if (response.code) {
      this.currentCartId = response.code;
    }

    // Also store in sessionStorage (TEL pattern)
    this.storePlanInSession(plan);

    return response;
  }

  // ------------------------------------------
  // ADD TO CART CURRENT PLAN (Keep existing plan)
  // ------------------------------------------

  /**
   * Keeps the current plan in cart (used when continuing with existing plan)
   * Endpoint: POST api/Plans/addToCartCurrentPlan
   */
  async addToCartCurrentPlan(productId: number, cartId: number): Promise<ApiResponse> {
    // Ensure token exists before making the call
    await tokenService.ensureToken();

    const formData = new FormData();
    formData.append('productId', String(productId));
    formData.append('cartId', String(cartId));

    return await httpService.postFormData<ApiResponse>('api/Plans/addToCartCurrentPlan', formData);
  }

  // ------------------------------------------
  // DELETE PLAN FROM CART
  // ------------------------------------------

  /**
   * Removes a plan from the cart
   * Endpoint: POST api/Card/deleteItem
   */
  async deleteFromCart(cartId: number, productId: number = 0): Promise<ApiResponse> {
    await tokenService.ensureToken();

    const response = await httpService.post<ApiResponse>('api/Card/deleteItem', {
      cartId: cartId,
      productId: productId,
    });

    if (!response.hasError) {
      // Clear local tracking if we deleted the current plan
      if (cartId === this.currentCartId) {
        this.currentCartId = 0;
      }
    }

    return response;
  }

  // ------------------------------------------
  // SESSION STORAGE (TEL Pattern)
  // ------------------------------------------

  /**
   * Stores plan data in sessionStorage following TEL's pattern
   */
  private storePlanInSession(plan: Plan): void {
    try {
      // Store full plan object
      sessionStorage.setItem('plan', JSON.stringify(plan));
      // Store plan ID
      sessionStorage.setItem('planId', String(plan.planId));
      // Store price
      const price = this.getEffectivePrice(plan);
      sessionStorage.setItem('planPrice', String(price));
      // Store plan code in Base64 (TEL pattern)
      sessionStorage.setItem('planCodeInternet', btoa(plan.planSoc || String(plan.planId)));
    } catch (e) {
      console.error('[PlansService] Error storing plan in session:', e);
    }
  }

  /**
   * Gets stored plan from sessionStorage
   */
  getStoredPlan(): Plan | null {
    try {
      const planData = sessionStorage.getItem('plan');
      return planData ? JSON.parse(planData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Gets stored plan ID from sessionStorage
   */
  getStoredPlanId(): number {
    const planId = sessionStorage.getItem('planId');
    return planId ? parseInt(planId, 10) : 0;
  }

  /**
   * Gets current cart ID
   */
  getCartId(): number {
    return this.currentCartId;
  }

  /**
   * Sets current cart ID (from parent flow)
   */
  setCartId(cartId: number): void {
    this.currentCartId = cartId;
  }

  /**
   * Clears plan from session and memory
   */
  clearPlan(): void {
    this.currentCartId = 0;
    sessionStorage.removeItem('plan');
    sessionStorage.removeItem('planId');
    sessionStorage.removeItem('planPrice');
    sessionStorage.removeItem('planCodeInternet');
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
