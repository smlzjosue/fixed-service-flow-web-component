import type { Components, JSX } from "../types/components";

interface StepConfirmation extends Components.StepConfirmation, HTMLElement {}
export const StepConfirmation: {
    prototype: StepConfirmation;
    new (): StepConfirmation;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
