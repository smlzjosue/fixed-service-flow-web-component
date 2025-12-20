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
        return (h(Host, { key: 'a0e39ccf15c31beadf5745a12b68eb6978c3c4fb' }, h("div", { key: '29e3069719060c1b3ffdedbe3dfb4b1fb75f26a6', class: "step-location" }, this.isValidating && (h("div", { key: 'cd414f53d6795dddb702cdf4d40154041a69fd21', class: "step-location__validating-overlay" }, h("div", { key: '6303dca28d5f98260f5cf60c3c5a0b3fa31b79a1', class: "step-location__validating-content" }, h("div", { key: 'd7e01f97aa7552f2f80721b2aade6c43e34a3bda', class: "step-location__validating-spinner" }), h("p", { key: 'f468f21dd7e903b99759029cf7966cc62d4f1e46', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: 'd199addc6a2be5361a867292498904efa375bb43', class: "step-location__header" }, h("h1", { key: '8c4ee99ad1633ff1af97cc89c7be518dab81e2c9', class: "step-location__title" }, h("span", { key: 'd5c12910a1421efbae94a1e3683e9c781f52538d', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '32566aabafe10db547a578dc5066f5df0e1b01d0', class: "step-location__map-container" }, h("div", { key: '52f93d98e524bf887f17c70c6a0e7d724c6d3f2e', class: "step-location__controls" }, h("div", { key: 'c0c0202f1df12acbaaa3f1d997fc87fccb322f6e', class: "step-location__input-group" }, h("span", { key: '7ebfce7e2ff99c11e83c8164cbc3c3368135c9f9', class: "step-location__input-icon" }, h("svg", { key: 'cb0a1b98f6ef2645596b4222a025e268194245d2', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'e0064d0fc51ac25d10a9718394e9861121bfa263', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: 'e6885929b60851f3a4f628ab5cd05ff5fa0bbbeb', cx: "12", cy: "10", r: "3" }))), h("input", { key: '1ac6b661a47ddf27d1605112e84ee3846f704604', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: 'ca0e84097fd91267937541df90dc7fb3f3404bb9', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("button", { key: 'e869cf4c4543e8e8b23fe4b2a1e6c00131ae02a6', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: 'd348516737de953040485157235a47d951be3e8b', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: 'd98bc6ab679863ce5d1e5a94180b926ca4a88db4', cx: "12", cy: "12", r: "10" }), h("circle", { key: 'b22d454be6686e057d91746535026d6aebe8f793', cx: "12", cy: "12", r: "3" }), h("line", { key: '7c835cbf33507f21fe0b59b18856e31e56285ee4', x1: "12", y1: "2", x2: "12", y2: "6" }), h("line", { key: '24919757ce7dc1f9afe0438d45546c1822775795', x1: "12", y1: "18", x2: "12", y2: "22" }), h("line", { key: '6ef0ff7c8ddd9b8be597aa646c262916db7794de', x1: "2", y1: "12", x2: "6", y2: "12" }), h("line", { key: '3c11883af54ddaff01ddf88208704bbf83a3b171', x1: "18", y1: "12", x2: "22", y2: "12" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual')), h("div", { key: '678e04c53c79555bd5268515bdbe1774b6fd5ba2', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: 'bd4381f0ccfdc46eda1ca526911fda09e48b70c2', class: "step-location__map-loading" }, h("div", { key: 'f6ed91a500b319052324b8f79cc4bc199a596d73', class: "step-location__spinner" }), h("p", { key: '76401eb2fa68492e07543fa04a012edf2f355b5b' }, "Cargando mapa..."))), this.mapError && (h("div", { key: '64efa54b41a451333213327beabbe1d36ae874c7', class: "step-location__map-error" }, h("p", { key: '4b3652acd2aabe5026e5acb287b6d0e24ce716ea' }, this.mapError), !this.googleMapsKey && (h("small", { key: 'a084a7a9d993f36f8886147afa180c770273d57b' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '6c6ee52902c57df2c5dc2e919689c4a0f1095a24', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: 'd03ec2dd73fee9a4528457c7c076dc6abf49c443', class: "step-location__modal-backdrop" }, h("div", { key: '5a50009d8570659606f9abe463fc5d7adf01843c', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'a5be2ce167fc6b19cbf3d1b36103638b8c5216f1', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: '5411fbcb00b4ee72ceaf8fa9919ca7b7847597cb', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: '98759c5ce7a8774f681ad58560a96f56963c34b1', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '9242de88c7371d61399809512b915adbcbc62083', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
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
