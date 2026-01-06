export interface CarouselBreakpoint {
    minWidth: number;
    slidesPerView: number;
}
export declare class UiCarousel {
    el: HTMLElement;
    /**
     * Total number of items in the carousel
     */
    totalItems: number;
    /**
     * Default number of slides per view
     */
    slidesPerView: number;
    /**
     * Gap between slides in pixels
     */
    gap: number;
    /**
     * Show navigation arrows
     */
    showNavigation: boolean;
    /**
     * Show pagination dots
     */
    showPagination: boolean;
    /**
     * Enable loop/circular mode
     */
    loop: boolean;
    /**
     * Auto-play interval in milliseconds (0 = disabled)
     */
    autoplay: number;
    /**
     * Responsive breakpoints
     * Default: mobile=1, tablet=2, desktop=3, large=4
     */
    breakpoints: CarouselBreakpoint[];
    currentIndex: number;
    currentSlidesPerView: number;
    isDragging: boolean;
    startX: number;
    translateX: number;
    private trackEl;
    private autoplayInterval;
    private resizeObserver;
    handleTotalItemsChange(): void;
    componentDidLoad(): void;
    disconnectedCallback(): void;
    private setupResizeObserver;
    private updateSlidesPerView;
    private getMaxIndex;
    private goToSlide;
    private goToPrev;
    private goToNext;
    private updateTranslate;
    private startAutoplay;
    private stopAutoplay;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private getPaginationDots;
    private handleDotClick;
    private getCurrentDot;
    render(): any;
}
