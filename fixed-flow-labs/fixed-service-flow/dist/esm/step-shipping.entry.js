import { r as registerInstance, h, H as Host } from './index-CYQeQM-n.js';
import { s as shippingService } from './shipping.service-HG5G08q9.js';
import './token.service-B9M544XN.js';

const stepShippingCss = () => `:host{display:block;width:100%;min-height:100%;background-color:white}.step-shipping{width:100%;max-width:900px;margin:0 auto;padding:1.5rem 1rem}.info-message{font-size:0.875rem;color:#666666;margin:0 0 1.5rem 0;padding:0 !important;background:transparent !important;background-color:transparent !important;line-height:1.5;border:none !important;border-radius:0 !important}.error-alert{display:flex;align-items:center;gap:0.5rem;background:rgb(248.1707317073, 205, 201.8292682927);color:rgb(172.8048780488, 32.5, 22.1951219512);padding:1rem;border-radius:0.5rem;margin-bottom:1.5rem;font-size:0.875rem}.error-alert svg{width:20px;height:20px;flex-shrink:0}.form-container{width:100%}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem 1.5rem;margin-bottom:0.25rem}@media (max-width: 700px){.form-row{grid-template-columns:1fr}}.form-group{margin-bottom:1rem}.form-group.existing-customer{margin-top:0.5rem}.form-label{display:block;font-size:0.875rem;font-weight:500;color:#4D4D4D;margin-bottom:0.25rem}.form-label .required{color:#4D4D4D;margin-right:2px}.form-input{width:100%;padding:10px 12px;border:1px solid #CCCCCC;border-radius:0.25rem;font-size:0.875rem;color:#1A1A1A;background:white;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.form-input::placeholder{color:#999999}.form-input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 2px rgba(0, 151, 169, 0.1)}.form-input:disabled{background:#F5F5F5;color:#808080;cursor:not-allowed}.form-input.error{border-color:#DA291C}.form-input.error:focus{box-shadow:0 0 0 2px rgba(218, 41, 28, 0.1)}input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}.date-input-wrapper{position:relative}.error-message{display:block;font-size:0.75rem;color:#DA291C;margin-top:0.25rem}.id-field{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}.id-field .radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem;flex-shrink:0}.id-field .id-input{flex:1;min-width:150px}.radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem}.radio-group.horizontal{flex-direction:row}.radio-label{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.875rem}.radio-label input[type=radio]{display:none}.radio-label .radio-custom{width:16px;height:16px;border:2px solid #999999;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}.radio-label .radio-custom::after{content:"";width:8px;height:8px;border-radius:50%;background:transparent;transition:background 0.2s}.radio-label input[type=radio]:checked+.radio-custom{border-color:#666666}.radio-label input[type=radio]:checked+.radio-custom::after{background:#666666}.radio-label .radio-text{color:#4D4D4D;font-size:0.75rem;white-space:nowrap}.btn-container{display:flex;justify-content:center;margin-top:1.5rem;padding-top:1rem}.btn-submit{min-width:200px;height:44px;background:#666666;color:white;border:none;border-radius:9999px;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0 2rem}.btn-submit:hover:not(:disabled){background:#4D4D4D}.btn-submit:disabled{background:#CCCCCC;cursor:not-allowed}.btn-submit.loading{background:#999999}.btn-loading{display:flex;align-items:center;gap:0.5rem}.spinner{width:18px;height:18px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media (max-width: 500px){.step-shipping{padding:1rem}.id-field{flex-direction:column;align-items:flex-start}.id-field .radio-group{margin-bottom:0.25rem}.id-field .id-input{width:100%}}`;

