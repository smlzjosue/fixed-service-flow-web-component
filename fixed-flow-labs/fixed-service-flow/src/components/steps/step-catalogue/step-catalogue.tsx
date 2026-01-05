// ============================================
// STEP CATALOGUE - Modem Selection for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on docs/capturas/3.png - Carousel + Summary Bar
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { catalogueService, productService, cartService } from '../../../services';
import { CatalogueProduct, ProductDetail } from '../../../store/interfaces';
import { formatPrice } from '../../../utils/formatters';

// ------------------------------------------
// SUMMARY DATA INTERFACE
// ------------------------------------------

interface SummaryData {
  productName: string;
  planPrice: number;
  svaPrice: number;
  equipmentPrice: number;
  payToday: number;
}

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

  // Products from catalogue
  @State() products: CatalogueProduct[] = [];
  @State() isLoading: boolean = true;
  @State() error: string | null = null;

  // Product details cache (loaded in parallel)
  @State() productsWithDetails: Map<number, ProductDetail> = new Map();
  @State() loadingDetails: Set<number> = new Set();

  // Selection state
  @State() selectedProduct: CatalogueProduct | null = null;
  @State() selectedProductDetail: ProductDetail | null = null;
  @State() isAddingToCart: boolean = false;

  // Unavailable modal
  @State() showUnavailableModal: boolean = false;

  // Summary bar data
  @State() summaryData: SummaryData | null = null;

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentWillLoad() {
    // isLoading is already true by default, so loader will show immediately
  }

  componentDidLoad() {
    // Load products after component renders
    this.loadProducts();
  }

  // ------------------------------------------
  // DATA LOADING METHODS
  // ------------------------------------------

  /**
   * Loads products from catalogue API
   * Uses "Internet Inalámbrico" filter by default
   */
  private async loadProducts() {
    this.isLoading = true;
    this.error = null;

    try {
      // Default to "Internet Inalámbrico" subcatalog
      const subcatalogId = catalogueService.FILTER_INTERNET_INALAMBRICO;

      const response = await catalogueService.listCatalogue(subcatalogId, 1, '');

      this.products = response.products || [];

      // After loading products, load details for visible ones
      if (this.products.length > 0) {
        await this.loadProductsDetails(this.products);
      }
    } catch (err) {
      console.error('[StepCatalogue] Error loading products:', err);
      this.error = 'Error al cargar el catálogo de productos';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Loads product details in parallel for faster UX
   * @param products - Products to load details for
   */
  private async loadProductsDetails(products: CatalogueProduct[]) {
    // Load details for first 6 products in parallel
    const productsToLoad = products.slice(0, 6);

    const detailPromises = productsToLoad.map(async (product) => {
      // Skip if already loaded
      if (this.productsWithDetails.has(product.productId)) {
        return;
      }

      // Mark as loading
      this.loadingDetails = new Set([...this.loadingDetails, product.productId]);

      try {
        const response = await productService.getEquipmentDetail(product.productId);

        if (!response.hasError && response.product) {
          const newMap = new Map(this.productsWithDetails);
          newMap.set(product.productId, response.product);
          this.productsWithDetails = newMap;
        }
      } catch (err) {
        console.error(`[StepCatalogue] Error loading details for ${product.productId}:`, err);
      } finally {
        const newSet = new Set(this.loadingDetails);
        newSet.delete(product.productId);
        this.loadingDetails = newSet;
      }
    });

    await Promise.allSettled(detailPromises);
  }

  // ------------------------------------------
  // SELECTION & CART METHODS
  // ------------------------------------------

  /**
   * Handles product selection
   * - Loads details if not cached
   * - Updates summary bar
   * - Calls addToCart API
   */
  private handleSelectProduct = async (product: CatalogueProduct) => {
    // If clicking the same product, do nothing
    if (this.selectedProduct?.productId === product.productId) {
      return;
    }

    this.isAddingToCart = true;
    this.error = null;

    try {
      // Get product detail (from cache or API)
      let productDetail = this.productsWithDetails.get(product.productId);

      if (!productDetail) {
        // Load detail on demand
        console.log('[StepCatalogue] Loading detail for:', product.productId);
        const response = await productService.getEquipmentDetail(product.productId);

        if (response.hasError || !response.product) {
          throw new Error('Error al cargar detalles del producto');
        }

        productDetail = response.product;

        // Cache it
        const newMap = new Map(this.productsWithDetails);
        newMap.set(product.productId, productDetail);
        this.productsWithDetails = newMap;
      }

      // Check availability BEFORE proceeding (stock must be > 1)
      const ENTRY_BARRIER = 1;
      if (productDetail.stock === undefined || productDetail.stock <= ENTRY_BARRIER) {
        console.log('[StepCatalogue] Product unavailable, stock:', productDetail.stock);
        this.showUnavailableModal = true;
        this.isAddingToCart = false;
        return;
      }

      // Update selection
      this.selectedProduct = product;
      this.selectedProductDetail = productDetail;

      // Update summary bar
      this.updateSummaryData(product, productDetail);

      // Store product in session for next steps
      const subcatalogId = parseInt(catalogueService.FILTER_INTERNET_INALAMBRICO, 10);
      catalogueService.storeProductInSession(product);
      productService.storeSelectedProduct(product, subcatalogId);

      // Add to cart
      console.log('[StepCatalogue] Adding to cart:', product.productName);
      const cartResponse = await cartService.addToCart(
        productDetail,
        product.installments || 24,
        1
      );

      if (cartResponse.hasError) {
        console.error('[StepCatalogue] Cart error:', cartResponse.message);
        // Still allow selection even if cart fails
      } else {
        console.log('[StepCatalogue] Added to cart, mainId:', cartResponse.code);
      }

    } catch (err) {
      console.error('[StepCatalogue] Selection error:', err);
      this.error = 'Error al seleccionar el producto. Por favor intente de nuevo.';
    } finally {
      this.isAddingToCart = false;
    }
  };

  /**
   * Updates the summary bar data based on selected product
   */
  private updateSummaryData(product: CatalogueProduct, detail: ProductDetail) {
    // Calculate "Paga hoy" = regular_price (down payment + any initial costs)
    const payToday = product.regular_price || detail.decDownPayment || 0;

    this.summaryData = {
      productName: product.productName,
      planPrice: 0, // Will be set in step-plans
      svaPrice: 0,  // No SVA at this point
      equipmentPrice: product.update_price || 0, // Monthly equipment payment
      payToday: payToday,
    };
  }

  /**
   * Handles continue button click
   * Proceeds to step-plans
   */
  private handleContinue = () => {
    if (this.selectedProduct && !this.isAddingToCart) {
      this.onNext?.();
    }
  };

  /**
   * Closes the unavailable product modal
   */
  private handleCloseUnavailableModal = () => {
    this.showUnavailableModal = false;
  };

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  /**
   * Renders the unavailable product modal
   */
  private renderUnavailableModal() {
    if (!this.showUnavailableModal) {
      return null;
    }

    return (
      <div class="unavailable-modal-overlay" onClick={this.handleCloseUnavailableModal}>
        <div class="unavailable-modal" onClick={(e) => e.stopPropagation()}>
          <div class="unavailable-modal__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 class="unavailable-modal__title">Producto no disponible</h3>
          <p class="unavailable-modal__message">
            Lo sentimos, este producto no está disponible en este momento.
            Por favor, seleccione otro equipo.
          </p>
          <button class="unavailable-modal__button" onClick={this.handleCloseUnavailableModal}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renders a product card for the carousel
   */
  private renderProductCard(product: CatalogueProduct) {
    const isSelected = this.selectedProduct?.productId === product.productId;
    const isLoadingDetail = this.loadingDetails.has(product.productId);
    const isProcessing = this.isAddingToCart && isSelected;

    return (
      <div
        class={{
          'product-card': true,
          'product-card--selected': isSelected,
          'product-card--loading': isLoadingDetail,
        }}
        onClick={() => !this.isAddingToCart && this.handleSelectProduct(product)}
      >
        {/* Card content: Image | Info */}
        <div class="product-card__content">
          {/* Left: Image */}
          <div class="product-card__image">
            <img src={product.imgUrl} alt={product.productName} loading="lazy" />
          </div>

          {/* Right: Info */}
          <div class="product-card__info">
            <h3 class="product-card__name">{product.productName}</h3>

            {/* Financed price */}
            {product.installments > 0 && (
              <div class="product-card__financed">
                <span class="product-card__financed-label">Financiado</span>
                <span class="product-card__financed-price">
                  {formatPrice(product.update_price || 0)}/mes
                </span>
                <span class="product-card__installments">
                  {product.installments} plazos
                </span>
              </div>
            )}

            {/* Regular price */}
            <p class="product-card__regular-price">
              Precio regular: {formatPrice(product.regular_price || 0)}
            </p>
          </div>
        </div>

        {/* Card footer with message */}
        <div class="product-card__footer">
          <p class="product-card__footer-text">¡Mantente conectado en todo momento!</p>
        </div>

        {/* Loading indicator for detail fetch */}
        {isProcessing && (
          <div class="product-card__processing">
            <div class="product-card__spinner"></div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Renders the summary bar footer
   */
  private renderSummaryBar() {
    const productName = this.summaryData?.productName || '-';
    const planPrice = this.summaryData?.planPrice || 0;
    const svaPrice = this.summaryData?.svaPrice || 0;
    const equipmentPrice = this.summaryData?.equipmentPrice || 0;
    const payToday = this.summaryData?.payToday || 0;

    return (
      <footer class="step-catalogue__summary-bar">
        <div class="step-catalogue__summary-content">
          {/* PCD */}
          <div class="step-catalogue__summary-item">
            <span class="step-catalogue__summary-label">PCD</span>
            <span class="step-catalogue__summary-value">{productName}</span>
          </div>

          {/* Plan */}
          <div class="step-catalogue__summary-item">
            <span class="step-catalogue__summary-label">Plan</span>
            <span class="step-catalogue__summary-value">
              {formatPrice(planPrice)} / mes
            </span>
          </div>

          {/* SVA */}
          <div class="step-catalogue__summary-item">
            <span class="step-catalogue__summary-label">SVA</span>
            <span class="step-catalogue__summary-value">
              {formatPrice(svaPrice)} / mes
            </span>
          </div>

          {/* Equipo / Accesorio */}
          <div class="step-catalogue__summary-item">
            <span class="step-catalogue__summary-label">Equipo / Accesorio</span>
            <span class="step-catalogue__summary-value">
              {formatPrice(equipmentPrice)} / mes
            </span>
          </div>

          {/* Paga hoy */}
          <div class="step-catalogue__summary-item step-catalogue__summary-item--highlight">
            <span class="step-catalogue__summary-label">Paga hoy</span>
            <span class="step-catalogue__summary-value step-catalogue__summary-value--red">
              {formatPrice(payToday)} + IVU
            </span>
          </div>
        </div>

        {/* Continue button */}
        <button
          class={{
            'step-catalogue__continue-btn': true,
            'step-catalogue__continue-btn--disabled': !this.selectedProduct || this.isAddingToCart,
          }}
          onClick={this.handleContinue}
          disabled={!this.selectedProduct || this.isAddingToCart}
        >
          {this.isAddingToCart ? 'Procesando...' : 'Continuar'}
        </button>
      </footer>
    );
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    return (
      <Host>
        <div class="step-catalogue">
          {/* Header */}
          <header class="step-catalogue__header">
            <button class="step-catalogue__back-link" onClick={this.onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Regresar</span>
            </button>
            <h1 class="step-catalogue__title">Escoger modem para servicio fijo</h1>
            <div class="step-catalogue__divider"></div>
          </header>

          {/* Loading state */}
          {this.isLoading && (
            <div class="step-catalogue__loading">
              <div class="step-catalogue__spinner"></div>
              <p>Cargando productos...</p>
            </div>
          )}

          {/* Error state */}
          {this.error && !this.isLoading && (
            <div class="step-catalogue__error">
              <p>{this.error}</p>
              <button onClick={() => this.loadProducts()}>Reintentar</button>
            </div>
          )}

          {/* Products carousel */}
          {!this.isLoading && !this.error && this.products.length > 0 && (
            <div class="step-catalogue__carousel-container">
              <ui-carousel
                totalItems={this.products.length}
                gap={24}
                showNavigation={false}
                showPagination={true}
                breakpoints={[
                  { minWidth: 0, slidesPerView: 1 },
                  { minWidth: 600, slidesPerView: 2 },
                  { minWidth: 900, slidesPerView: 3 },
                ]}
              >
                {this.products.map((product) => this.renderProductCard(product))}
              </ui-carousel>
            </div>
          )}

          {/* Empty state */}
          {!this.isLoading && !this.error && this.products.length === 0 && (
            <div class="step-catalogue__empty">
              <p>No hay productos disponibles en este momento.</p>
            </div>
          )}

          {/* Summary bar */}
          {this.renderSummaryBar()}

          {/* Unavailable product modal */}
          {this.renderUnavailableModal()}
        </div>
      </Host>
    );
  }
}
