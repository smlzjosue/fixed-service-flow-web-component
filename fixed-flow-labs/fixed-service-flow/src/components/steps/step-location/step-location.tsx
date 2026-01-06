// ============================================
// STEP LOCATION - Location/Map Step Component
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, Element, h, Host } from '@stencil/core';
import { flowActions } from '../../../store/flow.store';
import { coverageService, mapsService } from '../../../services';
import { LocationData } from '../../../store/interfaces';
import { ERROR_MESSAGES } from '../../../utils/constants';
import type { Coordinates, GeocodeResult } from '../../../services/maps.service';

// Offset to shift the map view so marker appears lower (InfoWindow visible above search bar)
const MAP_VERTICAL_OFFSET = 150;

@Component({
  tag: 'step-location',
  styleUrl: 'step-location.scss',
  shadow: true,
})
export class StepLocation {
  // ------------------------------------------
  // ELEMENT
  // ------------------------------------------

  @Element() el: HTMLElement;

  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() googleMapsKey: string;
  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() address: string = '';
  @State() isValidating: boolean = false;
  @State() isLoadingMap: boolean = true;
  @State() isGettingLocation: boolean = false;
  @State() locationData: LocationData | null = null;
  @State() mapError: string | null = null;
  @State() currentCoordinates: Coordinates | null = null;
  @State() geocodeResult: GeocodeResult | null = null;
  @State() showErrorModal: boolean = false;
  @State() errorMessage: string = '';

  // ------------------------------------------
  // REFS
  // ------------------------------------------

  private mapContainer: HTMLDivElement;
  private addressInput: HTMLInputElement;

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

