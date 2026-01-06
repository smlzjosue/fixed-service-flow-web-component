import type { Components, JSX } from "../types/components";

interface FixedServiceFlow extends Components.FixedServiceFlow, HTMLElement {}
export const FixedServiceFlow: {
    prototype: FixedServiceFlow;
    new (): FixedServiceFlow;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
