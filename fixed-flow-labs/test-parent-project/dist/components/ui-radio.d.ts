import type { Components, JSX } from "../types/components";

interface UiRadio extends Components.UiRadio, HTMLElement {}
export const UiRadio: {
    prototype: UiRadio;
    new (): UiRadio;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
