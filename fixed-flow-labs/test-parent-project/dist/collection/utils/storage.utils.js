// ============================================
// STORAGE UTILS - SessionStorage Utilities
// Fixed Service Flow Web Component
// ============================================
/**
 * Storage utilities for sessionStorage with Base64 encoding
 * Following TEL pattern for session data persistence
 */
export const storageUtils = {
    /**
     * Get value from sessionStorage
     */
    get(key) {
        try {
            const value = sessionStorage.getItem(key);
            return value;
        }
        catch {
            return null;
        }
    },
    /**
     * Set value in sessionStorage
     */
    set(key, value) {
        try {
            sessionStorage.setItem(key, value);
        }
        catch (e) {
            console.error('[StorageUtils] Error setting value:', e);
        }
    },
    /**
     * Get JSON value from sessionStorage
     */
    getJSON(key) {
        try {
            const value = sessionStorage.getItem(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    },
    /**
     * Set JSON value in sessionStorage
     */
    setJSON(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.error('[StorageUtils] Error setting JSON value:', e);
        }
    },
    /**
     * Remove value from sessionStorage
     */
    remove(key) {
        try {
            sessionStorage.removeItem(key);
        }
        catch (e) {
            console.error('[StorageUtils] Error removing value:', e);
        }
    },
    /**
     * Clear all sessionStorage
     */
    clear() {
        try {
            sessionStorage.clear();
        }
        catch (e) {
            console.error('[StorageUtils] Error clearing storage:', e);
        }
    },
    /**
     * Get value with Base64 decoding (TEL pattern)
     */
    getEncoded(key) {
        try {
            const value = sessionStorage.getItem(key);
            if (!value)
                return null;
            return atob(value);
        }
        catch {
            return null;
        }
    },
    /**
     * Set value with Base64 encoding (TEL pattern)
     */
    setEncoded(key, value) {
        try {
            sessionStorage.setItem(key, btoa(value));
        }
        catch (e) {
            console.error('[StorageUtils] Error setting encoded value:', e);
        }
    },
    /**
     * Get JSON value with Base64 decoding (TEL pattern)
     */
    getEncodedJSON(key) {
        try {
            const value = sessionStorage.getItem(key);
            if (!value)
                return null;
            const decoded = atob(value);
            return JSON.parse(decoded);
        }
        catch {
            return null;
        }
    },
    /**
     * Set JSON value with Base64 encoding (TEL pattern)
     */
    setEncodedJSON(key, value) {
        try {
            const json = JSON.stringify(value);
            sessionStorage.setItem(key, btoa(json));
        }
        catch (e) {
            console.error('[StorageUtils] Error setting encoded JSON value:', e);
        }
    },
};
//# sourceMappingURL=storage.utils.js.map
