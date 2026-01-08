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
            this.mapError = 'No podemos abrir la validación de cobertura en este momento. Intenta nuevamente más tarde.';
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
                // TODO: Flujo CLARO HOGAR deshabilitado temporalmente. Restaurar cuando se habilite.
                titleHtml = `<span style="color: #DA291C; font-weight: 700;">¡Fuera de área!</span>`;
                // displayMessage = 'Escoge entre nuestra selección de modems.'; // Original - restaurar cuando se habilite
                displayMessage = 'No poseemos servicios en tu área'; // Provisional
                // TODO: Restaurar botón cuando se habilite el flujo CLARO HOGAR
                /*
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
                */
                buttonHtml = ''; // Botón oculto temporalmente
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
        return (h(Host, { key: '54a5ff3c6b523ad147b00cf7f09faefce5d22732' }, h("div", { key: '2588e009a859cd86e9008ae92f99645b761faf9b', class: "step-location" }, this.isValidating && (h("div", { key: '66813c5424a489dc74e715fe92e564ceac3230ed', class: "step-location__validating-overlay" }, h("div", { key: '6d328683e83fdc8c1fd568d927f186138c086ce7', class: "step-location__validating-content" }, h("div", { key: '724fd2eefa12c952fc7bdd60f6939695334cb2bf', class: "step-location__validating-spinner" }), h("p", { key: '5f4c8f9b5a73643485768a4ce5c71f5d4900517d', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: 'ca7063473ec212c22a0a7ce44f1e52b7751437bd', class: "step-location__header" }, h("h1", { key: '259333f3ec56803c44af276b1c6a8ce129ffbe09', class: "step-location__title" }, h("span", { key: '0fdfaa401f5a4e5fa1aeb8efd20a0f06d91e7d99', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '7ebe784ede8e29933eb6d2a2765a4cb87207a040', class: "step-location__map-container" }, h("div", { key: '8e6869f818f168c562aba6eb8bb66c19aa1667a6', class: "step-location__controls" }, h("div", { key: '6dfcc99a743689d4579f295914dd3acdde56fbf0', class: "step-location__input-group" }, h("span", { key: 'b216766b8fb6a0f5bc8920e17ef62d5a271d7cd3', class: "step-location__input-icon" }, h("svg", { key: '967f57b0aea6dce6eaa56ee3027a4978dbfdfb5c', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'e85148c10010909a6671af1efdefb48402a81ef9', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: '3e5776cd19a8015c80c2f5c12ef4c23bc242a18c', cx: "12", cy: "10", r: "3" }))), h("input", { key: 'd5e90625538b6391c191b8b9aa49d8d708d8d067', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: 'c117e64a77c858d525f221dd17cd5bc5ab443ccd', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("div", { key: '98c6078e1e59c0250ccc27198a9f5da9c2da021b', class: "step-location__location-container" }, h("button", { key: 'c6a8d4d359e76cd76603b04d5fbe5d8078347188', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: '9cfad9417379b945beb476a1f136aedfd1672302', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "currentColor", stroke: "none" }, h("path", { key: '8dafe163a8a5ceaf212c9028b10ae819808a705a', d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual'))), h("div", { key: 'ce81d999669f9426744b88a38ad03dac577cef0b', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: '90e445d02b25fbc1a33ed9e0339bc8e4b0b5202e', class: "step-location__map-loading" }, h("div", { key: '610fbf68fd393efb694b2b28ca1a60348c8ea6b8', class: "step-location__spinner" }), h("p", { key: '6e576450a8025066bb3abc29095e38e1b864016b' }, "Cargando mapa..."))), this.mapError && (h("div", { key: '7730c5ff6fd176b918900bc325dfb16e7f80794d', class: "step-location__map-error" }, h("p", { key: '5035e4d530ad61b40234c4938e21cc620b97623e' }, this.mapError), !this.googleMapsKey && (h("small", { key: '56425e22f8b070245c138d0b1e00bf21ce96464f' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '84d175c59110d08c73a5daedbfbc82ac8608d407', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: '3da65c36d312d597a6f2e16b697f7cf43ed194aa', class: "step-location__modal-backdrop" }, h("div", { key: 'fc6c6738e7924d840ce6e78ff67c382f96a9b00d', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'd68d55262d914412254a16fa7676972183e6f84d', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: 'cd1acaf7ff3d9c221a6137ea8b4108b57205258b', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: 'a3978ce5f0da0fb7ad0fadaeef15ded0fa6e4350', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '1a06f5385b6d04caa1737e21ee34c9c3927820fa', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
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
//# sourceMappingURL=p-CEShBykW.js.map

//# sourceMappingURL=p-CEShBykW.js.map