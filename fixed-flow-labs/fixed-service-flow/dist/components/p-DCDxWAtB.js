import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-BTqKKAHI.js';
import './p-1rCYjdXc.js';
import { c as catalogueService } from './p-B9Yx6F-e.js';
import { p as productService } from './p-CDUi1inA.js';

const stepCatalogueCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-catalogue{width:100%;padding:0 1rem}.container-filter{display:grid;grid-gap:10px;padding:20px 0;align-items:center;justify-content:space-between;border-bottom:1px solid #DBDBDB;grid-template-columns:auto 1fr auto}@media (max-width: 991px){.container-filter{grid-template-columns:1fr;gap:15px}}.filter-title-main{margin:0;font-size:24px;font-weight:700;color:#333333}@media (max-width: 991px){.filter-title-main{font-size:20px}}.filter-content{display:flex;gap:10px;align-items:center;justify-content:flex-end}@media (max-width: 991px){.filter-content{width:100%}}.input-filter-wrapper{position:relative;display:flex;align-items:center;width:300px}@media (max-width: 991px){.input-filter-wrapper{flex:1;width:auto}}.search-icon{position:absolute;left:12px;width:20px;height:20px;color:#999999}.input-filter{width:100%;height:40px;padding:8px 12px 8px 40px;font-size:16px;border:1px solid #DBDBDB;border-radius:12px;outline:none;transition:border-color 0.2s}.input-filter:focus{border-color:#DA291C}.input-filter::placeholder{color:#999999}.btn-search{height:40px;padding:0 24px;background:#DA291C;color:#FFFFFF;border:none;border-radius:22px;font-size:16px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background-color 0.2s}.btn-search:hover{background:rgb(181.843902439, 34.2, 23.356097561)}@media (max-width: 767px){.btn-search{padding:0 16px;font-size:14px}}.btn-hidden-filter{display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;background:transparent;color:#0097A9;border:1px solid #0097A9;border-radius:22px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-hidden-filter:hover{background:rgba(0, 151, 169, 0.1)}.btn-hidden-filter .filter-icon{width:16px;height:16px}@media (max-width: 991px){.btn-hidden-filter{display:none}}.catalogue-content{display:grid;grid-template-columns:280px 1fr;gap:24px;padding:20px 0}@media (max-width: 1199px){.catalogue-content{grid-template-columns:240px 1fr}}@media (max-width: 991px){.catalogue-content{grid-template-columns:1fr}}.filter-container{border-radius:12px;border:1px solid #DBDBDB;background:#FFFFFF;height:fit-content}@media (max-width: 991px){.filter-container{display:none !important}}.filter-header{padding:20px;display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #DBDBDB}.filter-title{margin:0;font-size:24px;font-weight:700;color:#333333}.reset-filter{margin:0;color:#0097A9;cursor:pointer;font-size:14px;font-weight:700;text-decoration:none}.reset-filter:hover{text-decoration:underline}.filter-result{padding:20px;border-bottom:1px solid #DBDBDB}.filter-result .result{margin:0;font-size:14px;font-weight:700;color:#666666}.filter-type-product{border-bottom:1px solid #DBDBDB}.filter-type-product:last-child{border-bottom:none}.filter-type-title{display:flex;padding:20px;cursor:pointer;align-items:center;justify-content:space-between}.filter-title-section{margin:0;font-size:16px;font-weight:700;color:#333333}.chevron-icon{width:20px;height:20px;color:#666666}.slot-radio{padding:0 20px 20px}.radio-group{display:flex;flex-direction:column;gap:12px}.radio-button{display:flex;align-items:center;gap:10px;cursor:pointer}.radio-button input[type=radio]{width:18px;height:18px;accent-color:#0097A9;cursor:pointer}.radio-button .radio-label{font-size:14px;color:#333333}.products-section{min-height:400px}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:2rem;background:rgba(255, 255, 255, 0.95);border-radius:16px}.loading-container p{margin-top:1rem;font-size:18px;font-weight:600;color:#333333}.error-container,.empty-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;color:#666666}.error-container p,.empty-container p{margin-top:1rem;font-size:16px}.error-container button,.empty-container button{margin-top:1rem;padding:8px 24px;background:#0097A9;color:#FFFFFF;border:none;border-radius:20px;cursor:pointer}.spinner{width:48px;height:48px;border:4px solid #E5E5E5;border-top-color:#DA291C;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.container-product{display:grid;grid-gap:1.5rem;align-items:stretch;grid-template-columns:1fr 1fr 1fr}@media (max-width: 1399px){.container-product{grid-template-columns:1fr 1fr}}@media (max-width: 767px){.container-product{grid-template-columns:1fr}}.container-product-filter-off{grid-template-columns:1fr 1fr 1fr 1fr}@media (max-width: 1399px){.container-product-filter-off{grid-template-columns:1fr 1fr 1fr}}@media (max-width: 1199px){.container-product-filter-off{grid-template-columns:1fr 1fr}}@media (max-width: 767px){.container-product-filter-off{grid-template-columns:1fr}}.new-product-item{width:100%;height:100%;overflow:hidden;position:relative;border-radius:12px;border:solid 1px #dbdbdb;background:#FFFFFF;box-shadow:2px 3px 27px -3px rgb(211, 211, 211);transition:transform 0.2s, box-shadow 0.2s;display:flex;flex-direction:column}.new-product-item:hover{transform:translateY(-2px);box-shadow:2px 6px 32px -3px rgb(180, 180, 180)}.new-product-item__top{display:grid;margin-top:20px;position:relative;grid-column-gap:16px;padding:16px 16px 8px;grid-template-columns:1fr 2fr}@media (max-width: 1199px){.new-product-item__top{display:flex;flex-direction:column}}.new-product-item__img{display:flex;align-items:center;justify-content:center}.new-product-item__img img{max-width:100%;max-height:120px;object-fit:contain}@media (max-width: 1199px){.new-product-item__img{width:100px;margin:0 auto 16px}}.new-product-item__info .title{margin-top:10px;color:#3c3c3c;font-size:18px;font-weight:700;line-height:24px;margin-bottom:16px;font-family:Roboto, sans-serif}@media (max-width: 1199px){.new-product-item__info .title{margin-top:0;font-size:16px;min-height:48px}}.new-product-item__info .financed-price .financed-price-text{margin-top:4px;color:#3c3c3c;font-size:16px;font-weight:700;line-height:16px}.new-product-item__info .financed-price .financed-price__value{color:#DA291C;font-size:18px;font-weight:700;line-height:24px}.new-product-item__info .financed-price .installments-text{color:#3c3c3c;font-size:14px;font-weight:700;line-height:16px}.new-product-item__info .regular-price{color:#6c6c6c;font-size:14px;font-weight:400;margin-top:10px;line-height:16px}.container-colors{display:flex;gap:8px;padding:10px 25px 15px;flex-wrap:wrap}.color-dot{width:14px;height:14px;border-radius:50%;border:1px solid #3c3c3c;cursor:pointer}.color-dot:active{transform:scale(0.95)}.new-product-item__middle{padding:15px;color:#3c3c3c;min-height:65px;font-size:14px;line-height:1.4;border-top:2px solid #dbdbdb;border-bottom:2px solid #dbdbdb;flex-grow:1}.new-product-item__middle .description-text{display:block}.new-product-item__middle .see-detail{display:inline-block;margin-top:8px;font-size:14px;color:#0097A9;cursor:pointer;text-decoration:underline}.new-product-item__bottom{padding:1rem;display:flex;justify-content:center;align-items:center}.action-button{color:#DA291C;text-align:center;font-size:16px;font-weight:700;line-height:16px;border:solid 1px #DA291C;border-radius:30px;padding:0.5rem 2.5rem;background:transparent;cursor:pointer;transition:all 0.2s}.action-button:hover{background-color:#DA291C;color:#FFFFFF}.back-button-container{display:flex;justify-content:center;padding:24px 0 40px}.btn-back{padding:12px 32px;background:transparent;color:#0097A9;border:2px solid #0097A9;border-radius:30px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s}.btn-back:hover{background:#0097A9;color:#FFFFFF}.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}.modal-content{position:relative;background:#FFFFFF;border-radius:12px;max-width:500px;width:100%;max-height:80vh;overflow:hidden;box-shadow:0 4px 20px rgba(0, 0, 0, 0.15);animation:modalFadeIn 0.2s ease-out}@keyframes modalFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}.modal-close{position:absolute;top:12px;right:12px;width:32px;height:32px;background:transparent;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}.modal-close svg{width:20px;height:20px;color:#3c3c3c}.modal-close:hover{background:#f0f0f0}.modal-title{padding:20px;padding-right:50px;border-bottom:1px solid #dbdbdb;color:#3c3c3c;font-size:20px;font-weight:700;line-height:1.3}.modal-title .modal-subtitle{font-size:14px;font-weight:500;color:#6c6c6c;margin-bottom:8px}@media (max-width: 767px){.modal-title{font-size:18px;padding:16px;padding-right:45px}}.modal-body{padding:20px;max-height:300px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#ccc transparent}.modal-body::-webkit-scrollbar{width:6px}.modal-body::-webkit-scrollbar-track{background:transparent}.modal-body::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}.modal-text{margin:0;color:#3c3c3c;font-size:16px;font-weight:400;line-height:1.5;text-align:justify}@media (max-width: 767px){.modal-text{font-size:14px}}`;

const StepCatalogue = /*@__PURE__*/ proxyCustomElement(class StepCatalogue extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
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
    static get style() { return stepCatalogueCss(); }
}, [769, "step-catalogue", {
        "onNext": [16],
        "onBack": [16],
        "products": [32],
        "filteredProducts": [32],
        "isLoading": [32],
        "error": [32],
        "searchText": [32],
        "selectedFilter": [32],
        "showFilters": [32],
        "filterOptions": [32],
        "showDetailModal": [32],
        "modalTitle": [32],
        "modalContent": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-catalogue"];
    components.forEach(tagName => { switch (tagName) {
        case "step-catalogue":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepCatalogue);
            }
            break;
    } });
}
defineCustomElement();

export { StepCatalogue as S, defineCustomElement as d };
//# sourceMappingURL=p-DCDxWAtB.js.map

//# sourceMappingURL=p-DCDxWAtB.js.map