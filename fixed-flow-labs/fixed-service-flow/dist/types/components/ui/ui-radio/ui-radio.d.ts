import { EventEmitter } from '../../../stencil-public-runtime';
export declare class UiRadio {
    /**
     * Radio label text
     */
    label?: string;
    /**
     * Radio name (for grouping)
     */
    name: string;
    /**
     * Radio value
     */
    value: string;
    /**
     * Whether this radio is selected
     */
    checked: boolean;
    /**
     * Disabled state
     */
    disabled: boolean;
    /**
     * Emitted when radio is selected
     */
    radioChange: EventEmitter<string>;
    private handleChange;
    render(): any;
}
