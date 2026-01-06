import { EventEmitter } from '../../../stencil-public-runtime';
export type InputType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'date';
export declare class UiInput {
    private _inputEl?;
    /**
     * Input label text
     */
    label?: string;
    /**
     * Input type
     */
    type: InputType;
    /**
     * Input name attribute
     */
    name?: string;
    /**
     * Current value
     */
    value: string;
    /**
     * Placeholder text
     */
    placeholder?: string;
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
     * Helper text (shown when no error)
     */
    helperText?: string;
    /**
     * Maximum length
     */
    maxlength?: number;
    /**
     * Minimum length
     */
    minlength?: number;
    /**
     * Input pattern for validation
     */
    pattern?: string;
    /**
     * Autocomplete attribute
     */
    autocomplete?: string;
    isFocused: boolean;
    hasValue: boolean;
    /**
     * Emitted when value changes
     */
    valueChange: EventEmitter<string>;
    /**
     * Emitted on input event
     */
    inputEvent: EventEmitter<InputEvent>;
    /**
     * Emitted on focus
     */
    inputFocus: EventEmitter<FocusEvent>;
    /**
     * Emitted on blur
     */
    inputBlur: EventEmitter<FocusEvent>;
    handleValueChange(newValue: string): void;
    componentWillLoad(): void;
    private handleInput;
    private handleFocus;
    private handleBlur;
    render(): any;
}
