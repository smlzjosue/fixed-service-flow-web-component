// ============================================
// UI-CAROUSEL - Responsive Carousel Component
// Fixed Service Flow Web Component
// Based on TEL's carousel implementation
// ============================================
import { h, Host } from "@stencil/core";
export class UiCarousel {
    // ------------------------------------------
    // ELEMENT
    // ------------------------------------------
    el;
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Total number of items in the carousel
     */
    totalItems = 0;
    /**
     * Default number of slides per view
     */
    slidesPerView = 1;
    /**
     * Gap between slides in pixels
     */
    gap = 16;
    /**
     * Show navigation arrows
     */
    showNavigation = true;
    /**
     * Show pagination dots
     */
    showPagination = true;
    /**
     * Enable loop/circular mode
     */
    loop = false;
    /**
     * Auto-play interval in milliseconds (0 = disabled)
     */
    autoplay = 0;
    /**
     * Responsive breakpoints
     * Default: mobile=1, tablet=2, desktop=3, large=4
     */
    breakpoints = [
        { minWidth: 0, slidesPerView: 1 },
        { minWidth: 600, slidesPerView: 2 },
        { minWidth: 900, slidesPerView: 3 },
        { minWidth: 1200, slidesPerView: 4 },
    ];
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    currentIndex = 0;
    currentSlidesPerView = 1;
    isDragging = false;
    startX = 0;
    translateX = 0;
    // ------------------------------------------
    // REFS
    // ------------------------------------------
    trackEl;
    autoplayInterval;
    resizeObserver;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
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
    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateSlidesPerView();
        });
        this.resizeObserver.observe(this.el);
    }
    updateSlidesPerView() {
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
    getMaxIndex() {
        return Math.max(0, this.totalItems - this.currentSlidesPerView);
    }
    goToSlide(index) {
        const maxIndex = this.getMaxIndex();
        if (this.loop) {
            if (index < 0) {
                index = maxIndex;
            }
            else if (index > maxIndex) {
                index = 0;
            }
        }
        else {
            index = Math.max(0, Math.min(index, maxIndex));
        }
        this.currentIndex = index;
        this.updateTranslate();
    }
    goToPrev = () => {
        this.goToSlide(this.currentIndex - 1);
    };
    goToNext = () => {
        this.goToSlide(this.currentIndex + 1);
    };
    updateTranslate() {
        if (!this.trackEl)
            return;
        const slideWidth = 100 / this.currentSlidesPerView;
        this.translateX = -(this.currentIndex * slideWidth);
    }
    // ------------------------------------------
    // AUTOPLAY
    // ------------------------------------------
    startAutoplay() {
        if (this.autoplay > 0) {
            this.autoplayInterval = setInterval(() => {
                this.goToNext();
            }, this.autoplay);
        }
    }
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
    // ------------------------------------------
    // TOUCH/DRAG HANDLING
    // ------------------------------------------
    handleTouchStart = (e) => {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.stopAutoplay();
    };
    handleTouchMove = (e) => {
        if (!this.isDragging)
            return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - this.startX;
        // Calculate temporary translate based on drag
        const slideWidth = this.el.offsetWidth / this.currentSlidesPerView;
        const dragPercent = (diff / slideWidth) * (100 / this.currentSlidesPerView);
        const baseTranslate = -(this.currentIndex * (100 / this.currentSlidesPerView));
        this.translateX = baseTranslate + dragPercent;
    };
    handleTouchEnd = (e) => {
        if (!this.isDragging)
            return;
        this.isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = endX - this.startX;
        // Threshold for swipe (50px)
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.goToPrev();
            }
            else {
                this.goToNext();
            }
        }
        else {
            this.updateTranslate();
        }
        this.startAutoplay();
    };
    // ------------------------------------------
    // PAGINATION
    // ------------------------------------------
    getPaginationDots() {
        const totalDots = Math.ceil(this.totalItems / this.currentSlidesPerView);
        return Array.from({ length: totalDots }, (_, i) => i);
    }
    handleDotClick = (dotIndex) => {
        this.goToSlide(dotIndex * this.currentSlidesPerView);
    };
    getCurrentDot() {
        return Math.floor(this.currentIndex / this.currentSlidesPerView);
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const canGoPrev = this.loop || this.currentIndex > 0;
        const canGoNext = this.loop || this.currentIndex < this.getMaxIndex();
        const slideWidth = 100 / this.currentSlidesPerView;
        return (h(Host, { key: '1d71ded8170a2004929ada8d1401d18fbe5dcc0c' }, h("div", { key: '01d088bfc7590419709aa83850462f6b1fa6374c', class: "ui-carousel" }, this.showNavigation && (h("button", { key: 'a820df5e62634206f0d9f46092f84f84a724eb23', class: {
                'ui-carousel__nav': true,
                'ui-carousel__nav--prev': true,
                'ui-carousel__nav--disabled': !canGoPrev,
            }, onClick: this.goToPrev, disabled: !canGoPrev, "aria-label": "Anterior" }, h("svg", { key: '7ee40aa5fa9fd0c8ac38583ebeaf0c15b8b4c49e', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: '882e3d293306f869bd4d8db82a1c0a8720d83d69', points: "15 18 9 12 15 6" })))), h("div", { key: '0bc0eef0e943585d9877ae832a33bac4813c33c1', class: "ui-carousel__viewport" }, h("div", { key: '8ce97b79d901f63c3e6da2e750926857d2dddbc9', class: {
                'ui-carousel__track': true,
                'ui-carousel__track--dragging': this.isDragging,
            }, ref: (el) => (this.trackEl = el), style: {
                transform: `translateX(${this.translateX}%)`,
                gap: `${this.gap}px`,
            }, onTouchStart: this.handleTouchStart, onTouchMove: this.handleTouchMove, onTouchEnd: this.handleTouchEnd }, h("slot", { key: 'bab876ce6a274ce53c476444694cef4e94bf39ad' }))), this.showNavigation && (h("button", { key: '286f8e40d9092b5d837566977e252c36e9fee843', class: {
                'ui-carousel__nav': true,
                'ui-carousel__nav--next': true,
                'ui-carousel__nav--disabled': !canGoNext,
            }, onClick: this.goToNext, disabled: !canGoNext, "aria-label": "Siguiente" }, h("svg", { key: '28eabda805720b3bb8c540b4126c000db8ff7433', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'ad5d5d53067b22fe760c4e6499f027ac61105154', points: "9 18 15 12 9 6" })))), this.showPagination && this.totalItems > this.currentSlidesPerView && (h("div", { key: 'aab818d63c57cea9cfe25a91bb768f8be490cef5', class: "ui-carousel__pagination" }, this.getPaginationDots().map((dotIndex) => (h("button", { class: {
                'ui-carousel__dot': true,
                'ui-carousel__dot--active': dotIndex === this.getCurrentDot(),
            }, onClick: () => this.handleDotClick(dotIndex), "aria-label": `Ir a página ${dotIndex + 1}` })))))), h("style", { key: '927be72b1c508b1add09174d6402b4dfc5f1aece' }, `
            ::slotted(*) {
              flex: 0 0 calc(${slideWidth}% - ${this.gap * (this.currentSlidesPerView - 1) / this.currentSlidesPerView}px);
              max-width: calc(${slideWidth}% - ${this.gap * (this.currentSlidesPerView - 1) / this.currentSlidesPerView}px);
              /* height handled by align-items: stretch on track */
            }
          `)));
    }
    static get is() { return "ui-carousel"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-carousel.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-carousel.css"]
        };
    }
    static get properties() {
        return {
            "totalItems": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Total number of items in the carousel"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "total-items",
                "defaultValue": "0"
            },
            "slidesPerView": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Default number of slides per view"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "slides-per-view",
                "defaultValue": "1"
            },
            "gap": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Gap between slides in pixels"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "gap",
                "defaultValue": "16"
            },
            "showNavigation": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Show navigation arrows"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-navigation",
                "defaultValue": "true"
            },
            "showPagination": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Show pagination dots"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-pagination",
                "defaultValue": "true"
            },
            "loop": {
                "type": "boolean",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Enable loop/circular mode"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loop",
                "defaultValue": "false"
            },
            "autoplay": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Auto-play interval in milliseconds (0 = disabled)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "autoplay",
                "defaultValue": "0"
            },
            "breakpoints": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "CarouselBreakpoint[]",
                    "resolved": "CarouselBreakpoint[]",
                    "references": {
                        "CarouselBreakpoint": {
                            "location": "local",
                            "path": "/Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow/src/components/ui/ui-carousel/ui-carousel.tsx",
                            "id": "src/components/ui/ui-carousel/ui-carousel.tsx::CarouselBreakpoint"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Responsive breakpoints\nDefault: mobile=1, tablet=2, desktop=3, large=4"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[\n    { minWidth: 0, slidesPerView: 1 },\n    { minWidth: 600, slidesPerView: 2 },\n    { minWidth: 900, slidesPerView: 3 },\n    { minWidth: 1200, slidesPerView: 4 },\n  ]"
            }
        };
    }
    static get states() {
        return {
            "currentIndex": {},
            "currentSlidesPerView": {},
            "isDragging": {},
            "startX": {},
            "translateX": {}
        };
    }
    static get elementRef() { return "el"; }
    static get watchers() {
        return [{
                "propName": "totalItems",
                "methodName": "handleTotalItemsChange"
            }];
    }
}
//# sourceMappingURL=ui-carousel.js.map
