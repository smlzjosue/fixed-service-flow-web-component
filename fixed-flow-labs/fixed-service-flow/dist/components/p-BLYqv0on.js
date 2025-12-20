import { t as transformTag, p as proxyCustomElement, H, h, d as Host } from './p-rjZjel3R.js';
import { s as shippingService } from './p-Bw04z7HQ.js';

const stepShippingCss = () => `:host{display:block;width:100%;min-height:100%;background-color:white}.step-shipping{width:100%;max-width:900px;margin:0 auto;padding:1.5rem 1rem}.info-message{font-size:0.875rem;color:#666666;margin:0 0 1.5rem 0;padding:0 !important;background:transparent !important;background-color:transparent !important;line-height:1.5;border:none !important;border-radius:0 !important}.error-alert{display:flex;align-items:center;gap:0.5rem;background:rgb(248.1707317073, 205, 201.8292682927);color:rgb(172.8048780488, 32.5, 22.1951219512);padding:1rem;border-radius:0.5rem;margin-bottom:1.5rem;font-size:0.875rem}.error-alert svg{width:20px;height:20px;flex-shrink:0}.form-container{width:100%}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem 1.5rem;margin-bottom:0.25rem}@media (max-width: 700px){.form-row{grid-template-columns:1fr}}.form-group{margin-bottom:1rem}.form-group.existing-customer{margin-top:0.5rem}.form-label{display:block;font-size:0.875rem;font-weight:500;color:#4D4D4D;margin-bottom:0.25rem}.form-label .required{color:#4D4D4D;margin-right:2px}.form-input{width:100%;padding:10px 12px;border:1px solid #CCCCCC;border-radius:0.25rem;font-size:0.875rem;color:#1A1A1A;background:white;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.form-input::placeholder{color:#999999}.form-input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 2px rgba(0, 151, 169, 0.1)}.form-input:disabled{background:#F5F5F5;color:#808080;cursor:not-allowed}.form-input.error{border-color:#DA291C}.form-input.error:focus{box-shadow:0 0 0 2px rgba(218, 41, 28, 0.1)}input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}.date-input-wrapper{position:relative}.error-message{display:block;font-size:0.75rem;color:#DA291C;margin-top:0.25rem}.id-field{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}.id-field .radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem;flex-shrink:0}.id-field .id-input{flex:1;min-width:150px}.radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem}.radio-group.horizontal{flex-direction:row}.radio-label{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.875rem}.radio-label input[type=radio]{display:none}.radio-label .radio-custom{width:16px;height:16px;border:2px solid #999999;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}.radio-label .radio-custom::after{content:"";width:8px;height:8px;border-radius:50%;background:transparent;transition:background 0.2s}.radio-label input[type=radio]:checked+.radio-custom{border-color:#666666}.radio-label input[type=radio]:checked+.radio-custom::after{background:#666666}.radio-label .radio-text{color:#4D4D4D;font-size:0.75rem;white-space:nowrap}.btn-container{display:flex;justify-content:center;margin-top:1.5rem;padding-top:1rem}.btn-submit{min-width:200px;height:44px;background:#666666;color:white;border:none;border-radius:9999px;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0 2rem}.btn-submit:hover:not(:disabled){background:#4D4D4D}.btn-submit:disabled{background:#CCCCCC;cursor:not-allowed}.btn-submit.loading{background:#999999}.btn-loading{display:flex;align-items:center;gap:0.5rem}.spinner{width:18px;height:18px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media (max-width: 500px){.step-shipping{padding:1rem}.id-field{flex-direction:column;align-items:flex-start}.id-field .radio-group{margin-bottom:0.25rem}.id-field .id-input{width:100%}}`;

