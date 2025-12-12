import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';

const uiImageCarouselCss = () => `:host{display:block;width:100%}.ui-image-carousel{position:relative;width:100%}.ui-image-carousel__main{position:relative;width:100%;aspect-ratio:1;background:#F5F5F5;border-radius:0.75rem;overflow:hidden;display:flex;align-items:center;justify-content:center}.ui-image-carousel__track{display:flex;width:100%;height:100%;transition:transform 0.4s ease-out;will-change:transform}.ui-image-carousel__slide{flex:0 0 100%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:1rem;box-sizing:border-box}.ui-image-carousel__image{max-width:100%;max-height:100%;object-fit:contain;opacity:0;transition:opacity 0.3s ease}.ui-image-carousel__image--loaded{opacity:1}.ui-image-carousel__nav{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:40px;height:40px;border-radius:50%;background:rgba(255, 255, 255, 0.95);border:1px solid #E5E5E5;color:#808080;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.ui-image-carousel__nav svg{width:20px;height:20px}.ui-image-carousel__nav:hover:not(:disabled){background:#DA291C;border-color:#DA291C;color:white;box-shadow:0 4px 12px rgba(218, 41, 28, 0.3)}.ui-image-carousel__nav:active:not(:disabled){transform:translateY(-50%) scale(0.95)}.ui-image-carousel__nav--prev{left:0.5rem}.ui-image-carousel__nav--next{right:0.5rem}.ui-image-carousel__nav--disabled{opacity:0.3;cursor:not-allowed;pointer-events:none}@media (max-width: 599px){.ui-image-carousel__nav{width:32px;height:32px}.ui-image-carousel__nav svg{width:16px;height:16px}}.ui-image-carousel__indicators{display:flex;justify-content:center;gap:0.5rem;margin-top:0.75rem}.ui-image-carousel__dot{width:8px;height:8px;border-radius:50%;border:none;background:#CCCCCC;cursor:pointer;padding:0;transition:all 0.2s ease}.ui-image-carousel__dot:hover{background:#999999}.ui-image-carousel__dot--active{background:#DA291C;width:24px;border-radius:4px}.ui-image-carousel__thumbnails{display:flex;justify-content:center;gap:0.5rem;margin-top:0.75rem;padding:0 0.5rem;overflow-x:auto}.ui-image-carousel__thumbnails::-webkit-scrollbar{display:none}.ui-image-carousel__thumbnails{-ms-overflow-style:none;scrollbar-width:none}.ui-image-carousel__thumbnail{flex-shrink:0;width:60px;height:60px;border-radius:0.5rem;border:2px solid #E5E5E5;background:#F5F5F5;cursor:pointer;padding:4px;overflow:hidden;transition:all 0.2s ease}.ui-image-carousel__thumbnail img{width:100%;height:100%;object-fit:contain}.ui-image-carousel__thumbnail:hover{border-color:#0097A9}.ui-image-carousel__thumbnail--active{border-color:#DA291C;box-shadow:0 0 0 2px rgba(218, 41, 28, 0.2)}@media (max-width: 599px){.ui-image-carousel__thumbnail{width:48px;height:48px}}.ui-image-carousel__placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;aspect-ratio:1;background:#F5F5F5;border-radius:0.75rem;color:#999999}.ui-image-carousel__placeholder svg{width:64px;height:64px;margin-bottom:0.5rem}.ui-image-carousel__placeholder span{font-size:0.875rem}`;

const UiImageCarousel = /*@__PURE__*/ proxyCustomElement(class UiImageCarousel extends H {
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
    static get watchers() { return {
        "images": ["onImagesChange"]
    }; }
    static get style() { return uiImageCarouselCss(); }
}, [769, "ui-image-carousel", {
        "images": [16],
        "loop": [4],
        "showNavigation": [4, "show-navigation"],
        "showIndicators": [4, "show-indicators"],
        "autoplayInterval": [2, "autoplay-interval"],
        "fallbackImage": [1, "fallback-image"],
        "currentIndex": [32],
        "loadedImages": [32],
        "failedImages": [32]
    }, undefined, {
        "images": ["onImagesChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-image-carousel"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-image-carousel":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiImageCarousel);
            }
            break;
    } });
}
defineCustomElement();

export { UiImageCarousel as U, defineCustomElement as d };
//# sourceMappingURL=p-DIS67kJr.js.map

//# sourceMappingURL=p-DIS67kJr.js.map