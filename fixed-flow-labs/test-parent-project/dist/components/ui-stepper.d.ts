import type { Components, JSX } from "../types/components";

interface UiStepper extends Components.UiStepper, HTMLElement {}
export const UiStepper: {
    prototype: UiStepper;
    new (): UiStepper;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
