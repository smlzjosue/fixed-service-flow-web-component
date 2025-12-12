import type { Components, JSX } from "../types/components";

interface StepProductDetail extends Components.StepProductDetail, HTMLElement {}
export const StepProductDetail: {
    prototype: StepProductDetail;
    new (): StepProductDetail;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
