import { EventEmitter } from '../../../stencil-public-runtime';
export declare class UiRadioCard {
    /**
     * Card title
     */
    cardTitle?: string;
    /**
     * Card description
     */
    description?: string;
    /**
     * Radio name (for grouping)
     */
    name: string;
    /**
     * Radio value
     */
    value: string;
    /**
     * Whether this card is selected
     */
    checked: boolean;
    /**
     * Disabled state
     */
    disabled: boolean;
    /**
     * Icon name or URL (optional)
     */
    icon?: string;
    /**
     * Price to display (optional)
     */
    price?: string;
    /**
     * Badge text (optional, e.g., "Recomendado")
     */
    badge?: string;
    /**
     * Emitted when card is selected
     */
    cardSelect: EventEmitter<string>;
    private handleSelect;
    private handleKeyDown;
    render(): any;
}
