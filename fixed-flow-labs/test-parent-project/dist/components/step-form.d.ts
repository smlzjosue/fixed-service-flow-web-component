import type { Components, JSX } from "../types/components";

interface StepForm extends Components.StepForm, HTMLElement {}
export const StepForm: {
    prototype: StepForm;
    new (): StepForm;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
