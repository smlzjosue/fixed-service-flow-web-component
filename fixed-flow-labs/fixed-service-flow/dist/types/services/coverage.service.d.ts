import { CoverageResponse, LocationData } from '../store/interfaces';
declare class CoverageService {
    /**
     * Validates coverage for a given location
     * Endpoint: POST api/Catalogue/getInternetPlans
     */
    validateCoverage(latitude: number, longitude: number): Promise<CoverageResponse>;
    /**
     * Checks coverage and returns structured location data
     */
    checkCoverage(latitude: number, longitude: number, address: string, city: string, zipCode: string): Promise<LocationData>;
    /**
     * Gets a user-friendly display name for the service type
     */
    getServiceDisplayName(serviceType: string): string;
    /**
     * Checks if the service type is CLARO HOGAR (requires different flow)
     */
    isClaroHogar(serviceType: string): boolean;
}
export declare const coverageService: CoverageService;
export default coverageService;
