import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { s as state, f as flowActions } from './p-Dom6fCh6.js';
import { u as unformatPhone, b as formatPhone } from './p-jNHbU7wj.js';

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

const stepFormCss = () => `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}:host{display:block}.step-form{width:100%;max-width:800px;margin:0 auto}.step-form__header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #E5E5E5}.step-form__title{font-size:1.75rem;font-weight:700;line-height:1.2;color:#333333}.step-form__btn-back{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-back:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-back{height:48px;background-color:transparent;color:#0097A9;border:2px solid #0097A9}.step-form__btn-back:hover:not(:disabled){background-color:rgba(0, 151, 169, 0.1)}.step-form__btn-back:active:not(:disabled){background-color:rgba(0, 151, 169, 0.2)}.step-form__btn-back{height:40px}.step-form form{border:1px solid #E5E5E5;border-radius:0.75rem;padding:1.5rem;background:white}.step-form__instructions{font-size:0.875rem;font-weight:400;line-height:1.5;color:#666666;margin-bottom:1.5rem;padding:0;background:transparent}.step-form__section{margin-bottom:1.5rem;padding-bottom:0.5rem}.step-form__row{display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1rem}@media (min-width: 768px){.step-form__row{grid-template-columns:1fr 1fr}}.step-form__row:last-child{margin-bottom:0}.step-form__field{display:flex;flex-direction:column}@media (min-width: 768px){.step-form__field--id{grid-column:span 1}}.step-form__label{display:block;margin-bottom:0.5rem;font-size:0.875rem;font-weight:500;color:#333333}.step-form__label .required{color:#DA291C}.step-form__required{color:#DA291C;margin-left:0.25rem}.step-form__input{width:100%;height:44px;padding:0 1rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;color:#333333;background-color:#FFFFFF;border:1px solid #CCCCCC;border-radius:0.5rem;transition:border-color 150ms ease, box-shadow 150ms ease}.step-form__input::placeholder{color:#999999}.step-form__input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 3px rgba(0, 151, 169, 0.15)}.step-form__input:disabled{background-color:#F5F5F5;cursor:not-allowed}.step-form__input.error{border-color:#DA291C}.step-form__input.error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__input--error{border-color:#DA291C}.step-form__input--error:focus{box-shadow:0 0 0 3px rgba(218, 41, 28, 0.15)}.step-form__error{margin-top:0.25rem;font-size:0.75rem;color:#DA291C}.step-form__id-row{display:flex;flex-direction:column;gap:0.5rem}@media (min-width: 768px){.step-form__id-row{flex-direction:row;align-items:flex-start}}.step-form__id-row .step-form__input{flex:1;margin-top:4px}.step-form__radio-group{display:flex;flex-direction:row;align-items:flex-start;gap:1rem}.step-form__radio-group--horizontal{flex-direction:row;gap:1rem}.step-form__radio{display:flex;align-items:flex-start;gap:0.25rem;font-size:0.875rem;font-weight:400;line-height:1.5;color:#333333;cursor:pointer;max-width:90px;line-height:1.2;margin-top:14px}.step-form__radio input[type=radio]{accent-color:#0097A9;margin-top:2px;flex-shrink:0}.step-form__actions{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #E5E5E5;text-align:center}.step-form__btn-submit{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0 1.5rem;font-family:"AMX", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;font-size:1rem;font-weight:600;line-height:1;text-decoration:none;border:none;border-radius:9999px;cursor:pointer;transition:all 150ms ease}.step-form__btn-submit:disabled{opacity:0.5;cursor:not-allowed}.step-form__btn-submit{height:48px;background-color:#DA291C;color:#FFFFFF}.step-form__btn-submit:hover:not(:disabled){background-color:rgb(181.843902439, 34.2, 23.356097561)}.step-form__btn-submit:active:not(:disabled){background-color:rgb(163.7658536585, 30.8, 21.0341463415)}.step-form__btn-submit{min-width:200px}`;

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
    validateForm() {
        const fieldsToValidate = [
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
        return (h("div", { class: "step-form__field" }, h("label", { class: "step-form__label" }, label, required && h("span", { class: "step-form__required" }, "*")), h("input", { type: type, class: { 'step-form__input': true, 'step-form__input--error': !!hasError }, value: displayValue, placeholder: placeholder, disabled: disabled, onInput: this.handleInput(section, field) }), hasError && h("span", { class: "step-form__error" }, this.errors[field])));
    }
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: 'c481713f5117e41c0e66218f0622861aa0768f79' }, h("div", { key: '5a841d19a81206b88033bd3be24655af80df0736', class: "step-form" }, h("header", { key: '0f5ae19659d3ca868400a2309c48bb67f60634b6', class: "step-form__header" }, h("h1", { key: '5fcd2bd13efe8a7e4323026461fb8181bc123ec5', class: "step-form__title" }, "Formulario de solicitud de servicio fijo"), h("button", { key: '3cc16cf0a596ffb7dbe32470f997c59666cd501c', class: "step-form__btn-back", onClick: this.onBack }, "Regresar")), h("form", { key: 'ba16ab5360e054f0a59251bd8d983fd06f669291', onSubmit: this.handleSubmit }, h("p", { key: '3017b8bceec5c2dfa9faba7cb32bf2443fa60560', class: "step-form__instructions" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), h("div", { key: '6b15392974cdd563184b014e7a9bf520fc797d9b', class: "step-form__section" }, h("div", { key: '1f300e12e8f24a7e6ae101c8e1fa129c8ef39cf9', class: "step-form__row" }, this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
            placeholder: 'Ingrese nombre',
            required: true,
        }), this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
            placeholder: 'Ingrese segundo nombre (Opcional)',
        })), h("div", { key: '41e11ee93af952e5f56ca5d701ef203124a3a31c', class: "step-form__row" }, this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
            placeholder: 'Ingrese apellido',
            required: true,
        }), this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
            placeholder: 'Ingrese segundo apellido',
            required: true,
        })), h("div", { key: '0e48c1ca2e08a196c22bf98f9143803b4b5767c9', class: "step-form__row" }, h("div", { key: '1291f02f66593b9e7941534bd7c692d22e18d18f', class: "step-form__field step-form__field--id" }, h("label", { key: 'd0c40f3ab735276355394cc6fcca3edc25651dc9', class: "step-form__label" }, "Identificaci\u00F3n", h("span", { key: '116025fc57c98d50b4dcd5f788443717263dd1ae', class: "step-form__required" }, "*")), h("div", { key: '26410addf965b2a13a4e6861d3e6aa930fb8f307', class: "step-form__id-row" }, h("div", { key: '3741dd30d2cdded7699a46147e804b87d3a6f4be', class: "step-form__radio-group" }, h("label", { key: '16b7fe472ae0c03762f3c81deb27d0191c6c6dc7', class: "step-form__radio" }, h("input", { key: '3e5eddae5e960abc387ab5add8353a4dd265ddb6', type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'license', onChange: () => this.handleRadioChange('identificationType', 'license') }), "Licencia de conducir"), h("label", { key: '12d1e3594613178153f90b3b9239a9188254366b', class: "step-form__radio" }, h("input", { key: 'e13b28e7686054edeb3068bc1861c911bbfe318f', type: "radio", name: "idType", checked: this.formData.personal.identificationType === 'passport', onChange: () => this.handleRadioChange('identificationType', 'passport') }), "Pasaporte")), h("input", { key: '3ed6acf3d4638279f914e5da15fef7cb7767cac0', type: "text", class: { 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }, value: this.formData.personal.identificationNumber, placeholder: "Ingrese nro de identificaci\u00F3n", onInput: this.handleInput('personal', 'identificationNumber') })), this.touched['identificationNumber'] && this.errors['identificationNumber'] && (h("span", { key: '75d67c2f616e6d5970a2b1aa362f5304c6c70823', class: "step-form__error" }, this.errors['identificationNumber']))), this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
            type: 'date',
            required: true,
        })), h("div", { key: 'f03be9d11723497799ab378c87d1a6bdcd47413c', class: "step-form__row" }, this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
            type: 'tel',
            placeholder: 'Ingrese nro de teléfono',
            required: true,
        }), this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
            type: 'tel',
            placeholder: 'Ingrese nro de teléfono',
        }))), h("div", { key: '87a9b0398ba9c4224856d200a197226d57255918', class: "step-form__section" }, h("div", { key: '9770d7ad710c57d18f263c4b695dbc3fa63be6a4', class: "step-form__row" }, this.renderInput('Nombre del Negocio', 'businessName', 'business', this.formData.business.businessName, {
            placeholder: 'Ingrese nombre del negocio',
            required: true,
        }), this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
            placeholder: 'Ingrese posición actual',
            required: true,
        }))), h("div", { key: 'fc2fbe5af446bb0a79d740d07ff5b79603067858', class: "step-form__section" }, h("div", { key: 'ae3a915ead0593648b439210e3a326afef56b168', class: "step-form__row" }, this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
            placeholder: 'Ingrese dirección',
            required: true,
        }), this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
            placeholder: 'Ingrese ciudad',
            required: true,
        })), h("div", { key: 'acc57c7ac68cd4e8438c3ae2b86588b1047e63cc', class: "step-form__row" }, this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
            placeholder: 'Ingrese código postal',
            required: true,
        }), this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
            type: 'email',
            placeholder: 'Ingrese correo electrónico',
            required: true,
        }))), h("div", { key: '901019bc2449e39fb8b4a628389f35b6b8d7707d', class: "step-form__section" }, h("div", { key: '58f88109a6cd3999dafe39e7af0f04fe4f9465a8', class: "step-form__field" }, h("label", { key: '7b8f2e23aeaf997ff117149de0da52cd938c381e', class: "step-form__label" }, "Cliente existente de Claro PR", h("span", { key: '066a2fc74bf8697fb142e7d73df4b21ba9a987dc', class: "step-form__required" }, "*")), h("div", { key: '563375d345281e8b6779e919712fec0de91bcd95', class: "step-form__radio-group step-form__radio-group--horizontal" }, h("label", { key: '5f30d44ac24d69df8897c24ebe5312470a1176bd', class: "step-form__radio" }, h("input", { key: '0ddf22b09292105c8774a388dac629379158e631', type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === true, onChange: () => this.handleRadioChange('isExistingCustomer', true) }), "S\u00ED"), h("label", { key: 'ee75c13d17cc3332a5638838f03dd7fa7f02062c', class: "step-form__radio" }, h("input", { key: '769e0760bcd14b7efef849d150c49025b4bbcfa9', type: "radio", name: "existingCustomer", checked: this.formData.isExistingCustomer === false, onChange: () => this.handleRadioChange('isExistingCustomer', false) }), "No")))), h("div", { key: 'b1bf9791c0839db0a3bcab0ed9487d51b36ec9af', class: "step-form__actions" }, h("button", { key: '4521a008fca97e087aadd8d7a00a4454ce4aeb04', type: "submit", class: "step-form__btn-submit" }, "Continuar"))))));
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
//# sourceMappingURL=p-DehGW7ph.js.map

//# sourceMappingURL=p-DehGW7ph.js.map