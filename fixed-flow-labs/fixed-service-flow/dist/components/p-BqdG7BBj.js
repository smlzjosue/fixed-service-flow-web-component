import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import { f as flowActions } from './p-1rCYjdXc.js';
import { t as tokenService, h as httpService } from './p-De3C6PL0.js';
import { S as SERVICE_MESSAGES } from './p-DOL5qQha.js';
import { G as GOOGLE_MAPS_CONFIG, E as ERROR_MESSAGES } from './p-yvVRTe7W.js';

// ============================================
// COVERAGE SERVICE - Location Coverage Validation
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// COVERAGE SERVICE CLASS
// ------------------------------------------
class CoverageService {
    // ------------------------------------------
    // VALIDATE COVERAGE
    // ------------------------------------------
    /**
     * Validates coverage for a given location
     * Endpoint: POST api/Catalogue/getInternetPlans
     */
    async validateCoverage(latitude, longitude) {
        // Ensure token exists before making the call
        await tokenService.ensureToken();
        const response = await httpService.post('api/Catalogue/getInternetPlans', {
            latitud: String(latitude),
            longitud: String(longitude),
        });
        return response;
    }
    // ------------------------------------------
    // CHECK COVERAGE AND BUILD LOCATION DATA
    // ------------------------------------------
    /**
     * Checks coverage and returns structured location data
     */
    async checkCoverage(latitude, longitude, address, city, zipCode) {
        const response = await this.validateCoverage(latitude, longitude);
        // Check for errors
        if (response.hasError) {
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: '',
                serviceMessage: SERVICE_MESSAGES.NO_COVERAGE,
                isValid: false,
            };
        }
        // Get the priority service
        const serviceType = response.priorityService;
        // Find the service message
        let serviceMessage = SERVICE_MESSAGES.NO_COVERAGE;
        if (response.attributes && response.attributes.length > 0) {
            const priorityAttribute = response.attributes.find(attr => attr.servicE_NAME === serviceType);
            if (priorityAttribute) {
                serviceMessage = priorityAttribute.servicE_MESSAGE;
            }
        }
        // Check for PR LIMIT (out of coverage range)
        if (serviceType === 'PR LIMIT') {
            console.log('[CoverageService] PR LIMIT detected - out of coverage range');
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: 'PR LIMIT',
                serviceMessage: SERVICE_MESSAGES.PR_LIMIT,
                isValid: false,
            };
        }
        // Check for CLARO HOGAR (wireless internet option)
        if (serviceType.toUpperCase() === 'CLARO HOGAR') {
            console.log('[CoverageService] CLARO HOGAR detected - wireless internet option');
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: 'CLARO HOGAR',
                serviceMessage: serviceMessage || SERVICE_MESSAGES.CLARO_HOGAR,
                isValid: true, // Valid but different flow (catalogue)
            };
        }
        // Validate that we have a valid fiber/DSL service type
        const validServiceTypes = ['GPON', 'VRAD'];
        const isValid = validServiceTypes.includes(serviceType);
        if (!isValid) {
            return {
                latitude,
                longitude,
                address,
                city,
                zipCode,
                serviceType: '',
                serviceMessage: SERVICE_MESSAGES.NO_COVERAGE,
                isValid: false,
            };
        }
        console.log('[CoverageService] Returning valid coverage:', serviceType);
        return {
            latitude,
            longitude,
            address,
            city,
            zipCode,
            serviceType,
            serviceMessage,
            isValid: true,
        };
    }
    // ------------------------------------------
    // GET SERVICE TYPE DISPLAY NAME
    // ------------------------------------------
    /**
     * Gets a user-friendly display name for the service type
     */
    getServiceDisplayName(serviceType) {
        const displayNames = {
            GPON: 'Fibra Óptica',
            VRAD: 'Internet DSL',
            'CLARO HOGAR': 'Internet Inalámbrico',
        };
        return displayNames[serviceType] || serviceType;
    }
    // ------------------------------------------
    // CHECK IF SERVICE TYPE REQUIRES SPECIAL HANDLING
    // ------------------------------------------
    /**
     * Checks if the service type is CLARO HOGAR (requires different flow)
     */
    isClaroHogar(serviceType) {
        return serviceType.toLowerCase() === 'claro hogar';
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const coverageService = new CoverageService();

// ============================================
// MAPS SERVICE - Google Maps Integration
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// MAPS SERVICE CLASS
// ------------------------------------------
class MapsService {
    apiKey = '';
    isLoaded = false;
    loadPromise = null;
    map = null;
    marker = null;
    autocomplete = null;
    infoWindow = null;
    // ------------------------------------------
    // INITIALIZATION
    // ------------------------------------------
    /**
     * Sets the Google Maps API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Loads the Google Maps JavaScript API
     */
    async loadGoogleMaps() {
        if (this.isLoaded) {
            return;
        }
        if (this.loadPromise) {
            return this.loadPromise;
        }
        if (!this.apiKey) {
            throw new Error('Google Maps API key is required');
        }
        this.loadPromise = new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.google?.maps) {
                this.isLoaded = true;
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,marker&v=weekly`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load Google Maps API'));
            };
            document.head.appendChild(script);
        });
        return this.loadPromise;
    }
    /**
     * Checks if Google Maps is loaded
     */
    isGoogleMapsLoaded() {
        return this.isLoaded && !!window.google?.maps;
    }
    // ------------------------------------------
    // MAP MANAGEMENT
    // ------------------------------------------
    /**
     * Initializes the map in a container element
     */
    async initMap(container, options) {
        await this.loadGoogleMaps();
        const defaultOptions = {
            center: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER,
            zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
            mapTypeId: GOOGLE_MAPS_CONFIG.DEFAULT_MAP_TYPE,
            mapId: GOOGLE_MAPS_CONFIG.MAP_ID,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.LEFT_TOP,
                mapTypeIds: ['roadmap', 'satellite'],
            },
            streetViewControl: false,
            fullscreenControl: false,
        };
        this.map = new google.maps.Map(container, {
            ...defaultOptions,
            ...options,
        });
        return this.map;
    }
    /**
     * Gets the current map instance
     */
    getMap() {
        return this.map;
    }
    /**
     * Centers the map on given coordinates
     */
    centerMap(coordinates) {
        if (this.map) {
            this.map.setCenter(coordinates);
        }
    }
    /**
     * Sets the map zoom level
     */
    setZoom(zoom) {
        if (this.map) {
            this.map.setZoom(zoom);
        }
    }
    // ------------------------------------------
    // MARKER MANAGEMENT
    // ------------------------------------------
    /**
     * Adds or updates a marker on the map
     * @param coordinates - The marker position
     * @param verticalOffset - Pixels to shift the view up (positive = marker appears lower)
     */
    async setMarker(coordinates, verticalOffset = 0) {
        if (!this.map) {
            throw new Error('Map not initialized');
        }
        // Remove existing marker
        if (this.marker) {
            this.marker.map = null;
        }
        // Create new advanced marker
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
        this.marker = new AdvancedMarkerElement({
            map: this.map,
            position: coordinates,
            gmpDraggable: true,
        });
        // Center map on marker
        this.map.setCenter(coordinates);
        // Apply vertical offset to make marker appear lower on screen
        // Negative y value pans the map up, making the marker appear lower
        if (verticalOffset > 0) {
            this.map.panBy(0, -verticalOffset);
        }
    }
    /**
     * Adds a click listener to the map (like TEL: this.map.addListener("click", ...))
     * When user clicks on map, it triggers geocoding at that location
     */
    addMapClickListener(onMapClick) {
        if (!this.map) {
            console.warn('Map not initialized');
            return;
        }
        this.map.addListener('click', (e) => {
            if (e.latLng) {
                const coordinates = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                onMapClick(coordinates);
            }
        });
    }
    /**
     * Clears the marker from the map (like TEL: clear() method)
     */
    clear() {
        this.removeMarker();
    }
    /**
     * Gets the current marker position
     */
    getMarkerPosition() {
        if (!this.marker?.position) {
            return null;
        }
        const position = this.marker.position;
        return {
            lat: position.lat,
            lng: position.lng,
        };
    }
    /**
     * Removes the marker from the map
     */
    removeMarker() {
        if (this.marker) {
            this.marker.map = null;
            this.marker = null;
        }
    }
    // ------------------------------------------
    // INFOWINDOW (like TEL pattern)
    // ------------------------------------------
    /**
     * Shows an InfoWindow at the marker position with custom HTML content
     * Like TEL: this.infowindow.open(this.map, this.marker)
     */
    showInfoWindow(content, onContinueClick) {
        if (!this.map || !this.marker) {
            console.warn('Map or marker not initialized');
            return;
        }
        // Close existing InfoWindow
        this.closeInfoWindow();
        // Override Google Maps InfoWindow styles - wider modal with rounded corners
        const popStyle = `<style>
      .gm-ui-hover-effect { display: none !important; }
      .gm-style .gm-style-iw-c { padding: 0px !important; max-width: 400px !important; border-radius: 16px !important; overflow: visible !important; max-height: none !important; }
      .gm-style .gm-style-iw-d { padding: 0px !important; overflow: visible !important; max-width: 400px !important; max-height: none !important; overflow-y: visible !important; }
      .gm-style .gm-style-iw-d > div { overflow: visible !important; }
      .gm-style .gm-style-iw-tc { display: none !important; }
      .gm-style-iw { max-width: 400px !important; overflow: visible !important; max-height: none !important; }
      .gm-style-iw-chr { display: none !important; }
      .gm-style .gm-style-iw-d::-webkit-scrollbar { display: none !important; }
    </style>`;
        // Create InfoWindow with wider design
        this.infoWindow = new google.maps.InfoWindow({
            content: popStyle + content,
            maxWidth: 400,
        });
        // Open InfoWindow at marker position
        this.infoWindow.open({
            anchor: this.marker,
            map: this.map,
        });
        // Adjust InfoWindow styles after DOM is ready
        this.infoWindow.addListener('domready', () => {
            setTimeout(() => {
                const iwc = document.querySelector('.gm-style-iw-c');
                const iwd = document.querySelector('.gm-style-iw-d');
                if (iwc) {
                    iwc.style.setProperty('max-width', '400px', 'important');
                    iwc.style.setProperty('padding', '0', 'important');
                    iwc.style.setProperty('border-radius', '16px', 'important');
                    iwc.style.setProperty('box-shadow', '0 4px 20px rgba(0,0,0,0.15)', 'important');
                }
                if (iwd) {
                    iwd.style.setProperty('max-width', '400px', 'important');
                    iwd.style.setProperty('overflow', 'visible', 'important');
                }
            }, 50);
        });
        // Store callback reference for external access
        if (onContinueClick) {
            window.__infoWindowContinueCallback = onContinueClick;
        }
    }
    /**
     * Closes the InfoWindow
     */
    closeInfoWindow() {
        if (this.infoWindow) {
            this.infoWindow.close();
            this.infoWindow = null;
        }
    }
    /**
     * Gets the current InfoWindow instance
     */
    getInfoWindow() {
        return this.infoWindow;
    }
    // ------------------------------------------
    // AUTOCOMPLETE
    // ------------------------------------------
    /**
     * Initializes address autocomplete on an input element
     */
    async initAutocomplete(inputElement, onPlaceSelected) {
        await this.loadGoogleMaps();
        // Restrict to Puerto Rico
        const options = {
            componentRestrictions: { country: 'pr' },
            fields: ['address_components', 'geometry', 'formatted_address'],
            types: ['address'],
        };
        this.autocomplete = new google.maps.places.Autocomplete(inputElement, options);
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete?.getPlace();
            if (!place?.geometry?.location) {
                return;
            }
            const result = this.parseAddressComponents(place);
            onPlaceSelected(result);
            // Update map and marker if map exists
            if (this.map) {
                this.centerMap(result.coordinates);
                this.setMarker(result.coordinates);
            }
        });
    }
    /**
     * Parses Google Places address components
     */
    parseAddressComponents(place) {
        const components = place.address_components || [];
        let streetNumber = '';
        let route = '';
        let city = '';
        let zipCode = '';
        for (const component of components) {
            const type = component.types[0];
            switch (type) {
                case 'street_number':
                    streetNumber = component.long_name;
                    break;
                case 'route':
                    route = component.long_name;
                    break;
                case 'locality':
                case 'administrative_area_level_2':
                    city = city || component.long_name;
                    break;
                case 'postal_code':
                    zipCode = component.long_name;
                    break;
            }
        }
        const address = [streetNumber, route].filter(Boolean).join(' ');
        const location = place.geometry?.location;
        return {
            address,
            city,
            zipCode,
            coordinates: {
                lat: location?.lat() || 0,
                lng: location?.lng() || 0,
            },
            formattedAddress: place.formatted_address || '',
        };
    }
    // ------------------------------------------
    // GEOCODING
    // ------------------------------------------
    /**
     * Geocodes an address to coordinates
     */
    async geocodeAddress(address) {
        await this.loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({
                address,
                componentRestrictions: { country: 'pr' },
            }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const place = results[0];
                    const result = this.parseGeocoderResult(place);
                    resolve(result);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
     * Reverse geocodes coordinates to an address
     */
    async reverseGeocode(coordinates) {
        await this.loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({ location: coordinates }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const place = results[0];
                    const result = this.parseGeocoderResult(place);
                    resolve(result);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
     * Parses geocoder result to GeocodeResult
     */
    parseGeocoderResult(result) {
        const components = result.address_components || [];
        let streetNumber = '';
        let route = '';
        let city = '';
        let zipCode = '';
        for (const component of components) {
            const type = component.types[0];
            switch (type) {
                case 'street_number':
                    streetNumber = component.long_name;
                    break;
                case 'route':
                    route = component.long_name;
                    break;
                case 'locality':
                case 'administrative_area_level_2':
                    city = city || component.long_name;
                    break;
                case 'postal_code':
                    zipCode = component.long_name;
                    break;
            }
        }
        const address = [streetNumber, route].filter(Boolean).join(' ');
        const location = result.geometry.location;
        return {
            address,
            city,
            zipCode,
            coordinates: {
                lat: location.lat(),
                lng: location.lng(),
            },
            formattedAddress: result.formatted_address,
        };
    }
    // ------------------------------------------
    // GEOLOCATION
    // ------------------------------------------
    /**
     * Gets the user's current location
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            }, (error) => {
                let message = 'Error getting location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                reject(new Error(message));
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });
    }
    /**
     * Gets current location and reverse geocodes it
     */
    async getCurrentLocationWithAddress() {
        const coordinates = await this.getCurrentLocation();
        return this.reverseGeocode(coordinates);
    }
    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------
    /**
     * Cleans up map resources
     */
    destroy() {
        this.closeInfoWindow();
        this.removeMarker();
        this.autocomplete = null;
        this.map = null;
    }
}
// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------
const mapsService = new MapsService();

const stepLocationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-location{width:100%;position:relative}.step-location__validating-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.9);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn 0.2s ease-out}.step-location__validating-content{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem;background:#FFFFFF;border-radius:16px;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__validating-spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}.step-location__validating-text{margin:0;font-size:18px;font-weight:600;color:#333333}.step-location__header{text-align:center;margin-bottom:1rem}.step-location__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;font-weight:400}.step-location__title--highlight{color:#DA291C;font-weight:700}.step-location__map-container{position:relative;border-radius:0.75rem;overflow:hidden;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08)}.step-location__controls{position:absolute;top:3.5rem;left:0.75rem;right:0.75rem;z-index:1;display:flex;flex-direction:column;gap:0}@media (min-width: 576px){.step-location__controls{left:120px;right:50px}}@media (min-width: 768px){.step-location__controls{top:3.5rem;left:130px;right:60px}}.step-location__input-group{display:flex;align-items:center;background:#FFFFFF;border-radius:10px 10px 0 0;overflow:hidden;border:1px solid #E5E5E5;border-bottom:none}.step-location__location-container{background:#FFFFFF;border-radius:0 0 10px 10px;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:0.2rem 0.75rem;border:1px solid #E5E5E5;border-top:1px solid #E5E5E5}.step-location__input-icon{display:flex;align-items:center;justify-content:center;padding-left:0.75rem;color:#999999}.step-location__input-icon svg{width:20px;height:20px}.step-location__input{flex:1;padding:0.75rem 0.75rem;border:none;font-size:0.875rem;outline:none;background:transparent;min-width:0}.step-location__input::placeholder{color:#999999}.step-location__btn-validate{padding:0.75rem 1.25rem;background:#DA291C;color:#FFFFFF;border:none;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background-color 150ms ease;white-space:nowrap;min-width:100px}.step-location__btn-validate:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-location__btn-validate:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-validate--loading{pointer-events:none}.step-location__btn-validate-content{display:inline-flex;align-items:center;gap:0.5rem}.step-location__btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:btn-spin 0.8s linear infinite}@keyframes btn-spin{to{transform:rotate(360deg)}}.step-location__btn-location{display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0;background:transparent;color:#0097A9;border:none;border-radius:0;font-size:0.75rem;font-weight:500;cursor:pointer;box-shadow:none;transition:opacity 150ms ease;white-space:nowrap;align-self:flex-start}.step-location__btn-location:hover:not(:disabled){opacity:0.8}.step-location__btn-location:disabled{opacity:0.5;cursor:not-allowed}.step-location__btn-location-icon{width:14px;height:14px}.step-location__map{position:relative;width:100%;height:400px;background:#E5E5E5}@media (min-width: 768px){.step-location__map{height:500px}}.step-location__map-canvas{width:100%;height:100%}.step-location__map-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5}.step-location__map-loading p{font-size:1rem;font-weight:400;line-height:1.5;margin-top:1rem}.step-location__map-error{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5;padding:1rem;text-align:center}.step-location__map-error p{font-size:1rem;font-weight:400;line-height:1.5;color:#DA291C}.step-location__map-error small{margin-top:0.5rem;font-size:0.75rem}.step-location__spinner{width:40px;height:40px;border:3px solid #CCCCCC;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-location__map-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:#666666}.step-location__map-placeholder p{font-size:1rem;font-weight:400;line-height:1.5}.step-location__map-placeholder small{margin-top:0.5rem;font-size:0.75rem}.step-location__modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);z-index:400;display:flex;align-items:center;justify-content:center}.step-location__modal{position:relative;width:90%;max-width:400px;background:#FFFFFF;border-radius:0.75rem;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__modal--error .step-location__modal-error-bar{display:block}.step-location__modal-close{position:absolute;top:0.75rem;right:0.75rem;width:32px;height:32px;background:transparent;border:none;font-size:1.5rem;color:#666666;cursor:pointer;line-height:1}.step-location__modal-close:hover{color:#333333}.step-location__modal-error-bar{display:none;background:#DA291C;color:#FFFFFF;padding:0.5rem 1rem;margin:-2rem -1.5rem 1rem;font-weight:600}.step-location__modal-success-icon{width:60px;height:60px;margin:0 auto 1rem;color:#44AF69}.step-location__modal-success-icon svg{width:100%;height:100%}.step-location__modal-message{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;margin-bottom:1.5rem}.step-location__modal-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-location__modal-btn:disabled{opacity:0.5;cursor:not-allowed}.step-location__modal-btn{height:48px;background-color:#0097A9;color:#FFFFFF}.step-location__modal-btn:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-location__modal-btn:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}.step-location__modal-btn{min-width:150px}`;

// Offset to shift the map view so marker appears lower (InfoWindow visible above search bar)
const MAP_VERTICAL_OFFSET = 150;
const StepLocation = /*@__PURE__*/ proxyCustomElement(class StepLocation extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    googleMapsKey;
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    address = '';
    isValidating = false;
    isLoadingMap = true;
    isGettingLocation = false;
    locationData = null;
    mapError = null;
    currentCoordinates = null;
    geocodeResult = null;
    showErrorModal = false;
    errorMessage = '';
    // ------------------------------------------
    // REFS
    // ------------------------------------------
    mapContainer;
    addressInput;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    async componentDidLoad() {
        await this.initializeMap();
    }
    disconnectedCallback() {
        mapsService.destroy();
    }
    // ------------------------------------------
    // MAP INITIALIZATION
    // ------------------------------------------
    async initializeMap() {
        if (!this.googleMapsKey) {
            this.mapError = 'Google Maps API key no configurada';
            this.isLoadingMap = false;
            return;
        }
        try {
            mapsService.setApiKey(this.googleMapsKey);
            // Initialize map
            await mapsService.initMap(this.mapContainer);
            // Initialize autocomplete on address input
            if (this.addressInput) {
                await mapsService.initAutocomplete(this.addressInput, (result) => {
                    this.handlePlaceSelected(result);
                });
            }
            // Add map click listener (like TEL: this.map.addListener("click", ...))
            mapsService.addMapClickListener(async (coordinates) => {
                await this.handleMapClick(coordinates);
            });
            this.isLoadingMap = false;
        }
        catch (error) {
            console.error('Error initializing map:', error);
            this.mapError = 'Error al cargar Google Maps';
            this.isLoadingMap = false;
        }
    }
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleAddressChange = (e) => {
        this.address = e.target.value;
    };
    /**
     * Handles keypress on address input (like TEL: inputText.addEventListener("keypress", ...))
     * Triggers validation when Enter is pressed
     */
    handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
            e.preventDefault();
            this.handleValidate();
        }
    };
    /**
     * Handles click on map (like TEL: this.map.addListener("click", ...))
     * Reverse geocodes the clicked location and validates coverage
     */
    handleMapClick = async (coordinates) => {
        // Clear previous marker
        mapsService.clear();
        // Reverse geocode the clicked location
        const result = await mapsService.reverseGeocode(coordinates);
        if (result) {
            this.geocodeResult = result;
            this.address = result.formattedAddress || result.address;
            this.currentCoordinates = result.coordinates;
            // Update map marker with offset so InfoWindow appears below search bar
            mapsService.setMarker(result.coordinates, MAP_VERTICAL_OFFSET);
        }
        else {
            // If reverse geocode fails, still set coordinates
            this.currentCoordinates = coordinates;
            mapsService.setMarker(coordinates, MAP_VERTICAL_OFFSET);
        }
        // Auto-validate coverage (like TEL does on map click)
        await this.handleValidate();
    };
    handlePlaceSelected = (result) => {
        this.geocodeResult = result;
        this.address = result.formattedAddress || result.address;
        this.currentCoordinates = result.coordinates;
        // Update map marker
        mapsService.setMarker(result.coordinates);
        mapsService.centerMap(result.coordinates);
    };
    handleValidate = async () => {
        if (!this.currentCoordinates && !this.address.trim()) {
            return;
        }
        this.isValidating = true;
        try {
            let coords = this.currentCoordinates;
            let city = this.geocodeResult?.city || '';
            let zipCode = this.geocodeResult?.zipCode || '';
            // If we don't have coordinates, try to geocode the address
            if (!coords && this.address.trim()) {
                const geocoded = await mapsService.geocodeAddress(this.address);
                if (geocoded) {
                    coords = geocoded.coordinates;
                    city = geocoded.city;
                    zipCode = geocoded.zipCode;
                    this.currentCoordinates = coords;
                    this.geocodeResult = geocoded;
                    // Update map with offset so InfoWindow appears below search bar
                    mapsService.setMarker(coords, MAP_VERTICAL_OFFSET);
                }
                else {
                    this.errorMessage = 'No se pudo encontrar la dirección. Por favor, intenta con otra dirección.';
                    this.showErrorModal = true;
                    this.isValidating = false;
                    return;
                }
            }
            if (!coords) {
                this.errorMessage = 'Por favor, ingresa una dirección válida.';
                this.showErrorModal = true;
                this.isValidating = false;
                return;
            }
            // Validate coverage with API
            const location = await coverageService.checkCoverage(coords.lat, coords.lng, this.address || this.geocodeResult?.address || '', city, zipCode);
            this.locationData = location;
            // Determine coverage result type
            if (location.isValid) {
                if (location.serviceType.toUpperCase() === 'CLARO HOGAR') {
                    // CLARO HOGAR - show "Fuera de área" with options
                    this.showCoverageInfoWindow(location.serviceMessage, 'claro-hogar');
                }
                else {
                    // GPON/VRAD - show success
                    this.showCoverageInfoWindow(location.serviceMessage, 'success');
                }
            }
            else if (location.serviceType === 'PR LIMIT') {
                // PR LIMIT - show out of range message (no continue option)
                this.showCoverageInfoWindow(location.serviceMessage, 'pr-limit');
            }
            else {
                // Generic no coverage error
                this.showCoverageInfoWindow(ERROR_MESSAGES.NO_COVERAGE, 'no-coverage');
            }
        }
        catch (error) {
            console.error('Coverage validation error:', error);
            this.errorMessage = ERROR_MESSAGES.COVERAGE_ERROR;
            this.showErrorModal = true;
        }
        finally {
            this.isValidating = false;
        }
    };
    /**
     * Shows coverage result in InfoWindow on the marker
     * New design based on capturas 1.png and 2.png
     * @param message - The message to display
     * @param resultType - 'success' | 'claro-hogar' | 'pr-limit' | 'no-coverage'
     */
    showCoverageInfoWindow(message, resultType) {
        // SVG icon from covertura.svg (torre de transmisión con señal WiFi) - only for success
        const coverageIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.58325 19.5815L10.9873 4.5376" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M17.875 19.582L11.4707 4.53809" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M7.06067 14.8589L16.9086 18.3631" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M15.3981 14.8547L5.55017 18.3589" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M8.31006 11.8936L15.1257 14.3188" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M9.56519 8.60864L13.8695 11.4782" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M14.0804 11.8904L7.26477 14.3156" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M12.913 8.60864L8.60864 11.4782" stroke="black" stroke-width="0.956522" stroke-linecap="round"/>
      <path d="M11.2291 4.67082C11.8228 4.67082 12.3041 4.18951 12.3041 3.59579C12.3041 3.00206 11.8228 2.52075 11.2291 2.52075C10.6354 2.52075 10.1541 3.00206 10.1541 3.59579C10.1541 4.18951 10.6354 4.67082 11.2291 4.67082Z" fill="#FC4646" stroke="black" stroke-width="0.956522"/>
      <path d="M15.5457 5.24186C16.2939 4.22535 16.2939 2.70912 15.5457 1.69263" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M17.1342 6.11041C18.2923 4.62825 18.2923 2.32834 17.1342 0.846191" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M13.9615 4.3841C14.3 3.84461 14.3 3.10638 13.9615 2.56689" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M6.68811 5.24186C5.93984 4.22535 5.93984 2.70912 6.68811 1.69263" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M5.09949 6.11041C3.94132 4.62825 3.94132 2.32834 5.09949 0.846191" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
      <path d="M8.27209 4.3841C7.93361 3.84461 7.93361 3.10638 8.27209 2.56689" stroke="#FC4646" stroke-width="0.840492" stroke-linecap="round"/>
    </svg>`;
        // Configure content based on result type
        let titleHtml;
        let displayMessage;
        let buttonHtml;
        switch (resultType) {
            case 'success':
                // GPON/VRAD - Full coverage
                titleHtml = `<span style="flex-shrink: 0; margin-top: 2px;">${coverageIcon}</span>
           <span>¡Tu área posee nuestro servicio!</span>`;
                displayMessage = message;
                buttonHtml = `<button
          onclick="if(window.__infoWindowContinueCallback) window.__infoWindowContinueCallback();"
          style="
            background: #DA291C;
            color: #ffffff;
            border: none;
            padding: 12px 36px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            min-width: 150px;
          "
        >¡Lo quiero!</button>`;
                break;
            case 'claro-hogar':
                // CLARO HOGAR - Wireless internet option
                titleHtml = `<span><span style="color: #DA291C; font-weight: 700;">Fuera de área</span> <span style="font-weight: 400;">¡Pero tienes opciones!</span></span>`;
                displayMessage = 'Escoge entre nuestra selección de modems.';
                buttonHtml = `<button
          onclick="if(window.__infoWindowContinueCallback) window.__infoWindowContinueCallback();"
          style="
            background: #DA291C;
            color: #ffffff;
            border: none;
            padding: 12px 36px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            min-width: 150px;
          "
        >Ver opciones</button>`;
                break;
            case 'pr-limit':
                // PR LIMIT - Out of coverage range (no continue option)
                titleHtml = `<span style="color: #DA291C; font-weight: 700;">¡Fuera de área!</span>`;
                displayMessage = message;
                buttonHtml = ''; // No action button for PR LIMIT
                break;
            case 'no-coverage':
            default:
                // Generic no coverage
                titleHtml = `<span style="color: #DA291C; font-weight: 700;">¡Fuera de área!</span>`;
                displayMessage = message;
                buttonHtml = ''; // No action button
                break;
        }
        const infoWindowContent = `
      <div style="
        font-family: 'Open Sans', Arial, sans-serif;
        width: 100%;
        min-width: 340px;
        box-sizing: border-box;
        background: #ffffff;
        padding: 16px 20px 20px 20px;
        text-align: center;
        position: relative;
        border-radius: 16px;
      ">
        <!-- Close button -->
        <button
          onclick="if(window.__infoWindowCloseCallback) window.__infoWindowCloseCallback();"
          style="
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            background: transparent;
            border: none;
            font-size: 18px;
            color: #666;
            cursor: pointer;
            line-height: 1;
            padding: 0;
          "
        >×</button>

        <!-- Title -->
        <div style="
          margin: 0 0 10px 0;
          padding-right: 20px;
          font-size: 15px;
          font-weight: 700;
          color: #333;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 6px;
        ">
          ${titleHtml}
        </div>

        <!-- Message -->
        <p style="
          margin: 0 ${buttonHtml ? '0 16px 0' : '0 0 0'};
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        ">${displayMessage}</p>

        ${buttonHtml}
      </div>
    `;
        // Set up close callback
        window.__infoWindowCloseCallback = () => {
            mapsService.closeInfoWindow();
        };
        mapsService.showInfoWindow(infoWindowContent, () => {
            switch (resultType) {
                case 'success':
                    this.handleInfoWindowContinue();
                    break;
                case 'claro-hogar':
                    this.handleNoConverageWithOptions();
                    break;
                default:
                    // PR LIMIT and no-coverage - just close
                    mapsService.closeInfoWindow();
                    break;
            }
        });
    }
    /**
     * Handles "Ver opciones" action when no coverage but CLARO HOGAR is available
     */
    handleNoConverageWithOptions = () => {
        mapsService.closeInfoWindow();
        // Create location data for CLARO HOGAR flow
        if (this.currentCoordinates) {
            const claroHogarLocation = {
                latitude: this.currentCoordinates.lat,
                longitude: this.currentCoordinates.lng,
                address: this.address || this.geocodeResult?.address || '',
                city: this.geocodeResult?.city || '',
                zipCode: this.geocodeResult?.zipCode || '',
                serviceType: 'CLARO HOGAR',
                serviceMessage: 'Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.',
                isValid: true,
            };
            // Store in session and state
            this.storeLocationInSession(claroHogarLocation);
            flowActions.setLocation(claroHogarLocation);
            // Navigate to next step (catalogue)
            this.onNext?.();
        }
    };
    /**
     * Handles continue from InfoWindow (like TEL: goToRouter method)
     */
    handleInfoWindowContinue = () => {
        if (this.locationData && this.locationData.isValid) {
            // Close InfoWindow
            mapsService.closeInfoWindow();
            // Store data in sessionStorage with Base64 encoding (like TEL)
            this.storeLocationInSession(this.locationData);
            // Set location in store
            flowActions.setLocation(this.locationData);
            this.onNext?.();
        }
    };
    /**
     * Stores location data in sessionStorage with Base64 encoding (like TEL)
     * TEL pattern: sessionStorage.setItem('planCodeInternet', btoa(planCode))
     */
    storeLocationInSession(location) {
        try {
            // Store coordinates in Base64 (like TEL)
            sessionStorage.setItem('latitud', btoa(String(location.latitude)));
            sessionStorage.setItem('longitud', btoa(String(location.longitude)));
            // Special handling for CLARO HOGAR (like TEL)
            // TEL: if (servicE_NAME == 'CLARO HOGAR') { sessionStorage.removeItem('planCodeInternet'); }
            if (location.serviceType.toUpperCase() === 'CLARO HOGAR') {
                sessionStorage.removeItem('planCodeInternet');
                console.log('[StepLocation] CLARO HOGAR detected - planCodeInternet removed');
            }
            else {
                sessionStorage.setItem('planCodeInternet', btoa(location.serviceType));
                console.log('[StepLocation] Service type stored:', location.serviceType);
            }
            // Also store full plan data as JSON (for convenience)
            sessionStorage.setItem('plan', JSON.stringify({
                serviceType: location.serviceType,
                serviceMessage: location.serviceMessage,
                address: location.address,
                city: location.city,
                zipCode: location.zipCode,
            }));
            console.log('[StepLocation] Location data stored in sessionStorage');
        }
        catch (error) {
            console.error('[StepLocation] Error storing location in sessionStorage:', error);
        }
    }
    handleUseCurrentLocation = async () => {
        this.isGettingLocation = true;
        try {
            const result = await mapsService.getCurrentLocationWithAddress();
            if (result) {
                this.geocodeResult = result;
                this.address = result.formattedAddress || result.address;
                this.currentCoordinates = result.coordinates;
                // Update map
                mapsService.setMarker(result.coordinates);
                mapsService.centerMap(result.coordinates);
                mapsService.setZoom(17);
            }
            else {
                // Got coordinates but couldn't reverse geocode
                const coords = await mapsService.getCurrentLocation();
                this.currentCoordinates = coords;
                mapsService.setMarker(coords);
                mapsService.centerMap(coords);
                mapsService.setZoom(17);
            }
        }
        catch (error) {
            console.error('Geolocation error:', error);
            if (error.message.includes('denied')) {
                this.errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
            }
            else if (error.message.includes('unavailable')) {
                this.errorMessage = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
            }
            else {
                this.errorMessage = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
            }
            this.showErrorModal = true;
        }
        finally {
            this.isGettingLocation = false;
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: '9f00def9ccc346b50dd0092b34d33d0afc7d4272' }, h("div", { key: '43c8a619905081a65d3c67b8b6663ed28259feb3', class: "step-location" }, this.isValidating && (h("div", { key: '0195458030f10d73d5cef3a963aed32da7386665', class: "step-location__validating-overlay" }, h("div", { key: '665fe951b2d78542afbce22bc1b2f19add1f446c', class: "step-location__validating-content" }, h("div", { key: 'f5504f2ebb709665259abedad0fc5d0ae9b0044a', class: "step-location__validating-spinner" }), h("p", { key: '9652b97b4f7b9f8d464a426bcd421eb213bbab69', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: 'f78638177af520939d36b1f70314df4a6f596810', class: "step-location__header" }, h("h1", { key: '87bc6ffcdd7e7daccb547ee30c8e4a855e054a26', class: "step-location__title" }, h("span", { key: 'a021255a23f70de52af5b353018da87ebf6393da', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: 'eaf39af8b1dd929bf0b813b81cfcff7e0876b0c8', class: "step-location__map-container" }, h("div", { key: '59848c139c6faec39804d81f285a8865608f0a5f', class: "step-location__controls" }, h("div", { key: '67f5f4153d6466392853b94c4e2c262566f34efe', class: "step-location__input-group" }, h("span", { key: '30afbcbc962a7a35a66151d0c2a2d39ade23a5eb', class: "step-location__input-icon" }, h("svg", { key: '2240de42e3fdcde78accf64c6be949a49121b2da', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: '91a969294f1682a4f89c06fdf28ad17efeb5c707', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: '90bd9b6df6c45741d665e877173fd763dfbb5c7b', cx: "12", cy: "10", r: "3" }))), h("input", { key: 'aaeeb190efb97d1d482456c72162833866553e7f', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: 'dd78c6832ca5f10716c46acde8a74f75b9048576', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("div", { key: '8e9b6b132633af9aff0f1a837582c42a7a0d7ccb', class: "step-location__location-container" }, h("button", { key: 'a00bc9825e8fc1ac58d5fa28648a0940b733de88', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: 'e5af86f3be07afc4f97712929ca380fea34091c7', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "currentColor", stroke: "none" }, h("path", { key: '2eb697175b76a087b3e5e12f8048a449517c3ea1', d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual'))), h("div", { key: 'b4b08d3fe6cc830ddfab4aa1789d7a1a05901d2e', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: '2659f19175fb0d23ae1e267b751bde41ad5aa800', class: "step-location__map-loading" }, h("div", { key: '429a190be63c7b3c6cbd3f1be6ab99914da0e06c', class: "step-location__spinner" }), h("p", { key: 'ffc6ab435a50c7f0678c54ea3a2b20a69bf87cd2' }, "Cargando mapa..."))), this.mapError && (h("div", { key: 'd25ed7b6f0292bf85c979c43683c60d7aba954cb', class: "step-location__map-error" }, h("p", { key: '944f5296e4a0770a6f111da14a54053d184971b5' }, this.mapError), !this.googleMapsKey && (h("small", { key: '274ba996d5e94834368836bbb7817475c5aa64ee' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '288374c3ccab67a4ad9b0c46ea20aeb71835adf8', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: 'f0a9869b42a1efce9f2758814a30c320a3260e48', class: "step-location__modal-backdrop" }, h("div", { key: '5ae852cb63dd660c4175a11718b3847d458ece2c', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'ee317e1a56f6583f6e789eda000a170248dd6b84', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: '72dde675ffb4cb725bae7184388bb24641bad286', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: 'c653f42dd5c63fd6b9b193c4f2424f011e6d2c34', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '4eb8f7a55456e4e944498152b6500f0d03394311', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
    }
    static get style() { return stepLocationCss(); }
}, [769, "step-location", {
        "googleMapsKey": [1, "google-maps-key"],
        "onNext": [16],
        "onBack": [16],
        "address": [32],
        "isValidating": [32],
        "isLoadingMap": [32],
        "isGettingLocation": [32],
        "locationData": [32],
        "mapError": [32],
        "currentCoordinates": [32],
        "geocodeResult": [32],
        "showErrorModal": [32],
        "errorMessage": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-location"];
    components.forEach(tagName => { switch (tagName) {
        case "step-location":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepLocation);
            }
            break;
    } });
}
defineCustomElement();

export { StepLocation as S, defineCustomElement as d };
//# sourceMappingURL=p-BqdG7BBj.js.map

//# sourceMappingURL=p-BqdG7BBj.js.map