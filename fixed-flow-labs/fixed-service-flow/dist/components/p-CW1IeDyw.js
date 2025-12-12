import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';

const uiCarouselCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block;width:100%}.ui-carousel{position:relative;width:100%;display:flex;align-items:center}.ui-carousel__viewport{flex:1;overflow:hidden;margin:0 0.5rem}@media (min-width: 768px){.ui-carousel__viewport{margin:0 1rem}}.ui-carousel__track{display:flex;transition:transform 0.3s ease-out;will-change:transform}.ui-carousel__track--dragging{transition:none;cursor:grabbing}.ui-carousel__nav{flex-shrink:0;width:40px;height:40px;border-radius:50%;background:#FFFFFF;border:2px solid #DA291C;color:#DA291C;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;z-index:2;box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.ui-carousel__nav svg{width:20px;height:20px}.ui-carousel__nav:hover:not(:disabled){background:#DA291C;color:#FFFFFF}.ui-carousel__nav:active:not(:disabled){transform:scale(0.95)}.ui-carousel__nav--disabled{opacity:0.3;cursor:not-allowed;pointer-events:none}@media (max-width: 599px){.ui-carousel__nav{width:32px;height:32px}.ui-carousel__nav svg{width:16px;height:16px}}.ui-carousel__pagination{position:absolute;bottom:-2rem;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:2}.ui-carousel__dot{width:10px;height:10px;border-radius:50%;border:none;background:#CCCCCC;cursor:pointer;padding:0;transition:all 0.2s ease}.ui-carousel__dot:hover{background:#999999}.ui-carousel__dot--active{background:#DA291C;transform:scale(1.2)}::slotted(*){box-sizing:border-box}`;

const UiCarousel = /*@__PURE__*/ proxyCustomElement(class UiCarousel extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
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
            }
          `)));
    }
    static get watchers() { return {
        "totalItems": ["handleTotalItemsChange"]
    }; }
    static get style() { return uiCarouselCss(); }
}, [769, "ui-carousel", {
        "totalItems": [2, "total-items"],
        "slidesPerView": [2, "slides-per-view"],
        "gap": [2],
        "showNavigation": [4, "show-navigation"],
        "showPagination": [4, "show-pagination"],
        "loop": [4],
        "autoplay": [2],
        "breakpoints": [16],
        "currentIndex": [32],
        "currentSlidesPerView": [32],
        "isDragging": [32],
        "startX": [32],
        "translateX": [32]
    }, undefined, {
        "totalItems": ["handleTotalItemsChange"]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["ui-carousel"];
    components.forEach(tagName => { switch (tagName) {
        case "ui-carousel":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), UiCarousel);
            }
            break;
    } });
}
defineCustomElement();

export { UiCarousel as U, defineCustomElement as d };
//# sourceMappingURL=p-CW1IeDyw.js.map

//# sourceMappingURL=p-CW1IeDyw.js.map