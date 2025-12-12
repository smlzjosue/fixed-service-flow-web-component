// ============================================
// STEP PRODUCT DETAIL - Equipment Detail for CLARO HOGAR
// Fixed Service Flow Web Component
// Design based on TEL product-web.component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { productService } from '../../../services/product.service';
import { cartService } from '../../../services/cart.service';
import { catalogueService } from '../../../services';
import { ProductDetail, CatalogueProduct } from '../../../store/interfaces';

interface ColorOption {
  colorId: number;
  colorName: string;
  webColor: string;
  productId?: number;
  imgUrl?: string;
}

interface StorageOption {
  storageId: number;
  storageName: string;
  productId?: number;
  price?: number;
}

interface InstallmentOption {
  months: number;
  monthlyPrice: number;
  totalPrice: number;
}

@Component({
  tag: 'step-product-detail',
  styleUrl: 'step-product-detail.scss',
  shadow: true,
})
export class StepProductDetail {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() product: ProductDetail | null = null;
  @State() catalogueProduct: CatalogueProduct | null = null;
  @State() isLoading: boolean = true;
  @State() error: string | null = null;
  @State() isAddingToCart: boolean = false;

  // Selection states
  @State() selectedColorIndex: number = 0;
  @State() selectedStorageIndex: number = 0;
  @State() selectedInstallments: number = 36;
  @State() quantity: number = 1;

  // Availability state
  @State() isAvailable: boolean = true;
  @State() showUnavailableAlert: boolean = false;

  // Parsed options
  @State() colorOptions: ColorOption[] = [];
  @State() storageOptions: StorageOption[] = [];
  @State() installmentOptions: InstallmentOption[] = [];

  // Product images for carousel
  @State() productImages: string[] = [];

  // Stock threshold (TEL uses entryBarrier = 1, so stock > 1 means available)
  private readonly ENTRY_BARRIER = 1;

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentWillLoad() {
    this.loadProductDetail();
  }

  // ------------------------------------------
  // METHODS
  // ------------------------------------------

  private async loadProductDetail() {
    this.isLoading = true;
    this.error = null;

    try {
      // Get product from session (stored by step-catalogue)
      const storedProduct = catalogueService.getStoredProduct();

      if (!storedProduct) {
        this.error = 'No se encontró el producto seleccionado';
        this.isLoading = false;
        return;
      }

      this.catalogueProduct = storedProduct;

      // Fetch detailed product info from API
      const response = await productService.getEquipmentDetail(storedProduct.productId);

      if (response.hasError || !response.product) {
        // If API fails, use catalogue data as fallback
        console.warn('[StepProductDetail] API failed, using catalogue data');
        this.product = this.mapCatalogueToDetail(storedProduct);
      } else {
        this.product = response.product;
      }

      // Parse options
      this.parseColorOptions();
      this.parseStorageOptions();
      this.parseInstallmentOptions();

      // Build images array for carousel
      this.buildProductImages();

      // Check product availability (TEL pattern: stock > entryBarrier)
      this.checkAvailability();

      // Store in session
      productService.storeSelectedProduct(this.product);
      productService.storeDeviceType('home');

    } catch (err) {
      console.error('[StepProductDetail] Error:', err);
      this.error = 'Error al cargar el detalle del producto';
    } finally {
      this.isLoading = false;
    }
  }

  private mapCatalogueToDetail(cat: CatalogueProduct): ProductDetail {
    return {
      productId: cat.productId,
      productName: cat.productName,
      imgUrl: cat.imgUrl,
      regular_price: cat.regular_price,
      update_price: cat.update_price,
      installments: cat.installments,
      shortDescription: cat.shortDescription,
      colors: cat.colors?.map((c, i) => ({
        colorId: i,
        colorName: `Color ${i + 1}`,
        webColor: c.webColor,
      })),
      home: true,
      catalogId: 6,
    };
  }

  private parseColorOptions() {
    if (!this.product?.colors || this.product.colors.length === 0) {
      // Default single color if none specified
      this.colorOptions = [{
        colorId: 0,
        colorName: 'Default',
        webColor: '#333333',
      }];
      return;
    }

    this.colorOptions = this.product.colors.map((color: any, index: number) => ({
      colorId: color.colorId || index,
      colorName: color.colorName || `Color ${index + 1}`,
      webColor: color.webColor || '#333333',
      productId: color.productId,
      imgUrl: color.imgUrl,
    }));
  }

