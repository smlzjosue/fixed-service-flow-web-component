// ============================================
// STEP FORM - Customer Information Form
// Fixed Service Flow Web Component
// ============================================
import { h, Host } from "@stencil/core";
import { flowState, flowActions } from "../../../store/flow.store";
import { fieldValidators } from "../../../utils/validators";
import { formatPhone, unformatPhone } from "../../../utils/formatters";
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
            "touched": {}
        };
    }
}
//# sourceMappingURL=step-form.js.map
