import type { Components, JSX } from "../types/components";

interface StepShipping extends Components.StepShipping, HTMLElement {}
export const StepShipping: {
    prototype: StepShipping;
    new (): StepShipping;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