  private async initializeMap() {
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
    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapError = 'Error al cargar Google Maps';
      this.isLoadingMap = false;
    }
  }

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  private handleAddressChange = (e: Event) => {
    this.address = (e.target as HTMLInputElement).value;
  };

  /**
   * Handles keypress on address input (like TEL: inputText.addEventListener("keypress", ...))
   * Triggers validation when Enter is pressed
   */
  private handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      this.handleValidate();
    }
  };

  /**
   * Handles click on map (like TEL: this.map.addListener("click", ...))
   * Reverse geocodes the clicked location and validates coverage
   */
  private handleMapClick = async (coordinates: Coordinates) => {
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
    } else {
      // If reverse geocode fails, still set coordinates
      this.currentCoordinates = coordinates;
      mapsService.setMarker(coordinates, MAP_VERTICAL_OFFSET);
    }

    // Auto-validate coverage (like TEL does on map click)
    await this.handleValidate();
  };

  private handlePlaceSelected = (result: GeocodeResult) => {
    this.geocodeResult = result;
    this.address = result.formattedAddress || result.address;
    this.currentCoordinates = result.coordinates;

    // Update map marker
    mapsService.setMarker(result.coordinates);
    mapsService.centerMap(result.coordinates);
  };

  private handleValidate = async () => {
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
        } else {
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
      const location = await coverageService.checkCoverage(
        coords.lat,
        coords.lng,
        this.address || this.geocodeResult?.address || '',
        city,
        zipCode,
      );

      this.locationData = location;

      // Determine coverage result type
      if (location.isValid) {
        if (location.serviceType.toUpperCase() === 'CLARO HOGAR') {
          // CLARO HOGAR - show "Fuera de área" with options
          this.showCoverageInfoWindow(location.serviceMessage, 'claro-hogar');
        } else {
          // GPON/VRAD - show success
          this.showCoverageInfoWindow(location.serviceMessage, 'success');
        }
      } else if (location.serviceType === 'PR LIMIT') {
        // PR LIMIT - show out of range message (no continue option)
        this.showCoverageInfoWindow(location.serviceMessage, 'pr-limit');
      } else {
        // Generic no coverage error
        this.showCoverageInfoWindow(ERROR_MESSAGES.NO_COVERAGE, 'no-coverage');
      }
    } catch (error) {
      console.error('Coverage validation error:', error);
      this.errorMessage = ERROR_MESSAGES.COVERAGE_ERROR;
      this.showErrorModal = true;
    } finally {
      this.isValidating = false;
    }
  };

  /**
   * Shows coverage result in InfoWindow on the marker
   * New design based on capturas 1.png and 2.png
   * @param message - The message to display
   * @param resultType - 'success' | 'claro-hogar' | 'pr-limit' | 'no-coverage'
   */
  private showCoverageInfoWindow(message: string, resultType: 'success' | 'claro-hogar' | 'pr-limit' | 'no-coverage'): void {
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
    let titleHtml: string;
    let displayMessage: string;
    let buttonHtml: string;

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
    (window as any).__infoWindowCloseCallback = () => {
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
  private handleNoConverageWithOptions = () => {
    mapsService.closeInfoWindow();

    // Create location data for CLARO HOGAR flow
    if (this.currentCoordinates) {
      const claroHogarLocation: LocationData = {
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
  private handleInfoWindowContinue = () => {
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
  private storeLocationInSession(location: LocationData): void {
    try {
      // Store coordinates in Base64 (like TEL)
      sessionStorage.setItem('latitud', btoa(String(location.latitude)));
      sessionStorage.setItem('longitud', btoa(String(location.longitude)));

      // Special handling for CLARO HOGAR (like TEL)
      // TEL: if (servicE_NAME == 'CLARO HOGAR') { sessionStorage.removeItem('planCodeInternet'); }
      if (location.serviceType.toUpperCase() === 'CLARO HOGAR') {
        sessionStorage.removeItem('planCodeInternet');
        console.log('[StepLocation] CLARO HOGAR detected - planCodeInternet removed');
      } else {
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
    } catch (error) {
      console.error('[StepLocation] Error storing location in sessionStorage:', error);
    }
  }

  private handleUseCurrentLocation = async () => {
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
      } else {
        // Got coordinates but couldn't reverse geocode
        const coords = await mapsService.getCurrentLocation();
        this.currentCoordinates = coords;
        mapsService.setMarker(coords);
        mapsService.centerMap(coords);
        mapsService.setZoom(17);
      }
    } catch (error) {
      console.error('Geolocation error:', error);

      if (error.message.includes('denied')) {
        this.errorMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
      } else if (error.message.includes('unavailable')) {
        this.errorMessage = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
      } else {
        this.errorMessage = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
      }

      this.showErrorModal = true;
    } finally {
      this.isGettingLocation = false;
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    return (
      <Host>
        <div class="step-location">
          {/* Validating Overlay */}
          {this.isValidating && (
            <div class="step-location__validating-overlay">
              <div class="step-location__validating-content">
                <div class="step-location__validating-spinner"></div>
                <p class="step-location__validating-text">Validando cobertura...</p>
              </div>
            </div>
          )}

          {/* Header */}
          <header class="step-location__header">
            <h1 class="step-location__title">
              <span class="step-location__title--highlight">Servicio fijo empresarial</span>
              {' '}en tu área
            </h1>
          </header>

          {/* Map Container */}
          <div class="step-location__map-container">
            {/* Map controls */}
            <div class="step-location__controls">
              {/* Search bar */}
              <div class="step-location__input-group">
                <span class="step-location__input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <input
                  type="text"
                  class="step-location__input"
                  placeholder="Ingrese su dirección"
                  value={this.address}
                  onInput={this.handleAddressChange}
                  onKeyPress={this.handleKeyPress}
                  ref={(el) => this.addressInput = el}
                />
                <button
                  class={{
                    'step-location__btn-validate': true,
                    'step-location__btn-validate--loading': this.isValidating,
                  }}
                  onClick={this.handleValidate}
                  disabled={this.isValidating || (!this.address.trim() && !this.currentCoordinates)}
                >
                  {this.isValidating ? (
                    <span class="step-location__btn-validate-content">
                      <span class="step-location__btn-spinner"></span>
                      Validando...
                    </span>
                  ) : (
                    'Validar'
                  )}
                </button>
              </div>

              {/* Location button container */}
              <div class="step-location__location-container">
                <button
                  class="step-location__btn-location"
                  onClick={this.handleUseCurrentLocation}
                  disabled={this.isGettingLocation || this.isLoadingMap}
                >
                  <svg class="step-location__btn-location-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual'}
                </button>
              </div>
            </div>

            {/* Map */}
            <div class="step-location__map">
              {this.isLoadingMap && !this.mapError && (
                <div class="step-location__map-loading">
                  <div class="step-location__spinner"></div>
                  <p>Cargando mapa...</p>
                </div>
              )}

              {this.mapError && (
                <div class="step-location__map-error">
                  <p>{this.mapError}</p>
                  {!this.googleMapsKey && (
                    <small>Configura la prop google-maps-key en el componente</small>
                  )}
                </div>
              )}

              <div
                class="step-location__map-canvas"
                ref={(el) => this.mapContainer = el}
                style={{ display: this.mapError ? 'none' : 'block' }}
              ></div>
            </div>
          </div>

          {/* Error Modal (only for errors that can't be shown in InfoWindow) */}
          {this.showErrorModal && (
            <div class="step-location__modal-backdrop">
              <div class="step-location__modal step-location__modal--error">
                <button class="step-location__modal-close" onClick={() => this.showErrorModal = false}>
                  ×
                </button>
                <div class="step-location__modal-error-bar">Error</div>
                <p class="step-location__modal-message">{this.errorMessage}</p>
                <button
                  class="step-location__modal-btn"
                  onClick={() => this.showErrorModal = false}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
