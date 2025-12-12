import type { Components, JSX } from "../types/components";

interface StepPlans extends Components.StepPlans, HTMLElement {}
export const StepPlans: {
    prototype: StepPlans;
    new (): StepPlans;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
