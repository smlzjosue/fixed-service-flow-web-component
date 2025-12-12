import type { Components, JSX } from "../types/components";

interface StepContract extends Components.StepContract, HTMLElement {}
export const StepContract: {
    prototype: StepContract;
    new (): StepContract;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