  private parseStorageOptions() {
    if (!this.product?.storages || this.product.storages.length === 0) {
      // No storage options for this product
      this.storageOptions = [];
      return;
    }

    this.storageOptions = this.product.storages.map((storage: any, index: number) => ({
      storageId: storage.storageId || index,
      storageName: storage.storageName || storage.name || `${storage.size}GB`,
      productId: storage.productId,
      price: storage.price,
    }));
  }

  private parseInstallmentOptions() {
    const totalPrice = this.product?.regular_price || 0;
    const defaultInstallments = this.product?.installments || 36;

    // Common installment options
    const options = [12, 24, 36];

    this.installmentOptions = options.map(months => ({
      months,
      monthlyPrice: Number((totalPrice / months).toFixed(2)),
      totalPrice,
    }));

    // Set default selection
    this.selectedInstallments = defaultInstallments;
  }

  /**
   * Builds the product images array for the carousel
   * Following TEL pattern: combines main image, detail image, and any additional images
   */
  private buildProductImages() {
    if (!this.product) {
      this.productImages = [];
      return;
    }

    const images: string[] = [];

    // Add images from product.images if available (already processed by service)
    if (this.product.images?.length) {
      images.push(...this.product.images);
    }
    // Fallback: use single imgUrl if no images array
    else if (this.product.imgUrl) {
      images.push(this.product.imgUrl);
    }

    // Add color-specific images if available
    if (this.colorOptions?.length > 0) {
      this.colorOptions.forEach(color => {
        if (color.imgUrl && !images.includes(color.imgUrl)) {
          images.push(color.imgUrl);
        }
      });
    }

    this.productImages = images;
    console.log('[StepProductDetail] Product images:', this.productImages.length);
  }

  /**
   * Checks product availability based on stock quantity
   * Following TEL pattern: hasStock = stock > entryBarrier
   *
   * TEL's product.service.ts uses:
   *   - entryBarrier = 1
   *   - hasStock = (stock > entryBarrier)
   *
   * The stock value comes from colors[].storages[].products[0].stock in the API response
   * which is now extracted by productService.getEquipmentDetail()
   */
  private checkAvailability() {
    if (!this.product) {
      this.isAvailable = false;
      this.showUnavailableAlert = true;
      return;
    }

    // TEL Pattern: stock > entryBarrier (where entryBarrier = 1)
    // If stock is undefined, it means the colors structure wasn't present or no products found
    // In that case, we check if product has valid basic data and assume available
    if (this.product.stock === undefined || this.product.stock === null) {
      // No stock info from nested structure - assume available if product has basic data
      this.isAvailable = true;
      console.log('[StepProductDetail] Availability check - stock undefined (no colors structure), assuming available');
    } else {
      // TEL Pattern: hasStock = stock > entryBarrier (1)
      this.isAvailable = this.product.stock > this.ENTRY_BARRIER;
      console.log('[StepProductDetail] Availability check (TEL pattern) - stock:', this.product.stock, '> entryBarrier:', this.ENTRY_BARRIER, '=', this.isAvailable);

      if (!this.isAvailable) {
        this.showUnavailableAlert = true;
      }
    }
  }

  /**
   * Handles dismissing the unavailable alert and going back
   */
  private handleGoBackFromAlert = () => {
    this.showUnavailableAlert = false;
    this.onBack?.();
  };

  private handleColorSelect = (index: number) => {
    this.selectedColorIndex = index;
    const color = this.colorOptions[index];

    // Store selected color
    productService.storeSelectedColor(
      color.colorId,
      color.colorName,
      color.webColor
    );

    // Update product image if color has specific image
    if (color.imgUrl && this.product) {
      this.product = { ...this.product, imgUrl: color.imgUrl };
    }
  };

  private handleStorageSelect = (index: number) => {
    this.selectedStorageIndex = index;
    const storage = this.storageOptions[index];

    // Store selected storage
    productService.storeSelectedStorage(storage.storageId, storage.storageName);

    // Update children ID if storage has specific product
    if (storage.productId) {
      productService.storeChildrenId(storage.productId);
    }
  };

  private handleInstallmentSelect = (months: number) => {
    this.selectedInstallments = months;
  };

  // Quantity selector commented out - keeping function for future use
  // private handleQuantityChange = (delta: number) => {
  //   const newQty = this.quantity + delta;
  //   if (newQty >= 1 && newQty <= 5) {
  //     this.quantity = newQty;
  //   }
  // };

