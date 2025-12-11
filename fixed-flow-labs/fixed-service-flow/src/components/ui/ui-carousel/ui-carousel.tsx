// ============================================
// UI-CAROUSEL - Responsive Carousel Component
// Fixed Service Flow Web Component
// Based on TEL's carousel implementation
// ============================================

import { Component, Prop, State, Element, h, Host, Watch } from '@stencil/core';

export interface CarouselBreakpoint {
  minWidth: number;
  slidesPerView: number;
}

@Component({
  tag: 'ui-carousel',
  styleUrl: 'ui-carousel.scss',
  shadow: true,
})
export class UiCarousel {
  // ------------------------------------------
  // ELEMENT
  // ------------------------------------------

  @Element() el: HTMLElement;

  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  /**
   * Total number of items in the carousel
   */
  @Prop() totalItems: number = 0;

  /**
   * Default number of slides per view
   */
  @Prop() slidesPerView: number = 1;

  /**
   * Gap between slides in pixels
   */
  @Prop() gap: number = 16;

  /**
   * Show navigation arrows
   */
  @Prop() showNavigation: boolean = true;

  /**
   * Show pagination dots
   */
  @Prop() showPagination: boolean = true;

  /**
   * Enable loop/circular mode
   */
  @Prop() loop: boolean = false;

  /**
   * Auto-play interval in milliseconds (0 = disabled)
   */
  @Prop() autoplay: number = 0;

  /**
   * Responsive breakpoints
   * Default: mobile=1, tablet=2, desktop=3, large=4
   */
  @Prop() breakpoints: CarouselBreakpoint[] = [
    { minWidth: 0, slidesPerView: 1 },
    { minWidth: 600, slidesPerView: 2 },
    { minWidth: 900, slidesPerView: 3 },
    { minWidth: 1200, slidesPerView: 4 },
  ];

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() currentIndex: number = 0;
  @State() currentSlidesPerView: number = 1;
  @State() isDragging: boolean = false;
  @State() startX: number = 0;
  @State() translateX: number = 0;

  // ------------------------------------------
  // REFS
  // ------------------------------------------

  private trackEl: HTMLDivElement;
  private autoplayInterval: any;
  private resizeObserver: ResizeObserver;

  // ------------------------------------------
  // WATCHERS
  // ------------------------------------------

