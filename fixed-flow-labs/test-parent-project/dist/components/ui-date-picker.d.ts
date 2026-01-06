import type { Components, JSX } from "../types/components";

interface UiDatePicker extends Components.UiDatePicker, HTMLElement {}
export const UiDatePicker: {
    prototype: UiDatePicker;
    new (): UiDatePicker;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
