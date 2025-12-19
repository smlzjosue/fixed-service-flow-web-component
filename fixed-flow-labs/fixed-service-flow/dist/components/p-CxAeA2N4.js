import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { s as state, f as flowActions } from './p-Dom6fCh6.js';
import { u as unformatPhone, a as formatPhone } from './p-C5fd-Qsk.js';

// ============================================
// VALIDATORS - Form Validation Utilities
// Fixed Service Flow Web Component
// ============================================
// ------------------------------------------
// VALIDATION MESSAGES
// ------------------------------------------
const VALIDATION_MESSAGES = {
    required: 'Este campo es requerido',
    minLength: (min) => `Debe tener al menos ${min} caracteres`,
    maxLength: (max) => `No puede exceder ${max} caracteres`,
    email: 'Ingrese un correo electrónico válido',
    phone: 'Ingrese un número de teléfono válido (10 dígitos)',
    zipCode: 'Ingrese un código postal válido (5 dígitos)',
    date: 'Ingrese una fecha válida',
    futureDate: 'La fecha debe ser futura',
    identification: 'La identificación debe tener al menos 10 caracteres',
    numeric: 'Solo se permiten números',
    alphanumeric: 'Solo se permiten letras y números',
};
// ------------------------------------------
// VALIDATION FUNCTIONS
// ------------------------------------------
/**
 * Creates a successful validation result
 */
const valid = () => ({
    isValid: true,
    message: '',
});
/**
 * Creates a failed validation result
 */
const invalid = (message) => ({
    isValid: false,
    message,
});
/**
 * Required field validator
 */
const required = (value) => {
    if (!value || value.trim() === '') {
        return invalid(VALIDATION_MESSAGES.required);
    }
    return valid();
};
/**
 * Minimum length validator
 */
const minLength = (min) => {
    return (value) => {
        if (value && value.length < min) {
            return invalid(VALIDATION_MESSAGES.minLength(min));
        }
        return valid();
    };
};
/**
 * Email validator
 */
const email = (value) => {
    if (!value)
        return valid();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return invalid(VALIDATION_MESSAGES.email);
    }
    return valid();
};
/**
 * Phone number validator (Puerto Rico format - 10 digits)
 */
const phone = (value) => {
    if (!value)
        return valid();
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) {
        return invalid(VALIDATION_MESSAGES.phone);
    }
    return valid();
};
/**
 * Zip code validator (5 digits)
 */
const zipCode = (value) => {
    if (!value)
        return valid();
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(value)) {
        return invalid(VALIDATION_MESSAGES.zipCode);
    }
    return valid();
};
/**
 * Date validator (YYYY-MM-DD format)
 */
const date = (value) => {
    if (!value)
        return valid();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
        return invalid(VALIDATION_MESSAGES.date);
    }
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
        return invalid(VALIDATION_MESSAGES.date);
    }
    return valid();
};
/**
 * Future date validator
 */
const futureDate = (value) => {
    if (!value)
        return valid();
    const dateResult = date(value);
    if (!dateResult.isValid)
        return dateResult;
    const dateObj = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj <= today) {
        return invalid(VALIDATION_MESSAGES.futureDate);
    }
    return valid();
};
/**
 * Identification validator (min 10 characters)
 */
const identification = (value) => {
    if (!value)
        return valid();
    if (value.length < 10) {
        return invalid(VALIDATION_MESSAGES.identification);
    }
    return valid();
};
// ------------------------------------------
// COMPOSITE VALIDATORS
// ------------------------------------------
/**
 * Combines multiple validators
 */
const compose = (...validators) => {
    return (value) => {
        for (const validator of validators) {
            const result = validator(value);
            if (!result.isValid) {
                return result;
            }
        }
        return valid();
    };
};
// ------------------------------------------
// FIELD VALIDATORS (Pre-configured)
// ------------------------------------------
const fieldValidators = {
    firstName: compose(required, minLength(3)),
    lastName: compose(required, minLength(3)),
    secondLastName: compose(required, minLength(3)),
    identificationNumber: compose(required, identification),
    identificationExpiration: compose(required, futureDate),
    phone1: compose(required, phone),
    phone2: phone, // Optional
    email: compose(required, email),
    businessName: required,
    position: required,
    address: required,
    city: required,
    zipCode: compose(required, zipCode),
};

const stepFormCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-form{width:100%;max-width:800px;margin:0 auto}.step-form__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #E5E5E5}.step-form__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-form__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-form__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-form__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-form__btn-back{height:40px}.step-form form{border:1px solid #E5E5E5;border-radius:0.75rem;padding:1.5rem;background:white}.step-form__instructions{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0;background:transparent}.step-form__section{margin-bottom:1.5rem;padding-bottom:0.5rem}.step-form__row{display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1rem}@media (min-width: 768px){.step-form__row{grid-template-columns:1fr 1fr}}.step-form__row:last-child{margin-bottom:0}.step-form__field{display:flex;flex-direction:column}@media (min-width: 768px){.step-form__field--id{grid-column:span 1}}.step-form__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.step-form__label .required{color:#DA291C}.step-form__required{color:#DA291C;margin-right:0.25rem}.step-form__input{width:100%;height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease}.step-form__input::placeholder{color:#999999}.step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__input:disabled{background-color:#F5F5F5;cursor:not-allowed}.step-form__input.error{border-color:#DA291C}.step-form__input.error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__input--error{border-color:#DA291C}.step-form__input--error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__error{margin-top:0.25rem;font-size:0.75rem;color:#DA291C}.step-form__id-row{display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 768px){.step-form__id-row{flex-direction:row;align-items:flex-start}}.step-form__id-row .step-form__input{flex:1;margin-top:4px}.step-form__radio-group{display:flex;flex-direction:row;align-items:flex-start;gap:1rem}.step-form__radio-group--horizontal{flex-direction:row;gap:1rem}.step-form__radio{display:flex;align-items:flex-start;gap:0.25rem;font-size:0.875rem;font-weight:400;line-height:1.5;color:#333333;cursor:pointer;max-width:90px;line-height:1.2;margin-top:14px}.step-form__radio input[type=radio]{accent-color:#0097A9;margin-top:2px;flex-shrink:0}.step-form__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-form__btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-submit:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-submit{height:48px;background-color:#DA291C;color:#FFFFFF}.step-form__btn-submit:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-form__btn-submit:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-form__btn-submit{min-width:280px;height:44px;padding:0 2rem;border-radius:22px;font-size:1rem}.step-form__btn-submit:disabled{background-color:#999999;border-color:#999999;cursor:not-allowed;opacity:1}.step-form__btn-submit:disabled:hover{background-color:#999999;border-color:#999999}`;

