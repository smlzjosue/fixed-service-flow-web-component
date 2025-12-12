import type { Components, JSX } from "../types/components";

interface UiCheckbox extends Components.UiCheckbox, HTMLElement {}
export const UiCheckbox: {
    prototype: UiCheckbox;
    new (): UiCheckbox;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