const StepShipping = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h(Host, { key: '93fa19bea70235a684d2946dc0d7875c4b606f7a' }, h("div", { key: '572c75afbd932ff6e30185e090d3eebdad3d258e', class: "step-shipping" }, h("p", { key: '2f0d858ec387193f5c52f20d0f004dca478088f8', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (h("div", { key: 'f16a1dd64fe60554e8ec7c2e6e192c4f30ab2367', class: "error-alert" }, h("svg", { key: '977801c1429084572cb8b1f54dfc6c70526ed7b1', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: 'f0339ff53e8436017cdc5da4aecd20ac49448495', cx: "12", cy: "12", r: "10" }), h("line", { key: '29584c7f86d576632dfca487fa75558708fdbba7', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: 'db7e0411eaa95fbdf7b6498edabcabe4e06def8e', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("span", { key: 'ae2b6993ae5019d748ac5f61eb3dbacb03744c02' }, this.error))), h("div", { key: '64c5e1256282f88e0e22fe8193ac9619d9f251ea', class: "form-container" }, h("div", { key: '86a492c31c0a1b8b8b20165ed37ebccbb03fe9b7', class: "form-row" }, h("div", { key: '3911eed77c66b7df2089726b340bb4d52fdb0038', class: "form-group" }, h("label", { key: '32c1f01954a2d1f18b9240282cd3e13a96d1982e', class: "form-label" }, h("span", { key: 'b47441211e355bc3b7a2508249b7d28f37393713', class: "required" }, "*"), "Nombre:"), h("input", { key: 'a6ea3617e9fc6d856740a7d6da66eb675c367753', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && h("span", { key: '3a324ca9ae407b8b40a5f00e395e7d38c93607d2', class: "error-message" }, this.formErrors.name)), h("div", { key: '860ff2be3f1691ec72faa4aa0dafcdba2590a14d', class: "form-group" }, h("label", { key: 'aeae319d569d9f31b3b747d5376b113205fdb404', class: "form-label" }, "Segundo nombre:"), h("input", { key: '723b80a3f88b3204decf9133dbf97ba9bcad1fe5', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), h("div", { key: 'c4d062952143cb3f795f64b434dfa734f2123962', class: "form-row" }, h("div", { key: 'a94ede111dca24801c6512cc76fd1c68647f2254', class: "form-group" }, h("label", { key: '7f4d2249ff996fdf3233a2de8d5301899a00f063', class: "form-label" }, h("span", { key: '637ad3eb4afbf66a37e248448494f861f8098934', class: "required" }, "*"), "Apellido:"), h("input", { key: 'fdeb88e3ae966b935e373177e352c0967596f48f', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && h("span", { key: 'bc4f499d3ca47a9d40e2dbc19c14c736ab4d8c38', class: "error-message" }, this.formErrors.lastname)), h("div", { key: '3e035d8d0dbcb78d6e25f89718003b134b661d50', class: "form-group" }, h("label", { key: 'a4243cffd0f7a34f5d805eea981085d3f12c88b4', class: "form-label" }, h("span", { key: '1b3a2c782d5cc6fcc080d7e280b68bb7d22690d4', class: "required" }, "*"), "Segundo apellido:"), h("input", { key: 'c0024a126b87447df0580cc31f2f8fae240fe292', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && h("span", { key: '21594f77e96aedcc4bfbf6f1c1abd3f061363e14', class: "error-message" }, this.formErrors.secondLastname))), h("div", { key: '7d818f8b1e8c2322ac4f2b305681a25943f3b9f7', class: "form-row" }, h("div", { key: '7205d6d05e5fb70363cb9b1f6341590cc9c6b2e5', class: "form-group" }, h("label", { key: 'e3fa15be72b94623feea5f3028fa15d8a4470007', class: "form-label" }, h("span", { key: 'a4e15c76fa645e92609817e42a06b036f713b49b', class: "required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: 'a2903f8531be34c7ee125c9baa1838f29f11b91d', class: "id-field" }, h("div", { key: '566716c3671ca17f9329d5cc5f688416f534caad', class: "radio-group" }, h("label", { key: '3297a05852e4abd58059a98dc12556b7ab932f1a', class: "radio-label" }, h("input", { key: '7229e3e647c8fe69f05e828c057bacae7af24b99', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), h("span", { key: '882a15d1d74a8726e32e27c9e728690111a9b40d', class: "radio-custom" }), h("span", { key: '905cb19231827164a4e87c4888514d9b5fd513c4', class: "radio-text" }, "Licencia de conducir")), h("label", { key: 'e8188546d3ad08f14bd8d484a30e1468a0ad9180', class: "radio-label" }, h("input", { key: '3e7326fd217d4c9bfee16547d32049167e8239ab', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), h("span", { key: '274cbcf66425e546a1abd8fb84b1c583000c3f70', class: "radio-custom" }), h("span", { key: '765b416183219af154a5c3c4782ec9bd529da882', class: "radio-text" }, "Pasaporte"))), h("input", { key: '464431456003ec4d60dd49bff26b998c1a6a68d4', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && h("span", { key: '07b3c661ea1afa9e21a11b4749eadc905119d031', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && h("span", { key: 'd21ce6000719d3b28c2897c7b79274e1f2e29f53', class: "error-message" }, this.formErrors.idNumber)), h("div", { key: '1d7102cd1b4bc15066b8cc241b8e75a27807473f', class: "form-group" }, h("label", { key: '8a74cc86fe581429396fe912f544e1b2573c1433', class: "form-label" }, h("span", { key: '1d075f98fda55e4cf0f5bf603c306358903eaec0', class: "required" }, "*"), "Fecha de vencimiento:"), h("div", { key: '07275500c1fbae638ee7e4304b88bb5812d33327', class: "date-input-wrapper" }, h("input", { key: '7e55870ffd04a48178618dec07ac80a68d3c6001', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && h("span", { key: '6c041f1f61d17d00485d745ce4d042fd5b44d0a2', class: "error-message" }, this.formErrors.expirationDate))), h("div", { key: 'a8c83e187e0d1b95947cb2c8fe165e7a2c159ff5', class: "form-row" }, h("div", { key: 'da14df27efba51540485811f1c58b6effd8c493a', class: "form-group" }, h("label", { key: '0c9793f61559adfdcbdbba8cd1e149a62834d8c8', class: "form-label" }, h("span", { key: '757e24849d34c2624d946c76629d5203e9cbdc4f', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), h("input", { key: '46bb760c62590140c0517cba8a327dbefbe17e82', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && h("span", { key: '4713cb3a07b83d2528b060c4908457154ef323fc', class: "error-message" }, this.formErrors.phone)), h("div", { key: 'f670c9d802a2b02118c3e196fe64f668f98debb1', class: "form-group" }, h("label", { key: '4bf7b0f239874291e7e47924c05080994dad3270', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), h("input", { key: 'e5986512e0fbc75e95d751225a7b966ec8c41bf7', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), h("div", { key: 'e51761623a1dba81fc9a5aefad9a73df8d6b2fcf', class: "form-row" }, h("div", { key: '4a49659bc9d81b5a4cfce625a4cc5386c59615b3', class: "form-group" }, h("label", { key: 'f9dc06d8bb72946b6e69bfcebbb5fbcaa03e915f', class: "form-label" }, h("span", { key: '76bb25232a00d8988e9549fc7f9c11d36b54dfa6', class: "required" }, "*"), "Nombre del Negocio:"), h("input", { key: '497fb3dd9e2660ef48671694dae90b64e45709cf', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && h("span", { key: 'a1a3e4642445dee7936bcf4af326ab32ab46a3e8', class: "error-message" }, this.formErrors.businessName)), h("div", { key: 'd8c5ddfd7205023cffb453e08621d32817be6414', class: "form-group" }, h("label", { key: '14e596a28ef7bf1b968da27ba84ae127abc6ea27', class: "form-label" }, h("span", { key: 'efe8e80664cbbfe6c5a7741e07e4ce9e1b14bab7', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), h("input", { key: '33fd36cd2c5d9342bf9da33a92986d489ffce151', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && h("span", { key: '896a4f02feaf873aed7f08cdefbe22dfed2dfa34', class: "error-message" }, this.formErrors.position))), h("div", { key: '7a34b640ce9a0d6247688a3281e86d91662b417c', class: "form-row" }, h("div", { key: '8d0a393a10b0c3a47647abacafe034127205198f', class: "form-group" }, h("label", { key: '754d085067cffeb0837f21c82be45019994c48ef', class: "form-label" }, h("span", { key: '467ea826773d7628ff56c90a8596ecdcdb9e581a', class: "required" }, "*"), "Direcci\u00F3n:"), h("input", { key: '5f3ab1e22a27fff5787df2c1868a18a317f33e5b', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && h("span", { key: 'c415fb5cb5e7d3b1ef3d8f496414e6a504e868d4', class: "error-message" }, this.formErrors.address)), h("div", { key: '568a1e9910366b36457e4434d2c0a51a0baef2c5', class: "form-group" }, h("label", { key: '381456ed4862d8a23b03195d655d403003c61057', class: "form-label" }, h("span", { key: '5e579e18722c195b5c256701c9a1632bac1809e0', class: "required" }, "*"), "Ciudad:"), h("input", { key: '3f5bf9f27bcf8d9710d001f223d79f09ecb86cd3', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && h("span", { key: '89770f19aeff36ab49583d09a628cd8662e00954', class: "error-message" }, this.formErrors.city))), h("div", { key: '25fef4a2300af89c452018ba194db6c3d500e1ed', class: "form-row" }, h("div", { key: '7bc86c5001e6cbb60e6e974ef199f324da799dea', class: "form-group" }, h("label", { key: '635869f101080a22580aee163267c0d180dc2290', class: "form-label" }, h("span", { key: 'd278535c7f7f6af8d1aa1188934b9335887a1e96', class: "required" }, "*"), "C\u00F3digo postal"), h("input", { key: 'f368177a00944cfcbe2d00e943928b4bd8a3414c', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && h("span", { key: '88fe3bfb10ad9b999ace83112fc84d75da3c5491', class: "error-message" }, this.formErrors.zipcode)), h("div", { key: '8103f7d9ce3374c8bd115a2b1edd3aac12b69576', class: "form-group" }, h("label", { key: '3eaedd6bb64aa77a8d2265d2c92f76c39e0301f5', class: "form-label" }, h("span", { key: '31ed86ace9e8087ce1937582c8f301e6553e97de', class: "required" }, "*"), "Correo electr\u00F3nico:"), h("input", { key: 'd15b21835f67d56bc0b023c28855354e5001e3c3', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && h("span", { key: 'cc23ce6537d37c4f9dc27c775b1cb24dce144352', class: "error-message" }, this.formErrors.email))), h("div", { key: 'f8b87c06ec832404e71707d0497efb9bbc4b6fea', class: "form-group existing-customer" }, h("label", { key: 'c0d41140fd77553ccd04e2617cfd33608b79cc79', class: "form-label" }, h("span", { key: '509de2cc7c58ec9b6a2a2c1c488b2704d36d13e9', class: "required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: 'db7eb175e377383dfcd803174ba64f02d578c798', class: "radio-group horizontal" }, h("label", { key: '28da88c9be6eecfb34cc5a4165c63474374862a7', class: "radio-label" }, h("input", { key: 'ba946f92b2bf95d5ac05bbebe739d3f6ee42f232', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), h("span", { key: '558a204ee500ece7372d760b6cebb82669768aeb', class: "radio-custom" }), h("span", { key: '3001a6109781e1f7a1484252fa1b146b4db33973', class: "radio-text" }, "S\u00ED")), h("label", { key: '8bfdbbd93757b6b9a3772549dc522bac03449ced', class: "radio-label" }, h("input", { key: 'd644c5f495569715f6e9275b2f221a6141c8bd0c', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), h("span", { key: '022531c1a1bdfa0a7a87f00306d9bc51d6aaab68', class: "radio-custom" }), h("span", { key: 'd657c42235f5dd9fafea7b36e810adb5cd7fc941', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (h("span", { key: 'd6e370fcdbe2ec86e409765ea02c1b4ab805fbea', class: "error-message" }, this.formErrors.existingCustomer))), h("div", { key: '5bd07826371f65f1626a8b19c869666f05e3fd89', class: "btn-container" }, h("button", { key: '21d5a602a4a2b97e0c99b19733c1f2ff4ac15eb4', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (h("span", { class: "btn-loading" }, h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
    }
};
StepShipping.style = stepShippingCss();

export { StepShipping as step_shipping };
//# sourceMappingURL=step-shipping.entry.js.map
