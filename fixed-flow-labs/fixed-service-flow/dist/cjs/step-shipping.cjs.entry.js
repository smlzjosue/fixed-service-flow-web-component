'use strict';

var index = require('./index-BAqxGv-h.js');
var shipping_service = require('./shipping.service-CxeHNzaD.js');
require('./token.service-B-RtLk56.js');

const stepShippingCss = () => `:host{display:block;width:100%;min-height:100%;background-color:white}.step-shipping{width:100%;max-width:900px;margin:0 auto;padding:1.5rem 1rem}.info-message{font-size:0.875rem;color:#666666;margin:0 0 1.5rem 0;padding:0 !important;background:transparent !important;background-color:transparent !important;line-height:1.5;border:none !important;border-radius:0 !important}.error-alert{display:flex;align-items:center;gap:0.5rem;background:rgb(248.1707317073, 205, 201.8292682927);color:rgb(172.8048780488, 32.5, 22.1951219512);padding:1rem;border-radius:0.5rem;margin-bottom:1.5rem;font-size:0.875rem}.error-alert svg{width:20px;height:20px;flex-shrink:0}.form-container{width:100%}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem 1.5rem;margin-bottom:0.25rem}@media (max-width: 700px){.form-row{grid-template-columns:1fr}}.form-group{margin-bottom:1rem}.form-group.existing-customer{margin-top:0.5rem}.form-label{display:block;font-size:0.875rem;font-weight:500;color:#4D4D4D;margin-bottom:0.25rem}.form-label .required{color:#4D4D4D;margin-right:2px}.form-input{width:100%;padding:10px 12px;border:1px solid #CCCCCC;border-radius:0.25rem;font-size:0.875rem;color:#1A1A1A;background:white;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.form-input::placeholder{color:#999999}.form-input:focus{outline:none;border-color:#0097A9;box-shadow:0 0 0 2px rgba(0, 151, 169, 0.1)}.form-input:disabled{background:#F5F5F5;color:#808080;cursor:not-allowed}.form-input.error{border-color:#DA291C}.form-input.error:focus{box-shadow:0 0 0 2px rgba(218, 41, 28, 0.1)}input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}.date-input-wrapper{position:relative}.error-message{display:block;font-size:0.75rem;color:#DA291C;margin-top:0.25rem}.id-field{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap}.id-field .radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem;flex-shrink:0}.id-field .id-input{flex:1;min-width:150px}.radio-group{display:flex;flex-direction:row;align-items:center;gap:1rem}.radio-group.horizontal{flex-direction:row}.radio-label{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.875rem}.radio-label input[type=radio]{display:none}.radio-label .radio-custom{width:16px;height:16px;border:2px solid #999999;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}.radio-label .radio-custom::after{content:"";width:8px;height:8px;border-radius:50%;background:transparent;transition:background 0.2s}.radio-label input[type=radio]:checked+.radio-custom{border-color:#666666}.radio-label input[type=radio]:checked+.radio-custom::after{background:#666666}.radio-label .radio-text{color:#4D4D4D;font-size:0.75rem;white-space:nowrap}.btn-container{display:flex;justify-content:center;margin-top:1.5rem;padding-top:1rem}.btn-submit{min-width:200px;height:44px;background:#666666;color:white;border:none;border-radius:9999px;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;padding:0 2rem}.btn-submit:hover:not(:disabled){background:#4D4D4D}.btn-submit:disabled{background:#CCCCCC;cursor:not-allowed}.btn-submit.loading{background:#999999}.btn-loading{display:flex;align-items:center;gap:0.5rem}.spinner{width:18px;height:18px;border:2px solid rgba(255, 255, 255, 0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media (max-width: 500px){.step-shipping{padding:1rem}.id-field{flex-direction:column;align-items:flex-start}.id-field .radio-group{margin-bottom:0.25rem}.id-field .id-input{width:100%}}`;

