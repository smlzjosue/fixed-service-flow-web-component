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
        return (h(Host, { key: '1d039e0886b26c3b2d248b58dc19eba3e95b39dd' }, h("div", { key: '0fea0f07a26ab17953f23c3205f2c328ef1c9a54', class: "step-catalogue" }, h("div", { key: 'd5517730f8f9bedc0f09fbf0a51cfd3a18dc3dce', class: "container-filter" }, h("h1", { key: '8ff3960af6aaccfc4dccab2432e95db8f534b14f', class: "filter-title-main" }, title), h("div", { key: '50173802907da0d15f13201412db24e0f817bf99', class: "filter-content" }, h("div", { key: '18f2bc15ebd502525768b79bba73d13d239dc2ef', class: "input-filter-wrapper" }, h("svg", { key: '5ac2b02cf6691d7c138bdc8d6618778c4202da53', class: "search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '5bc9fbf6d6194a87a03b976a80c4c13a85823252', cx: "11", cy: "11", r: "8" }), h("path", { key: '4723e015a9c94331741bed88d873c2a536a31834', d: "m21 21-4.35-4.35" })), h("input", { key: '799681d42ba267c147e477c8f4f645d51069fa50', type: "text", class: "input-filter", placeholder: "Buscar articulo", value: this.searchText, onInput: this.handleSearchInput, onKeyPress: this.handleKeyPress })), h("button", { key: '9d13777022d9949eb4245034f38533373ef0db05', class: "btn-search", onClick: this.handleSearch }, "Buscar"))), h("div", { key: '343c9edbe94686e15f21affec70a3f68ed5965f8', class: "catalogue-content" }, this.renderFilterSidebar(), h("div", { key: 'd51f10033f77682dc03d8d958cf004d574838954', class: "products-section" }, this.isLoading && (h("div", { key: '1542625375f5d2b265bbecff44ab65468c6d4f4d', class: "loading-container" }, h("div", { key: 'b48473e6d22f9a536cf7b9c6d9d4a839e34c23a3', class: "spinner" }), h("p", { key: '702f744448fd22ec0d409d793c129356190dc195' }, "Cargando productos..."))), this.error && !this.isLoading && (h("div", { key: 'b82d6659d975570d777397909715cc488f97dbe5', class: "error-container" }, h("p", { key: '5c0d488ed32e225157052291c5f495188c06e400' }, this.error), h("button", { key: 'fddf301ab62cffc59b0842a551052c4cddfd254f', onClick: () => this.loadProducts() }, "Reintentar"))), !this.isLoading && !this.error && (h("div", { key: '24aaff67c25f41f0bc71b5ce07e9a87f64638896', class: {
                'container-product': true,
                'container-product-filter-off': !this.showFilters,
            } }, this.filteredProducts.map((product) => this.renderProductCard(product)))), !this.isLoading && !this.error && this.filteredProducts.length === 0 && (h("div", { key: '5ae49ef2980aab9518bdf6694a4960e0838cd5f4', class: "empty-container" }, h("p", { key: '220c85131df9697d53d68d3ec621a067d44ad649' }, "No hay productos disponibles para esta categor\u00EDa"))))), h("div", { key: '1c759d41bf1b1dac3ef539c3ef36623723035494', class: "back-button-container" }, h("button", { key: '28b296115d047f38f0311fdaebf43d595154a599', class: "btn-back", onClick: this.onBack }, "Regresar"))), this.showDetailModal && (h("div", { key: '02995010245195e6520bda1264d2fe2efb7fc0ae', class: "modal-overlay", onClick: this.closeDetailModal }, h("div", { key: 'f966900e2d3cd3a2f0e7a72cf2a128c35e60b1b3', class: "modal-content", onClick: (e) => e.stopPropagation() }, h("button", { key: 'a762de75addd97999a2f9650ed00b57278607f21', class: "modal-close", onClick: this.closeDetailModal }, h("svg", { key: 'fc2a4e5bdc6bea5020f478b702c485a358c5e281', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("line", { key: 'd1b8b336ee9d0f39770e1707deaa2b19d312ec33', x1: "18", y1: "6", x2: "6", y2: "18" }), h("line", { key: '7fc1ea360318bd51f315964e2149488a9f648bd6', x1: "6", y1: "6", x2: "18", y2: "18" }))), h("div", { key: 'd91d7d8e23e652f3b7e6077271235b2add677d8b', class: "modal-title" }, h("div", { key: '711ea47e08e5fd17bfa30979a8373bcce66553e8', class: "modal-subtitle" }, "Descripci\u00F3n completa"), this.modalTitle), h("div", { key: '0cfbd7a95944d5a96504699156d9a0377de59296', class: "modal-body" }, h("p", { key: '1cb734b48ec1cd332fc5074e790df3e42759ee4e', class: "modal-text" }, this.modalContent)))))));
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
