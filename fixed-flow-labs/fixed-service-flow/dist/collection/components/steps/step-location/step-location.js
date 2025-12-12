// ============================================
// STEP LOCATION - Location/Map Step Component
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowActions } from "../../../store/flow.store";
import { coverageService, mapsService } from "../../../services";
import { ERROR_MESSAGES } from "../../../utils/constants";
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
            // Update map marker
            mapsService.setMarker(result.coordinates);
        }
        else {
            // If reverse geocode fails, still set coordinates
            this.currentCoordinates = coordinates;
            mapsService.setMarker(coordinates);
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
                    // Update map
                    mapsService.setMarker(coords);
                    mapsService.centerMap(coords);
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
            if (location.isValid) {
                // Show InfoWindow on marker (like TEL)
                this.showCoverageInfoWindow(location.serviceMessage, true);
            }
            else {
                // Show error InfoWindow
                this.showCoverageInfoWindow(ERROR_MESSAGES.NO_COVERAGE, false);
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
     * Shows coverage result in InfoWindow on the marker (like TEL pattern)
     * Styles match TEL: .info, .infoOn, .infoOff, .continue-map, .continue-button
     */
    showCoverageInfoWindow(message, isSuccess) {
        // TEL-style InfoWindow content - width auto to fill parent container (600px set by maps.service)
        const infoWindowContent = `
      <div class="general-container" style="font-family: 'Open Sans', Arial, sans-serif; width: 100%; box-sizing: border-box;">
        <div class="info ${isSuccess ? 'infoOn' : 'infoOff'}" style="
          padding: ${isSuccess ? '20px' : '15px 20px'};
          width: 100%;
          height: auto;
          box-sizing: border-box;
          background: ${isSuccess ? '#1F97AF' : '#EE122C'};
          color: #ffffff;
          font-size: 14px;
          line-height: 1.5;
          white-space: normal;
        ">
          ${message}
        </div>
        <div class="continue-map" style="
          width: 100%;
          height: auto;
          padding: 20px;
          font-size: 16px;
          text-align: center;
          background: #ffffff;
          color: #1F97AF;
          cursor: pointer;
          box-sizing: border-box;
        ">
          ${!isSuccess ? `
            <div style="color: #333; margin-bottom: 8px;">
              Actualmente usted se encuentra fuera del rango de cobertura.
            </div>
          ` : ''}
          <div
            id="infowindow-continue-btn"
            class="no-link continue-button"
            onclick="if(window.__infoWindowContinueCallback) window.__infoWindowContinueCallback();"
            style="
              text-decoration: none;
              color: #1F97AF;
              font-size: 16px;
              cursor: pointer;
              font-weight: 600;
            "
          >
            ${isSuccess ? 'Continuar' : 'Cerrar'}
          </div>
        </div>
      </div>
    `;
        mapsService.showInfoWindow(infoWindowContent, () => {
            if (isSuccess && this.locationData && this.locationData.isValid) {
                this.handleInfoWindowContinue();
            }
            else {
                mapsService.closeInfoWindow();
            }
        });
    }
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
        return (h(Host, { key: '4437f94dba31f3726dc5b809692a66178ffa6837' }, h("div", { key: '1b415cac1c65c3edeab788c316961bbc9fb8c9d0', class: "step-location" }, this.isValidating && (h("div", { key: '6023f4b3a277824ca60a0542181925493e611890', class: "step-location__validating-overlay" }, h("div", { key: '7df3fc32f8c4a43c7630b6ef4f1bbf6a0f4979fa', class: "step-location__validating-content" }, h("div", { key: 'd7904f1815c99e8ae4d38fbc8c4b5de54e268370', class: "step-location__validating-spinner" }), h("p", { key: '91a291b13095cd2fbb0ff253c2ff485c6c4e53e4', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: 'c0d3df9929d16e92855bf89969d97990ecfed900', class: "step-location__header" }, h("h1", { key: '957fb9b4916bf255b765354000e3910084363a2f', class: "step-location__title" }, h("span", { key: '0794aecd47078c706467e8ae7b0f5011da133237', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '6464a3b447edb7b49d2a3415405f31c1eb374e17', class: "step-location__map-container" }, h("div", { key: '206a993ad029a57d86a84f948125595171f52bb6', class: "step-location__controls" }, h("div", { key: '21e3c7617bc6df7b6ec35f15839a151e6e2bd24f', class: "step-location__input-group" }, h("span", { key: 'dfba0e93ace9823d72011030802b335d92eb14bc', class: "step-location__input-icon" }, h("svg", { key: '85a2571ba6b9dd8201b3b6ae00a16382c1369640', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'e2ed4110193aa7ae16063ff45e0f75e5ab5be752', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: 'a68bed46a5ab7c3ba41a7ba028f489266a98fe62', cx: "12", cy: "10", r: "3" }))), h("input", { key: '44f7f009b03f85dbef77e8aca256ab3dc4524df4', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: 'dc96224cf6479bcce55e08371f98899b8648f6e3', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("button", { key: '8095e3157fdd2de9565436a87d3af0be428496bb', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: '048fb61f55e6e91ecc9b738e514e43e15e87c05d', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: 'f3ae5c0478f4c2fd66428f11140033340c010ee0', cx: "12", cy: "12", r: "10" }), h("circle", { key: '611a78c56df944d5f51bd51c649a1870b21add90', cx: "12", cy: "12", r: "3" }), h("line", { key: 'b54f19e0dafdf2eb40dfae9a15df109e89a64b06', x1: "12", y1: "2", x2: "12", y2: "6" }), h("line", { key: '37024a78191541aff3879f1453a92598c818bc90', x1: "12", y1: "18", x2: "12", y2: "22" }), h("line", { key: 'd15f3ec70193772335b4a7311d431f2d7d890c40', x1: "2", y1: "12", x2: "6", y2: "12" }), h("line", { key: 'fe8b6191ec2150805cd02148ffe889dd227ca6c1', x1: "18", y1: "12", x2: "22", y2: "12" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual')), h("div", { key: 'a6f431074f4606e7f72b928f7500a16e1d931588', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: '2fa47417bf593b7b0106aae9fb06b57e38f69d36', class: "step-location__map-loading" }, h("div", { key: '2f686dcd318cf61d73fe552ecf9a54485c2de1bc', class: "step-location__spinner" }), h("p", { key: '9cb586fc653a2781218f966c4cb031dfe3268674' }, "Cargando mapa..."))), this.mapError && (h("div", { key: 'fd8410023faed497a2345412540b5dd088822aba', class: "step-location__map-error" }, h("p", { key: 'f1e4f1185e8cfe56fda5ed9d1db9c68c3d61d092' }, this.mapError), !this.googleMapsKey && (h("small", { key: '1bd24b7cd0f4a29b7d74ae487e38885e0ec5fb0f' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '742ff1891115c9cc099071d2adeed4daf34413e3', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: '10ebf6fde06bed19e3dcdbed0e855f4e285cb306', class: "step-location__modal-backdrop" }, h("div", { key: '23576e8c1f327e521ba8f4ca0aae25bcc295e425', class: "step-location__modal step-location__modal--error" }, h("button", { key: '6e3680f37a66739601695d3c1117aed68876cc1c', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: '07f616666d8507474881ae79b19ec77fe12f61d9', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: '0ca7463877338b6c2acb878e26dbcb47ca84327c', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: 'c69b0713cc76eb0d73fb3eed45601d896513e3a1', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
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
