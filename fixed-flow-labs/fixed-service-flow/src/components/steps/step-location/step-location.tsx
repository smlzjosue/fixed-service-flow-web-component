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
  @State() showModal: boolean = false;
  @State() modalType: 'success' | 'error' = 'success';
  @State() modalMessage: string = '';
  @State() locationData: LocationData | null = null;
  @State() mapError: string | null = null;
  @State() currentCoordinates: Coordinates | null = null;
  @State() geocodeResult: GeocodeResult | null = null;

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

      // Update map marker
      mapsService.setMarker(result.coordinates);
    } else {
      // If reverse geocode fails, still set coordinates
      this.currentCoordinates = coordinates;
      mapsService.setMarker(coordinates);
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

          // Update map
          mapsService.setMarker(coords);
          mapsService.centerMap(coords);
        } else {
          this.modalType = 'error';
          this.modalMessage = 'No se pudo encontrar la dirección. Por favor, intenta con otra dirección.';
          this.showModal = true;
          this.isValidating = false;
          return;
        }
      }

      if (!coords) {
        this.modalType = 'error';
        this.modalMessage = 'Por favor, ingresa una dirección válida.';
        this.showModal = true;
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

      if (location.isValid) {
        this.modalType = 'success';
        this.modalMessage = location.serviceMessage;
      } else {
        this.modalType = 'error';
        this.modalMessage = ERROR_MESSAGES.NO_COVERAGE;
      }

      this.showModal = true;
    } catch (error) {
      console.error('Coverage validation error:', error);
      this.modalType = 'error';
      this.modalMessage = ERROR_MESSAGES.COVERAGE_ERROR;
      this.showModal = true;
    } finally {
      this.isValidating = false;
    }
  };

  private handleModalContinue = () => {
    if (this.locationData && this.locationData.isValid) {
      // Store data in sessionStorage with Base64 encoding (like TEL)
      this.storeLocationInSession(this.locationData);

      // Set location in store
      flowActions.setLocation(this.locationData);
      this.showModal = false;
      this.onNext?.();
    } else {
      this.showModal = false;
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
      this.modalType = 'error';

      if (error.message.includes('denied')) {
        this.modalMessage = ERROR_MESSAGES.GEOLOCATION_DENIED;
      } else if (error.message.includes('unavailable')) {
        this.modalMessage = ERROR_MESSAGES.GEOLOCATION_UNAVAILABLE;
      } else {
        this.modalMessage = ERROR_MESSAGES.GEOLOCATION_TIMEOUT;
      }

      this.showModal = true;
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
                  class="step-location__btn-validate"
                  onClick={this.handleValidate}
                  disabled={this.isValidating || (!this.address.trim() && !this.currentCoordinates)}
                >
                  {this.isValidating ? 'Validando...' : 'Validar'}
                </button>
              </div>
              <button
                class="step-location__btn-location"
                onClick={this.handleUseCurrentLocation}
                disabled={this.isGettingLocation || this.isLoadingMap}
              >
                <svg class="step-location__btn-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                </svg>
                {this.isGettingLocation ? 'Obteniendo ubicación...' : 'Utilizar Ubicación Actual'}
              </button>
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

          {/* Modal */}
          {this.showModal && (
            <div class="step-location__modal-backdrop">
              <div class={`step-location__modal step-location__modal--${this.modalType}`}>
                <button class="step-location__modal-close" onClick={() => this.showModal = false}>
                  ×
                </button>
                {this.modalType === 'success' && (
                  <div class="step-location__modal-success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                )}
                {this.modalType === 'error' && (
                  <div class="step-location__modal-error-bar">¡Fuera de área!</div>
                )}
                <p class="step-location__modal-message">{this.modalMessage}</p>
                <button
                  class="step-location__modal-btn"
                  onClick={this.handleModalContinue}
                >
                  {this.modalType === 'success' ? 'Continuar' : 'Cerrar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
