import { CartResponse, CartItem, AddToCartResponse, ProductDetail, CatalogueProduct, Plan } from '../store/interfaces';
declare class CartService {
    /**
     * Retrieves the shopping cart contents
     * Endpoint: POST api/Card/getCart
     *
     * @param promoCode - Optional discount/promo code
     * @returns CartResponse with products and totals
     */
    getCart(promoCode?: string): Promise<CartResponse>;
    /**
     * Adds a product to the cart
     * Endpoint: POST api/Card/addToCart
     *
     * IMPORTANT: The backend expects `cartItems` as a JSON string array, not an object.
     * See TEL: card.service.ts pushAddToCart() and CardController.cs addToCart()
     *
     * @param product - Product to add
     * @param installments - Number of installments
     * @param quantity - Quantity to add (default 1)
     * @param parentCartId - Parent cart ID for accessories
     * @param parentProductId - Parent product ID for accessories
     * @returns AddToCartResponse with new cart ID
     */
    addToCart(product: ProductDetail | CatalogueProduct, installments: number, quantity?: number, parentCartId?: number, parentProductId?: number): Promise<AddToCartResponse>;
    /**
     * Adds a plan to the cart
     * Plans have special handling with parentCartId linking to the equipment
     *
     * IMPORTANT: Backend expects `cartItems` as a JSON string array
     */
    addPlanToCart(plan: Plan, parentCartId: number, parentProductId: number): Promise<AddToCartResponse>;
    /**
     * Removes an item from the cart
     * Endpoint: POST api/Card/deleteItem
     *
     * @param cartId - Cart item ID to remove
     * @param productId - Product ID to remove
     * @returns Success/error response
     */
    deleteItem(cartId: number, productId: number): Promise<{
        hasError: boolean;
        message?: string;
    }>;
    /**
     * Clears the entire cart
     * Deletes all items one by one
     */
    clearCart(): Promise<{
        hasError: boolean;
        message?: string;
    }>;
    /**
     * Stores cart data in session for quick access
     */
    private storeCartInSession;
    /**
     * Gets cached cart from session
     */
    getCachedCart(): CartResponse | null;
    /**
     * Stores the mainId (primary cart item ID)
     */
    storeMainId(mainId: number): void;
    /**
     * Gets the stored mainId
     */
    getMainId(): number | null;
    /**
     * Stores discount/promo coupon code
     */
    storeDiscountCoupon(code: string): void;
    /**
     * Gets stored discount coupon
     */
    getDiscountCoupon(): string | null;
    /**
     * Clears discount coupon
     */
    clearDiscountCoupon(): void;
    /**
     * Clears all cart session data
     */
    clearCartSession(): void;
    /**
     * Calculates cart totals from items
     */
    calculateTotals(items: CartItem[]): {
        subtotal: number;
        tax: number;
        total: number;
        monthlyPayment: number;
    };
    /**
     * Gets equipment items from cart (excludes plans)
     */
    getEquipmentItems(items: CartItem[]): CartItem[];
    /**
     * Gets plan items from cart
     */
    getPlanItems(items: CartItem[]): CartItem[];
    /**
     * Checks if cart has equipment
     */
    hasEquipment(items: CartItem[]): boolean;
    /**
     * Checks if cart has a plan
     */
    hasPlan(items: CartItem[]): boolean;
    /**
     * Gets cart item count
     */
    getItemCount(items: CartItem[]): number;
    /**
     * Formats price for display
     */
    formatPrice(price: number): string;
}
export declare const cartService: CartService;
export default cartService;
