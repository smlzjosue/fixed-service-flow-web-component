import type { Components, JSX } from "../types/components";

interface UiRadioCard extends Components.UiRadioCard, HTMLElement {}
export const UiRadioCard: {
    prototype: UiRadioCard;
    new (): UiRadioCard;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
