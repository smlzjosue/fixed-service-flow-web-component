import { EventEmitter } from '../../../stencil-public-runtime';
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export declare class UiSelect {
    /**
     * Select label text
     */
    label?: string;
    /**
     * Select name attribute
     */
    name?: string;
    /**
     * Current selected value
     */
    value: string;
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Options array
     */
    options: SelectOption[];
    /**
     * Required field
     */
    required: boolean;
    /**
     * Disabled state
     */
    disabled: boolean;
    /**
     * Error message to display
     */
    error?: string;
    isFocused: boolean;
    hasValue: boolean;
    /**
     * Emitted when value changes
     */
    valueChange: EventEmitter<string>;
    /**
     * Emitted on focus
     */
    selectFocus: EventEmitter<FocusEvent>;
    /**
     * Emitted on blur
     */
    selectBlur: EventEmitter<FocusEvent>;
    handleValueChange(newValue: string): void;
    componentWillLoad(): void;
    private handleChange;
    private handleFocus;
    private handleBlur;
    render(): any;
}
