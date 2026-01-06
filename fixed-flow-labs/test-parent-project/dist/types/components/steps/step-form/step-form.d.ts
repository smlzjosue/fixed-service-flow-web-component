import { FormData } from '../../../store/interfaces';
type FormSection = 'identification' | 'contact';
export declare class StepForm {
    onNext: () => void;
    onBack: () => void;
    formData: FormData;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    /** Current form section (mobile only) */
    currentSection: FormSection;
    /** Whether we're in mobile view */
    isMobile: boolean;
    componentWillLoad(): void;
    disconnectedCallback(): void;
    private handleResize;
    private checkMobile;
    /** Get current step number (1-indexed) for stepper */
    private getCurrentStepNumber;
    /** Fields in identification section */
    private getIdentificationFields;
    /** Fields in contact section */
    private getContactFields;
    /** Validate identification section fields */
    private isIdentificationValid;
    /** Validate contact section fields */
    private isContactValid;
    /** Mark identification fields as touched and validate */
    private validateIdentificationSection;
    private handleInput;
    private handleRadioChange;
    private validateField;
    private getFieldsToValidate;
    /**
     * Verifica si el formulario es válido sin modificar el estado de errores.
     * Se usa para habilitar/deshabilitar el botón Continuar.
     */
    private isFormValid;
    /**
     * Check if current section is valid (for mobile button state)
     */
    private isCurrentSectionValid;
    private validateForm;
    private handleSubmit;
    private handleBack;
    private renderInput;
    /** Render identification section (mobile step 1) */
    private renderIdentificationSection;
    /** Render contact section (mobile step 2) */
    private renderContactSection;
    render(): any;
}
export {};
