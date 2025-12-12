import type { Components, JSX } from "../types/components";

interface UiSelect extends Components.UiSelect, HTMLElement {}
export const UiSelect: {
    prototype: UiSelect;
    new (): UiSelect;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
