import { r as registerInstance, e as getElement, h, d as Host } from './index-zT41ZBSk.js';
import { f as flowActions } from './flow.store-BVgy_Tq5.js';
import { m as mapsService, b as coverageService, E as ERROR_MESSAGES } from './index-2VcInuuj.js';
import './token.service-RvrPTISp.js';
import './interfaces-DIJ391iV.js';
import './cart.service-C3FR8Gpo.js';
import './shipping.service-Cs5hFbUT.js';
import './payment.service-BjkEFOi4.js';

const stepLocationCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-location{width:100%;position:relative}.step-location__validating-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.9);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn 0.2s ease-out}.step-location__validating-content{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem;background:#FFFFFF;border-radius:16px;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__validating-spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}.step-location__validating-text{margin:0;font-size:18px;font-weight:600;color:#333333}.step-location__header{text-align:center;margin-bottom:1rem}.step-location__title{font-size:1.5rem;font-weight:600;line-height:1.35;color:#333333;font-weight:400}.step-location__title--highlight{color:#DA291C;font-weight:700}.step-location__map-container{position:relative;border-radius:0.75rem;overflow:hidden;box-shadow:0 2px 8px rgba(0, 0, 0, 0.08)}.step-location__controls{position:absolute;top:3.5rem;left:0.75rem;right:0.75rem;z-index:1;display:flex;flex-direction:column;gap:0}@media (min-width: 576px){.step-location__controls{left:120px;right:50px}}@media (min-width: 768px){.step-location__controls{top:3.5rem;left:130px;right:60px}}.step-location__input-group{display:flex;align-items:center;background:#FFFFFF;border-radius:10px 10px 0 0;overflow:hidden;border:1px solid #E5E5E5;border-bottom:none}.step-location__location-container{background:#FFFFFF;border-radius:0 0 10px 10px;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);padding:0.2rem 0.75rem;border:1px solid #E5E5E5;border-top:1px solid #E5E5E5}.step-location__input-icon{display:flex;align-items:center;justify-content:center;padding-left:0.75rem;color:#999999}.step-location__input-icon svg{width:20px;height:20px}.step-location__input{flex:1;padding:0.75rem 0.75rem;border:none;font-size:0.875rem;outline:none;background:transparent;min-width:0}.step-location__input::placeholder{color:#999999}.step-location__btn-validate{padding:0.75rem 1.25rem;background:#DA291C;color:#FFFFFF;border:none;font-size:0.875rem;font-weight:600;cursor:pointer;transition:background-color 150ms ease;white-space:nowrap;min-width:100px}.step-location__btn-validate:hover:not(:disabled){background:rgb(181.843902439, 34.2, 23.356097561)}.step-location__btn-validate:disabled{opacity:0.6;cursor:not-allowed}.step-location__btn-validate--loading{pointer-events:none}.step-location__btn-validate-content{display:inline-flex;align-items:center;gap:0.5rem}.step-location__btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:#FFFFFF;border-radius:50%;animation:btn-spin 0.8s linear infinite}@keyframes btn-spin{to{transform:rotate(360deg)}}.step-location__btn-location{display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0;background:transparent;color:#0097A9;border:none;border-radius:0;font-size:0.75rem;font-weight:500;cursor:pointer;box-shadow:none;transition:opacity 150ms ease;white-space:nowrap;align-self:flex-start}.step-location__btn-location:hover:not(:disabled){opacity:0.8}.step-location__btn-location:disabled{opacity:0.5;cursor:not-allowed}.step-location__btn-location-icon{width:14px;height:14px}.step-location__map{position:relative;width:100%;height:400px;background:#E5E5E5}@media (min-width: 768px){.step-location__map{height:500px}}.step-location__map-canvas{width:100%;height:100%}.step-location__map-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5}.step-location__map-loading p{font-size:1rem;font-weight:400;line-height:1.5;margin-top:1rem}.step-location__map-error{display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F5F5;color:#666666;z-index:5;padding:1rem;text-align:center}.step-location__map-error p{font-size:1rem;font-weight:400;line-height:1.5;color:#DA291C}.step-location__map-error small{margin-top:0.5rem;font-size:0.75rem}.step-location__spinner{width:40px;height:40px;border:3px solid #CCCCCC;border-top-color:#0097A9;border-radius:50%;animation:spin 1s linear infinite}.step-location__map-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:#666666}.step-location__map-placeholder p{font-size:1rem;font-weight:400;line-height:1.5}.step-location__map-placeholder small{margin-top:0.5rem;font-size:0.75rem}.step-location__modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);z-index:400;display:flex;align-items:center;justify-content:center}.step-location__modal{position:relative;width:90%;max-width:400px;background:#FFFFFF;border-radius:0.75rem;padding:2rem 1.5rem;text-align:center;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)}.step-location__modal--error .step-location__modal-error-bar{display:block}.step-location__modal-close{position:absolute;top:0.75rem;right:0.75rem;width:32px;height:32px;background:transparent;border:none;font-size:1.5rem;color:#666666;cursor:pointer;line-height:1}.step-location__modal-close:hover{color:#333333}.step-location__modal-error-bar{display:none;background:#DA291C;color:#FFFFFF;padding:0.5rem 1rem;margin:-2rem -1.5rem 1rem;font-weight:600}.step-location__modal-success-icon{width:60px;height:60px;margin:0 auto 1rem;color:#44AF69}.step-location__modal-success-icon svg{width:100%;height:100%}.step-location__modal-message{font-size:1rem;font-weight:400;line-height:1.5;color:#333333;margin-bottom:1.5rem}.step-location__modal-btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-location__modal-btn:disabled{opacity:0.5;cursor:not-allowed}.step-location__modal-btn{height:48px;background-color:#0097A9;color:#FFFFFF}.step-location__modal-btn:hover:not(:disabled){background-color:rgb(0, 114.5455621302, 128.2)}.step-location__modal-btn:active:not(:disabled){background-color:rgb(0, 96.3183431953, 107.8)}.step-location__modal-btn{min-width:150px}`;

// Offset to shift the map view so marker appears lower (InfoWindow visible above search bar)
const MAP_VERTICAL_OFFSET = 150;
const StepLocation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    get el() { return getElement(this); }
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
        return (h(Host, { key: 'a277c65d6f7cde73682ce009dfe64f99b33625bb' }, h("div", { key: 'f00353c6dfcbcfc3836342ad3c2c5d381106f8b1', class: "step-location" }, this.isValidating && (h("div", { key: '9a34be5eac8ccc560e8d2da86cacbea1c97e4b45', class: "step-location__validating-overlay" }, h("div", { key: 'c80ef7ec8645849010e98e839f6b1219e9b90309', class: "step-location__validating-content" }, h("div", { key: '2ccc798f4428d95fe26cb6f7cb1a2c3dc36b96be', class: "step-location__validating-spinner" }), h("p", { key: '34ebb862679139420d7f3b32444fe1e88214c15a', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: '8647775f5792b425d5ba16ad1a8c4a8c214cebdb', class: "step-location__header" }, h("h1", { key: '3ee52c05e8e89260f4592d944a8fa95331ab2002', class: "step-location__title" }, h("span", { key: 'b34d3156c80ed7063a71fdacd827dbca5a76cd08', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '72407fb0ae165412c6458f73c8b2264787d67e63', class: "step-location__map-container" }, h("div", { key: 'bcc1e45a5bc782ef34c4ab0cdb599f1759ab85f9', class: "step-location__controls" }, h("div", { key: '8eeb6651e6bd8d816807ebf445feef71536fa8a4', class: "step-location__input-group" }, h("span", { key: 'cb801b24e2d0d1b47610f020a93cdb2d0aee3de8', class: "step-location__input-icon" }, h("svg", { key: '03058476c09fedb579f29881bab5f70e0a48d0ae', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'e35449e03553f32589953e4e852d1b4a2f372b6b', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: 'faf9d798c9b013e8feba55983fa9ee7a120331ba', cx: "12", cy: "10", r: "3" }))), h("input", { key: 'b917469ffc983c38ef23c5a8598eb98015f868ac', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: '4c3202666dd4877aa3e7f39dbb8368740ea6c3c1', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("div", { key: '3c6e604950eb7a88816cab297a043dc8a72b3af1', class: "step-location__location-container" }, h("button", { key: '6a9bcd5c4c344f7e91b9ce233ab3c85a85e4d809', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: '8aea5e38394da1b7c86acfa8622bf9b046931cee', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "currentColor", stroke: "none" }, h("path", { key: '5985f65e567d22f4d32aa6cfc30a2266aa5a6311', d: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual'))), h("div", { key: 'f10c38d5f3bd13581f8320b1f04ea9627b014167', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: '133b0e2e407c71d800897290d5a509e343264461', class: "step-location__map-loading" }, h("div", { key: '9d920b95c0490bf7714843b41bbcf6e736ffa376', class: "step-location__spinner" }), h("p", { key: '856e550515254cfd86aeceb32152368a2fd71224' }, "Cargando mapa..."))), this.mapError && (h("div", { key: 'd7d40cf0157461f7e6b4fb35f617b8c364d848fc', class: "step-location__map-error" }, h("p", { key: 'af873c95809968e2ce24f86db7be0704eb4cc972' }, this.mapError), !this.googleMapsKey && (h("small", { key: '2aee4f15642716404901765b8f91f6aa08656cc9' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '4f45f8222fe2351c5aea27052849dac227513c65', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: '4885ff4d073000fa62e0a651e36931755639ba3e', class: "step-location__modal-backdrop" }, h("div", { key: 'f24eb86b71643b6a4af0e11ea40ed9063a364644', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'd59dbeff27d1ffb29b5d24ae6c153f00ed49ce1c', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: '4dc63bc763cedb2f305985b867be54e031f7c6a9', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: 'abcd81b8349b00b2ecf623dfb402ec3072cc4220', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '8157f3342e2e79faa3187042768f84b67c385315', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
    }
};
StepLocation.style = stepLocationCss();

export { StepLocation as step_location };
//# sourceMappingURL=step-location.entry.esm.js.map
