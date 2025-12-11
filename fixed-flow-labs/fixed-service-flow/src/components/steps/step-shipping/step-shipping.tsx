// ============================================
// STEP SHIPPING - Delivery Address Form
// Fixed Service Flow Web Component
// Design based on TEL shipment-web.component
// ============================================

import { Component, Prop, State, h, Host } from '@stencil/core';
import { shippingService, ShippingAddress } from '../../../services/shipping.service';

interface FormErrors {
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address1?: string;
  zipcode?: string;
  terms?: string;
  policies?: string;
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

  // Form fields
  @State() name: string = '';
  @State() lastname: string = '';
  @State() email: string = '';
  @State() phone: string = '';
  @State() phone2: string = '';
  @State() address1: string = '';
  @State() address2: string = '';
  @State() zipcode: string = '';
  @State() city: string = '';
  @State() state: string = 'PR';
  @State() notes: string = '';

  // Authorize other person
  @State() authorizeOther: boolean = false;
  @State() authorizerName: string = '';
  @State() authorizerPhone: string = '';

  // Terms
  @State() acceptTerms: boolean = false;
  @State() acceptPolicies: boolean = false;

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
      this.address1 = stored.address1;
      this.address2 = stored.address2 || '';
      this.zipcode = stored.zip;
      this.city = stored.city;
      this.state = stored.state;
      this.notes = stored.notes || '';
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
    if (field === 'phone' || field === 'phone2' || field === 'authorizerPhone') {
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

  private handleCheckboxChange = (field: string) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    this[field] = target.checked;

    if (field === 'authorizeOther' && !target.checked) {
      this.authorizerName = '';
      this.authorizerPhone = '';
    }

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

      case 'email':
        if (!this.email.trim()) {
          errors.email = 'El correo es requerido';
        } else if (!shippingService.isValidEmail(this.email)) {
          errors.email = 'Ingresa un correo válido';
        } else {
          delete errors.email;
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

      case 'address1':
        if (!this.address1.trim()) {
          errors.address1 = 'La dirección es requerida';
        } else if (!shippingService.isValidPhysicalAddress(this.address1 + ' ' + this.address2)) {
          errors.address1 = 'Ingresa una dirección física (PO Box no permitido)';
        } else {
          delete errors.address1;
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

      case 'acceptTerms':
        if (!this.acceptTerms) {
          errors.terms = 'Debes aceptar los términos';
        } else {
          delete errors.terms;
        }
        break;

      case 'acceptPolicies':
        if (!this.acceptPolicies) {
          errors.policies = 'Debes aceptar las políticas';
        } else {
          delete errors.policies;
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
      email: true,
      phone: true,
      address1: true,
      zipcode: true,
      acceptTerms: true,
      acceptPolicies: true,
    };

    // Validate all required fields
    const fields = ['name', 'lastname', 'email', 'phone', 'address1', 'zipcode', 'acceptTerms', 'acceptPolicies'];
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
        name: `${this.name} ${this.lastname}`.trim(),
        email: this.email,
        phone: shippingService.cleanPhoneNumber(this.phone),
        phone2: this.phone2 ? shippingService.cleanPhoneNumber(this.phone2) : undefined,
        address1: this.address1,
        address2: this.address2 || undefined,
        city: this.city,
        state: this.state,
        zip: this.zipcode,
        notes: this.notes || undefined,
        authorizerName: this.authorizeOther ? this.authorizerName : undefined,
        authorizerPhone: this.authorizeOther ? shippingService.cleanPhoneNumber(this.authorizerPhone) : undefined,
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
          {/* Header */}
          <div class="header">
            <button class="btn-back" onClick={this.onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              Regresar
            </button>
            <h1 class="title">Dirección de envío</h1>
          </div>

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
            {/* Personal Information */}
            <div class="form-section">
              <h3 class="section-title">Información personal</h3>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    Nombre <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class={{ 'form-input': true, error: this.touched.name && !!this.formErrors.name }}
                    value={this.name}
                    onInput={this.handleInputChange('name')}
                    placeholder="Juan"
                  />
                  {this.touched.name && this.formErrors.name && <span class="error-message">{this.formErrors.name}</span>}
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Apellido <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class={{ 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }}
                    value={this.lastname}
                    onInput={this.handleInputChange('lastname')}
                    placeholder="Pérez"
                  />
                  {this.touched.lastname && this.formErrors.lastname && <span class="error-message">{this.formErrors.lastname}</span>}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Correo electrónico <span class="required">*</span>
                </label>
                <input
                  type="email"
                  class={{ 'form-input': true, error: this.touched.email && !!this.formErrors.email }}
                  value={this.email}
                  onInput={this.handleInputChange('email')}
                  placeholder="juan@ejemplo.com"
                />
                {this.touched.email && this.formErrors.email && <span class="error-message">{this.formErrors.email}</span>}
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    Teléfono <span class="required">*</span>
                  </label>
                  <input
                    type="tel"
                    class={{ 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }}
                    value={this.phone}
                    onInput={this.handleInputChange('phone')}
                    placeholder="(787) 555-1234"
                  />
                  {this.touched.phone && this.formErrors.phone && <span class="error-message">{this.formErrors.phone}</span>}
                </div>

                <div class="form-group">
                  <label class="form-label">Teléfono alterno</label>
                  <input type="tel" class="form-input" value={this.phone2} onInput={this.handleInputChange('phone2')} placeholder="(787) 555-5678" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div class="form-section">
              <h3 class="section-title">Dirección de entrega</h3>
              <p class="section-note">Solo se permiten direcciones físicas. No se aceptan PO Box.</p>

              <div class="form-group">
                <label class="form-label">
                  Dirección línea 1 <span class="required">*</span>
                </label>
                <input
                  type="text"
                  class={{ 'form-input': true, error: this.touched.address1 && !!this.formErrors.address1 }}
                  value={this.address1}
                  onInput={this.handleInputChange('address1')}
                  placeholder="Calle Principal #123"
                />
                {this.touched.address1 && this.formErrors.address1 && <span class="error-message">{this.formErrors.address1}</span>}
              </div>

              <div class="form-group">
                <label class="form-label">Dirección línea 2</label>
                <input
                  type="text"
                  class="form-input"
                  value={this.address2}
                  onInput={this.handleInputChange('address2')}
                  placeholder="Apt, Suite, Urbanización, etc."
                />
              </div>

              <div class="form-row form-row--three">
                <div class="form-group">
                  <label class="form-label">
                    Código Postal <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class={{ 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }}
                    value={this.zipcode}
                    onInput={this.handleInputChange('zipcode')}
                    placeholder="00XXX"
                    maxLength={5}
                  />
                  {this.touched.zipcode && this.formErrors.zipcode && <span class="error-message">{this.formErrors.zipcode}</span>}
                </div>

                <div class="form-group">
                  <label class="form-label">Ciudad</label>
                  <input type="text" class="form-input" value={this.city} disabled placeholder="Se completa automáticamente" />
                </div>

                <div class="form-group">
                  <label class="form-label">Estado</label>
                  <input type="text" class="form-input" value={this.state} disabled />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Indicaciones adicionales</label>
                <textarea class="form-textarea" value={this.notes} onInput={this.handleInputChange('notes')} placeholder="Casa color azul, portón negro, etc." rows={3}></textarea>
              </div>
            </div>

            {/* Authorize Other */}
            <div class="form-section">
              <label class="checkbox-label">
                <input type="checkbox" checked={this.authorizeOther} onChange={this.handleCheckboxChange('authorizeOther')} />
                <span class="checkmark"></span>
                <span class="checkbox-text">Autorizo a otra persona a recibir el paquete</span>
              </label>

              {this.authorizeOther && (
                <div class="authorized-person">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">
                        Nombre del autorizado <span class="required">*</span>
                      </label>
                      <input type="text" class="form-input" value={this.authorizerName} onInput={this.handleInputChange('authorizerName')} placeholder="Nombre completo" />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        Teléfono del autorizado <span class="required">*</span>
                      </label>
                      <input type="tel" class="form-input" value={this.authorizerPhone} onInput={this.handleInputChange('authorizerPhone')} placeholder="(787) 555-1234" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div class="form-section terms-section">
              <label class={{ 'checkbox-label': true, error: this.touched.acceptTerms && !!this.formErrors.terms }}>
                <input type="checkbox" checked={this.acceptTerms} onChange={this.handleCheckboxChange('acceptTerms')} />
                <span class="checkmark"></span>
                <span class="checkbox-text">
                  Acepto los{' '}
                  <a href="#" target="_blank">
                    términos y condiciones
                  </a>{' '}
                  de Claro Puerto Rico
                </span>
              </label>

              <label class={{ 'checkbox-label': true, error: this.touched.acceptPolicies && !!this.formErrors.policies }}>
                <input type="checkbox" checked={this.acceptPolicies} onChange={this.handleCheckboxChange('acceptPolicies')} />
                <span class="checkmark"></span>
                <span class="checkbox-text">
                  Acepto las{' '}
                  <a href="#" target="_blank">
                    políticas de devolución
                  </a>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button class={{ 'btn-submit': true, loading: this.isLoading }} onClick={this.handleSubmit} disabled={this.isLoading}>
              {this.isLoading ? (
                <span class="btn-loading">
                  <span class="spinner"></span>
                  Procesando...
                </span>
              ) : (
                'Continuar al pago'
              )}
            </button>
          </div>
        </div>
      </Host>
    );
  }
}
