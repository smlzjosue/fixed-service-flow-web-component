// ============================================
// UI-IMAGE-CAROUSEL - Product Image Carousel
// Fixed Service Flow Web Component
// Based on TEL's image-carousel-web component
// ============================================

import { Component, Prop, State, h, Host, Watch } from '@stencil/core';

@Component({
  tag: 'ui-image-carousel',
  styleUrl: 'ui-image-carousel.scss',
  shadow: true,
})
export class UiImageCarousel {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Array of image URLs to display
   */
  @Prop() images: string[] = [];

  /**
   * Enable circular/loop mode
   */
  @Prop() loop: boolean = true;

  /**
   * Show navigation arrows
   */
  @Prop() showNavigation: boolean = true;

  /**
   * Show indicator dots
   */
  @Prop() showIndicators: boolean = true;

  /**
   * Auto-play interval in milliseconds (0 = disabled)
   */
  @Prop() autoplayInterval: number = 0;

  /**
   * Fallback image URL when image fails to load
   */
  @Prop() fallbackImage: string = '';

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() currentIndex: number = 0;
  @State() loadedImages: Set<number> = new Set();
  @State() failedImages: Set<number> = new Set();

  // ------------------------------------------
  // PRIVATE
  // ------------------------------------------

  private autoplayTimer: any;
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  // ------------------------------------------
  // WATCHERS
  // ------------------------------------------

  @Watch('images')
  onImagesChange() {
    this.currentIndex = 0;
    this.loadedImages = new Set();
    this.failedImages = new Set();
    this.restartAutoplay();
  }

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentDidLoad() {
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  // ------------------------------------------
  // AUTOPLAY
  // ------------------------------------------

  private startAutoplay() {
    if (this.autoplayInterval > 0 && this.images.length > 1) {
      this.autoplayTimer = setInterval(() => {
        this.goToNext();
      }, this.autoplayInterval);
    }
  }

  private stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  // ------------------------------------------
  // NAVIGATION
  // ------------------------------------------

  private goToSlide = (index: number) => {
    const total = this.images.length;
    if (total === 0) return;

    if (this.loop) {
      if (index < 0) {
        index = total - 1;
      } else if (index >= total) {
        index = 0;
      }
    } else {
      index = Math.max(0, Math.min(index, total - 1));
    }

    this.currentIndex = index;
    this.restartAutoplay();
  };

  private goToPrev = () => {
    this.goToSlide(this.currentIndex - 1);
  };

  private goToNext = () => {
    this.goToSlide(this.currentIndex + 1);
  };

  // ------------------------------------------
  // TOUCH HANDLING
  // ------------------------------------------

  private handleTouchStart = (e: TouchEvent) => {
    this.touchStartX = e.touches[0].clientX;
    this.stopAutoplay();
  };

  private handleTouchEnd = (e: TouchEvent) => {
    this.touchEndX = e.changedTouches[0].clientX;
    this.handleSwipe();
    this.startAutoplay();
  };

  private handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50; // Min swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.goToNext();
      } else {
        this.goToPrev();
      }
    }
  }

  // ------------------------------------------
  // IMAGE HANDLING
  // ------------------------------------------

  private handleImageLoad = (index: number) => {
    this.loadedImages = new Set([...this.loadedImages, index]);
  };

  private handleImageError = (index: number, event: Event) => {
    this.failedImages = new Set([...this.failedImages, index]);

    // Apply fallback image
    if (this.fallbackImage) {
      const img = event.target as HTMLImageElement;
      img.src = this.fallbackImage;
    }
  };

  private getImageSrc(index: number): string {
    const src = this.images[index];
    if (!src && this.fallbackImage) {
      return this.fallbackImage;
    }
    return src || '';
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const total = this.images.length;
    const hasMultiple = total > 1;
    const canGoPrev = this.loop || this.currentIndex > 0;
    const canGoNext = this.loop || this.currentIndex < total - 1;

    // If no images, show placeholder
    if (total === 0) {
      return (
        <Host>
          <div class="ui-image-carousel">
            <div class="ui-image-carousel__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Sin imagen</span>
            </div>
          </div>
        </Host>
      );
    }

    return (
      <Host>
        <div class="ui-image-carousel">
          {/* Main Image Container */}
          <div
            class="ui-image-carousel__main"
            onTouchStart={this.handleTouchStart}
            onTouchEnd={this.handleTouchEnd}
          >
            {/* Navigation Arrow - Previous */}
            {this.showNavigation && hasMultiple && (
              <button
                class={{
                  'ui-image-carousel__nav': true,
                  'ui-image-carousel__nav--prev': true,
                  'ui-image-carousel__nav--disabled': !canGoPrev,
                }}
                onClick={this.goToPrev}
                disabled={!canGoPrev}
                aria-label="Imagen anterior"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Images Track */}
            <div
              class="ui-image-carousel__track"
              style={{
                transform: `translateX(-${this.currentIndex * 100}%)`,
              }}
            >
              {this.images.map((_, index) => (
                <div class="ui-image-carousel__slide">
                  <img
                    src={this.getImageSrc(index)}
                    alt={`Imagen ${index + 1}`}
                    class={{
                      'ui-image-carousel__image': true,
                      'ui-image-carousel__image--loaded': this.loadedImages.has(index),
                    }}
                    onLoad={() => this.handleImageLoad(index)}
                    onError={(e) => this.handleImageError(index, e)}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Arrow - Next */}
            {this.showNavigation && hasMultiple && (
              <button
                class={{
                  'ui-image-carousel__nav': true,
                  'ui-image-carousel__nav--next': true,
                  'ui-image-carousel__nav--disabled': !canGoNext,
                }}
                onClick={this.goToNext}
                disabled={!canGoNext}
                aria-label="Imagen siguiente"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>

          {/* Indicators/Dots */}
          {this.showIndicators && hasMultiple && (
            <div class="ui-image-carousel__indicators">
              {this.images.map((_, index) => (
                <button
                  class={{
                    'ui-image-carousel__dot': true,
                    'ui-image-carousel__dot--active': index === this.currentIndex,
                  }}
                  onClick={() => this.goToSlide(index)}
                  aria-label={`Ir a imagen ${index + 1}`}
                ></button>
              ))}
            </div>
          )}

          {/* Thumbnails (optional, shown when more than 1 image) */}
          {hasMultiple && (
            <div class="ui-image-carousel__thumbnails">
              {this.images.map((src, index) => (
                <button
                  class={{
                    'ui-image-carousel__thumbnail': true,
                    'ui-image-carousel__thumbnail--active': index === this.currentIndex,
                  }}
                  onClick={() => this.goToSlide(index)}
                >
                  <img
                    src={src || this.fallbackImage}
                    alt={`Miniatura ${index + 1}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
