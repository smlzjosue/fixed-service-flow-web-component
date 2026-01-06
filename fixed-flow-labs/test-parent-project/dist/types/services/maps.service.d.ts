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
declare global {
    interface Window {
        google?: typeof google;
    }
}
declare class MapsService {
    private apiKey;
    private isLoaded;
    private loadPromise;
    private map;
    private marker;
    private autocomplete;
    private infoWindow;
    /**
     * Sets the Google Maps API key
     */
    setApiKey(apiKey: string): void;
    /**
     * Loads the Google Maps JavaScript API
     */
    loadGoogleMaps(): Promise<void>;
    /**
     * Checks if Google Maps is loaded
     */
    isGoogleMapsLoaded(): boolean;
    /**
     * Initializes the map in a container element
     */
    initMap(container: HTMLElement, options?: Partial<google.maps.MapOptions>): Promise<google.maps.Map>;
    /**
     * Gets the current map instance
     */
    getMap(): google.maps.Map | null;
    /**
     * Centers the map on given coordinates
     */
    centerMap(coordinates: Coordinates): void;
    /**
     * Sets the map zoom level
     */
    setZoom(zoom: number): void;
    /**
     * Adds or updates a marker on the map
     * @param coordinates - The marker position
     * @param verticalOffset - Pixels to shift the view up (positive = marker appears lower)
     */
    setMarker(coordinates: Coordinates, verticalOffset?: number): Promise<void>;
    /**
     * Adds a click listener to the map (like TEL: this.map.addListener("click", ...))
     * When user clicks on map, it triggers geocoding at that location
     */
    addMapClickListener(onMapClick: (coordinates: Coordinates) => void): void;
    /**
     * Clears the marker from the map (like TEL: clear() method)
     */
    clear(): void;
    /**
     * Gets the current marker position
     */
    getMarkerPosition(): Coordinates | null;
    /**
     * Removes the marker from the map
     */
    removeMarker(): void;
    /**
     * Shows an InfoWindow at the marker position with custom HTML content
     * Like TEL: this.infowindow.open(this.map, this.marker)
     */
    showInfoWindow(content: string, onContinueClick?: () => void): void;
    /**
     * Closes the InfoWindow
     */
    closeInfoWindow(): void;
    /**
     * Gets the current InfoWindow instance
     */
    getInfoWindow(): google.maps.InfoWindow | null;
    /**
     * Initializes address autocomplete on an input element
     */
    initAutocomplete(inputElement: HTMLInputElement, onPlaceSelected: (result: GeocodeResult) => void): Promise<void>;
    /**
     * Parses Google Places address components
     */
    private parseAddressComponents;
    /**
     * Geocodes an address to coordinates
     */
    geocodeAddress(address: string): Promise<GeocodeResult | null>;
    /**
     * Reverse geocodes coordinates to an address
     */
    reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult | null>;
    /**
     * Parses geocoder result to GeocodeResult
     */
    private parseGeocoderResult;
    /**
     * Gets the user's current location
     */
    getCurrentLocation(): Promise<Coordinates>;
    /**
     * Gets current location and reverse geocodes it
     */
    getCurrentLocationWithAddress(): Promise<GeocodeResult | null>;
    /**
     * Cleans up map resources
     */
    destroy(): void;
}
export declare const mapsService: MapsService;
export default mapsService;
