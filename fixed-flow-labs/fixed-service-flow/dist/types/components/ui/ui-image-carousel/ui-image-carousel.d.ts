export declare class UiImageCarousel {
    /**
     * Array of image URLs to display
     */
    images: string[];
    /**
     * Enable circular/loop mode
     */
    loop: boolean;
    /**
     * Show navigation arrows
     */
    showNavigation: boolean;
    /**
     * Show indicator dots
     */
    showIndicators: boolean;
    /**
     * Auto-play interval in milliseconds (0 = disabled)
     */
    autoplayInterval: number;
    /**
     * Fallback image URL when image fails to load
     */
    fallbackImage: string;
    currentIndex: number;
    loadedImages: Set<number>;
    failedImages: Set<number>;
    private autoplayTimer;
    private touchStartX;
    private touchEndX;
    onImagesChange(): void;
    componentDidLoad(): void;
    disconnectedCallback(): void;
    private startAutoplay;
    private stopAutoplay;
    private restartAutoplay;
    private goToSlide;
    private goToPrev;
    private goToNext;
    private handleTouchStart;
    private handleTouchEnd;
    private handleSwipe;
    private handleImageLoad;
    private handleImageError;
    private getImageSrc;
    render(): any;
}
