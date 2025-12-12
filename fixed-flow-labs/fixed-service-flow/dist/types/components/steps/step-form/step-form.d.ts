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
    private validateForm;
    private handleSubmit;
    private renderInput;
    render(): any;
}
