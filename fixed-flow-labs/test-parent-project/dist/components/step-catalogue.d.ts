import type { Components, JSX } from "../types/components";

interface StepCatalogue extends Components.StepCatalogue, HTMLElement {}
export const StepCatalogue: {
    prototype: StepCatalogue;
    new (): StepCatalogue;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
