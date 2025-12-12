import { CatalogueProduct, CatalogueFilter } from '../../../store/interfaces';
export declare class StepCatalogue {
    onNext: () => void;
    onBack: () => void;
    products: CatalogueProduct[];
    filteredProducts: CatalogueProduct[];
    isLoading: boolean;
    error: string | null;
    searchText: string;
    selectedFilter: string;
    showFilters: boolean;
    filterOptions: CatalogueFilter[];
    showDetailModal: boolean;
    modalTitle: string;
    modalContent: string;
    componentWillLoad(): void;
    componentDidLoad(): void;
    private loadProducts;
    private handleFilterChange;
    private handleSearchInput;
    private handleSearch;
    private handleKeyPress;
    private _toggleFilters;
    private clearFilters;
    private handleViewMore;
    private cleanHTML;
    private getSelectedFilterCount;
    /**
     * Opens the detail modal with product description
     * TEL pattern: seeMore() -> modalProvider.seeMoreModal()
     */
    private handleSeeDetail;
    /**
     * Closes the detail modal
     * TEL pattern: closeModal() -> modalController.dismiss()
     */
    private closeDetailModal;
    private renderFilterSidebar;
    private renderProductCard;
    render(): any;
}
