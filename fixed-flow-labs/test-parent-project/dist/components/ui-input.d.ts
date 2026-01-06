import type { Components, JSX } from "../types/components";

interface UiInput extends Components.UiInput, HTMLElement {}
export const UiInput: {
    prototype: UiInput;
    new (): UiInput;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
