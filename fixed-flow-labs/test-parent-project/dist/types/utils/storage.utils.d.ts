/**
 * Storage utilities for sessionStorage with Base64 encoding
 * Following TEL pattern for session data persistence
 */
export declare const storageUtils: {
    /**
     * Get value from sessionStorage
     */
    get(key: string): string | null;
    /**
     * Set value in sessionStorage
     */
    set(key: string, value: string): void;
    /**
     * Get JSON value from sessionStorage
     */
    getJSON<T>(key: string): T | null;
    /**
     * Set JSON value in sessionStorage
     */
    setJSON<T>(key: string, value: T): void;
    /**
     * Remove value from sessionStorage
     */
    remove(key: string): void;
    /**
     * Clear all sessionStorage
     */
    clear(): void;
    /**
     * Get value with Base64 decoding (TEL pattern)
     */
    getEncoded(key: string): string | null;
    /**
     * Set value with Base64 encoding (TEL pattern)
     */
    setEncoded(key: string, value: string): void;
    /**
     * Get JSON value with Base64 decoding (TEL pattern)
     */
    getEncodedJSON<T>(key: string): T | null;
    /**
     * Set JSON value with Base64 encoding (TEL pattern)
     */
    setEncodedJSON<T>(key: string, value: T): void;
};