  private handleAddToCart = async () => {
    if (!this.product || this.isAddingToCart) return;

    this.isAddingToCart = true;

    try {
      const response = await cartService.addToCart(
        this.product,
        this.selectedInstallments,
        this.quantity
      );

      if (response.hasError) {
        console.error('[StepProductDetail] Add to cart failed:', response.message);
        this.error = response.message || 'Error al agregar al carrito';
        return;
      }

      // Store mainId for next steps
      if (response.code) {
        cartService.storeMainId(response.code);
        productService.storeMainId(response.code);
      }

      console.log('[StepProductDetail] Added to cart, proceeding to plans');

      // Navigate to next step (plans selection)
      this.onNext?.();

    } catch (err) {
      console.error('[StepProductDetail] Error:', err);
      this.error = 'Error al agregar el producto al carrito';
    } finally {
      this.isAddingToCart = false;
    }
  };

  private getCurrentMonthlyPrice(): number {
    const option = this.installmentOptions.find(o => o.months === this.selectedInstallments);
    return option?.monthlyPrice || this.product?.update_price || 0;
  }

  private formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  // ------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------

  private renderBreadcrumb() {
    return (
      <div class="breadcrumb">
        <span class="breadcrumb-item" onClick={this.onBack}>
          Catálogo
        </span>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-item active">
          {this.product?.productName || 'Detalle'}
        </span>
      </div>
    );
  }

