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
        return (h(Host, { key: '2c8f6a961a85b824e9a85de70ead29a534d4a897' }, h("div", { key: 'ac1ec34f9bfdb2a7ab540d2cae3e4b67160b4bb3', class: "step-location" }, this.isValidating && (h("div", { key: '44197f1334c1616bf16ebea6aaa4ee62d2df829e', class: "step-location__validating-overlay" }, h("div", { key: 'bedfaea659d06328993affdebef2ca37ace38be4', class: "step-location__validating-content" }, h("div", { key: 'a25b48d4a9f0794b4e85454265fe1bc6f8508964', class: "step-location__validating-spinner" }), h("p", { key: '1a709e4f309c48a56768884881f38d1288d890ca', class: "step-location__validating-text" }, "Validando cobertura...")))), h("header", { key: '2a947717ce26017638f68116480513fecf2c5951', class: "step-location__header" }, h("h1", { key: '8a5140fae64e91dfb144fe1404743c45816692c7', class: "step-location__title" }, h("span", { key: '8c16e083469cdef3723c9e6c78898da2dfaba1a9', class: "step-location__title--highlight" }, "Servicio fijo empresarial"), ' ', "en tu \u00E1rea")), h("div", { key: '472964ddd2d2c172f0548fb063304816f42677e6', class: "step-location__map-container" }, h("div", { key: '111c1efc7a8a95135b66af71625cbae8bb564e3d', class: "step-location__controls" }, h("div", { key: 'f18da275ca833e889c2d91f9cd28f8823d67a746', class: "step-location__input-group" }, h("span", { key: '8cd1fb816216a1879b9d9b06835378fac83617ad', class: "step-location__input-icon" }, h("svg", { key: '38e3f02c3d1d29c00725f528f9301fcfc990b5c5', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("path", { key: 'a82af2add5969cd72bf4b3760ce84c2e6f50ae37', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), h("circle", { key: '9c80df77d6d577d00f0b24a0e43916c5e653e378', cx: "12", cy: "10", r: "3" }))), h("input", { key: 'a446b9596a4c3ae4e9f29d88ce9a4bea1b2529c0', type: "text", class: "step-location__input", placeholder: "Ingrese su direcci\u00F3n", value: this.address, onInput: this.handleAddressChange, onKeyPress: this.handleKeyPress, ref: (el) => this.addressInput = el }), h("button", { key: 'df44398539d6a09f1397c0e01131afa022fb3451', class: {
                'step-location__btn-validate': true,
                'step-location__btn-validate--loading': this.isValidating,
            }, onClick: this.handleValidate, disabled: this.isValidating || (!this.address.trim() && !this.currentCoordinates) }, this.isValidating ? (h("span", { class: "step-location__btn-validate-content" }, h("span", { class: "step-location__btn-spinner" }), "Validando...")) : ('Validar'))), h("button", { key: '9be446cda265a74c4be684f77096d769df4e3dcd', class: "step-location__btn-location", onClick: this.handleUseCurrentLocation, disabled: this.isGettingLocation || this.isLoadingMap }, h("svg", { key: 'd26386c0e5968088b4ce26ee43e6e344edecc159', class: "step-location__btn-location-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '305ed4421540682debf2166c69a51fd2204139c9', cx: "12", cy: "12", r: "10" }), h("circle", { key: '2098fb87a1c5a7ebd09fff005d281dd368b07415', cx: "12", cy: "12", r: "3" }), h("line", { key: '6e705969a5e5cf5275d757bf459e9fd2647514ac', x1: "12", y1: "2", x2: "12", y2: "6" }), h("line", { key: '0f864276a49d685158eeb462c9068e7aabd69ab3', x1: "12", y1: "18", x2: "12", y2: "22" }), h("line", { key: 'd65b42ba47f577d24130316a0b3014e69187fd7b', x1: "2", y1: "12", x2: "6", y2: "12" }), h("line", { key: 'dcd3fad6259de3c80eddc8e32ef30dbcff16a615', x1: "18", y1: "12", x2: "22", y2: "12" })), this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual')), h("div", { key: '95c0fa349a5b7119cae4c0bca80ad966b4bf9c82', class: "step-location__map" }, this.isLoadingMap && !this.mapError && (h("div", { key: 'f8821e1c39018185236c98552adc592d49b17365', class: "step-location__map-loading" }, h("div", { key: '61d546024598f25914d61d24c4e639e9ff844e16', class: "step-location__spinner" }), h("p", { key: '1e9e8b9f9383cc88deb506d4e714f98600c9b314' }, "Cargando mapa..."))), this.mapError && (h("div", { key: '933fe3aedd72d139717fab3978df9a4f777d5203', class: "step-location__map-error" }, h("p", { key: '863824c972c6ff52c31b9b6c49ac8c7aaf7a893f' }, this.mapError), !this.googleMapsKey && (h("small", { key: 'c811bd149f780af33606609edcc99fc7c91341a6' }, "Configura la prop google-maps-key en el componente")))), h("div", { key: '9728b428e75641db9d16b9c450b55edd92b74c6e', class: "step-location__map-canvas", ref: (el) => this.mapContainer = el, style: { display: this.mapError ? 'none' : 'block' } }))), this.showErrorModal && (h("div", { key: '39957723559961bfdb693886c16e2e2610d7d1d3', class: "step-location__modal-backdrop" }, h("div", { key: '8860113883786c78b4d45e9006fca9bb8499e47f', class: "step-location__modal step-location__modal--error" }, h("button", { key: 'cbf18a9ea4117b97a3e50b26a95f9b0727b272a7', class: "step-location__modal-close", onClick: () => this.showErrorModal = false }, "\u00D7"), h("div", { key: 'a1cf84a852d23fe278fc1e114311dafac42fb915', class: "step-location__modal-error-bar" }, "Error"), h("p", { key: '8cf60d6e9cc5bec9900314838bf660a12927461f', class: "step-location__modal-message" }, this.errorMessage), h("button", { key: '1f8588f361058ae98f36d048babc8b16f82bfa5d', class: "step-location__modal-btn", onClick: () => this.showErrorModal = false }, "Cerrar")))))));
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
