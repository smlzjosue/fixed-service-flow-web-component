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

  // Parsed options
  @State() colorOptions: ColorOption[] = [];
  @State() storageOptions: StorageOption[] = [];
  @State() installmentOptions: InstallmentOption[] = [];

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

  private handleQuantityChange = (delta: number) => {
    const newQty = this.quantity + delta;
    if (newQty >= 1 && newQty <= 5) {
      this.quantity = newQty;
    }
  };

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
        <h4 class="selector-title">Cantidad</h4>
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
        </div>
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

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    return (
      <Host>
        <div class="step-product-detail">
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
                {/* Left Column: Image */}
                <div class="product-image-section">
                  <div class="image-container">
                    <img
                      src={this.product.imgUrl}
                      alt={this.product.productName}
                      class="product-image"
                    />
                  </div>
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
                    }}
                    onClick={this.handleAddToCart}
                    disabled={this.isAddingToCart}
                  >
                    {this.isAddingToCart ? (
                      <span class="loading-text">
                        <span class="spinner-small"></span>
                        Agregando...
                      </span>
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
