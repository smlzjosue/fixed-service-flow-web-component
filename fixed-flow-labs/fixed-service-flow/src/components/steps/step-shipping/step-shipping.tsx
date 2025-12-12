// ============================================
// STEP SHIPPING - Delivery Address Form
// Fixed Service Flow Web Component
// Design based on datos-envio.png reference
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { shippingService, ShippingAddress } from '../../../services/shipping.service';

interface FormErrors {
  name?: string;
  secondName?: string;
  lastname?: string;
  secondLastname?: string;
  idType?: string;
  idNumber?: string;
  expirationDate?: string;
  phone?: string;
  phone2?: string;
  businessName?: string;
  position?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  email?: string;
  existingCustomer?: string;
}

@Component({
  tag: 'step-shipping',
  styleUrl: 'step-shipping.scss',
  shadow: true,
})
export class StepShipping {
  // ------------------------------------------
  // PROPS
  // ------------------------------------------

  @Prop() onNext: () => void;
  @Prop() onBack: () => void;

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  @State() isLoading: boolean = false;
  @State() error: string | null = null;

  // Form fields - Personal Info
  @State() name: string = '';
  @State() secondName: string = '';
  @State() lastname: string = '';
  @State() secondLastname: string = '';

  // Identification
  @State() idType: 'license' | 'passport' | '' = '';
  @State() idNumber: string = '';
  @State() expirationDate: string = '';

  // Contact
  @State() phone: string = '';
  @State() phone2: string = '';

  // Business
  @State() businessName: string = '';
  @State() position: string = '';

  // Address
  @State() address: string = '';
  @State() city: string = '';
  @State() zipcode: string = '';
  @State() email: string = '';

  // Existing customer
  @State() existingCustomer: 'yes' | 'no' | '' = '';

  // Validation
  @State() formErrors: FormErrors = {};
  @State() touched: Record<string, boolean> = {};

  // ------------------------------------------
  // LIFECYCLE
  // ------------------------------------------

  componentWillLoad() {
    this.loadStoredData();
  }

  // ------------------------------------------
  // METHODS
  // ------------------------------------------

  private loadStoredData() {
    // Try to load previously stored shipping data
    const stored = shippingService.getStoredShippingAddress();
    if (stored) {
      const nameParts = stored.name.split(' ');
      this.name = nameParts[0] || '';
      this.lastname = nameParts.slice(1).join(' ') || '';
      this.email = stored.email;
      this.phone = this.formatPhoneDisplay(stored.phone);
      this.phone2 = stored.phone2 ? this.formatPhoneDisplay(stored.phone2) : '';
      this.address = stored.address1;
      this.zipcode = stored.zip;
      this.city = stored.city;
    }
  }

  private formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  private handleInputChange = (field: string) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    let value = target.value;

    // Special handling for phone fields
    if (field === 'phone' || field === 'phone2') {
      value = this.formatPhoneInput(value);
    }

    // Special handling for zipcode
    if (field === 'zipcode') {
      value = value.replace(/\D/g, '').slice(0, 5);
      const municipality = shippingService.getMunicipalityByZip(value);
      if (municipality) {
        this.city = municipality;
      } else if (value.length === 5) {
        this.city = '';
      }
    }

