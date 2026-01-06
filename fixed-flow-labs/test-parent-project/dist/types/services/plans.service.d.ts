import { Plan, ApiResponse } from '../store/interfaces';
interface AddToCartResponse extends ApiResponse {
    code?: number;
}
declare class PlansService {
    private currentCartId;
    /**
     * Fetches available internet plans for a service type
     * Endpoint: POST api/Plans/getPlansInternet
     *
     * For CLARO HOGAR, the type should be "internet" (following TEL pattern)
     */
    getPlans(serviceType: string, catalogId?: number): Promise<Plan[]>;
    /**
     * Adds a plan to the cart
     * This replicates TEL's Card.pushAddToCart + Card.addToCart flow
     * Endpoint: POST api/Card/addToCart
     */
    addToCart(plan: Plan, parentCartId?: number, parentProductId?: number, installments?: number, creditClass?: string): Promise<AddToCartResponse>;
    /**
     * Keeps the current plan in cart (used when continuing with existing plan)
     * Endpoint: POST api/Plans/addToCartCurrentPlan
     */
    addToCartCurrentPlan(productId: number, cartId: number): Promise<ApiResponse>;
    /**
     * Removes a plan from the cart
     * Endpoint: POST api/Card/deleteItem
     */
    deleteFromCart(cartId: number, productId?: number): Promise<ApiResponse>;
    /**
     * Stores plan data in sessionStorage following TEL's pattern
     */
    private storePlanInSession;
    /**
     * Gets stored plan from sessionStorage
     */
    getStoredPlan(): Plan | null;
    /**
     * Gets stored plan ID from sessionStorage
     */
    getStoredPlanId(): number;
    /**
     * Gets current cart ID
     */
    getCartId(): number;
    /**
     * Sets current cart ID (from parent flow)
     */
    setCartId(cartId: number): void;
    /**
     * Clears plan from session and memory
     */
    clearPlan(): void;
    /**
     * Formats price for display
     */
    formatPrice(price: number): string;
    /**
     * Parses plan description HTML to extract features
     */
    parsePlanFeatures(description: string): string[];
    /**
     * Gets the discount percentage if there's a sale price
     */
    getDiscountPercentage(originalPrice: number, salePrice: number): number;
    /**
     * Checks if plan has a promotion
     */
    hasPromotion(plan: Plan): boolean;
    /**
     * Gets the effective price (sale price if available, otherwise regular price)
     */
    getEffectivePrice(plan: Plan): number;
    /**
     * Sorts plans by price (ascending)
     */
    sortByPrice(plans: Plan[], ascending?: boolean): Plan[];
}
export declare const plansService: PlansService;
export default plansService;
