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
        return (h(Host, { key: '052a17c0714cde57a903b9101514376f3b2d3512' }, h("div", { key: 'feb6abb25ea09b5e8c1fe352de0bb09cf9844c22', class: "step-form" }, h("header", { key: '7368db5e199f05b74ffef1aad5b6af2755c97d4b', class: "step-form__header" }, h("button", { key: '3754d869f636700320f388f6454d936b324099bb', type: "button", class: "step-form__back-link", onClick: this.handleBack }, h("svg", { key: 'a8d9dd2906d47801c6072c410f17622afe6d75b0', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("polyline", { key: 'cde115fd0288b6e23fbaf2029ef59313d9dae969', points: "15 18 9 12 15 6" })), h("span", { key: '9ace2f7b98003ea34671e95b66fe901fc0cce127' }, "Regresar")), h("h1", { key: '00af145de0cfb2340e1e4fc690f63d60032896e7', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), h("div", { key: 'e4416415e9d1db86242194cd62364a04a92f34c7', class: "step-form__divider" })), this.isMobile && (h("div", { key: '0c522c33e3b51c45b621b6f177690ef23a06abb5', class: "step-form__stepper" }, h("ui-stepper", { key: '9e3e1d3f51c2f7628d8a5e82bdd62ce36a86e7f7', steps: FORM_STEPS, currentStep: currentStepNumber }))), h("form", { key: 'b68783bd19a1ebe5eaf1de5123c1d308bbe27e73', onSubmit: this.handleSubmit }, h("p", { key: 'eecb49ec1edb1495f5dc076878ff279949de8017', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), !this.isMobile && ([
            this.renderIdentificationSection(),
            ...this.renderContactSection(),
        ]), this.isMobile && this.currentSection === 'identification' && (this.renderIdentificationSection()), this.isMobile && this.currentSection === 'contact' && (this.renderContactSection()), h("div", { key: 'f02f79569143c69bc842f3704d4f028893b85513', class: "step-form__actions" }, h("button", { key: '46f2d379c4ac03714fe207704521ef6699bc8276', type: "submit", class: "step-form__btn-submit", disabled: !this.isCurrentSectionValid() }, "Continuar"))))));
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