const StepShipping = /*@__PURE__*/ proxyCustomElement(class StepShipping extends H {
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
    isLoading = false;
    error = null;
    // Form fields - Personal Info
    name = '';
    secondName = '';
    lastname = '';
    secondLastname = '';
    // Identification
    idType = '';
    idNumber = '';
    expirationDate = '';
    // Contact
    phone = '';
    phone2 = '';
    // Business
    businessName = '';
    position = '';
    // Address
    address = '';
    city = '';
    zipcode = '';
    email = '';
    // Existing customer
    existingCustomer = '';
    // Validation
    formErrors = {};
    touched = {};
    // ------------------------------------------
    // LIFECYCLE
    // ------------------------------------------
    componentWillLoad() {
        this.loadStoredData();
    }
    // ------------------------------------------
    // METHODS
    // ------------------------------------------
    loadStoredData() {
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
    formatPhoneDisplay(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }
    handleInputChange = (field) => (e) => {
        const target = e.target;
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
            }
            else if (value.length === 5) {
                this.city = '';
            }
        }
        this[field] = value;
        this.touched[field] = true;
        this.validateField(field);
    };
    formatPhoneInput(value) {
        const cleaned = value.replace(/\D/g, '').slice(0, 10);
        if (cleaned.length === 0)
            return '';
        if (cleaned.length <= 3)
            return `(${cleaned}`;
        if (cleaned.length <= 6)
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    handleRadioChange = (field, value) => () => {
        this[field] = value;
        this.touched[field] = true;
        this.validateField(field);
    };
    validateField(field) {
        const errors = { ...this.formErrors };
        switch (field) {
            case 'name':
                if (!this.name.trim()) {
                    errors.name = 'El nombre es requerido';
                }
                else {
                    delete errors.name;
                }
                break;
            case 'lastname':
                if (!this.lastname.trim()) {
                    errors.lastname = 'El apellido es requerido';
                }
                else {
                    delete errors.lastname;
                }
                break;
            case 'secondLastname':
                if (!this.secondLastname.trim()) {
                    errors.secondLastname = 'El segundo apellido es requerido';
                }
                else {
                    delete errors.secondLastname;
                }
                break;
            case 'idType':
                if (!this.idType) {
                    errors.idType = 'Seleccione un tipo de identificación';
                }
                else {
                    delete errors.idType;
                }
                break;
            case 'idNumber':
                if (!this.idNumber.trim()) {
                    errors.idNumber = 'El número de identificación es requerido';
                }
                else {
                    delete errors.idNumber;
                }
                break;
            case 'expirationDate':
                if (!this.expirationDate) {
                    errors.expirationDate = 'La fecha de vencimiento es requerida';
                }
                else {
                    delete errors.expirationDate;
                }
                break;
            case 'phone':
                if (!this.phone.trim()) {
                    errors.phone = 'El teléfono es requerido';
                }
                else if (!shippingService.isValidPhone(this.phone)) {
                    errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
                }
                else {
                    delete errors.phone;
                }
                break;
            case 'businessName':
                if (!this.businessName.trim()) {
                    errors.businessName = 'El nombre del negocio es requerido';
                }
                else {
                    delete errors.businessName;
                }
                break;
            case 'position':
                if (!this.position.trim()) {
                    errors.position = 'La posición es requerida';
                }
                else {
                    delete errors.position;
                }
                break;
            case 'address':
                if (!this.address.trim()) {
                    errors.address = 'La dirección es requerida';
                }
                else {
                    delete errors.address;
                }
                break;
            case 'city':
                if (!this.city.trim()) {
                    errors.city = 'La ciudad es requerida';
                }
                else {
                    delete errors.city;
                }
                break;
            case 'zipcode':
                if (!this.zipcode.trim()) {
                    errors.zipcode = 'El código postal es requerido';
                }
                else if (!shippingService.validateZipCode(this.zipcode)) {
                    errors.zipcode = 'Código postal no válido para Puerto Rico';
                }
                else {
                    delete errors.zipcode;
                }
                break;
            case 'email':
                if (!this.email.trim()) {
                    errors.email = 'El correo es requerido';
                }
                else if (!shippingService.isValidEmail(this.email)) {
                    errors.email = 'Ingresa un correo válido';
                }
                else {
                    delete errors.email;
                }
                break;
            case 'existingCustomer':
                if (!this.existingCustomer) {
                    errors.existingCustomer = 'Seleccione una opción';
                }
                else {
                    delete errors.existingCustomer;
                }
                break;
        }
        this.formErrors = errors;
        return Object.keys(errors).length === 0;
    }
    validateForm() {
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
    handleSubmit = async () => {
        if (!this.validateForm()) {
            return;
        }
        this.isLoading = true;
        this.error = null;
        try {
            const shippingAddress = {
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
        }
        catch (err) {
            console.error('[StepShipping] Error:', err);
            this.error = 'Error de conexión. Intenta nuevamente.';
        }
        finally {
            this.isLoading = false;
        }
    };
    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    render() {
        return (h(Host, { key: '718b73e1181b51c1b3e711e2e9ad25f78e395697' }, h("div", { key: 'd8af1a7487a33ab08c01ff7d7f34ab65fa643220', class: "step-shipping" }, h("p", { key: 'a42d368e574aab14ca81930a72e8684335975d28', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (h("div", { key: '295254454ef1b074d38b2ca6263baaaacf15d078', class: "error-alert" }, h("svg", { key: 'b280338dc7160a79e4858f7f23f5e8dbf75ff7fb', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '77d376a7a961b5a568b9f257e8585806ba686eee', cx: "12", cy: "12", r: "10" }), h("line", { key: '36cdf8c8efb858d7d729c2e700fa63bb9e33697f', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: '347cbb94e4c4d306b7e7cda3654a40e562ee4b92', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("span", { key: 'f6023ef2714d00c89256680aab9e176529146bc0' }, this.error))), h("div", { key: 'b4b31b93d5e21253a4440f695e471398cadb8c89', class: "form-container" }, h("div", { key: 'd346ce734ea088b5b03c1f4727943cbbed43415b', class: "form-row" }, h("div", { key: '5b0b5e8d8aab86adbfc5d117ef66eb4fae90a64e', class: "form-group" }, h("label", { key: 'b61b9b1238390515b4cd0e9234f80ebf1c7fb81b', class: "form-label" }, h("span", { key: 'ac26adeb50bbd5da4b37642d2f945c4b27c6776e', class: "required" }, "*"), "Nombre:"), h("input", { key: '401badf6a5f1541130473c910e1b4c2115f9a37b', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && h("span", { key: '7fc1b8e118bb03d08deabcd56d52148a15b7247e', class: "error-message" }, this.formErrors.name)), h("div", { key: '2015a6fd830153e630219d2fac495e89f0218d5d', class: "form-group" }, h("label", { key: 'cd71a7559583fae6669c7c70337ec9a3e6c5d5f8', class: "form-label" }, "Segundo nombre:"), h("input", { key: '709901e72f344cb7a455cfa2c3b3cb0eff385d87', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), h("div", { key: 'a3951c5c49dd87283aeb93c081ef3fa401e74a43', class: "form-row" }, h("div", { key: '83e3a20ee3c9c9a9d16508c1d9a6e4e9c9a69a27', class: "form-group" }, h("label", { key: '7b944aacfd5eee6ce766b7809dad5721600c3cf4', class: "form-label" }, h("span", { key: '2ba1aa0d33e0735374809108168a6361349e3de7', class: "required" }, "*"), "Apellido:"), h("input", { key: '2059d5d7977ca24732a7f768c63d098e82af05ab', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && h("span", { key: 'cefe8d589f75acefda1832f21923bf49973eb4d2', class: "error-message" }, this.formErrors.lastname)), h("div", { key: 'cc8d0de7cc17a117281f18cb171f50966807c5b3', class: "form-group" }, h("label", { key: 'adc722b89df8973c4e192ec606feced3dfff9391', class: "form-label" }, h("span", { key: '5b29170455cf28dc3840cea46af49f9a2e7c0110', class: "required" }, "*"), "Segundo apellido:"), h("input", { key: '3054aba92319d3dc2a416a868519226ff19ea47a', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && h("span", { key: '21e64a8ea3c78c9fbd2afb4c36df150ec5caa8b9', class: "error-message" }, this.formErrors.secondLastname))), h("div", { key: '610e56a60267625fd26d21b69468deae26129c59', class: "form-row" }, h("div", { key: '52930f3d8d998db9758e8c76607a1f49632553db', class: "form-group" }, h("label", { key: 'e5dd284ae9eb4853d827012ec22e796fecb562b2', class: "form-label" }, h("span", { key: '17b14b8204f57d7b5c104d4872d5da94509b3e0a', class: "required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: 'd71bb632960d3125c392da5e508029bc6e1983cd', class: "id-field" }, h("div", { key: '99fa7009d036ead87caf5ad2eeaf5573906efc4b', class: "radio-group" }, h("label", { key: 'e444924399dd8c642f20b329e1843b54723a4368', class: "radio-label" }, h("input", { key: '2852138132b113de22bf0b04e51749d0132ecfd6', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), h("span", { key: 'fa298c47cbdbe489d7321f39b1455863f42c33b7', class: "radio-custom" }), h("span", { key: '31383ead591fb73f782404ecf6ecb8a667327d9a', class: "radio-text" }, "Licencia de conducir")), h("label", { key: 'c0811288ed9eba4fb559a162937235cbb4ae255a', class: "radio-label" }, h("input", { key: '2c4e87c56913b4029c083998e3bae1df7485f55e', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), h("span", { key: '4744848d30ecf31c8ed1e9f04e0574c3da0d2f12', class: "radio-custom" }), h("span", { key: '2646a0c2781c18641f1a8e8a9d8172624acf58ba', class: "radio-text" }, "Pasaporte"))), h("input", { key: '1e6bf0f48a23b1e5cd13ec768c009d91bdd02d90', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && h("span", { key: '0986c281e0fb6984e33d41766b92c108fc5c33c4', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && h("span", { key: '31ba68eb5a57314b2f4bfec6c78e719b16a8dfa1', class: "error-message" }, this.formErrors.idNumber)), h("div", { key: 'ae004d8854393bd2aa71f01ec794cba821a052d0', class: "form-group" }, h("label", { key: '8f7867816b2ec18d04c34a0a3f3a56894a732b9a', class: "form-label" }, h("span", { key: 'aad1cd1f664679a91179cd76e75971f471f7ce7a', class: "required" }, "*"), "Fecha de vencimiento:"), h("div", { key: 'db49c6abe2f340b79d0900cedcdb18213eba3ae0', class: "date-input-wrapper" }, h("input", { key: '6335aeb8c9ab02b17da2214f38d2454bf29ef29e', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && h("span", { key: '7233da321a6a8cf89c711b2e42bf13d032726315', class: "error-message" }, this.formErrors.expirationDate))), h("div", { key: 'bd5b7e6fa4da78f2bb4f1432a5e552b4cd6cfc7b', class: "form-row" }, h("div", { key: 'e925a81118095dc618dedde2e3d6b778e559a3e1', class: "form-group" }, h("label", { key: '01b8c67903f8ffa127840607b2f48be8fc1aa32c', class: "form-label" }, h("span", { key: '5be19820108b503f3ffdb68a791841c2149480c2', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), h("input", { key: '44c862ea19da00540cc7323e866e1a81a0ba4c03', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && h("span", { key: '77c8a486d895cad1be3c5dc3d0fac425671dfa7a', class: "error-message" }, this.formErrors.phone)), h("div", { key: 'a1118302c9b1cd1842052c23c7b80a8e509cea78', class: "form-group" }, h("label", { key: 'b9f25472ed8ac5e1ebdb9e9ebabd1b0a0a49f382', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), h("input", { key: '0d702ff4d399eba12c75c7b84ec5efcc9553b16c', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), h("div", { key: 'bc21071f3b3b517fb7d4e372584118745a3a3e48', class: "form-row" }, h("div", { key: '11c673e65a5719b6acc97877324b0f11a31d7dd8', class: "form-group" }, h("label", { key: '924fbbb9683775f6822f4a2f3ac52da5d27554ad', class: "form-label" }, h("span", { key: '1c5efe973cc04643f75b69e8dde754ffc8636f44', class: "required" }, "*"), "Nombre del Negocio:"), h("input", { key: '8cca3452b7d497ac1be3b230e92b0747bf9f389e', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && h("span", { key: '2196e90ebb76aa3eb9117e79d0b6f13bed0bfdf1', class: "error-message" }, this.formErrors.businessName)), h("div", { key: 'e95f64e4859e051a0ef7b604b1b89de74e4e1756', class: "form-group" }, h("label", { key: '352c97731b333a9923993c3a7c890225f1d4d59d', class: "form-label" }, h("span", { key: '027d75ee2b490367739ebab4828548b11b7ef660', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), h("input", { key: 'f27e8ee053c1a737ef057f37c5ff404eeac80df2', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && h("span", { key: '430552ea612a2d8ace1048fcbdeeea4350b14375', class: "error-message" }, this.formErrors.position))), h("div", { key: '460af8c81d52f7915a60fa595f118aaa329f1dd7', class: "form-row" }, h("div", { key: '31dc4d7d955af9fd01728929b5d7e5cd25b942e5', class: "form-group" }, h("label", { key: '11b9433805505e55949fc2bcf07fbe1c7646b8c7', class: "form-label" }, h("span", { key: 'b7e3397f2be9609e0fdce42820b0d3d0cbd19350', class: "required" }, "*"), "Direcci\u00F3n:"), h("input", { key: 'a5eedc981cd7e1226ba5b20b7519bd3e9c4120d2', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && h("span", { key: 'ea6c9df9ef47f6d65271db7f3df4cc834566924b', class: "error-message" }, this.formErrors.address)), h("div", { key: '2764e0bb78417f52f032f3f9df0b9be4a81ba1c9', class: "form-group" }, h("label", { key: '91b25e249954af0de46f64a83d6498ee3727dac9', class: "form-label" }, h("span", { key: 'e91966ffc9dff717b4ebc004afcc9f0af292124a', class: "required" }, "*"), "Ciudad:"), h("input", { key: 'b747dfd09065cd0cc8381b8cea6a939e11a5a552', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && h("span", { key: '5f4f1966d747110bae5bf5612487500fb9fdb495', class: "error-message" }, this.formErrors.city))), h("div", { key: 'fdfd25752bef60d5ab42cf5dfd637158e261c4b9', class: "form-row" }, h("div", { key: 'bc173ee964743bc3325ec45a38362ea635047b77', class: "form-group" }, h("label", { key: '8bb0f1e94e363a48bb3b0758b78e1557a8b28df3', class: "form-label" }, h("span", { key: '87589fb593d56593dc514217336d67e3ed404d05', class: "required" }, "*"), "C\u00F3digo postal"), h("input", { key: '89e366675439a561dedbc2a6abb15af36aa853bb', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && h("span", { key: 'd8f07cef2095cb873a5cfda2de6cb2c9be012b09', class: "error-message" }, this.formErrors.zipcode)), h("div", { key: 'ddb647ea2aaba389684bcf5a703c5f7474e3848e', class: "form-group" }, h("label", { key: '1024047287d92d05d7e56e80d5af59466490645b', class: "form-label" }, h("span", { key: '9897af04d171afc2478e572b6e2032e91e907a32', class: "required" }, "*"), "Correo electr\u00F3nico:"), h("input", { key: '844260ef342d0847d258e07dfcc25ce4d10c5ad1', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && h("span", { key: '5d13f61791d1ed39f1d533ff1e52a2deae7043f3', class: "error-message" }, this.formErrors.email))), h("div", { key: '8d00d54fa241546180c3a2dad060603a85a2e8d1', class: "form-group existing-customer" }, h("label", { key: 'da50fe01eeed25cd83b91d6c94ae2d40d8bff0d9', class: "form-label" }, h("span", { key: 'c4cbdeeb7e12cc0c59c95ac9d8701ba92db883d6', class: "required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: '3249042dcc98fba664ad4d171d18f81bbd6c601e', class: "radio-group horizontal" }, h("label", { key: '0f120999ea298667750ff8cb0f7aaf9ef715544b', class: "radio-label" }, h("input", { key: '6248fa3f13e2453b40bb4b0ae74398f8c1d79dd2', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), h("span", { key: 'eccce11d742e2320ef45d812654e47abca7f7d93', class: "radio-custom" }), h("span", { key: '9f4973483c91c2b6c18fe5f067af379667c4c1c6', class: "radio-text" }, "S\u00ED")), h("label", { key: '65651fd1820ac5a613faa9e82efc3832c1ee1f47', class: "radio-label" }, h("input", { key: '9e4ddf271171fab4a6a12f4f6a01637cc41465ee', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), h("span", { key: '1af4c6c3b1df86972de0025e63727f3095ae5e1a', class: "radio-custom" }), h("span", { key: '09556a5f9f59e00e8e5f932b036fa4e643fd3a4e', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (h("span", { key: 'eafc255a4736ae3cbf877f86333f9a7337f37a99', class: "error-message" }, this.formErrors.existingCustomer))), h("div", { key: 'd81651a8d929f37ffc28d981ef8d504fd776c830', class: "btn-container" }, h("button", { key: '867d0f14a81d15d48762ba12adc2e6e08fbb1f97', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (h("span", { class: "btn-loading" }, h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
    }
    static get style() { return stepShippingCss(); }
}, [769, "step-shipping", {
        "onNext": [16],
        "onBack": [16],
        "isLoading": [32],
        "error": [32],
        "name": [32],
        "secondName": [32],
        "lastname": [32],
        "secondLastname": [32],
        "idType": [32],
        "idNumber": [32],
        "expirationDate": [32],
        "phone": [32],
        "phone2": [32],
        "businessName": [32],
        "position": [32],
        "address": [32],
        "city": [32],
        "zipcode": [32],
        "email": [32],
        "existingCustomer": [32],
        "formErrors": [32],
        "touched": [32]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["step-shipping"];
    components.forEach(tagName => { switch (tagName) {
        case "step-shipping":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), StepShipping);
            }
            break;
    } });
}
defineCustomElement();

export { StepShipping as S, defineCustomElement as d };
//# sourceMappingURL=p-BLYqv0on.js.map

//# sourceMappingURL=p-BLYqv0on.js.map