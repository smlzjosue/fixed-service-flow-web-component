import { FormData } from '../../../store/interfaces';
export declare class StepForm {
    onNext: () => void;
    onBack: () => void;
    formData: FormData;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    private handleInput;
    private handleRadioChange;
    private validateField;
    private getFieldsToValidate;
    /**
     * Verifica si el formulario es válido sin modificar el estado de errores.
     * Se usa para habilitar/deshabilitar el botón Continuar.
     */
    private isFormValid;
    private validateForm;
    private handleSubmit;
    private renderInput;
    render(): any;
}
