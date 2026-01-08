// ============================================
// STEP LOCATION - Location/Map Step Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowActions } from "../../../store/flow.store";
import { coverageService, mapsService } from "../../../services";
import { ERROR_MESSAGES } from "../../../utils/constants";
// Offset to shift the map view so marker appears lower (InfoWindow visible above search bar)
const MAP_VERTICAL_OFFSET = 150;
export class StepLocation {
    // ------------------------------------------
    // ELEMENT
    // ------------------------------------------
    el;
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
    static get is() { return "step-location"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-location.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-location.css"]
        };
    }
    static get properties() {
        return {
            "googleMapsKey": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "google-maps-key"
            },
            "onNext": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "onBack": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            }
        };
    }
    static get states() {
        return {
            "address": {},
            "isValidating": {},
            "isLoadingMap": {},
            "isGettingLocation": {},
            "locationData": {},
            "mapError": {},
            "currentCoordinates": {},
            "geocodeResult": {},
            "showErrorModal": {},
            "errorMessage": {}
        };
    }
    static get elementRef() { return "el"; }
}
//# sourceMappingURL=step-location.js.map
