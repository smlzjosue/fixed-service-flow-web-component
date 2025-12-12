import type { Components, JSX } from "../types/components";

interface StepOrderSummary extends Components.StepOrderSummary, HTMLElement {}
export const StepOrderSummary: {
    prototype: StepOrderSummary;
    new (): StepOrderSummary;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
