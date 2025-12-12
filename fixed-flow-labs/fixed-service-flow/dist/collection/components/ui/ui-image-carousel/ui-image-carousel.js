// ============================================
// UI-IMAGE-CAROUSEL - Product Image Carousel
// Fixed Service Flow Web Component
// Based on TEL's image-carousel-web component
// ============================================
import { h, Host } from "@stencil/core";
export class UiImageCarousel {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    /**
     * Array of image URLs to display
     */
    images = [];
    /**
     * Enable circular/loop mode
     */
    loop = true;
    /**
     * Show navigation arrows
     */
    showNavigation = true;
    /**
     * Show indicator dots
     */
    showIndicators = true;
    /**
     * Auto-play interval in milliseconds (0 = disabled)
     */
    autoplayInterval = 0;
    /**
     * Fallback image URL when image fails to load
     */
    fallbackImage = '';
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    currentIndex = 0;
    loadedImages = new Set();
    failedImages = new Set();
    // ------------------------------------------
    // PRIVATE
    // ------------------------------------------
    autoplayTimer;
    touchStartX = 0;
    touchEndX = 0;
    // ------------------------------------------
    // WATCHERS
    // ------------------------------------------
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
    startAutoplay() {
        if (this.autoplayInterval > 0 && this.images.length > 1) {
            this.autoplayTimer = setInterval(() => {
                this.goToNext();
            }, this.autoplayInterval);
        }
    }
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    goToSlide = (index) => {
        const total = this.images.length;
        if (total === 0)
            return;
        if (this.loop) {
            if (index < 0) {
                index = total - 1;
            }
            else if (index >= total) {
                index = 0;
            }
        }
        else {
            index = Math.max(0, Math.min(index, total - 1));
        }
        this.currentIndex = index;
        this.restartAutoplay();
    };
    goToPrev = () => {
        this.goToSlide(this.currentIndex - 1);
    };
    goToNext = () => {
        this.goToSlide(this.currentIndex + 1);
    };
    // ------------------------------------------
    // TOUCH HANDLING
    // ------------------------------------------
    handleTouchStart = (e) => {
        this.touchStartX = e.touches[0].clientX;
        this.stopAutoplay();
    };
    handleTouchEnd = (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
        this.startAutoplay();
    };
    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        const threshold = 50; // Min swipe distance
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.goToNext();
            }
            else {
                this.goToPrev();
            }
        }
    }
    // ------------------------------------------
    // IMAGE HANDLING
    // ------------------------------------------
    handleImageLoad = (index) => {
        this.loadedImages = new Set([...this.loadedImages, index]);
    };
    handleImageError = (index, event) => {
        this.failedImages = new Set([...this.failedImages, index]);
        // Apply fallback image
        if (this.fallbackImage) {
            const img = event.target;
            img.src = this.fallbackImage;
        }
    };
    getImageSrc(index) {
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
            return (h(Host, null, h("div", { class: "ui-image-carousel" }, h("div", { class: "ui-image-carousel__placeholder" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }, h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }), h("circle", { cx: "8.5", cy: "8.5", r: "1.5" }), h("polyline", { points: "21 15 16 10 5 21" })), h("span", null, "Sin imagen")))));
        }
        return (h(Host, null, h("div", { class: "ui-image-carousel" }, h("div", { class: "ui-image-carousel__main", onTouchStart: this.handleTouchStart, onTouchEnd: this.handleTouchEnd }, this.showNavigation && hasMultiple && (h("button", { class: {
                'ui-image-carousel__nav': true,
                'ui-image-carousel__nav--prev': true,
                'ui-image-carousel__nav--disabled': !canGoPrev,
            }, onClick: this.goToPrev, disabled: !canGoPrev, "aria-label": "Imagen anterior" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { points: "15 18 9 12 15 6" })))), h("div", { class: "ui-image-carousel__track", style: {
                transform: `translateX(-${this.currentIndex * 100}%)`,
            } }, this.images.map((_, index) => (h("div", { class: "ui-image-carousel__slide" }, h("img", { src: this.getImageSrc(index), alt: `Imagen ${index + 1}`, class: {
                'ui-image-carousel__image': true,
                'ui-image-carousel__image--loaded': this.loadedImages.has(index),
            }, onLoad: () => this.handleImageLoad(index), onError: (e) => this.handleImageError(index, e), loading: index === 0 ? 'eager' : 'lazy' }))))), this.showNavigation && hasMultiple && (h("button", { class: {
                'ui-image-carousel__nav': true,
                'ui-image-carousel__nav--next': true,
                'ui-image-carousel__nav--disabled': !canGoNext,
            }, onClick: this.goToNext, disabled: !canGoNext, "aria-label": "Imagen siguiente" }, h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { points: "9 18 15 12 9 6" }))))), this.showIndicators && hasMultiple && (h("div", { class: "ui-image-carousel__indicators" }, this.images.map((_, index) => (h("button", { class: {
                'ui-image-carousel__dot': true,
                'ui-image-carousel__dot--active': index === this.currentIndex,
            }, onClick: () => this.goToSlide(index), "aria-label": `Ir a imagen ${index + 1}` }))))), hasMultiple && (h("div", { class: "ui-image-carousel__thumbnails" }, this.images.map((src, index) => (h("button", { class: {
                'ui-image-carousel__thumbnail': true,
                'ui-image-carousel__thumbnail--active': index === this.currentIndex,
            }, onClick: () => this.goToSlide(index) }, h("img", { src: src || this.fallbackImage, alt: `Miniatura ${index + 1}`, loading: "lazy" })))))))));
    }
    static get is() { return "ui-image-carousel"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["ui-image-carousel.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["ui-image-carousel.css"]
        };
    }
    static get properties() {
        return {
            "images": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "string[]",
                    "resolved": "string[]",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Array of image URLs to display"
                },
                "getter": false,
                "setter": false,
                "defaultValue": "[]"
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
                    "text": "Enable circular/loop mode"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "loop",
                "defaultValue": "true"
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
            "showIndicators": {
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
                    "text": "Show indicator dots"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "show-indicators",
                "defaultValue": "true"
            },
            "autoplayInterval": {
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
                "attribute": "autoplay-interval",
                "defaultValue": "0"
            },
            "fallbackImage": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Fallback image URL when image fails to load"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "fallback-image",
                "defaultValue": "''"
            }
        };
    }
    static get states() {
        return {
            "currentIndex": {},
            "loadedImages": {},
            "failedImages": {}
        };
    }
    static get watchers() {
        return [{
                "propName": "images",
                "methodName": "onImagesChange"
            }];
    }
}
//# sourceMappingURL=ui-image-carousel.js.map
