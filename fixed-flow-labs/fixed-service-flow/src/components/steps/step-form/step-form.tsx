// ============================================
// STEP FORM - Customer Information Form
// Fixed Service Flow Web Component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { flowState, flowActions } from '../../../store/flow.store';
import { FormData, IdentificationType } from '../../../store/interfaces';
import { fieldValidators, ValidationResult } from '../../../utils/validators';
import { formatPhone, unformatPhone } from '../../../utils/formatters';

@Component({
  tag: 'step-form',
  styleUrl: 'step-form.scss',
  shadow: true,
})
export class StepForm {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() formData: FormData = {
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

  @State() errors: Record<string, string> = {};
  @State() touched: Record<string, boolean> = {};

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  private handleInput = (section: string, field: string) => (e: Event) => {
    const target = e.target as HTMLInputElement;
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

  private handleRadioChange = (field: string, value: any) => {
    if (field === 'identificationType') {
      this.formData = {
        ...this.formData,
        personal: {
          ...this.formData.personal,
          identificationType: value as IdentificationType,
        },
      };
    } else if (field === 'isExistingCustomer') {
      this.formData = {
        ...this.formData,
        isExistingCustomer: value,
      };
    }
  };

  private validateField(field: string, value: string): ValidationResult {
    const validator = fieldValidators[field];
    if (!validator) return { isValid: true, message: '' };

    const result = validator(value);

    if (!result.isValid) {
      this.errors = { ...this.errors, [field]: result.message };
    } else {
      const { [field]: _, ...rest } = this.errors;
      this.errors = rest;
    }

    return result;
  }

  private getFieldsToValidate() {
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
  private isFormValid(): boolean {
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

  private validateForm(): boolean {
    const fieldsToValidate = this.getFieldsToValidate();

    let isValid = true;
    const newErrors: Record<string, string> = {};

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

  private handleSubmit = (e: Event) => {
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

  private renderInput(
    label: string,
    field: string,
    section: string,
    value: string,
    options: {
      type?: string;
      placeholder?: string;
      required?: boolean;
      disabled?: boolean;
    } = {},
  ) {
    const { type = 'text', placeholder = '', required = false, disabled = false } = options;
    const hasError = this.touched[field] && this.errors[field];
    const displayValue = (field === 'phone1' || field === 'phone2') ? formatPhone(value) : value;

    return (
      <div class="step-form__field">
        <label class="step-form__label">
          {required && <span class="step-form__required">*</span>}
          {label}:
        </label>
        <input
          type={type}
          class={{ 'step-form__input': true, 'step-form__input--error': !!hasError }}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onInput={this.handleInput(section, field)}
        />
        {hasError && <span class="step-form__error">{this.errors[field]}</span>}
      </div>
    );
  }

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    return (
      <Host>
        <div class="step-form">
          {/* Header */}
          <header class="step-form__header">
            <h1 class="step-form__title">Formulario de solicitud de servicio fijo</h1>
            <button class="step-form__btn-back" onClick={this.onBack}>
              Regresar
            </button>
          </header>

          <form onSubmit={this.handleSubmit}>
            <p class="step-form__instructions">
              Por favor, ingresa la información personal solicitada. Su nombre y apellido deben ser iguales a su identificación de gobierno.
            </p>

            {/* Personal Information */}
            <div class="step-form__section">
              <div class="step-form__row">
                {this.renderInput('Nombre', 'firstName', 'personal', this.formData.personal.firstName, {
                  placeholder: 'Ingrese nombre',
                  required: true,
                })}
                {this.renderInput('Segundo nombre', 'secondName', 'personal', this.formData.personal.secondName || '', {
                  placeholder: 'Ingrese segundo nombre (Opcional)',
                })}
              </div>

              <div class="step-form__row">
                {this.renderInput('Apellido', 'lastName', 'personal', this.formData.personal.lastName, {
                  placeholder: 'Ingrese apellido',
                  required: true,
                })}
                {this.renderInput('Segundo apellido', 'secondLastName', 'personal', this.formData.personal.secondLastName, {
                  placeholder: 'Ingrese segundo apellido',
                  required: true,
                })}
              </div>

              {/* Identification */}
              <div class="step-form__row">
                <div class="step-form__field step-form__field--id">
                  <label class="step-form__label">
                    <span class="step-form__required">*</span>Identificación:
                  </label>
                  <div class="step-form__id-row">
                    <div class="step-form__radio-group">
                      <label class="step-form__radio">
                        <input
                          type="radio"
                          name="idType"
                          checked={this.formData.personal.identificationType === 'license'}
                          onChange={() => this.handleRadioChange('identificationType', 'license')}
                        />
                        Licencia de conducir
                      </label>
                      <label class="step-form__radio">
                        <input
                          type="radio"
                          name="idType"
                          checked={this.formData.personal.identificationType === 'passport'}
                          onChange={() => this.handleRadioChange('identificationType', 'passport')}
                        />
                        Pasaporte
                      </label>
                    </div>
                    <input
                      type="text"
                      class={{ 'step-form__input': true, 'step-form__input--error': !!(this.touched['identificationNumber'] && this.errors['identificationNumber']) }}
                      value={this.formData.personal.identificationNumber}
                      placeholder="Ingrese nro de identificación"
                      onInput={this.handleInput('personal', 'identificationNumber')}
                    />
                  </div>
                  {this.touched['identificationNumber'] && this.errors['identificationNumber'] && (
                    <span class="step-form__error">{this.errors['identificationNumber']}</span>
                  )}
                </div>
                {this.renderInput('Fecha de vencimiento', 'identificationExpiration', 'personal', this.formData.personal.identificationExpiration, {
                  type: 'date',
                  required: true,
                })}
              </div>

              {/* Phones */}
              <div class="step-form__row">
                {this.renderInput('Teléfono de contacto 1', 'phone1', 'personal', this.formData.personal.phone1, {
                  type: 'tel',
                  placeholder: 'Ingrese nro de teléfono',
                  required: true,
                })}
                {this.renderInput('Teléfono de contacto 2', 'phone2', 'personal', this.formData.personal.phone2 || '', {
                  type: 'tel',
                  placeholder: 'Ingrese nro de teléfono',
                })}
              </div>
            </div>

            {/* Business Information */}
            <div class="step-form__section">
              <div class="step-form__row">
                {this.renderInput('Nombre legal de Empresa (según IRS)', 'businessName', 'business', this.formData.business.businessName, {
                  placeholder: 'Ingresar nombre legal de empresa',
                  required: true,
                })}
                {this.renderInput('Posición en la Empresa', 'position', 'business', this.formData.business.position, {
                  placeholder: 'Ingrese posición actual',
                  required: true,
                })}
              </div>
            </div>

            {/* Address */}
            <div class="step-form__section">
              <div class="step-form__row">
                {this.renderInput('Dirección', 'address', 'address', this.formData.address.address, {
                  placeholder: 'Ingrese dirección',
                  required: true,
                })}
                {this.renderInput('Ciudad', 'city', 'address', this.formData.address.city, {
                  placeholder: 'Ingrese ciudad',
                  required: true,
                })}
              </div>

              <div class="step-form__row">
                {this.renderInput('Código postal', 'zipCode', 'address', this.formData.address.zipCode, {
                  placeholder: 'Ingrese código postal',
                  required: true,
                })}
                {this.renderInput('Correo electrónico', 'email', 'personal', this.formData.personal.email, {
                  type: 'email',
                  placeholder: 'Ingrese correo electrónico',
                  required: true,
                })}
              </div>
            </div>

            {/* Existing Customer */}
            <div class="step-form__section">
              <div class="step-form__field">
                <label class="step-form__label">
                  <span class="step-form__required">*</span>Cliente existente de Claro PR:
                </label>
                <div class="step-form__radio-group step-form__radio-group--horizontal">
                  <label class="step-form__radio">
                    <input
                      type="radio"
                      name="existingCustomer"
                      checked={this.formData.isExistingCustomer === true}
                      onChange={() => this.handleRadioChange('isExistingCustomer', true)}
                    />
                    Sí
                  </label>
                  <label class="step-form__radio">
                    <input
                      type="radio"
                      name="existingCustomer"
                      checked={this.formData.isExistingCustomer === false}
                      onChange={() => this.handleRadioChange('isExistingCustomer', false)}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div class="step-form__actions">
              <button
                type="submit"
                class="step-form__btn-submit"
                disabled={!this.isFormValid()}
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </Host>
    );
  }
}
