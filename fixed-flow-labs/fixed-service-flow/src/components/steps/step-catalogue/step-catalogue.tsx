// ============================================
// STEP CATALOGUE - Product Catalogue for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on TEL product-list-web + filters-web
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { catalogueService } from '../../../services';
import { CatalogueProduct, CatalogueFilter } from '../../../store/interfaces';

@Component({
  tag: 'step-catalogue',
  styleUrl: 'step-catalogue.scss',
  shadow: true,
})
export class StepCatalogue {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() products: CatalogueProduct[] = [];
  @State() filteredProducts: CatalogueProduct[] = [];
  @State() isLoading: boolean = true;
  @State() error: string | null = null;
  @State() searchText: string = '';
  @State() selectedFilter: string = '';
  @State() showFilters: boolean = true;
  @State() filterOptions: CatalogueFilter[] = [];

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

  private async loadProducts() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await catalogueService.listCatalogue(
        this.selectedFilter,
        1,
        this.searchText
      );

      this.products = response.products || [];
      this.filteredProducts = this.products;
    } catch (err) {
      console.error('[StepCatalogue] Error loading products:', err);
      this.error = 'Error al cargar el catálogo de productos';
    } finally {
      this.isLoading = false;
    }
  }

  private handleFilterChange = async (filterValue: string) => {
    this.selectedFilter = filterValue;
    await this.loadProducts();
  };

  private handleSearchInput = (e: Event) => {
    this.searchText = (e.target as HTMLInputElement).value;
  };

  private handleSearch = async () => {
    await this.loadProducts();
  };

  private handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleSearch();
    }
  };

  // @ts-ignore: toggleFilters reserved for mobile filter toggle feature
  private _toggleFilters = () => {
    this.showFilters = !this.showFilters;
  };

  private clearFilters = () => {
    this.selectedFilter = catalogueService.FILTER_INTERNET_INALAMBRICO;
    this.searchText = '';
    this.loadProducts();
  };

  private handleViewMore = (product: CatalogueProduct) => {
    // Store selected product and continue to next step
    catalogueService.storeProductInSession(product);
    console.log('[StepCatalogue] Product selected:', product.productName);
    this.onNext?.();
  };

  private cleanHTML(html: string): string {
    return catalogueService.cleanDescription(html);
  }

  private getSelectedFilterCount(): number {
    return this.selectedFilter ? 1 : 0;
  }

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  private renderFilterSidebar() {
    const filterCount = this.getSelectedFilterCount();

    return (
      <aside class="filter-container" style={{ display: this.showFilters ? 'block' : 'none' }}>
        {/* Filter Header */}
        <div class="filter-header">
          <span class="filter-title">Filtrar por:</span>
          <a class="reset-filter" onClick={this.clearFilters}>
            Limpiar filtros
          </a>
        </div>

        {/* Filter Count */}
        <div class="filter-result">
          <p class="result">
            {filterCount > 0
              ? `filtros seleccionados (${filterCount})`
              : 'Ningún filtro seleccionado'}
          </p>
        </div>

        {/* Product Type Filter */}
        <div class="filter-type-product">
          <div class="filter-type-title">
            <h4 class="filter-title-section">Tipo de producto</h4>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div class="slot-radio">
            <div class="radio-group">
              {this.filterOptions.map((option) => (
                <label class="radio-button">
                  <input
                    type="radio"
                    name="productType"
                    value={option.value}
                    checked={this.selectedFilter === option.value}
                    onChange={() => this.handleFilterChange(option.value)}
                  />
                  <span class="radio-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  private renderProductCard(product: CatalogueProduct) {
    const description = this.cleanHTML(product.shortDescription || '');
    const truncatedDesc = catalogueService.truncateText(description, 80);

    return (
      <div class="new-product-item">
        {/* Top section: Image + Info */}
        <div class="new-product-item__top">
          <div class="new-product-item__img">
            <img src={product.imgUrl} alt={product.productName} loading="lazy" />
          </div>
          <div class="new-product-item__info">
            <div class="title">{product.productName}</div>
            {product.installments > 0 && (
              <div class="financed-price">
                <div class="financed-price-text">Financiado</div>
                <div class="financed-price__value">
                  ${product.update_price?.toFixed(2) || '0.00'}/mes
                </div>
                <div class="installments-text">{product.installments} Plazos</div>
              </div>
            )}
            <div class="regular-price">
              Precio regular: ${product.regular_price?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>

        {/* Color dots */}
        {product.colors && product.colors.length > 0 && (
          <div class="container-colors">
            {product.colors.map((color) => (
              <div class="color-dot" style={{ backgroundColor: color.webColor }}></div>
            ))}
          </div>
        )}

        {/* Middle section: Description (always render for consistent card height) */}
        <div class="new-product-item__middle">
          {description ? (
            <span class="description-text">
              {truncatedDesc}
              {description.length > 80 && (
                <a class="see-detail">Ver detalle</a>
              )}
            </span>
          ) : (
            <span class="description-text">&nbsp;</span>
          )}
        </div>

        {/* Bottom section: Actions */}
        <div class="new-product-item__bottom">
          <button class="action-button" onClick={() => this.handleViewMore(product)}>
            Ver más
          </button>
          <div class="check-info">
            <input type="checkbox" id={`compare-${product.productId}`} />
            <label htmlFor={`compare-${product.productId}`} class="check-label">
              Comparar
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    // Get title based on selected filter
    const title = this.selectedFilter === catalogueService.FILTER_INTERNET_INALAMBRICO
      ? 'Internet Inalámbrico'
      : 'Internet + Telefonía';

    return (
      <Host>
        <div class="step-catalogue">
          {/* Search Header */}
          <div class="container-filter">
            <h1 class="filter-title-main">{title}</h1>

            <div class="filter-content">
              <div class="input-filter-wrapper">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  class="input-filter"
                  placeholder="Buscar articulo"
                  value={this.searchText}
                  onInput={this.handleSearchInput}
                  onKeyPress={this.handleKeyPress}
                />
              </div>
              <button class="btn-search" onClick={this.handleSearch}>
                Buscar
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div class="catalogue-content">
            {/* Filter Sidebar */}
            {this.renderFilterSidebar()}

            {/* Products Grid */}
            <div class="products-section">
              {/* Loading */}
              {this.isLoading && (
                <div class="loading-container">
                  <div class="spinner"></div>
                  <p>Cargando productos...</p>
                </div>
              )}

              {/* Error */}
              {this.error && !this.isLoading && (
                <div class="error-container">
                  <p>{this.error}</p>
                  <button onClick={() => this.loadProducts()}>Reintentar</button>
                </div>
              )}

              {/* Products Grid */}
              {!this.isLoading && !this.error && (
                <div class={{
                  'container-product': true,
                  'container-product-filter-off': !this.showFilters,
                }}>
                  {this.filteredProducts.map((product) => this.renderProductCard(product))}
                </div>
              )}

              {/* Empty State */}
              {!this.isLoading && !this.error && this.filteredProducts.length === 0 && (
                <div class="empty-container">
                  <p>No hay productos disponibles para esta categoría</p>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div class="back-button-container">
            <button class="btn-back" onClick={this.onBack}>
              Regresar
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
