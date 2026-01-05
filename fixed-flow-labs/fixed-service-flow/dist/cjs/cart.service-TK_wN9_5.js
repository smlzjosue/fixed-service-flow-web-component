'use strict';

var token_service = require('./token.service-B-RtLk56.js');

// ============================================
// CART SERVICE - Shopping Cart for CLARO HOGAR
// Fixed Service Flow Web Component
// Based on TEL: card.service.ts
// ============================================
// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS = {
    CART: 'cart',
    CART_ID: 'cartId',
    MAIN_ID: 'mainId',
    DISCOUNT_COUPON: 'discountCoupon',
    CART_TOTAL: 'cartTotal',
    CART_PRODUCTS: 'cartProducts',
};
// ------------------------------------------
// CONSTANTS
// ------------------------------------------
// Flow IDs (from TEL appConst.ts)
const FLOW_ID = {
    HOME: 6};
// Credit class
const DEFAULT_CREDIT_CLASS = 'C';
// ------------------------------------------
// CART SERVICE CLASS
// ------------------------------------------
class CartService {
    // ------------------------------------------
    // GET CART
    // ------------------------------------------
    /**
     * Retrieves the shopping cart contents
     * Endpoint: POST api/Card/getCart
     *
     * @param promoCode - Optional discount/promo code
     * @returns CartResponse with products and totals
     */
    async getCart(promoCode = '') {
        try {
            await token_service.tokenService.ensureToken();
            // Get promo code from session if not provided
            const appliedPromoCode = promoCode || this.getDiscountCoupon() || '';
            const request = {
                promoCode: appliedPromoCode,
            };
            console.log('[CartService] Getting cart with promo:', appliedPromoCode || 'none');
            const response = await token_service.httpService.post('api/Card/getCart', request);
            if (response.hasError) {
                console.error('[CartService] API error:', response.message);
                return {
                    hasError: true,
                    message: response.message || 'Error al obtener el carrito',
                    errorDisplay: response.errorDisplay,
                };
            }
            // Store cart data in session
            this.storeCartInSession(response);
            return response;
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                hasError: true,
                message: 'Error de conexión al obtener el carrito',
            };
        }
    }
    // ------------------------------------------
    // ADD TO CART
    // ------------------------------------------
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
    async addToCart(product, installments, quantity = 1, parentCartId, parentProductId) {
        try {
            await token_service.tokenService.ensureToken();
            const token = token_service.tokenService.getToken() || '';
            // Build cart item object (following TEL pushAddToCart format)
            const cartItem = {
                token: token,
                productId: String(product.productId),
                notificationDetailID: 0,
                chvSource: '',
                promoCode: '',
                installments: installments,
                decPrice: product.update_price || 0,
                decDeposit: 0,
                decDownPayment: product.decDownPayment || 0,
                decTotalPrice: product.regular_price || 0,
                Qty: quantity,
                flowId: FLOW_ID.HOME,
                ssoToken: '',
                userID: '0',
                parentProductId: parentProductId || 0,
                parentCartId: parentCartId || 0,
                creditClass: DEFAULT_CREDIT_CLASS,
                downgradeAllowed: false,
                pendingAccelerated: 0,
                acceletartedAmount: 0,
                pastDueAmount: 0,
                delicuency: false,
            };
            // Backend expects cartItems as a JSON STRING of array, not an object
            // See: CardController.cs line 52: "{\"cartItems\": " + data.cartItems + "}"
            const cartItemsString = JSON.stringify([cartItem]);
            const request = {
                cartItems: cartItemsString,
            };
            console.log('[CartService] Adding to cart:', product.productName);
            console.log('[CartService] Request payload:', request);
            const response = await token_service.httpService.post('api/Card/addToCart', request);
            if (response.hasError) {
                console.error('[CartService] Add to cart error:', response.message);
                return {
                    code: 0,
                    hasError: true,
                    message: response.message || 'Error al agregar al carrito',
                    errorDisplay: response.errorDisplay,
                };
            }
            // Store the mainId returned
            if (response.code) {
                this.storeMainId(response.code);
            }
            console.log('[CartService] Added to cart, mainId:', response.code);
            return response;
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                code: 0,
                hasError: true,
                message: 'Error de conexión al agregar al carrito',
            };
        }
    }
    /**
     * Adds a plan to the cart
     * Plans have special handling with parentCartId linking to the equipment
     *
     * IMPORTANT: Backend expects `cartItems` as a JSON string array
     */
    async addPlanToCart(plan, parentCartId, parentProductId) {
        try {
            await token_service.tokenService.ensureToken();
            const token = token_service.tokenService.getToken() || '';
            // Build cart item for plan (following TEL format)
            const cartItem = {
                token: token,
                productId: String(plan.planId),
                notificationDetailID: 0,
                chvSource: '',
                promoCode: '',
                installments: 1, // Plans are monthly
                decPrice: plan.decSalePrice || plan.decPrice,
                decDeposit: 0,
                decDownPayment: 0,
                decTotalPrice: plan.decPrice,
                Qty: 1,
                flowId: FLOW_ID.HOME,
                ssoToken: '',
                userID: '0',
                parentProductId: parentProductId,
                parentCartId: parentCartId,
                creditClass: DEFAULT_CREDIT_CLASS,
                downgradeAllowed: false,
                pendingAccelerated: 0,
                acceletartedAmount: 0,
                pastDueAmount: 0,
                delicuency: false,
            };
            // Backend expects cartItems as JSON string
            const cartItemsString = JSON.stringify([cartItem]);
            const request = {
                cartItems: cartItemsString,
            };
            console.log('[CartService] Adding plan to cart:', plan.planName);
            const response = await token_service.httpService.post('api/Card/addToCart', request);
            if (response.hasError) {
                console.error('[CartService] Add plan error:', response.message);
                return {
                    code: 0,
                    hasError: true,
                    message: response.message || 'Error al agregar el plan',
                    errorDisplay: response.errorDisplay,
                };
            }
            console.log('[CartService] Plan added to cart');
            return response;
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                code: 0,
                hasError: true,
                message: 'Error de conexión al agregar el plan',
            };
        }
    }
    // ------------------------------------------
    // DELETE FROM CART
    // ------------------------------------------
    /**
     * Removes an item from the cart
     * Endpoint: POST api/Card/deleteItem
     *
     * @param cartId - Cart item ID to remove
     * @param productId - Product ID to remove
     * @returns Success/error response
     */
    async deleteItem(cartId, productId) {
        try {
            await token_service.tokenService.ensureToken();
            const request = {
                cartId: cartId,
                productId: productId,
            };
            console.log('[CartService] Deleting item:', cartId, productId);
            const response = await token_service.httpService.post('api/Card/deleteItem', request);
            if (response.hasError) {
                console.error('[CartService] Delete error:', response.message);
                return {
                    hasError: true,
                    message: response.message || 'Error al eliminar del carrito',
                };
            }
            console.log('[CartService] Item deleted successfully');
            return { hasError: false };
        }
        catch (error) {
            console.error('[CartService] Exception:', error);
            return {
                hasError: true,
                message: 'Error de conexión al eliminar del carrito',
            };
        }
    }
    /**
     * Clears the entire cart
     * Deletes all items one by one
     */
    async clearCart() {
        try {
            const cart = await this.getCart();
            if (cart.hasError || !cart.products?.length) {
                return { hasError: false };
            }
            // Delete each item
            for (const item of cart.products) {
                const result = await this.deleteItem(item.cartId, item.productId);
                if (result.hasError) {
                    return result;
                }
            }
            // Clear session storage
            this.clearCartSession();
            return { hasError: false };
        }
        catch (error) {
            console.error('[CartService] Clear cart error:', error);
            return {
                hasError: true,
                message: 'Error al limpiar el carrito',
            };
        }
    }
    // ------------------------------------------
    // SESSION STORAGE METHODS
    // ------------------------------------------
    /**
     * Stores cart data in session for quick access
     */
    storeCartInSession(cart) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            if (cart.totalPrice !== undefined) {
                sessionStorage.setItem(STORAGE_KEYS.CART_TOTAL, String(cart.totalPrice));
            }
            if (cart.products) {
                sessionStorage.setItem(STORAGE_KEYS.CART_PRODUCTS, JSON.stringify(cart.products));
            }
        }
        catch (e) {
            console.error('[CartService] Error storing cart:', e);
        }
    }
    /**
     * Gets cached cart from session
     */
    getCachedCart() {
        try {
            const data = sessionStorage.getItem(STORAGE_KEYS.CART);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores the mainId (primary cart item ID)
     */
    storeMainId(mainId) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.MAIN_ID, String(mainId));
        }
        catch (e) {
            console.error('[CartService] Error storing mainId:', e);
        }
    }
    /**
     * Gets the stored mainId
     */
    getMainId() {
        try {
            const value = sessionStorage.getItem(STORAGE_KEYS.MAIN_ID);
            return value ? parseInt(value, 10) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Stores discount/promo coupon code
     */
    storeDiscountCoupon(code) {
        try {
            sessionStorage.setItem(STORAGE_KEYS.DISCOUNT_COUPON, code);
        }
        catch (e) {
            console.error('[CartService] Error storing coupon:', e);
        }
    }
    /**
     * Gets stored discount coupon
     */
    getDiscountCoupon() {
        try {
            return sessionStorage.getItem(STORAGE_KEYS.DISCOUNT_COUPON);
        }
        catch {
            return null;
        }
    }
    /**
     * Clears discount coupon
     */
    clearDiscountCoupon() {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.DISCOUNT_COUPON);
        }
        catch (e) {
            console.error('[CartService] Error clearing coupon:', e);
        }
    }
    /**
     * Clears all cart session data
     */
    clearCartSession() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                sessionStorage.removeItem(key);
            });
            console.log('[CartService] Cleared cart session');
        }
        catch (e) {
            console.error('[CartService] Error clearing session:', e);
        }
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Calculates cart totals from items
     */
    calculateTotals(items) {
        let subtotal = 0;
        let monthlyPayment = 0;
        items.forEach(item => {
            subtotal += (item.decPrice || 0) * item.qty;
            monthlyPayment += (item.decTotalPerMonth || item.decPrice || 0) * item.qty;
        });
        // Puerto Rico tax rate (11.5%)
        const taxRate = 0.115;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        return {
            subtotal: Number(subtotal.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            total: Number(total.toFixed(2)),
            monthlyPayment: Number(monthlyPayment.toFixed(2)),
        };
    }
    /**
     * Gets equipment items from cart (excludes plans)
     */
    getEquipmentItems(items) {
        return items.filter(item => item.equipment === true || item.home === true);
    }
    /**
     * Gets plan items from cart
     */
    getPlanItems(items) {
        return items.filter(item => item.plan === true);
    }
    /**
     * Checks if cart has equipment
     */
    hasEquipment(items) {
        return items.some(item => item.equipment === true || item.home === true);
    }
    /**
     * Checks if cart has a plan
     */
    hasPlan(items) {
        return items.some(item => item.plan === true);
    }
    /**
     * Gets cart item count
     */
    getItemCount(items) {
        return items.reduce((count, item) => count + item.qty, 0);
    }
    /**
     * Formats price for display
     */
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const cartService = new CartService();

exports.cartService = cartService;
//# sourceMappingURL=cart.service-TK_wN9_5.js.map

//# sourceMappingURL=cart.service-TK_wN9_5.js.map