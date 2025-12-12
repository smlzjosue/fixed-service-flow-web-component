import type { Components, JSX } from "../types/components";

interface StepPayment extends Components.StepPayment, HTMLElement {}
export const StepPayment: {
    prototype: StepPayment;
    new (): StepPayment;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
