import type { Components, JSX } from "../types/components";

interface UiCarousel extends Components.UiCarousel, HTMLElement {}
export const UiCarousel: {
    prototype: UiCarousel;
    new (): UiCarousel;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