const StepShipping = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
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
        const stored = shipping_service.shippingService.getStoredShippingAddress();
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
            const municipality = shipping_service.shippingService.getMunicipalityByZip(value);
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
                else if (!shipping_service.shippingService.isValidPhone(this.phone)) {
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
                else if (!shipping_service.shippingService.validateZipCode(this.zipcode)) {
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
                else if (!shipping_service.shippingService.isValidEmail(this.email)) {
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
                phone: shipping_service.shippingService.cleanPhoneNumber(this.phone),
                phone2: this.phone2 ? shipping_service.shippingService.cleanPhoneNumber(this.phone2) : undefined,
                address1: this.address,
                city: this.city,
                state: 'PR',
                zip: this.zipcode,
            };
            const result = await shipping_service.shippingService.createAddress(shippingAddress);
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
        return (index.h(index.Host, { key: '3d53f2dcd0aeeed1aebf1b42c0b7e6d568c1efd4' }, index.h("div", { key: 'f43f9d2169c6337003326d500506832bac892035', class: "step-shipping" }, index.h("p", { key: '8ea00953490012efaf583ba85a25ae638dc576e9', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (index.h("div", { key: '2dc2bab2305d749739d96a051dd2a6798d01ba45', class: "error-alert" }, index.h("svg", { key: '40593721cbfbdc1857c1ad18f9879abb625e6805', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, index.h("circle", { key: '9dd52e63b4e08039529c837a8e8e619a3e5657ce', cx: "12", cy: "12", r: "10" }), index.h("line", { key: '3156e6849dd53fede6cf6bedc8db34cfe588bfb4', x1: "12", y1: "8", x2: "12", y2: "12" }), index.h("line", { key: '4ebfb1d319556fec813caabb631019d25a33de10', x1: "12", y1: "16", x2: "12.01", y2: "16" })), index.h("span", { key: '7eadc7c7f8d4747e4519b10cf74ff8e07f2c3979' }, this.error))), index.h("div", { key: 'cfc710da0e76666f262063f6ba388dbdcb1fc36c', class: "form-container" }, index.h("div", { key: '5f2889bb404c625c9b98ab346995157c21dc1980', class: "form-row" }, index.h("div", { key: 'dc9ef69d153ccbd5cb76632798fd7ed5095d4c58', class: "form-group" }, index.h("label", { key: 'd9cc7a4dbd2dc636c7a7afbe36a222d629663e6b', class: "form-label" }, index.h("span", { key: 'd99b8ef1f26941dec23b8eb8ea47fcdb2a507a0d', class: "required" }, "*"), "Nombre:"), index.h("input", { key: '8bc8aebd3a85a60b83e51728d1a171e7029ec189', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && index.h("span", { key: 'd793838d813eee034a49c73f17d5d809063e305e', class: "error-message" }, this.formErrors.name)), index.h("div", { key: '075b7a5bf602e699e833eb8943a32d15adf9ede7', class: "form-group" }, index.h("label", { key: '20230a7a5508acf25b4de6571018fd369b95275a', class: "form-label" }, "Segundo nombre:"), index.h("input", { key: 'a14691e9a91144b196752fe8d3e27fea382fad81', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), index.h("div", { key: 'ac13f5ef6245927c5865c7bb335cc81b236c9bd3', class: "form-row" }, index.h("div", { key: '1b7051b4cb25ebea631de0fc94d7eef022f96dd8', class: "form-group" }, index.h("label", { key: 'a22a44b5791225d3621d2c03eefae960a679b78b', class: "form-label" }, index.h("span", { key: '6ba4f46f144bb0c5c790d8d63a73a0e7c99981b1', class: "required" }, "*"), "Apellido:"), index.h("input", { key: 'fa1ed72ea9d88791acd92281f359b06d07a61ada', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && index.h("span", { key: 'fa7b407fb33907c130bf553376d38867beff3033', class: "error-message" }, this.formErrors.lastname)), index.h("div", { key: 'bbad7f88ecb21724b3a5f85970832b0dc6933f0d', class: "form-group" }, index.h("label", { key: '804919cebe76696380b2b3dabacd0732ece9fbf1', class: "form-label" }, index.h("span", { key: 'ea10aac938d0bbefd5dbe8e8b1c8e2211aa26bd1', class: "required" }, "*"), "Segundo apellido:"), index.h("input", { key: 'c9c76e0bd4572fe5481a6ee06fb3e8cc8b7667ac', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && index.h("span", { key: 'b6ed1365d153bab9cc1849706368f3f818278e22', class: "error-message" }, this.formErrors.secondLastname))), index.h("div", { key: 'a8c5b3a385e5a2132c6e715764e39a6622cb8ab4', class: "form-row" }, index.h("div", { key: 'ad96c30771b4316648ee96190e777fff22a3582c', class: "form-group" }, index.h("label", { key: '89d75050f487cfbd78a66cadfc284e72c87c163f', class: "form-label" }, index.h("span", { key: 'eaf90ece225c5418fdb1919126b8b486d8101f44', class: "required" }, "*"), "Identificaci\u00F3n:"), index.h("div", { key: '51e81598d1fd5465f925728112a2c8f039dbea72', class: "id-field" }, index.h("div", { key: 'ddc2e70ca3958db8888eb361d4a34a0a9626e8fb', class: "radio-group" }, index.h("label", { key: '708c91ba59ea237bc75cc32dd79297ae2b193e46', class: "radio-label" }, index.h("input", { key: 'df03013f258a3dadeccf3cf6e860db5621bd9283', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), index.h("span", { key: '245594ed2d01924043053d6070540ddf3f6cd9ad', class: "radio-custom" }), index.h("span", { key: '1d53513b9e13ea01ef29357e23492f10a921a059', class: "radio-text" }, "Licencia de conducir")), index.h("label", { key: '101bf99a6b67ab05b277c4d219fff723e85c3c81', class: "radio-label" }, index.h("input", { key: 'f800f0b3b1812634797f3a07fbcc7b2007637fdb', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), index.h("span", { key: 'fcfc8f7af21dad057b0374dfca1a763027f02b62', class: "radio-custom" }), index.h("span", { key: '496bc91a62e2e339ea428ba9978da9214625a30c', class: "radio-text" }, "Pasaporte"))), index.h("input", { key: 'f8ac9356a554573fba30a953da21e254553d4154', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && index.h("span", { key: 'af5dff38d768c674443670b7ffa2fd08f0e1d55b', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && index.h("span", { key: '249c68f2d8466248ac2b710ac472b2322097bffb', class: "error-message" }, this.formErrors.idNumber)), index.h("div", { key: 'e99efcb01e68a99c84c5f3bcd3ec606ffc269add', class: "form-group" }, index.h("label", { key: '981f911ba3e950d211230d15f6c3421f8dbe0679', class: "form-label" }, index.h("span", { key: 'e9284e724f91aac393255bde0e710b72112af0f7', class: "required" }, "*"), "Fecha de vencimiento:"), index.h("div", { key: 'd70aefcfb90a087b66413c537494070e8070b9a4', class: "date-input-wrapper" }, index.h("input", { key: 'e98b89c7c2c8a009107bb39135072f4d2d8f45f0', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && index.h("span", { key: 'e9b6199b9fc2a12e083c5a047b847f461c654b98', class: "error-message" }, this.formErrors.expirationDate))), index.h("div", { key: '95f1fb7aeca7e446d5e7e29cf8f2af0f7c323310', class: "form-row" }, index.h("div", { key: '86d3eb2d1d87a14733b63f07c4adbe26557cc806', class: "form-group" }, index.h("label", { key: 'cd7426abe12baa9eb0106a32f0a4fb7e80f28c5f', class: "form-label" }, index.h("span", { key: 'eabee32c031b1444b65f14bd6812216fb45003ce', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), index.h("input", { key: '8723bee3451a35d86f62f3e7e772861d07ed84ea', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && index.h("span", { key: '1fc4bc0b791cb145d08d27b701d9b645feba7389', class: "error-message" }, this.formErrors.phone)), index.h("div", { key: '2c12cf53628662524b90f012548bc83b48956f4d', class: "form-group" }, index.h("label", { key: '731ae2c0cb5ee0b62797ace0e072fec869b512a5', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), index.h("input", { key: '0c02df17ebec9a417e405085b36d7546da210792', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), index.h("div", { key: '65bb35b563fc636f01e370199d7a791f08121afb', class: "form-row" }, index.h("div", { key: '595727c27d6277902cbe892758e11331dd3fbb84', class: "form-group" }, index.h("label", { key: '21ca00fdcc153fee8fa5c69e2584385867c64cf0', class: "form-label" }, index.h("span", { key: 'de9b0899b49be9e1a6c85c95fc40a4ddcdfb1aec', class: "required" }, "*"), "Nombre del Negocio:"), index.h("input", { key: 'c82015d9a158c1dd007825daf217c11c477b8b67', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && index.h("span", { key: 'be917bf7a0cea7d7a48ef7d5d8185c7fc55b1e74', class: "error-message" }, this.formErrors.businessName)), index.h("div", { key: '25bb49e10297503da66f4c5e94599566a3d32868', class: "form-group" }, index.h("label", { key: 'bc14aa86829cd8293011537abd19936ca125f6a8', class: "form-label" }, index.h("span", { key: '3468204ee91cfd97a48e3bd83812a507347be9ca', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), index.h("input", { key: '206183c0b6dbbebc0a2868f506d1d2b32a56bb36', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && index.h("span", { key: '09be006e684ea4beeec3c8a77b32c4e043ea0dc8', class: "error-message" }, this.formErrors.position))), index.h("div", { key: 'd0a92aca0db6c855c02aba4e08560a8c13a33802', class: "form-row" }, index.h("div", { key: 'f8437d92513779f3a84375448854fdc5f9eb18b8', class: "form-group" }, index.h("label", { key: '602d74b1c49ed364666419070a23811f380d5549', class: "form-label" }, index.h("span", { key: '66567b272b015ec6b8df0200b9096f156cde134d', class: "required" }, "*"), "Direcci\u00F3n:"), index.h("input", { key: 'f83274400b462008a0d1ab62c100ec8da3aabbc4', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && index.h("span", { key: 'f729657722e3c3d6a9bd2eb4429343f8d301b78d', class: "error-message" }, this.formErrors.address)), index.h("div", { key: '1a7cb6a53aaaa925cc4331711b542527f0544a13', class: "form-group" }, index.h("label", { key: 'ab0b10529d8919c6d4f17e4c45c945f9a9915491', class: "form-label" }, index.h("span", { key: '74543450bf890c589fbf8da7b43bf2c399a48231', class: "required" }, "*"), "Ciudad:"), index.h("input", { key: '70199602938fbdc4a15df6755112c449c351fb60', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && index.h("span", { key: '69241b89abd00855208192405b76a6e05394f6c7', class: "error-message" }, this.formErrors.city))), index.h("div", { key: 'b7ae00cc48dbb521cdd92f52b6865b78b8c2649c', class: "form-row" }, index.h("div", { key: 'ce582aa6120f42c8030773ec73df017104f8ee42', class: "form-group" }, index.h("label", { key: '8cfde13f059feabaf92cb63a10d12bd6ea272267', class: "form-label" }, index.h("span", { key: 'ca360700c68cd3f92f0a05b34fa257550022889c', class: "required" }, "*"), "C\u00F3digo postal"), index.h("input", { key: '82769e359dd09fbc34d46f3f67942232fb2d2923', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && index.h("span", { key: '4b79f6510d4c2e55cbef7d539bc0a27a5691c70e', class: "error-message" }, this.formErrors.zipcode)), index.h("div", { key: '5df9ce944a644ec0765139d45c36f13f00856474', class: "form-group" }, index.h("label", { key: 'cee0bd80b96cf37667c42d3c2025141b41d38b77', class: "form-label" }, index.h("span", { key: '6822ac1f6cd6f06b497704559a801355111f5531', class: "required" }, "*"), "Correo electr\u00F3nico:"), index.h("input", { key: 'b6ba5bc6e2ed5e9807e8a9a6b55c3a93885c9b52', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && index.h("span", { key: '3051f8ed00ec8f6f3f8b8a45327f77cdf8c6bc79', class: "error-message" }, this.formErrors.email))), index.h("div", { key: '905c1825e3b737d8fdbf6d40f089d5a33e7de36e', class: "form-group existing-customer" }, index.h("label", { key: 'e464ac761eca1f93162a3cc660027737c0ab6227', class: "form-label" }, index.h("span", { key: '5f6d75faa5231e45c5c6fa21b9ebed5e5f772047', class: "required" }, "*"), "Cliente existente de Claro PR:"), index.h("div", { key: '48a55a518a5c8f441aa35b61512b592f59bca4d7', class: "radio-group horizontal" }, index.h("label", { key: '1f8b9a94e03865098b3ff6e41cbea0aeefc4db3e', class: "radio-label" }, index.h("input", { key: 'ba7b79f2fbe0b4f092916e2669c848206f123547', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), index.h("span", { key: 'fd106f2bd2d6bee4f33c9771e2eadccb334e99bc', class: "radio-custom" }), index.h("span", { key: '7f4e9ed18e1d361e88d550115eb2548d8dbd004c', class: "radio-text" }, "S\u00ED")), index.h("label", { key: 'f8746e37aecd9894c9a682d483c883e9ce2c5b1e', class: "radio-label" }, index.h("input", { key: '6338fca2e2be0519ea189297836e1bd50621284d', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), index.h("span", { key: 'e627f878172fe5a14e55bf905e70f00ff09e7c41', class: "radio-custom" }), index.h("span", { key: '5746ce238fa2fb23d152ade0765130ba8fe43fde', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (index.h("span", { key: '73195b38f26b398ea75c96cd1f89b9571037dfea', class: "error-message" }, this.formErrors.existingCustomer))), index.h("div", { key: '15e28dbfa8a489de11af26dc9f4d4c1ada0bca67', class: "btn-container" }, index.h("button", { key: 'f7639e45d0e4fb9dbdce49a26d3443d140d57b47', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (index.h("span", { class: "btn-loading" }, index.h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
    }
};
StepShipping.style = stepShippingCss();

exports.step_shipping = StepShipping;
//# sourceMappingURL=step-shipping.entry.cjs.js.map
