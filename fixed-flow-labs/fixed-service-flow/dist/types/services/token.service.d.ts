import { TokenResponse } from '../store/interfaces';
declare class TokenService {
    private isInitializing;
    private initPromise;
    /**
     * Fetches a new token from the API
     * Endpoint: POST api/Token/getToken
     * Request: { "agentName": "" }
     */
    fetchToken(): Promise<TokenResponse>;
    /**
     * Initializes the token - checks sessionStorage first, then fetches if needed
     * This method should be called at the start of the flow
     */
    initialize(): Promise<boolean>;
    /**
     * Checks if a valid token exists
     */
    hasToken(): boolean;
    /**
     * Gets the current token
     */
    getToken(): string | null;
    /**
     * Gets the current correlation ID
     */
    getCorrelationId(): string | null;
    /**
     * Clears the token (logout)
     */
    clearToken(): void;
    /**
     * Forces a new token fetch (refresh)
     */
    refreshToken(): Promise<boolean>;
    /**
     * Ensures a token exists before proceeding
     * Use this as a guard before API calls
     */
    ensureToken(): Promise<void>;
}
export declare const tokenService: TokenService;
export default tokenService;
