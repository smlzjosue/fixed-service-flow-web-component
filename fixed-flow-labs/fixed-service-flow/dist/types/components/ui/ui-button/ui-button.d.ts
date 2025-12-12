import { EventEmitter } from '../../../stencil-public-runtime';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';
export declare class UiButton {
    /**
     * Button variant style
     */
    variant: ButtonVariant;
    /**
     * Button size
     */
    size: ButtonSize;
    /**
     * Disabled state
     */
    disabled: boolean;
    /**
     * Loading state (shows spinner)
     */
    loading: boolean;
    /**
     * Full width button
     */
    fullWidth: boolean;
    /**
     * Button type attribute
     */
    type: 'button' | 'submit' | 'reset';
    /**
     * Emitted when button is clicked
     */
    buttonClick: EventEmitter<MouseEvent>;
    private handleClick;
    render(): any;
}
