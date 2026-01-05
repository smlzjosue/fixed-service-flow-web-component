// ============================================
// MAPS SERVICE - Google Maps Integration
// Fixed Service Flow Web Component
// ============================================

import { GOOGLE_MAPS_CONFIG } from '../utils/constants';

// ------------------------------------------
// TYPES
// ------------------------------------------

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  city: string;
  zipCode: string;
  coordinates: Coordinates;
  formattedAddress: string;
}

export interface PlaceResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: typeof google;
  }
}

// ------------------------------------------
// MAPS SERVICE CLASS
// ------------------------------------------

class MapsService {
  private apiKey: string = '';
  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private map: google.maps.Map | null = null;
  private marker: google.maps.marker.AdvancedMarkerElement | null = null;
  private autocomplete: google.maps.places.Autocomplete | null = null;
  private infoWindow: google.maps.InfoWindow | null = null;

  // ------------------------------------------
  // INITIALIZATION
  // ------------------------------------------

  /**
   * Sets the Google Maps API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Loads the Google Maps JavaScript API
   */
  async loadGoogleMaps(): Promise<void> {
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
  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  // ------------------------------------------
  // MAP MANAGEMENT
  // ------------------------------------------

  /**
   * Initializes the map in a container element
   */
  async initMap(container: HTMLElement, options?: Partial<google.maps.MapOptions>): Promise<google.maps.Map> {
    await this.loadGoogleMaps();

    const defaultOptions: google.maps.MapOptions = {
      center: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER,
      zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
      mapTypeId: GOOGLE_MAPS_CONFIG.DEFAULT_MAP_TYPE as google.maps.MapTypeId,
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
  getMap(): google.maps.Map | null {
    return this.map;
  }

  /**
   * Centers the map on given coordinates
   */
  centerMap(coordinates: Coordinates): void {
    if (this.map) {
      this.map.setCenter(coordinates);
    }
  }

  /**
   * Sets the map zoom level
   */
  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  // ------------------------------------------
  // MARKER MANAGEMENT
  // ------------------------------------------

  /**
   * Adds or updates a marker on the map
   */
  async setMarker(coordinates: Coordinates): Promise<void> {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    // Remove existing marker
    if (this.marker) {
      this.marker.map = null;
    }

    // Create new advanced marker
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position: coordinates,
      gmpDraggable: true,
    });

    // Center map on marker
    this.map.setCenter(coordinates);
  }

  /**
   * Adds a click listener to the map (like TEL: this.map.addListener("click", ...))
   * When user clicks on map, it triggers geocoding at that location
   */
  addMapClickListener(onMapClick: (coordinates: Coordinates) => void): void {
    if (!this.map) {
      console.warn('Map not initialized');
      return;
    }

    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const coordinates: Coordinates = {
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
  clear(): void {
    this.removeMarker();
  }

  /**
   * Gets the current marker position
   */
  getMarkerPosition(): Coordinates | null {
    if (!this.marker?.position) {
      return null;
    }

    const position = this.marker.position as google.maps.LatLngLiteral;
    return {
      lat: position.lat,
      lng: position.lng,
    };
  }

  /**
   * Removes the marker from the map
   */
  removeMarker(): void {
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
  showInfoWindow(content: string, onContinueClick?: () => void): void {
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
        const iwc = document.querySelector('.gm-style-iw-c') as HTMLElement;
        const iwd = document.querySelector('.gm-style-iw-d') as HTMLElement;

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
      (window as any).__infoWindowContinueCallback = onContinueClick;
    }
  }

  /**
   * Closes the InfoWindow
   */
  closeInfoWindow(): void {
    if (this.infoWindow) {
      this.infoWindow.close();
      this.infoWindow = null;
    }
  }

  /**
   * Gets the current InfoWindow instance
   */
  getInfoWindow(): google.maps.InfoWindow | null {
    return this.infoWindow;
  }

  // ------------------------------------------
  // AUTOCOMPLETE
  // ------------------------------------------

  /**
   * Initializes address autocomplete on an input element
   */
  async initAutocomplete(
    inputElement: HTMLInputElement,
    onPlaceSelected: (result: GeocodeResult) => void,
  ): Promise<void> {
    await this.loadGoogleMaps();

    // Restrict to Puerto Rico
    const options: google.maps.places.AutocompleteOptions = {
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
  private parseAddressComponents(place: google.maps.places.PlaceResult): GeocodeResult {
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
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    await this.loadGoogleMaps();

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        {
          address,
          componentRestrictions: { country: 'pr' },
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const place = results[0];
            const result = this.parseGeocoderResult(place);
            resolve(result);
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  /**
   * Reverse geocodes coordinates to an address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult | null> {
    await this.loadGoogleMaps();

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        { location: coordinates },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const place = results[0];
            const result = this.parseGeocoderResult(place);
            resolve(result);
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  /**
   * Parses geocoder result to GeocodeResult
   */
  private parseGeocoderResult(result: google.maps.GeocoderResult): GeocodeResult {
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
  async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }

  /**
   * Gets current location and reverse geocodes it
   */
  async getCurrentLocationWithAddress(): Promise<GeocodeResult | null> {
    const coordinates = await this.getCurrentLocation();
    return this.reverseGeocode(coordinates);
  }

  // ------------------------------------------
  // CLEANUP
  // ------------------------------------------

  /**
   * Cleans up map resources
   */
  destroy(): void {
    this.closeInfoWindow();
    this.removeMarker();
    this.autocomplete = null;
    this.map = null;
  }
}

// ------------------------------------------
// SINGLETON EXPORT
// ------------------------------------------

export const mapsService = new MapsService();
export default mapsService;
