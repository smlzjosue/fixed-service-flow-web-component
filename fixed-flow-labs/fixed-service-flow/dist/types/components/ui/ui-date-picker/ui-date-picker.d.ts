import { EventEmitter } from '../../../stencil-public-runtime';
export declare class UiDatePicker {
    /**
     * Input label
     */
    label?: string;
    /**
     * Input name attribute
     */
    name?: string;
    /**
     * Current value (YYYY-MM-DD format)
     */
    value: string;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Minimum date (YYYY-MM-DD)
     */
    min?: string;
    /**
     * Maximum date (YYYY-MM-DD)
     */
    max?: string;
    /**
     * Required field
     */
    required: boolean;
    /**
     * Disabled state
     */
    disabled: boolean;
    /**
     * Read-only state
     */
    readonly: boolean;
    /**
     * Error message to display
     */
    error?: string;
    /**
     * Helper text below the input
     */
    helperText?: string;
    isFocused: boolean;
    hasValue: boolean;
    /**
     * Emitted when value changes
     */
    valueChange: EventEmitter<string>;
    /**
     * Emitted on focus
     */
    dateFocus: EventEmitter<FocusEvent>;
    /**
     * Emitted on blur
     */
    dateBlur: EventEmitter<FocusEvent>;
    handleValueChange(newValue: string): void;
    componentWillLoad(): void;
    private handleInput;
    private handleFocus;
    private handleBlur;
    render(): any;
}