  @Watch('totalItems')
  handleTotalItemsChange() {
    this.currentIndex = 0;
    this.updateTranslate();
  }

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentDidLoad() {
    this.updateSlidesPerView();
    this.setupResizeObserver();
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // ------------------------------------------
  // RESIZE HANDLING
  // ------------------------------------------

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSlidesPerView();
    });
    this.resizeObserver.observe(this.el);
  }

  private updateSlidesPerView() {
    const width = this.el.offsetWidth;

    // Find the appropriate breakpoint
    let slidesPerView = this.slidesPerView;

    for (const bp of this.breakpoints) {
      if (width >= bp.minWidth) {
        slidesPerView = bp.slidesPerView;
      }
    }

    this.currentSlidesPerView = slidesPerView;

    // Ensure currentIndex is valid
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex;
    }

    this.updateTranslate();
  }

  // ------------------------------------------
  // NAVIGATION
  // ------------------------------------------

  private getMaxIndex(): number {
    return Math.max(0, this.totalItems - this.currentSlidesPerView);
  }

  private goToSlide(index: number) {
    const maxIndex = this.getMaxIndex();

    if (this.loop) {
      if (index < 0) {
        index = maxIndex;
      } else if (index > maxIndex) {
        index = 0;
      }
    } else {
      index = Math.max(0, Math.min(index, maxIndex));
    }

    this.currentIndex = index;
    this.updateTranslate();
  }

  private goToPrev = () => {
    this.goToSlide(this.currentIndex - 1);
  };

  private goToNext = () => {
    this.goToSlide(this.currentIndex + 1);
  };

  private updateTranslate() {
    if (!this.trackEl) return;

    const slideWidth = 100 / this.currentSlidesPerView;
    this.translateX = -(this.currentIndex * slideWidth);
  }

  // ------------------------------------------
  // AUTOPLAY
  // ------------------------------------------

  private startAutoplay() {
    if (this.autoplay > 0) {
      this.autoplayInterval = setInterval(() => {
        this.goToNext();
      }, this.autoplay);
    }
  }

  private stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  // ------------------------------------------
  // TOUCH/DRAG HANDLING
  // ------------------------------------------

  private handleTouchStart = (e: TouchEvent) => {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.stopAutoplay();
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (!this.isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - this.startX;

    // Calculate temporary translate based on drag
    const slideWidth = this.el.offsetWidth / this.currentSlidesPerView;
    const dragPercent = (diff / slideWidth) * (100 / this.currentSlidesPerView);

    const baseTranslate = -(this.currentIndex * (100 / this.currentSlidesPerView));
    this.translateX = baseTranslate + dragPercent;
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (!this.isDragging) return;

    this.isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - this.startX;

    // Threshold for swipe (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.goToPrev();
      } else {
        this.goToNext();
      }
    } else {
      this.updateTranslate();
    }

    this.startAutoplay();
  };

  // ------------------------------------------
  // PAGINATION
  // ------------------------------------------

  private getPaginationDots(): number[] {
    const totalDots = Math.ceil(this.totalItems / this.currentSlidesPerView);
    return Array.from({ length: totalDots }, (_, i) => i);
  }

  private handleDotClick = (dotIndex: number) => {
    this.goToSlide(dotIndex * this.currentSlidesPerView);
  };

  private getCurrentDot(): number {
    return Math.floor(this.currentIndex / this.currentSlidesPerView);
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    const canGoPrev = this.loop || this.currentIndex > 0;
    const canGoNext = this.loop || this.currentIndex < this.getMaxIndex();
    const slideWidth = 100 / this.currentSlidesPerView;

    return (
      <Host>
        <div class="ui-carousel">
          {/* Navigation - Previous */}
          {this.showNavigation && (
            <button
              class={{
                'ui-carousel__nav': true,
                'ui-carousel__nav--prev': true,
                'ui-carousel__nav--disabled': !canGoPrev,
              }}
              onClick={this.goToPrev}
              disabled={!canGoPrev}
              aria-label="Anterior"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          {/* Track Container */}
          <div class="ui-carousel__viewport">
            <div
              class={{
                'ui-carousel__track': true,
                'ui-carousel__track--dragging': this.isDragging,
              }}
              ref={(el) => (this.trackEl = el)}
              style={{
                transform: `translateX(${this.translateX}%)`,
                gap: `${this.gap}px`,
              }}
              onTouchStart={this.handleTouchStart}
              onTouchMove={this.handleTouchMove}
              onTouchEnd={this.handleTouchEnd}
            >
              <slot></slot>
            </div>
          </div>

          {/* Navigation - Next */}
          {this.showNavigation && (
            <button
              class={{
                'ui-carousel__nav': true,
                'ui-carousel__nav--next': true,
                'ui-carousel__nav--disabled': !canGoNext,
              }}
              onClick={this.goToNext}
              disabled={!canGoNext}
              aria-label="Siguiente"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* Pagination Dots */}
          {this.showPagination && this.totalItems > this.currentSlidesPerView && (
            <div class="ui-carousel__pagination">
              {this.getPaginationDots().map((dotIndex) => (
                <button
                  class={{
                    'ui-carousel__dot': true,
                    'ui-carousel__dot--active': dotIndex === this.getCurrentDot(),
                  }}
                  onClick={() => this.handleDotClick(dotIndex)}
                  aria-label={`Ir a página ${dotIndex + 1}`}
                ></button>
              ))}
            </div>
          )}
        </div>

        {/* Slide width CSS variable for slotted content */}
        <style>
          {`
            ::slotted(*) {
              flex: 0 0 calc(${slideWidth}% - ${this.gap * (this.currentSlidesPerView - 1) / this.currentSlidesPerView}px);
              max-width: calc(${slideWidth}% - ${this.gap * (this.currentSlidesPerView - 1) / this.currentSlidesPerView}px);
            }
          `}
        </style>
      </Host>
    );
  }
}
