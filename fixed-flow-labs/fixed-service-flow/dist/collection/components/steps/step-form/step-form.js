// ============================================
// STEP FORM - Customer Information Form
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../../store/flow.store";
import { fieldValidators } from "../../../utils/validators";
import { formatPhone, unformatPhone } from "../../../utils/formatters";
// Mobile breakpoint (matches $breakpoint-md in variables.scss)
const MOBILE_BREAKPOINT = 768;
// Steps configuration for ui-stepper
const FORM_STEPS = [
    { label: 'Identificación' },
    { label: 'Contacto' },
];
export class StepForm {
    // ------------------------------------------
    // PROPS
    // ------------------------------------------
    onNext;
    onBack;
    // ------------------------------------------
    // STATE
    // ------------------------------------------
    formData = {
        personal: {
            firstName: '',
            secondName: '',
            lastName: '',
            secondLastName: '',
            identificationType: 'license',
            identificationNumber: '',
            identificationExpiration: '',
            phone1: '',
            phone2: '',
            email: '',
        },
        business: {
            businessName: '',
            position: '',
        },
        address: {
            address: flowState.location?.address || '',
            city: flowState.location?.city || '',
            zipCode: flowState.location?.zipCode || '',
        },
        isExistingCustomer: false,
    };
    errors = {};
    touched = {};
    /** Current form section (mobile only) */
    currentSection = 'identification';
    /** Whether we're in mobile view */
    isMobile = false;
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.checkMobile();
        window.addEventListener('resize', this.handleResize);
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
    }
    // ------------------------------------------
    // MOBILE DETECTION
    // ------------------------------------------
    handleResize = () => {
        this.checkMobile();
    };
    checkMobile() {
        this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    }
    // ------------------------------------------
    // SECTION MANAGEMENT
    // ------------------------------------------
    /** Get current step number (1-indexed) for stepper */
    getCurrentStepNumber() {
        return this.currentSection === 'identification' ? 1 : 2;
    }
    /** Fields in identification section */
    getIdentificationFields() {
        return [
            { field: 'firstName', value: this.formData.personal.firstName },
            { field: 'lastName', value: this.formData.personal.lastName },
            { field: 'secondLastName', value: this.formData.personal.secondLastName },
            { field: 'identificationNumber', value: this.formData.personal.identificationNumber },
            { field: 'identificationExpiration', value: this.formData.personal.identificationExpiration },
        ];
    }
    /** Fields in contact section */
    getContactFields() {
        return [
            { field: 'phone1', value: this.formData.personal.phone1 },
            { field: 'email', value: this.formData.personal.email },
            { field: 'businessName', value: this.formData.business.businessName },
            { field: 'position', value: this.formData.business.position },
            { field: 'address', value: this.formData.address.address },
            { field: 'city', value: this.formData.address.city },
            { field: 'zipCode', value: this.formData.address.zipCode },
        ];
    }
    /** Validate identification section fields */
    isIdentificationValid() {
        for (const { field, value } of this.getIdentificationFields()) {
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    return false;
                }
            }
        }
        return true;
    }
    /** Validate contact section fields */
    isContactValid() {
        for (const { field, value } of this.getContactFields()) {
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    return false;
                }
            }
        }
        return true;
    }
    /** Mark identification fields as touched and validate */
    validateIdentificationSection() {
        const fields = this.getIdentificationFields();
        let isValid = true;
        const newTouched = { ...this.touched };
        const newErrors = { ...this.errors };
        for (const { field, value } of fields) {
            newTouched[field] = true;
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    isValid = false;
                    newErrors[field] = result.message;
                }
                else {
                    delete newErrors[field];
                }
            }
        }
        this.touched = newTouched;
        this.errors = newErrors;
        return isValid;
    }
    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------
    handleInput = (section, field) => (e) => {
        const target = e.target;
        let value = target.value;
        // Format phone numbers
        if (field === 'phone1' || field === 'phone2') {
            value = unformatPhone(value);
        }
        this.formData = {
            ...this.formData,
            [section]: {
                ...this.formData[section],
                [field]: value,
            },
        };
        // Mark as touched
        this.touched = { ...this.touched, [field]: true };
        // Validate field
        this.validateField(field, value);
    };
    handleRadioChange = (field, value) => {
        if (field === 'identificationType') {
            this.formData = {
                ...this.formData,
                personal: {
                    ...this.formData.personal,
                    identificationType: value,
                },
            };
        }
        else if (field === 'isExistingCustomer') {
            this.formData = {
                ...this.formData,
                isExistingCustomer: value,
            };
        }
    };
    validateField(field, value) {
        const validator = fieldValidators[field];
        if (!validator)
            return { isValid: true, message: '' };
        const result = validator(value);
        if (!result.isValid) {
            this.errors = { ...this.errors, [field]: result.message };
        }
        else {
            const { [field]: _, ...rest } = this.errors;
            this.errors = rest;
        }
        return result;
    }
    getFieldsToValidate() {
        return [
            { field: 'firstName', value: this.formData.personal.firstName },
            { field: 'lastName', value: this.formData.personal.lastName },
            { field: 'secondLastName', value: this.formData.personal.secondLastName },
            { field: 'identificationNumber', value: this.formData.personal.identificationNumber },
            { field: 'identificationExpiration', value: this.formData.personal.identificationExpiration },
            { field: 'phone1', value: this.formData.personal.phone1 },
            { field: 'email', value: this.formData.personal.email },
            { field: 'businessName', value: this.formData.business.businessName },
            { field: 'position', value: this.formData.business.position },
            { field: 'address', value: this.formData.address.address },
            { field: 'city', value: this.formData.address.city },
            { field: 'zipCode', value: this.formData.address.zipCode },
        ];
    }
    /**
     * Verifica si el formulario es válido sin modificar el estado de errores.
     * Se usa para habilitar/deshabilitar el botón Continuar.
     */
    isFormValid() {
        for (const { field, value } of this.getFieldsToValidate()) {
            const validator = fieldValidators[field];
            if (validator) {
                const result = validator(value);
                if (!result.isValid) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Check if current section is valid (for mobile button state)
     */
    isCurrentSectionValid() {
        if (!this.isMobile) {
            return this.isFormValid();
        }
        if (this.currentSection === 'identification') {
            return this.isIdentificationValid();
        }
        else {
            return this.isContactValid();
        }
    }
    validateForm() {
        const fieldsToValidate = this.getFieldsToValidate();
        let isValid = true;
        const newErrors = {};
        for (const { field, value } of fieldsToValidate) {
            const result = this.validateField(field, value);
            if (!result.isValid) {
                isValid = false;
                newErrors[field] = result.message;
            }
        }
        this.errors = newErrors;
        return isValid;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        // In mobile, handle section navigation
        if (this.isMobile) {
            if (this.currentSection === 'identification') {
                // Validate identification section and move to contact
                if (this.validateIdentificationSection()) {
                    this.currentSection = 'contact';
                }
                return;
            }
            // In contact section, validate all and submit
        }
        // Mark all fields as touched
        this.touched = {
            firstName: true,
            lastName: true,
            secondLastName: true,
            identificationNumber: true,
            identificationExpiration: true,
            phone1: true,
            email: true,
            businessName: true,
            position: true,
            address: true,
            city: true,
            zipCode: true,
        };
        if (this.validateForm()) {
            flowActions.setFormData(this.formData);
            this.onNext?.();
        }
    };
    handleBack = () => {
        // In mobile, navigate between sections first
        if (this.isMobile && this.currentSection === 'contact') {
            this.currentSection = 'identification';
            return;
        }
        // Otherwise, go back to previous step
        this.onBack?.();
    };
    // ------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------
    renderInput(label, field, section, value, options = {}) {
        const { type = 'text', placeholder = '', required = false, disabled = false } = options;
        const hasError = this.touched[field] && this.errors[field];
        const displayValue = (field === 'phone1' || field === 'phone2') ? formatPhone(value) : value;
        return (h("div", { class: "step-form__field" }, h("label", { class: "step-form__label" }, required && h("span", { class: "step-form__required" }, "*"), label, ":"), h("input", { type: type, class: { 'step-form__input': true, 'step-form__input--error': !!hasError }, value: displayValue, placeholder: placeholder, disabled: disabled, onInput: this.handleInput(section, field) }), hasError && h("span", { class: "step-form__error" }, this.errors[field])));
    }
    // ------------------------------------------
    // SECTION RENDERERS
    // ------------------------------------------
    /** Render identification section (mobile step 1) */
    renderIdentificationSection() {
        return (h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
            placeholder: 'Ingrese nombre',
            required: true,
        }), this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
            placeholder: 'Ingrese segundo nombre (Opcional)',
        })), h("div", { class: "step-form__row" }, this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
            placeholder: 'Ingrese apellido',
            required: true,
        }), this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
            placeholder: 'Ingrese segundo apellido',
            required: true,
        })), h("div", { class: "step-form__row" }, h("div", { class: "step-form__field step-form__field--id" }, h("label", { class: "step-form__label" }, h("span", { class: "step-form__required" }, "*"), "Identificaci\u00F3n:"), h("div", { class: "step-form__id-row" }, h("div", { class: "step-form__radio-group" }, h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'license', onChange: () => this.handleRadioChange('identificationType', 'license') }), "Licencia de conducir"), h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'passport', onChange: () => this.handleRadioChange('identificationType', 'passport') }), "Pasaporte")), h("input", { type: "text", class: { 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }, value: this.formData.personal.identificationNumber, placeholder: "Ingrese nro de identificaci\u00F3n", onInput: this.handleInput('personal', 'identificationNumber') })), this.touched['identificationNumber'] && this.errors['identificationNumber'] && (h("span", { class: "step-form__error" }, this.errors['identificationNumber']))), this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
            type: 'date',
            required: true,
        }))));
    }
    /** Render contact section (mobile step 2) */
    renderContactSection() {
        return [
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
                type: 'tel',
                placeholder: 'Ingrese nro de teléfono',
                required: true,
            }), this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
                type: 'tel',
                placeholder: 'Ingrese nro de teléfono',
            }))),
            /* Business Information */
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Nombre legal de Empresa (según IRS)', 'businessName', 'business', this.formData.business.businessName, {
                placeholder: 'Ingresar nombre legal de empresa',
                required: true,
            }), this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
                placeholder: 'Ingrese posición actual',
                required: true,
            }))),
            /* Address */
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__row" }, this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
                placeholder: 'Ingrese dirección',
                required: true,
            }), this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
                placeholder: 'Ingrese ciudad',
                required: true,
            })), h("div", { class: "step-form__row" }, this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
                placeholder: 'Ingrese código postal',
                required: true,
            }), this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
                type: 'email',
                placeholder: 'Ingrese correo electrónico',
                required: true,
            }))),
            /* Existing Customer */
            h("div", { class: "step-form__section" }, h("div", { class: "step-form__field" }, h("label", { class: "step-form__label" }, h("span", { class: "step-form__required" }, "*"), "Cliente existente de Claro PR:"), h("div", { class: "step-form__radio-group step-form__radio-group--horizontal" }, h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === true, onChange: () => this.handleRadioChange('isExistingCustomer', true) }), "S\u00ED"), h("label", { class: "step-form__radio" }, h("input", { type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === false, onChange: () => this.handleRadioChange('isExistingCustomer', false) }), "No")))),
        ];
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        const currentStepNumber = this.getCurrentStepNumber();
        return (h(Host, { key: '0ff3baeb8d758c4ab60d3af46716223f9cc41dbb' }, h("div", { key: 'b7c5b885e03241a732c5e234bf059d3d7f001372', class: "step-form" }, h("header", { key: '5d149adc54d4e3c36abc554476aa0774d77dd2f8', class: "step-form__header" }, h("h1", { key: '7824074ec9cfebc87d57159953874a854c5849c4', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), h("button", { key: '554400631442f25b7b9ae8c0c21fcc793672ae66', type: "button", class: "step-form__btn-back", onClick: this.handleBack }, "Regresar")), this.isMobile && (h("div", { key: 'ab28ab7cbcac54cf0a0c2c0e11b13c7289cdb18f', class: "step-form__stepper" }, h("ui-stepper", { key: '6575f57a4351c8a586e612ea0dc05ad38b3d56c9', steps: FORM_STEPS, currentStep: currentStepNumber }))), h("form", { key: 'c9af47b6e343737b09412ba09500bed39a1c47d8', onSubmit: this.handleSubmit }, h("p", { key: '47578d738b67c231804db4c961cac430e1d9c57d', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), !this.isMobile && ([
            this.renderIdentificationSection(),
            ...this.renderContactSection(),
        ]), this.isMobile && this.currentSection === 'identification' && (this.renderIdentificationSection()), this.isMobile && this.currentSection === 'contact' && (this.renderContactSection()), h("div", { key: '67dcdd884f9778fce2b9844b8e9bd2f5b78bb390', class: "step-form__actions" }, h("button", { key: 'e4da19eb9543cdf255b6caf882f5eb4f17dd2c87', type: "submit", class: "step-form__btn-submit", disabled: !this.isCurrentSectionValid() }, "Continuar"), h("button", { key: 'f517b1101d80971753a7176113f18be80ae36a4b', type: "button", class: "step-form__btn-back-mobile", onClick: this.handleBack }, "Regresar"))))));
    }
    static get is() { return "step-form"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-form.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-form.css"]
        };
    }
    static get properties() {
        return {
            "onNext": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            },
            "onBack": {
                "type": "unknown",
                "mutable": false,
                "complexType": {
                    "original": "() => void",
                    "resolved": "() => void",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false
            }
        };
    }
    static get states() {
        return {
            "formData": {},
            "errors": {},
            "touched": {},
            "currentSection": {},
            "isMobile": {}
        };
    }
}
//# sourceMappingURL=step-form.js.map