  private renderColorSelector() {
    if (this.colorOptions.length <= 1) return null;

    return (
      <div class="selector-section">
        <h4 class="selector-title">Color</h4>
        <div class="color-options">
          {this.colorOptions.map((color, index) => (
            <button
              class={{
                'color-circle': true,
                'selected': this.selectedColorIndex === index,
              }}
              style={{ backgroundColor: color.webColor }}
              onClick={() => this.handleColorSelect(index)}
              title={color.colorName}
            >
              {this.selectedColorIndex === index && (
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
        <span class="selected-label">{this.colorOptions[this.selectedColorIndex]?.colorName}</span>
      </div>
    );
  }

  private renderStorageSelector() {
    if (this.storageOptions.length === 0) return null;

    return (
      <div class="selector-section">
        <h4 class="selector-title">Almacenamiento</h4>
        <div class="storage-options">
          {this.storageOptions.map((storage, index) => (
            <button
              class={{
                'storage-button': true,
                'selected': this.selectedStorageIndex === index,
              }}
              onClick={() => this.handleStorageSelect(index)}
            >
              {storage.storageName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  private renderInstallmentSelector() {
    return (
      <div class="selector-section">
        <h4 class="selector-title">Plazos de pago</h4>
        <div class="installment-options">
          {this.installmentOptions.map(option => (
            <button
              class={{
                'installment-button': true,
                'selected': this.selectedInstallments === option.months,
              }}
              onClick={() => this.handleInstallmentSelect(option.months)}
            >
              <span class="months">{option.months} meses</span>
              <span class="price">{this.formatPrice(option.monthlyPrice)}/mes</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  private renderQuantitySelector() {
    return (
      <div class="selector-section">
        {/* <h4 class="selector-title">Cantidad</h4>
        <div class="quantity-selector">
          <button
            class="qty-button"
            onClick={() => this.handleQuantityChange(-1)}
            disabled={this.quantity <= 1}
          >
            -
          </button>
          <span class="qty-value">{this.quantity}</span>
          <button
            class="qty-button"
            onClick={() => this.handleQuantityChange(1)}
            disabled={this.quantity >= 5}
          >
            +
          </button>
        </div> */}
      </div>
    );
  }

  private renderPriceSection() {
    const monthlyPrice = this.getCurrentMonthlyPrice();
    const totalPrice = this.product?.regular_price || 0;

    return (
      <div class="price-section">
        <div class="price-row monthly">
          <span class="label">Pago mensual</span>
          <span class="value">{this.formatPrice(monthlyPrice)}</span>
        </div>
        <div class="price-row total">
          <span class="label">Precio total</span>
          <span class="value">{this.formatPrice(totalPrice)}</span>
        </div>
        <div class="price-row installments">
          <span class="label">Financiado a</span>
          <span class="value">{this.selectedInstallments} meses</span>
        </div>
      </div>
    );
  }

  /**
   * Renders the availability status indicator (TEL pattern)
   */
  private renderAvailabilityStatus() {
    return (
      <div class="availability-status">
        {this.isAvailable ? (
          <div class="availability-status--available">
            <svg class="availability-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Disponible</span>
          </div>
        ) : (
          <div class="availability-status--unavailable">
            <svg class="availability-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>No disponible</span>
          </div>
        )}
      </div>
    );
  }

  /**
   * Renders the unavailable product alert modal
   */
  private renderUnavailableAlert() {
    if (!this.showUnavailableAlert) return null;

    return (
      <div class="unavailable-alert-overlay">
        <div class="unavailable-alert">
          <div class="unavailable-alert__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3 class="unavailable-alert__title">Producto no disponible</h3>
          <p class="unavailable-alert__message">
            Lo sentimos, este equipo no está disponible actualmente.
            Por favor seleccione otro equipo del catálogo.
          </p>
          <button class="unavailable-alert__btn" onClick={this.handleGoBackFromAlert}>
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    return (
      <Host>
        <div class="step-product-detail">
          {/* Unavailable Alert Modal */}
          {this.renderUnavailableAlert()}

          {/* Loading */}
          {this.isLoading && (
            <div class="loading-container">
              <div class="spinner"></div>
              <p>Cargando producto...</p>
            </div>
          )}

          {/* Error */}
          {this.error && !this.isLoading && (
            <div class="error-container">
              <p>{this.error}</p>
              <button class="btn-retry" onClick={() => this.loadProductDetail()}>
                Reintentar
              </button>
              <button class="btn-back" onClick={this.onBack}>
                Volver al catálogo
              </button>
            </div>
          )}

          {/* Product Detail */}
          {!this.isLoading && !this.error && this.product && (
            <div class="product-container">
              {/* Breadcrumb */}
              {this.renderBreadcrumb()}

              {/* Main Content Grid */}
              <div class="product-grid">
                {/* Left Column: Image Carousel */}
                <div class="product-image-section">
                  <ui-image-carousel
                    images={this.productImages}
                    loop={true}
                    showNavigation={this.productImages.length > 1}
                    showIndicators={this.productImages.length > 1}
                    autoplayInterval={0}
                  ></ui-image-carousel>
                </div>

                {/* Right Column: Details */}
                <div class="product-details-section">
                  {/* Brand & Name */}
                  {this.product.brandName && (
                    <span class="brand-name">{this.product.brandName}</span>
                  )}
                  <h1 class="product-name">{this.product.productName}</h1>

                  {/* Description */}
                  {this.product.shortDescription && (
                    <p class="product-description">
                      {productService.cleanDescription(this.product.shortDescription)}
                    </p>
                  )}

                  {/* Availability Status Indicator */}
                  {this.renderAvailabilityStatus()}

                  {/* Color Selector */}
                  {this.renderColorSelector()}

                  {/* Storage Selector */}
                  {this.renderStorageSelector()}

                  {/* Installment Selector */}
                  {this.renderInstallmentSelector()}

                  {/* Quantity Selector */}
                  {this.renderQuantitySelector()}

                  {/* Price Section */}
                  {this.renderPriceSection()}

                  {/* Add to Cart Button */}
                  <button
                    class={{
                      'btn-add-to-cart': true,
                      'loading': this.isAddingToCart,
                      'disabled': !this.isAvailable,
                    }}
                    onClick={this.handleAddToCart}
                    disabled={this.isAddingToCart || !this.isAvailable}
                  >
                    {this.isAddingToCart ? (
                      <span class="loading-text">
                        <span class="spinner-small"></span>
                        Agregando...
                      </span>
                    ) : !this.isAvailable ? (
                      'No disponible'
                    ) : (
                      'Continuar'
                    )}
                  </button>

                  {/* Back Button */}
                  <button class="btn-back-link" onClick={this.onBack}>
                    &larr; Volver al catálogo
                  </button>
                </div>
              </div>

              {/* Features Section */}
              {this.product.features && this.product.features.length > 0 && (
                <div class="features-section">
                  <h3 class="features-title">Características</h3>
                  <ul class="features-list">
                    {this.product.features.map(feature => (
                      <li class="feature-item">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications Section */}
              {this.product.specifications && this.product.specifications.length > 0 && (
                <div class="specs-section">
                  <h3 class="specs-title">Especificaciones</h3>
                  <div class="specs-grid">
                    {this.product.specifications.map((spec: any) => (
                      <div class="spec-item">
                        <span class="spec-label">{spec.name}</span>
                        <span class="spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
