// ============================================
// STEP CATALOGUE - Product Catalogue for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on TEL product-list-web + filters-web
// ============================================
import { h, Host } from "@stencil/core";
import { catalogueService, productService } from "../../../services";
export class StepCatalogue {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    products = [];
    filteredProducts = [];
    isLoading = true;
    error = null;
    searchText = '';
    selectedFilter = '';
    showFilters = true;
    filterOptions = [];
    // Modal state (TEL pattern: seeMoreModal)
    showDetailModal = false;
    modalTitle = '';
    modalContent = '';
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        // Get filter options (sync)
        this.filterOptions = catalogueService.getProductTypeFilters();
        // Set default filter to "Internet Inalámbrico" (second option)
        this.selectedFilter = catalogueService.FILTER_INTERNET_INALAMBRICO;
        // isLoading is already true by default, so loader will show immediately
    }
    componentDidLoad() {
        // Load products after component renders (shows loader while loading)
        this.loadProducts();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    async loadProducts() {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await catalogueService.listCatalogue(this.selectedFilter, 1, this.searchText);
            this.products = response.products || [];
            this.filteredProducts = this.products;
        }
        catch (err) {
            console.error('[StepCatalogue] Error loading products:', err);
            this.error = 'Error al cargar el catálogo de productos';
        }
        finally {
            this.isLoading = false;
        }
    }
    handleFilterChange = async (filterValue) => {
        this.selectedFilter = filterValue;
        await this.loadProducts();
    };
    handleSearchInput = (e) => {
        this.searchText = e.target.value;
    };
    handleSearch = async () => {
        await this.loadProducts();
    };
    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    };
    // @ts-ignore: toggleFilters reserved for mobile filter toggle feature
    _toggleFilters = () => {
        this.showFilters = !this.showFilters;
    };
    clearFilters = () => {
        this.selectedFilter = catalogueService.FILTER_INTERNET_INALAMBRICO;
        this.searchText = '';
        this.loadProducts();
    };
    handleViewMore = (product) => {
        // Store selected product and subcatalog ID for plans API
        const subcatalogId = parseInt(this.selectedFilter, 10);
        catalogueService.storeProductInSession(product);
        productService.storeSelectedProduct(product, subcatalogId);
        console.log('[StepCatalogue] Product selected:', product.productName, 'subcatalogId:', subcatalogId);
        this.onNext?.();
    };
    cleanHTML(html) {
        return catalogueService.cleanDescription(html);
    }
    getSelectedFilterCount() {
        return this.selectedFilter ? 1 : 0;
    }
    /**
     * Opens the detail modal with product description
     * TEL pattern: seeMore() -> modalProvider.seeMoreModal()
     */
    handleSeeDetail = (product) => {
        const fullDescription = this.cleanHTML(product.shortDescription || '');
        this.modalTitle = product.productName;
        this.modalContent = fullDescription;
        this.showDetailModal = true;
    };
    /**
     * Closes the detail modal
     * TEL pattern: closeModal() -> modalController.dismiss()
     */
    closeDetailModal = () => {
        this.showDetailModal = false;
        this.modalTitle = '';
        this.modalContent = '';
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderFilterSidebar() {
        const filterCount = this.getSelectedFilterCount();
        return (h("aside", { class: "filter-container", style: { display: this.showFilters ? 'block' : 'none' } }, h("div", { class: "filter-header" }, h("span", { class: "filter-title" }, "Filtrar por:"), h("a", { class: "reset-filter", onClick: this.clearFilters }, "Limpiar filtros")), h("div", { class: "filter-result" }, h("p", { class: "result" }, filterCount > 0
            ? `filtros seleccionados (${filterCount})`
            : 'Ningún filtro seleccionado')), h("div", { class: "filter-type-product" }, h("div", { class: "filter-type-title" }, h("h4", { class: "filter-title-section" }, "Tipo de producto"), h("svg", { class: "chevron-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { points: "6 9 12 15 18 9" }))), h("div", { class: "slot-radio" }, h("div", { class: "radio-group" }, this.filterOptions.map((option) => (h("label", { class: "radio-button" }, h("input", { type: "radio", name: "productType", value: option.value, checked: this.selectedFilter === option.value, onChange: () => this.handleFilterChange(option.value) }), h("span", { class: "radio-label" }, option.label)))))))));
    }
    renderProductCard(product) {
        const description = this.cleanHTML(product.shortDescription || '');
        const truncatedDesc = catalogueService.truncateText(description, 80);
        return (h("div", { class: "new-product-item" }, h("div", { class: "new-product-item__top" }, h("div", { class: "new-product-item__img" }, h("img", { src: product.imgUrl, alt: product.productName, loading: "lazy" })), h("div", { class: "new-product-item__info" }, h("div", { class: "title" }, product.productName), product.installments > 0 && (h("div", { class: "financed-price" }, h("div", { class: "financed-price-text" }, "Financiado"), h("div", { class: "financed-price__value" }, "$", product.update_price?.toFixed(2) || '0.00', "/mes"), h("div", { class: "installments-text" }, product.installments, " Plazos"))), h("div", { class: "regular-price" }, "Precio regular: $", product.regular_price?.toFixed(2) || '0.00'))), product.colors && product.colors.length > 0 && (h("div", { class: "container-colors" }, product.colors.map((color) => (h("div", { class: "color-dot", style: { backgroundColor: color.webColor } }))))), h("div", { class: "new-product-item__middle" }, description ? (h("span", { class: "description-text" }, truncatedDesc, description.length > 80 && (h("a", { class: "see-detail", onClick: (e) => { e.stopPropagation(); this.handleSeeDetail(product); } }, "Ver detalle")))) : (h("span", { class: "description-text" }, "\u00A0"))), h("div", { class: "new-product-item__bottom" }, h("button", { class: "action-button", onClick: () => this.handleViewMore(product) }, "Ver m\u00E1s"))));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        // Get title based on selected filter
        const title = this.selectedFilter === catalogueService.FILTER_INTERNET_INALAMBRICO
            ? 'Internet Inalámbrico'
            : 'Internet + Telefonía';
        return (h(Host, { key: '633cab4f89f3e79907cb5db33eb2897e114ecf97' }, h("div", { key: '9390e25d97abc32a1ad7c303b1460f310f6f05ab', class: "step-catalogue" }, h("div", { key: '02e7d0c13069e26f9a07ea6e0c307f5bb699954c', class: "container-filter" }, h("h1", { key: 'ccded62f26e8b1cb8719a5e85965cbb87a793689', class: "filter-title-main" }, title), h("div", { key: '2e8b8d5966728504b0c9a35953d2734cfc9d2166', class: "filter-content" }, h("div", { key: 'c7b44c9803036ea915e916276935c123e1ae6394', class: "input-filter-wrapper" }, h("svg", { key: 'fc68b3c733ac05a3d72f3242281495b1a4d195dd', class: "search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '465cf04a8bac926218930455360383f4ce76d4d2', cx: "11", cy: "11", r: "8" }), h("path", { key: '94880ba619fba184c09735fb5dee50a2dc9e2638', d: "m21 21-4.35-4.35" })), h("input", { key: '96e070ad2f6913c5dac4f32a0331f9c8452c5ca4', type: "text", class: "input-filter", placeholder: "Buscar articulo", value: this.searchText, onInput: this.handleSearchInput, onKeyPress: this.handleKeyPress })), h("button", { key: '3ed9a4be367b1daded8e20f9d04876a5cceaddf4', class: "btn-search", onClick: this.handleSearch }, "Buscar"))), h("div", { key: '31dedbc72907c038675e86e69610d656dfb1933c', class: "catalogue-content" }, this.renderFilterSidebar(), h("div", { key: '5fc3589a28fc81d2fa105d2ab68a8645c3e16d3c', class: "products-section" }, this.isLoading && (h("div", { key: '292cb80c0714438e041805d2250be61c4db7a0e1', class: "loading-container" }, h("div", { key: 'e58b5e87f3092109d7ebb87f9ad4827d17e9527a', class: "spinner" }), h("p", { key: 'd8ea4899e95713de1acb4d5c9e1df3d0da6f00bc' }, "Cargando productos..."))), this.error && !this.isLoading && (h("div", { key: 'd12da3b185d76e74f3b195a7bc95115502d50801', class: "error-container" }, h("p", { key: 'bd2d3bbdd3a22d41d90760af4103fcd413858551' }, this.error), h("button", { key: 'aecf413d4416c536d035453741ccf0b10f07ddc5', onClick: () => this.loadProducts() }, "Reintentar"))), !this.isLoading && !this.error && (h("div", { key: 'ab42f43d608c13216bee78a5f6979bb883908434', class: {
                'container-product': true,
                'container-product-filter-off': !this.showFilters,
            } }, this.filteredProducts.map((product) => this.renderProductCard(product)))), !this.isLoading && !this.error && this.filteredProducts.length === 0 && (h("div", { key: 'fe07cc32a053431c0f5624669646ed95d52b2014', class: "empty-container" }, h("p", { key: '354f47fce91aa5d8e7d09127119fcfcad12c6a49' }, "No hay productos disponibles para esta categor\u00EDa"))))), h("div", { key: '9edaae5bf982ec881e74353e952ae4158ce9e87c', class: "back-button-container" }, h("button", { key: 'ccb3b1dcafbf7a0f4938e5192874a4c59087a6d1', class: "btn-back", onClick: this.onBack }, "Regresar"))), this.showDetailModal && (h("div", { key: '3c3d144571de958f77d47a1d2077e6914f758ec2', class: "modal-overlay", onClick: this.closeDetailModal }, h("div", { key: '6e0ea7baa3b102322a025c316276f50468ec1e5f', class: "modal-content", onClick: (e) => e.stopPropagation() }, h("button", { key: '3f9017ff359a09a6f56ab2b998b64f12f408712d', class: "modal-close", onClick: this.closeDetailModal }, h("svg", { key: '8b5debf990dfba49121bc00557ff8787b98766b0', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("line", { key: '73e21236ccdc9be42e65ada13b224dfeed689247', x1: "18", y1: "6", x2: "6", y2: "18" }), h("line", { key: 'e54bf79a62b785719755ee4e0e906e8540dc2001', x1: "6", y1: "6", x2: "18", y2: "18" }))), h("div", { key: 'af62534c7dbdbe94508f0f177200e3362828b595', class: "modal-title" }, h("div", { key: '2e867881616c387d65681cf3cc0e9d097e64568a', class: "modal-subtitle" }, "Descripci\u00F3n completa"), this.modalTitle), h("div", { key: '5361636aec7839c921dc8d48d2bb5432aff0a876', class: "modal-body" }, h("p", { key: '51f2c1a26f1ada39a8e3543dd2b0c4006f566773', class: "modal-text" }, this.modalContent)))))));
    }
    static get is() { return "step-catalogue"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-catalogue.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-catalogue.css"]
        };
    }
    static get properties() {
        return {
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
            "products": {},
            "filteredProducts": {},
            "isLoading": {},
            "error": {},
            "searchText": {},
            "selectedFilter": {},
            "showFilters": {},
            "filterOptions": {},
            "showDetailModal": {},
            "modalTitle": {},
            "modalContent": {}
        };
    }
}
//# sourceMappingURL=step-catalogue.js.map
