import type { Components, JSX } from "../types/components";

interface StepLocation extends Components.StepLocation, HTMLElement {}
export const StepLocation: {
    prototype: StepLocation;
    new (): StepLocation;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