    this[field] = value;
    this.touched[field] = true;
    this.validateField(field);
  };

  private formatPhoneInput(value: string): string {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  private handleRadioChange = (field: string, value: string) => () => {
    this[field] = value;
    this.touched[field] = true;
    this.validateField(field);
  };

  private validateField(field: string): boolean {
    const errors: FormErrors = { ...this.formErrors };

    switch (field) {
      case 'name':
        if (!this.name.trim()) {
          errors.name = 'El nombre es requerido';
        } else {
          delete errors.name;
        }
        break;

      case 'lastname':
        if (!this.lastname.trim()) {
          errors.lastname = 'El apellido es requerido';
        } else {
          delete errors.lastname;
        }
        break;

      case 'secondLastname':
        if (!this.secondLastname.trim()) {
          errors.secondLastname = 'El segundo apellido es requerido';
        } else {
          delete errors.secondLastname;
        }
        break;

      case 'idType':
        if (!this.idType) {
          errors.idType = 'Seleccione un tipo de identificación';
        } else {
          delete errors.idType;
        }
        break;

      case 'idNumber':
        if (!this.idNumber.trim()) {
          errors.idNumber = 'El número de identificación es requerido';
        } else {
          delete errors.idNumber;
        }
        break;

      case 'expirationDate':
        if (!this.expirationDate) {
          errors.expirationDate = 'La fecha de vencimiento es requerida';
        } else {
          delete errors.expirationDate;
        }
        break;

      case 'phone':
        if (!this.phone.trim()) {
          errors.phone = 'El teléfono es requerido';
        } else if (!shippingService.isValidPhone(this.phone)) {
          errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
        } else {
          delete errors.phone;
        }
        break;

      case 'businessName':
        if (!this.businessName.trim()) {
          errors.businessName = 'El nombre del negocio es requerido';
        } else {
          delete errors.businessName;
        }
        break;

      case 'position':
        if (!this.position.trim()) {
          errors.position = 'La posición es requerida';
        } else {
          delete errors.position;
        }
        break;

      case 'address':
        if (!this.address.trim()) {
          errors.address = 'La dirección es requerida';
        } else {
          delete errors.address;
        }
        break;

      case 'city':
        if (!this.city.trim()) {
          errors.city = 'La ciudad es requerida';
        } else {
          delete errors.city;
        }
        break;

      case 'zipcode':
        if (!this.zipcode.trim()) {
          errors.zipcode = 'El código postal es requerido';
        } else if (!shippingService.validateZipCode(this.zipcode)) {
          errors.zipcode = 'Código postal no válido para Puerto Rico';
        } else {
          delete errors.zipcode;
        }
        break;

      case 'email':
        if (!this.email.trim()) {
          errors.email = 'El correo es requerido';
        } else if (!shippingService.isValidEmail(this.email)) {
          errors.email = 'Ingresa un correo válido';
        } else {
          delete errors.email;
        }
        break;

      case 'existingCustomer':
        if (!this.existingCustomer) {
          errors.existingCustomer = 'Seleccione una opción';
        } else {
          delete errors.existingCustomer;
        }
        break;
    }

    this.formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  private validateForm(): boolean {
    // Mark all fields as touched
    this.touched = {
      name: true,
      lastname: true,
      secondLastname: true,
      idType: true,
      idNumber: true,
      expirationDate: true,
      phone: true,
      businessName: true,
      position: true,
      address: true,
      city: true,
      zipcode: true,
      email: true,
      existingCustomer: true,
    };

    // Validate all required fields
    const fields = [
      'name',
      'lastname',
      'secondLastname',
      'idType',
      'idNumber',
      'expirationDate',
      'phone',
      'businessName',
      'position',
      'address',
      'city',
      'zipcode',
      'email',
      'existingCustomer',
    ];
    fields.forEach((field) => this.validateField(field));

    return Object.keys(this.formErrors).length === 0;
  }

  private handleSubmit = async () => {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const shippingAddress: ShippingAddress = {
        name: `${this.name} ${this.secondName} ${this.lastname} ${this.secondLastname}`.replace(/\s+/g, ' ').trim(),
        email: this.email,
        phone: shippingService.cleanPhoneNumber(this.phone),
        phone2: this.phone2 ? shippingService.cleanPhoneNumber(this.phone2) : undefined,
        address1: this.address,
        city: this.city,
        state: 'PR',
        zip: this.zipcode,
      };

      const result = await shippingService.createAddress(shippingAddress);

      if (result.hasError) {
        this.error = result.message || result.errorDesc || 'Error al guardar la dirección';
        return;
      }

      console.log('[StepShipping] Address created, shipmentId:', result.response);
      this.onNext?.();
    } catch (err) {
      console.error('[StepShipping] Error:', err);
      this.error = 'Error de conexión. Intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  render() {
    return (
      <Host>
        <div class="step-shipping">
          {/* Info Message */}
          <p class="info-message">
            Por favor, ingresa la información personal solicitada. Su nombre y apellido deben ser iguales a su identificación de gobierno.
          </p>

          {/* Error Alert */}
          {this.error && (
            <div class="error-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{this.error}</span>
            </div>
          )}

          {/* Form */}
          <div class="form-container">
            {/* Row 1: Nombre + Segundo nombre */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Nombre:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.name && !!this.formErrors.name }}
                  value={this.name}
                  onInput={this.handleInputChange('name')}
                  placeholder="Ingresar nombre"
                />
                {this.touched.name && this.formErrors.name && <span class="error-message">{this.formErrors.name}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">Segundo nombre:</label>
                <input
                  type="text"
                  class="form-input"
                  value={this.secondName}
                  onInput={this.handleInputChange('secondName')}
                  placeholder="Ingresar segundo nombre (Opcional)"
                />
              </div>
            </div>

            {/* Row 2: Apellido + Segundo apellido */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Apellido:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }}
                  value={this.lastname}
                  onInput={this.handleInputChange('lastname')}
                  placeholder="Ingresar apellido"
                />
                {this.touched.lastname && this.formErrors.lastname && <span class="error-message">{this.formErrors.lastname}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Segundo apellido:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }}
                  value={this.secondLastname}
                  onInput={this.handleInputChange('secondLastname')}
                  placeholder="Ingresar segundo apellido"
                />
                {this.touched.secondLastname && this.formErrors.secondLastname && <span class="error-message">{this.formErrors.secondLastname}</span>}
              </div>
            </div>

            {/* Row 3: Identificación + Fecha de vencimiento */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Identificación:
                </label>
                <div class="id-field">
                  <div class="radio-group">
                    <label class="radio-label">
                      <input
                        type="radio"
                        name="idType"
                        checked={this.idType === 'license'}
                        onChange={this.handleRadioChange('idType', 'license')}
                      />
                      <span class="radio-custom"></span>
                      <span class="radio-text">Licencia de conducir</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        name="idType"
                        checked={this.idType === 'passport'}
                        onChange={this.handleRadioChange('idType', 'passport')}
                      />
                      <span class="radio-custom"></span>
                      <span class="radio-text">Pasaporte</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    class={{ 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }}
                    value={this.idNumber}
                    onInput={this.handleInputChange('idNumber')}
                    placeholder="Ingresar nro de identificación"
                  />
                </div>
                {this.touched.idType && this.formErrors.idType && <span class="error-message">{this.formErrors.idType}</span>}
                {this.touched.idNumber && this.formErrors.idNumber && <span class="error-message">{this.formErrors.idNumber}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Fecha de vencimiento:
                </label>
                <div class="date-input-wrapper">
                  <input
                    type="date"
                    class={{ 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }}
                    value={this.expirationDate}
                    onInput={this.handleInputChange('expirationDate')}
                    placeholder="Seleccionar"
                  />
                </div>
                {this.touched.expirationDate && this.formErrors.expirationDate && <span class="error-message">{this.formErrors.expirationDate}</span>}
              </div>
            </div>

            {/* Row 4: Teléfono 1 + Teléfono 2 */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Teléfono de contacto 1:
                </label>
                <input
                  type="tel"
                  class={{ 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }}
                  value={this.phone}
                  onInput={this.handleInputChange('phone')}
                  placeholder="Ingresar nro de teléfono"
                />
                {this.touched.phone && this.formErrors.phone && <span class="error-message">{this.formErrors.phone}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">Teléfono de contacto 2:</label>
                <input
                  type="tel"
                  class="form-input"
                  value={this.phone2}
                  onInput={this.handleInputChange('phone2')}
                  placeholder="Ingresar nro de teléfono"
                />
              </div>
            </div>

            {/* Row 5: Nombre del Negocio + Posición en la Empresa */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Nombre del Negocio:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }}
                  value={this.businessName}
                  onInput={this.handleInputChange('businessName')}
                  placeholder="Ingresar nombre del negocio"
                />
                {this.touched.businessName && this.formErrors.businessName && <span class="error-message">{this.formErrors.businessName}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Posición en la Empresa:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.position && !!this.formErrors.position }}
                  value={this.position}
                  onInput={this.handleInputChange('position')}
                  placeholder="Ingresar posición actual"
                />
                {this.touched.position && this.formErrors.position && <span class="error-message">{this.formErrors.position}</span>}
              </div>
            </div>

            {/* Row 6: Dirección + Ciudad */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Dirección:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.address && !!this.formErrors.address }}
                  value={this.address}
                  onInput={this.handleInputChange('address')}
                  placeholder="Ingresar dirección"
                />
                {this.touched.address && this.formErrors.address && <span class="error-message">{this.formErrors.address}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Ciudad:
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.city && !!this.formErrors.city }}
                  value={this.city}
                  onInput={this.handleInputChange('city')}
                  placeholder="Ingresar ciudad"
                />
                {this.touched.city && this.formErrors.city && <span class="error-message">{this.formErrors.city}</span>}
              </div>
            </div>

            {/* Row 7: Código postal + Correo electrónico */}
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Código postal
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }}
                  value={this.zipcode}
                  onInput={this.handleInputChange('zipcode')}
                  placeholder="Ingresar código postal"
                  maxLength={5}
                />
                {this.touched.zipcode && this.formErrors.zipcode && <span class="error-message">{this.formErrors.zipcode}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>Correo electrónico:
                </label>
                <input
                  type="email"
                  class={{ 'form-input': true, error: this.touched.email && !!this.formErrors.email }}
                  value={this.email}
                  onInput={this.handleInputChange('email')}
                  placeholder="Ingresar Correo electrónico"
                />
                {this.touched.email && this.formErrors.email && <span class="error-message">{this.formErrors.email}</span>}
              </div>
            </div>

            {/* Row 8: Cliente existente de Claro PR */}
            <div class="form-group existing-customer">
              <label class="form-label">
                <span class="required">*</span>Cliente existente de Claro PR:
              </label>
              <div class="radio-group horizontal">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="existingCustomer"
                    checked={this.existingCustomer === 'yes'}
                    onChange={this.handleRadioChange('existingCustomer', 'yes')}
                  />
                  <span class="radio-custom"></span>
                  <span class="radio-text">Sí</span>
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="existingCustomer"
                    checked={this.existingCustomer === 'no'}
                    onChange={this.handleRadioChange('existingCustomer', 'no')}
                  />
                  <span class="radio-custom"></span>
                  <span class="radio-text">No</span>
                </label>
              </div>
              {this.touched.existingCustomer && this.formErrors.existingCustomer && (
                <span class="error-message">{this.formErrors.existingCustomer}</span>
              )}
            </div>

            {/* Submit Button */}
            <div class="btn-container">
              <button class={{ 'btn-submit': true, loading: this.isLoading }} onClick={this.handleSubmit} disabled={this.isLoading}>
                {this.isLoading ? (
                  <span class="btn-loading">
                    <span class="spinner"></span>
                    Procesando...
                  </span>
                ) : (
                  'Continuar'
                )}
              </button>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
