import { LocationData } from '../../../store/interfaces';
import type { Coordinates, GeocodeResult } from '../../../services/maps.service';
export declare class StepLocation {
    el: HTMLElement;
    googleMapsKey: string;
    onNext: () => void;
    onBack: () => void;
    address: string;
    isValidating: boolean;
    isLoadingMap: boolean;
    isGettingLocation: boolean;
    locationData: LocationData | null;
    mapError: string | null;
    currentCoordinates: Coordinates | null;
    geocodeResult: GeocodeResult | null;
    showErrorModal: boolean;
    errorMessage: string;
    private mapContainer;
    private addressInput;
    componentDidLoad(): Promise<void>;
    disconnectedCallback(): void;
    private initializeMap;
    private handleAddressChange;
    /**
     * Handles keypress on address input (like TEL: inputText.addEventListener("keypress", ...))
     * Triggers validation when Enter is pressed
     */
    private handleKeyPress;
    /**
     * Handles click on map (like TEL: this.map.addListener("click", ...))
     * Reverse geocodes the clicked location and validates coverage
     */
    private handleMapClick;
    private handlePlaceSelected;
    private handleValidate;
    /**
     * Shows coverage result in InfoWindow on the marker (like TEL pattern)
     * Styles match TEL: .info, .infoOn, .infoOff, .continue-map, .continue-button
     */
    private showCoverageInfoWindow;
    /**
     * Handles continue from InfoWindow (like TEL: goToRouter method)
     */
    private handleInfoWindowContinue;
    /**
     * Stores location data in sessionStorage with Base64 encoding (like TEL)
     * TEL pattern: sessionStorage.setItem('planCodeInternet', btoa(planCode))
     */
    private storeLocationInSession;
    private handleUseCurrentLocation;
    render(): any;
}
