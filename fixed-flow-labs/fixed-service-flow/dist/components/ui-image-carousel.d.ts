import type { Components, JSX } from "../types/components";

interface UiImageCarousel extends Components.UiImageCarousel, HTMLElement {}
export const UiImageCarousel: {
    prototype: UiImageCarousel;
    new (): UiImageCarousel;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
