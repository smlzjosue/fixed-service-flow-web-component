import { h as httpService, t as tokenService } from './p-De3C6PL0.js';

// ============================================
// STORAGE UTILS - SessionStorage Utilities
// Fixed Service Flow Web Component
// ============================================
/**
 * Storage utilities for sessionStorage with Base64 encoding
 * Following TEL pattern for session data persistence
 */
const storageUtils = {
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

// ============================================
// SHIPPING SERVICE - Address & Delivery Management
// Fixed Service Flow Web Component
// Based on TEL ShipmentService
// ============================================
// ------------------------------------------
// ZIP CODE DATA (Puerto Rico)
// ------------------------------------------
const PR_ZIP_CODES = [
    { label: 'Adjuntas', value: '00601' },
    { label: 'Adjuntas', value: '00631' },
    { label: 'Aguada', value: '00602' },
    { label: 'Aguadilla', value: '00603' },
    { label: 'Aguadilla', value: '00604' },
    { label: 'Aguadilla', value: '00605' },
    { label: 'Aguadilla', value: '00690' },
    { label: 'Aguas Buenas', value: '00703' },
    { label: 'Aibonito', value: '00705' },
    { label: 'La Plata', value: '00786' },
    { label: 'Añasco', value: '00610' },
    { label: 'Angeles', value: '00611' },
    { label: 'Arecibo', value: '00612' },
    { label: 'Arecibo', value: '00613' },
    { label: 'Arecibo', value: '00614' },
    { label: 'Arecibo', value: '00616' },
    { label: 'Arecibo', value: '00652' },
    { label: 'Arecibo', value: '00688' },
    { label: 'Arroyo', value: '00714' },
    { label: 'Barceloneta', value: '00617' },
    { label: 'Barranquitas', value: '00794' },
    { label: 'Bayamón', value: '00956' },
    { label: 'Bayamón', value: '00957' },
    { label: 'Bayamón', value: '00959' },
    { label: 'Bayamón', value: '00961' },
    { label: 'Bayamón', value: '00958' },
    { label: 'Cabo Rojo', value: '00623' },
    { label: 'Boquerón', value: '00622' },
    { label: 'Caguas', value: '00725' },
    { label: 'Caguas', value: '00727' },
    { label: 'Caguas', value: '00726' },
    { label: 'Camuy', value: '00627' },
    { label: 'Canóvanas', value: '00729' },
    { label: 'Canóvanas', value: '00745' },
    { label: 'Carolina', value: '00979' },
    { label: 'Carolina', value: '00982' },
    { label: 'Carolina', value: '00983' },
    { label: 'Carolina', value: '00985' },
    { label: 'Carolina', value: '00987' },
    { label: 'Carolina', value: '00981' },
    { label: 'Carolina', value: '00984' },
    { label: 'Carolina', value: '00986' },
    { label: 'Carolina', value: '00988' },
    { label: 'Cataño', value: '00962' },
    { label: 'Cataño', value: '00963' },
    { label: 'Cayey', value: '00736' },
    { label: 'Cayey', value: '00737' },
    { label: 'Ceiba', value: '00735' },
    { label: 'Ceiba', value: '00742' },
    { label: 'Ciales', value: '00638' },
    { label: 'Cidra', value: '00739' },
    { label: 'Coamo', value: '00769' },
    { label: 'Comerio', value: '00782' },
    { label: 'Corozal', value: '00783' },
    { label: 'Culebra', value: '00775' },
    { label: 'Dorado', value: '00646' },
    { label: 'Fajardo', value: '00738' },
    { label: 'Fajardo', value: '00740' },
    { label: 'Florida', value: '00650' },
    { label: 'Guánica', value: '00653' },
    { label: 'Guánica', value: '00647' },
    { label: 'Guayama', value: '00784' },
    { label: 'Guayama', value: '00704' },
    { label: 'Guayama', value: '00785' },
    { label: 'Guayanilla', value: '00656' },
    { label: 'Guaynabo', value: '00965' },
    { label: 'Guaynabo', value: '00966' },
    { label: 'Guaynabo', value: '00968' },
    { label: 'Guaynabo', value: '00971' },
    { label: 'Guaynabo', value: '00970' },
    { label: 'Guaynabo', value: '00969' },
    { label: 'Gurabo', value: '00778' },
    { label: 'Hatillo', value: '00659' },
    { label: 'Hormigueros', value: '00660' },
    { label: 'Humacao', value: '00791' },
    { label: 'Humacao', value: '00792' },
    { label: 'Humacao', value: '00741' },
    { label: 'Isabela', value: '00662' },
    { label: 'Jayuya', value: '00664' },
    { label: 'Juana Díaz', value: '00795' },
    { label: 'Juncos', value: '00777' },
    { label: 'Lajas', value: '00667' },
    { label: 'Lares', value: '00669' },
    { label: 'Las Marías', value: '00670' },
    { label: 'Las Piedras', value: '00771' },
    { label: 'Loíza', value: '00772' },
    { label: 'Luquillo', value: '00773' },
    { label: 'Manatí', value: '00674' },
    { label: 'Maricao', value: '00606' },
    { label: 'Maunabo', value: '00707' },
    { label: 'Mayaguez', value: '00680' },
    { label: 'Mayaguez', value: '00682' },
    { label: 'Mayaguez', value: '00681' },
    { label: 'Moca', value: '00676' },
    { label: 'Morovis', value: '00687' },
    { label: 'Naguabo', value: '00718' },
    { label: 'Rio Blanco', value: '00744' },
    { label: 'Naranjito', value: '00719' },
    { label: 'Orocovis', value: '00720' },
    { label: 'Patillas', value: '00723' },
    { label: 'Peñuelas', value: '00624' },
    { label: 'Ponce', value: '00716' },
    { label: 'Ponce', value: '00717' },
    { label: 'Ponce', value: '00728' },
    { label: 'Ponce', value: '00730' },
    { label: 'Ponce', value: '00731' },
    { label: 'Ponce', value: '00733' },
    { label: 'Ponce', value: '00780' },
    { label: 'Ponce', value: '00715' },
    { label: 'Ponce', value: '00732' },
    { label: 'Ponce', value: '00734' },
    { label: 'Quebradillas', value: '00678' },
    { label: 'Rincón', value: '00677' },
    { label: 'Río Grande', value: '00721' },
    { label: 'Río Grande', value: '00745' },
    { label: 'Sabana Grande', value: '00637' },
    { label: 'Salinas', value: '00751' },
    { label: 'San Germán', value: '00683' },
    { label: 'San Germán', value: '00636' },
    { label: 'San Juan', value: '00921' },
    { label: 'San Juan', value: '00923' },
    { label: 'San Juan', value: '00924' },
    { label: 'San Juan', value: '00929' },
    { label: 'San Juan', value: '00915' },
    { label: 'San Juan', value: '00916' },
    { label: 'San Juan', value: '00920' },
    { label: 'San Juan', value: '00909' },
    { label: 'San Juan', value: '00910' },
    { label: 'Fort Buchanan', value: '00934' },
    { label: 'San Juan', value: '00936' },
    { label: 'San Juan', value: '00917' },
    { label: 'San Juan', value: '00919' },
    { label: 'San Juan', value: '00911' },
    { label: 'San Juan', value: '00912' },
    { label: 'San Juan', value: '00913' },
    { label: 'San Juan', value: '00914' },
    { label: 'San Juan', value: '00940' },
    { label: 'San Juan', value: '00901' },
    { label: 'San Juan', value: '00902' },
    { label: 'San Juan', value: '00906' },
    { label: 'San Juan', value: '00925' },
    { label: 'San Juan', value: '00926' },
    { label: 'San Juan', value: '00927' },
    { label: 'San Juan', value: '00928' },
    { label: 'San Juan', value: '00930' },
    { label: 'San Juan', value: '00907' },
    { label: 'San Juan', value: '00908' },
    { label: 'San Juan', value: '00931' },
    { label: 'San Juan', value: '00933' },
    { label: 'San Lorenzo', value: '00754' },
    { label: 'San Sebastián', value: '00685' },
    { label: 'Santa Isabel', value: '00757' },
    { label: 'Toa Alta', value: '00953' },
    { label: 'Toa Alta', value: '00954' },
    { label: 'Toa Baja', value: '00949' },
    { label: 'Toa Baja', value: '00950' },
    { label: 'Toa Baja', value: '00951' },
    { label: 'Toa Baja', value: '00952' },
    { label: 'Trujillo Alto', value: '00976' },
    { label: 'Trujillo Alto', value: '00977' },
    { label: 'Saint Just', value: '00978' },
    { label: 'Utuado', value: '00641' },
    { label: 'Utuado', value: '00611' },
    { label: 'Vega Alta', value: '00692' },
    { label: 'Vega Baja', value: '00693' },
    { label: 'Vega Baja', value: '00694' },
    { label: 'Vieques', value: '00765' },
    { label: 'Villalba', value: '00766' },
    { label: 'Yabucoa', value: '00767' },
    { label: 'Yauco', value: '00698' },
];
// Invalid address patterns (PO Box, HC, RR not allowed)
const INVALID_ADDRESS_PATTERNS = ['PO BOX', 'P.O. BOX', 'P O BOX', 'HC ', 'RR ', 'APARTADO'];
// ------------------------------------------
// SESSION STORAGE KEYS
// ------------------------------------------
const STORAGE_KEYS = {
    SHIPMENT_ID: 'shipmentId',
    ZIP_CODE: 'zipCode',
    SHIPPING_ADDRESS: 'shippingAddress',
    DELIVERY_METHOD: 'deliveryMethodInfo',
};
// ------------------------------------------
// SHIPPING SERVICE CLASS
// ------------------------------------------
class ShippingService {
    http;
    constructor() {
        this.http = httpService;
    }
    // ------------------------------------------
    // API METHODS
    // ------------------------------------------
    /**
     * Create shipping address
     * TEL Pattern: userId comes from wBCUserID or defaults to '0' for new clients
     * flowId 6 = CLARO HOGAR flow
     */
    async createAddress(address, flowId = '6') {
        // TEL Pattern: userId from wBCUserID or '0' for new clients (line 102 shipment.page.ts)
        const userId = storageUtils.get('wBCUserID') || '0';
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        formData.append('flowId', flowId);
        formData.append('userId', userId);
        formData.append('name', address.name);
        formData.append('email', address.email);
        formData.append('phone', this.cleanPhoneNumber(address.phone));
        formData.append('phone2', this.cleanPhoneNumber(address.phone2 || ''));
        formData.append('address1', address.address1);
        formData.append('address2', address.address2 || '');
        formData.append('city', address.city);
        formData.append('zip', address.zip + '-0000');
        formData.append('state', address.state);
        formData.append('town', address.city);
        formData.append('notes', address.notes || '');
        formData.append('chvAuthorizerName', address.authorizerName || '');
        formData.append('chvAuthorizerPhone', this.cleanPhoneNumber(address.authorizerPhone || ''));
        try {
            const response = await this.http.postFormData('api/Address/create', formData);
            if (!response.hasError && response.response) {
                this.setShipmentId(response.response);
                this.setZipCode(address.zip);
                this.storeShippingAddress(address);
            }
            return response;
        }
        catch (error) {
            console.error('[ShippingService] Create address error:', error);
            return {
                hasError: true,
                message: 'Error al crear la dirección de envío',
            };
        }
    }
    /**
     * Get available delivery methods
     */
    async getDeliveryMethods() {
        const token = tokenService.getToken();
        const formData = new FormData();
        formData.append('token', token);
        try {
            const response = await this.http.postFormData('api/Address/getDeliveryMethods', formData);
            return response;
        }
        catch (error) {
            console.error('[ShippingService] Get delivery methods error:', error);
            return {
                hasError: true,
                errorDesc: 'Error al obtener métodos de entrega',
            };
        }
    }
    // ------------------------------------------
    // STORAGE METHODS
    // ------------------------------------------
    getShipmentId() {
        const id = storageUtils.get(STORAGE_KEYS.SHIPMENT_ID);
        return id ? parseInt(id, 10) : 0;
    }
    setShipmentId(id) {
        storageUtils.set(STORAGE_KEYS.SHIPMENT_ID, id.toString());
    }
    getZipCode() {
        return storageUtils.get(STORAGE_KEYS.ZIP_CODE) || '';
    }
    setZipCode(zip) {
        storageUtils.set(STORAGE_KEYS.ZIP_CODE, zip);
    }
    storeShippingAddress(address) {
        storageUtils.setJSON(STORAGE_KEYS.SHIPPING_ADDRESS, address);
    }
    getStoredShippingAddress() {
        return storageUtils.getJSON(STORAGE_KEYS.SHIPPING_ADDRESS);
    }
    storeDeliveryMethod(method) {
        storageUtils.setJSON(STORAGE_KEYS.DELIVERY_METHOD, method);
    }
    getStoredDeliveryMethod() {
        return storageUtils.getJSON(STORAGE_KEYS.DELIVERY_METHOD);
    }
    clearShippingData() {
        storageUtils.remove(STORAGE_KEYS.SHIPMENT_ID);
        storageUtils.remove(STORAGE_KEYS.ZIP_CODE);
        storageUtils.remove(STORAGE_KEYS.SHIPPING_ADDRESS);
        storageUtils.remove(STORAGE_KEYS.DELIVERY_METHOD);
    }
    // ------------------------------------------
    // VALIDATION METHODS
    // ------------------------------------------
    /**
     * Validate if zip code is valid for Puerto Rico
     * Returns the municipality name if valid, null if invalid
     */
    validateZipCode(zipCode) {
        const entry = PR_ZIP_CODES.find((z) => z.value === zipCode);
        return entry ? entry.label : null;
    }
    /**
     * Get municipality by zip code
     */
    getMunicipalityByZip(zipCode) {
        return this.validateZipCode(zipCode) || '';
    }
    /**
     * Get all valid zip codes
     */
    getAllZipCodes() {
        return PR_ZIP_CODES;
    }
    /**
     * Validate address is physical (not PO Box)
     */
    isValidPhysicalAddress(address) {
        const upperAddress = address.toUpperCase();
        return !INVALID_ADDRESS_PATTERNS.some((pattern) => upperAddress.includes(pattern));
    }
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    }
    /**
     * Validate phone format (10 digits)
     */
    isValidPhone(phone) {
        const cleaned = this.cleanPhoneNumber(phone);
        return cleaned.length === 10;
    }
    // ------------------------------------------
    // HELPER METHODS
    // ------------------------------------------
    /**
     * Clean phone number - remove formatting
     */
    cleanPhoneNumber(phone) {
        return phone.replace(/\(|\)|-|\s/g, '');
    }
    /**
     * Format phone number for display (XXX) XXX-XXXX
     */
    formatPhoneNumber(phone) {
        const cleaned = this.cleanPhoneNumber(phone);
        if (cleaned.length !== 10)
            return phone;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
}
// Export singleton instance
const shippingService = new ShippingService();

export { storageUtils as a, shippingService as s };
//# sourceMappingURL=p-Wsxu9H2a.js.map

//# sourceMappingURL=p-Wsxu9H2a.js.map