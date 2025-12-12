import { EventEmitter } from '../../../stencil-public-runtime';
export declare class UiCheckbox {
    /**
     * The checkbox value
     */
    checked: boolean;
    /**
     * The checkbox label
     */
    label: string;
    /**
     * The checkbox name
     */
    name: string;
    /**
     * Whether the checkbox is disabled
     */
    disabled: boolean;
    /**
     * Whether the checkbox has an error
     */
    hasError: boolean;
    /**
     * Error message to display
     */
    errorMessage: string;
    /**
     * Event emitted when the checkbox value changes
     */
    checkboxChange: EventEmitter<boolean>;
    private handleChange;
    render(): any;
}