const StepForm = /*@__PURE__*/ proxyCustomElement(class StepForm extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
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
            address: state.location?.address || '',
            city: state.location?.city || '',
            zipCode: state.location?.zipCode || '',
        },
        isExistingCustomer: false,
    };
    errors = {};
    touched = {};
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
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: '0b2f99bd94e1adbf650f44a55db6525c6899cf46' }, h("div", { key: 'bab002c14860341264211f063160759ab37934d0', class: "step-form" }, h("header", { key: '3ff52f43ce12b47c99b459924a7c412c4ae31937', class: "step-form__header" }, h("h1", { key: '5415a1edaefe1dbcf6c15b37199381ea3780386d', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), h("button", { key: 'a2a97733267d9816f59646e2c49cca3fc1d2a87a', class: "step-form__btn-back", onClick: this.onBack }, "Regresar")), h("form", { key: '17f59261ae81fca827a728f72152b1a2e135071c', onSubmit: this.handleSubmit }, h("p", { key: '267f119a14581b2201e7a24d3fb0d10295b12206', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), h("div", { key: '324437746373bc40a75c7cc24520ec49bbe2a3fb', class: "step-form__section" }, h("div", { key: '510e1e8bca4554f2a8577df839f77bb6433e57b1', class: "step-form__row" }, this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
            placeholder: 'Ingrese nombre',
            required: true,
        }), this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
            placeholder: 'Ingrese segundo nombre (Opcional)',
        })), h("div", { key: 'b4ad26b6b1f4b8ccfe0149c5fef93e89e6ebebcf', class: "step-form__row" }, this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
            placeholder: 'Ingrese apellido',
            required: true,
        }), this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
            placeholder: 'Ingrese segundo apellido',
            required: true,
        })), h("div", { key: '559571d64825f3d68d41ac65f288dc59ee635759', class: "step-form__row" }, h("div", { key: '920720d8ea94f7ce5abe8262a03bc50d83db92bb', class: "step-form__field step-form__field--id" }, h("label", { key: 'a7b2e8574c96e3c772ba52d997f8054a2d44102a', class: "step-form__label" }, h("span", { key: '884b499ce30bfbbf703c204f5d0965bf109caaa2', class: "step-form__required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: '720f30ea432fd5ef746007154559d61d66217d55', class: "step-form__id-row" }, h("div", { key: '684aa154a379c5e4022989f4cf9b77048f50c87c', class: "step-form__radio-group" }, h("label", { key: 'b30a8b648b875b4b1cea14e3ab5b73260e147b6a', class: "step-form__radio" }, h("input", { key: '6faee17560e5d8cb0b376a61a4532a6d4ab74afa', type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'license', onChange: () => this.handleRadioChange('identificationType', 'license') }), "Licencia de conducir"), h("label", { key: 'dfb0c00309925bdab56701e648e4dd402bf527e4', class: "step-form__radio" }, h("input", { key: '7a4fbfdbcf1e25b87dcf0f4c18d5d801556da806', type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'passport', onChange: () => this.handleRadioChange('identificationType', 'passport') }), "Pasaporte")), h("input", { key: 'fe262abad7767ca9f677d5c208e026828bbdeb46', type: "text", class: { 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }, value: this.formData.personal.identificationNumber, placeholder: "Ingrese nro de identificaci\u00F3n", onInput: this.handleInput('personal', 'identificationNumber') })), this.touched['identificationNumber'] && this.errors['identificationNumber'] && (h("span", { key: 'f6cc1b9a9034fbe3868a25d4ba24071005b4fcb2', class: "step-form__error" }, this.errors['identificationNumber']))), this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
            type: 'date',
            required: true,
        })), h("div", { key: '9ac276afc5c1a29c8829819475c9d5018baf1055', class: "step-form__row" }, this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
            type: 'tel',
            placeholder: 'Ingrese nro de teléfono',
            required: true,
        }), this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
            type: 'tel',
            placeholder: 'Ingrese nro de teléfono',
        }))), h("div", { key: 'ae2a5883df29772e1de14b8ea1db1ebda264712d', class: "step-form__section" }, h("div", { key: '81820f7fdae07c99fc9de3127fa88856655beac1', class: "step-form__row" }, this.renderInput('Nombre legal de Empresa (según IRS)', 'businessName', 'business', this.formData.business.businessName, {
            placeholder: 'Ingresar nombre legal de empresa',
            required: true,
        }), this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
            placeholder: 'Ingrese posición actual',
            required: true,
        }))), h("div", { key: 'a3d96e10f02fc2e8badaf1e0055dcd5dfb881287', class: "step-form__section" }, h("div", { key: '9d72e0baedfd021596fa0bd4f8a730c566742c6d', class: "step-form__row" }, this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
            placeholder: 'Ingrese dirección',
            required: true,
        }), this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
            placeholder: 'Ingrese ciudad',
            required: true,
        })), h("div", { key: '996c0aab4c1c57f4014bfdb30e202342243db058', class: "step-form__row" }, this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
            placeholder: 'Ingrese código postal',
            required: true,
        }), this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
            type: 'email',
            placeholder: 'Ingrese correo electrónico',
            required: true,
        }))), h("div", { key: '8b7aeacdd37fc6b98797b498628ab9d129f10bd6', class: "step-form__section" }, h("div", { key: 'fde1815a479609bf7ae45bc6b780efa2431e8a1e', class: "step-form__field" }, h("label", { key: 'faea036119860ca1b8bbaca80986587c7438594a', class: "step-form__label" }, h("span", { key: '70c30d45a29a996f153642f778d172d6f5ee0cf0', class: "step-form__required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: 'c096231cc8d69b9b0d2c7ed343977f48cc99b810', class: "step-form__radio-group step-form__radio-group--horizontal" }, h("label", { key: 'c06ddf0911aaf06571cb12135d160768236b82b0', class: "step-form__radio" }, h("input", { key: '93242f3fcaf0b45d60d3cf593b6c75ad9a0901a9', type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === true, onChange: () => this.handleRadioChange('isExistingCustomer', true) }), "S\u00ED"), h("label", { key: '4739e30de1341859773c3f51b47172f49f7597a1', class: "step-form__radio" }, h("input", { key: '9dfd6b22495955d9fb4a8b3593df08768cf73b81', type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === false, onChange: () => this.handleRadioChange('isExistingCustomer', false) }), "No")))), h("div", { key: '2656e64fb81fb912b4176749118b8dc5fcddcae1', class: "step-form__actions" }, h("button", { key: 'e6156b9570363d80d6e9c6101fe063af41962b8f', type: "submit", class: "step-form__btn-submit", disabled: !this.isFormValid() }, "Continuar"))))));
    }
    static get style() { return stepFormCss(); }
}, [769, "step-form", {
        "onNext": [16],
        "onBack": [16],
        "formData": [32],
        "errors": [32],
        "touched": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-form"];
    components.forEach(tagName => { switch (tagName) {
        case "step-form":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepForm);
            }
            break;
    } });
}
defineCustomElement();

export { StepForm as S, defineCustomElement as d };
//# sourceMappingURL=p-CxAeA2N4.js.map

//# sourceMappingURL=p-CxAeA2N4.js.map