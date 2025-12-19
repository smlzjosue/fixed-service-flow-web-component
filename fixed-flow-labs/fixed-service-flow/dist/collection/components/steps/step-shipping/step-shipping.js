// ============================================
// STEP SHIPPING - Delivery Address Form
// Fixed Service Flow Web Component
// Design based on datos-envio.png reference
// ============================================
import { h, Host } from "@stencil/core";
import { shippingService } from "../../../services/shipping.service";
export class StepShipping {
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
        return (h(Host, { key: 'c07553bdbaa3372ca94591fb13dd23ca919fd7cd' }, h("div", { key: '4ed5a61e3b9453c946c1ee251c7af433632b1a47', class: "step-shipping" }, h("p", { key: '56af6226a93d1b721250595712dc9ae388fe6352', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (h("div", { key: 'ade2b1dde278061611862e1935b593d74aa18a08', class: "error-alert" }, h("svg", { key: '36b884150ff4815eaae6f5b8e8b8d9cde3febcbe', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: '2c90b3776ae3c35643ee0384436e174f198fa84a', cx: "12", cy: "12", r: "10" }), h("line", { key: 'a13513e527287809096b473428adc9eb620306a1', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: 'f1ead6eed9d8e258952321364ee504f3ea8a90b6', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("span", { key: 'edc327fe90f09aea6b449ea1d85e4212921826e6' }, this.error))), h("div", { key: '8ca4e304db4fe381fcb3908f3cde5fb4b74141ac', class: "form-container" }, h("div", { key: '76cb518d3b890f3a122bf78a9d90e46781bf41b7', class: "form-row" }, h("div", { key: '7ae1d427963f6387bda0696f5eab053fe40722d5', class: "form-group" }, h("label", { key: 'd6a23ccea5367a19035116b16c7bda1e9de09fe5', class: "form-label" }, h("span", { key: '99de19d5c3dde6c267a513c55d582dd0f7bf5410', class: "required" }, "*"), "Nombre:"), h("input", { key: 'ac5dfa6dff61b5e4b3e8abd308b94d2a0fd46144', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && h("span", { key: 'f7a28376fc546336a36f5d12d80c094dd60d9e2c', class: "error-message" }, this.formErrors.name)), h("div", { key: '8deff41d097263f18f578d84c6b40b1c69982bf4', class: "form-group" }, h("label", { key: '41400f13d2bdaa85480b155d07e193eb980001a2', class: "form-label" }, "Segundo nombre:"), h("input", { key: '67573cc53af5d658c7b705c8f2ea47f387e9ea83', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), h("div", { key: '7edcd4d93e14526ba432d9b4d21846b04f140596', class: "form-row" }, h("div", { key: '16520203d44a9f23a04bd93fd1445dedd8e24978', class: "form-group" }, h("label", { key: '3dfae7e516e9798cdb460c580fc7442f46fdfc75', class: "form-label" }, h("span", { key: 'da03d5edba574af10137aa40fdd40214e7426ec2', class: "required" }, "*"), "Apellido:"), h("input", { key: '68fbc627ed84ab9695b135ade5ab0335009d1bf7', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && h("span", { key: 'c63dda9d8efb56c73b0fb294c8882363b45453e3', class: "error-message" }, this.formErrors.lastname)), h("div", { key: '20b2308f610fe8f7ffac7c83b467fbf9830bd29c', class: "form-group" }, h("label", { key: '32c03703d5089dfbaea81bc13b10f99f30cb505c', class: "form-label" }, h("span", { key: '5b26734a7289e0f7bdbd7f12c0a58f2454c6b90a', class: "required" }, "*"), "Segundo apellido:"), h("input", { key: '16118423cb334b85379553359d25e44324cbf02d', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && h("span", { key: 'aa062fa68bc1b44be0ed56e8450dc09c7ccb940c', class: "error-message" }, this.formErrors.secondLastname))), h("div", { key: 'f32bda48060872b868097b663299e218f8db2344', class: "form-row" }, h("div", { key: '91e11d90e279c45d57716ad7e57a8ff101f7f5eb', class: "form-group" }, h("label", { key: '90ce229b347974b7d5f5e7f834b78c899fe2d3f2', class: "form-label" }, h("span", { key: '3ab365d6756c952d10f70a3e31d4a692b042c32a', class: "required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: 'b2bcd6c4a185f30664e9a46c5c4068d2a0bf601a', class: "id-field" }, h("div", { key: '1851ff3305e49e344208e49e99a7276f7c779b91', class: "radio-group" }, h("label", { key: '5a7954738f7ea0f896e4a38afd431f1beb14b176', class: "radio-label" }, h("input", { key: 'ef932dd61bcc37c75519c3d1e0505bfa1fed4f38', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), h("span", { key: '3a7b8f96a9b321d135d54f8e35a108f22c3d6c55', class: "radio-custom" }), h("span", { key: 'd890af48f323ab67b6b254a48a92f9b099a1d930', class: "radio-text" }, "Licencia de conducir")), h("label", { key: '01670f605ec76a8386116b88048db54973be8d47', class: "radio-label" }, h("input", { key: '573798d590a46ee6c83178a71fdbe68c4baac8cf', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), h("span", { key: 'bcb4e2dc3fdb8bacfe86f04a508c10a42ff9903d', class: "radio-custom" }), h("span", { key: 'aee5b52e256597d9414f08ad49977be65ac07d3c', class: "radio-text" }, "Pasaporte"))), h("input", { key: '1c388b898cfa13659b04abd6892faee39b0df6d1', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && h("span", { key: 'b2427fffb3a111384d5c946b6f6e2aeec279129f', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && h("span", { key: '05d4b92beacd9b41c9f9de3b047c92633a9d8b3a', class: "error-message" }, this.formErrors.idNumber)), h("div", { key: '3821bcea062c63dcddf5626071d3690238192c6f', class: "form-group" }, h("label", { key: '52be2efd130820f13f057229923732e31d7050b7', class: "form-label" }, h("span", { key: '28e1d4c8c838235d3ab7b58feefc339570106081', class: "required" }, "*"), "Fecha de vencimiento:"), h("div", { key: '103969c96a32758608896967caff011b148fdf5f', class: "date-input-wrapper" }, h("input", { key: 'bf9e5b53ee5cfb8df18ff8dbd9b60572f9b764bb', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && h("span", { key: '311fb163a8c986be979d998e17b3870b512901e9', class: "error-message" }, this.formErrors.expirationDate))), h("div", { key: '111588d4c1726e20a2b9783b4d08d52e97147ec2', class: "form-row" }, h("div", { key: '986224ced53c65a7144b1da6c0c3be98ca295156', class: "form-group" }, h("label", { key: '2d9fd90d956b0c5e2f0bf2395bbbd423c6a4aac7', class: "form-label" }, h("span", { key: 'd840a52b6d6cdd7e3133672b2e692e2cbdc7cccb', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), h("input", { key: '693860bdf028bef79ea5c09c03466a0f3b47159f', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && h("span", { key: 'ff7b3ea2c2ca470c122e923f9b91c8c6e4c0fec5', class: "error-message" }, this.formErrors.phone)), h("div", { key: '2155e49b260846cfb8327b8461f2718b7b49674a', class: "form-group" }, h("label", { key: 'bc1854ca36aa98dc5292eafea366350b0ecdc80f', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), h("input", { key: 'ba461ffe0cf3a2048f44ff2428f0537361fc098c', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), h("div", { key: '2e2f49470951085e9bf8c4ed38e8460dae7b9156', class: "form-row" }, h("div", { key: 'f60814966ea372a28cbabbbbc4b41ba3af10a21e', class: "form-group" }, h("label", { key: 'c71e46f2f78573c923a25960789910f370c27ce1', class: "form-label" }, h("span", { key: '11bb1896bb6915efc677b3ce754049468c8f7cdf', class: "required" }, "*"), "Nombre del Negocio:"), h("input", { key: '969838eae6fc87103469153f0e5f2c5083271179', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && h("span", { key: '9646b721d08f29cde95cf78dbc1001abb934836d', class: "error-message" }, this.formErrors.businessName)), h("div", { key: 'd45bd7f5cca0a2ad58df815d756d60cb4b38e7f9', class: "form-group" }, h("label", { key: '71734e73b70775a0c7d22b699ff4a5e3056da0b6', class: "form-label" }, h("span", { key: 'efe7dee11cf6da58edef0e55fd819bfef1df73e4', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), h("input", { key: '13aacdcbe0fba647b8089bf9501b6876d8c07d62', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && h("span", { key: 'a76d5d2ecc698e2d5c2213825a57d8f97f1a450f', class: "error-message" }, this.formErrors.position))), h("div", { key: '6532f090127fa795374ca8de3d5e0d13f2207289', class: "form-row" }, h("div", { key: '1c61342e3a30ca3b2c6e11e207a041d4d99ee031', class: "form-group" }, h("label", { key: '8a9ad21933e56287f96c2ae34452852eeb578aa4', class: "form-label" }, h("span", { key: 'c55ed9cbacc909c8f7381d152407ad090ca8289d', class: "required" }, "*"), "Direcci\u00F3n:"), h("input", { key: '7de7c7e9a8e765dedb2ed471dbfc172b98825d03', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && h("span", { key: '79b209b7c6af74362fc467965feafd62a0a3120e', class: "error-message" }, this.formErrors.address)), h("div", { key: '4dda998d4b27d4917ba9863bae3d07515f1b0f53', class: "form-group" }, h("label", { key: '4f8a2929520eeeebd71c908b86e0f95693214a9d', class: "form-label" }, h("span", { key: 'bd125c14674af3b003fad1433883380a88117d9b', class: "required" }, "*"), "Ciudad:"), h("input", { key: '29fcaf0d0009f9cd02c179f74ec23e0d8f7a6047', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && h("span", { key: '87d40db52764bbd0cadfe3442d831979f3f91a13', class: "error-message" }, this.formErrors.city))), h("div", { key: '43cd8a11b5aaccd906dcce39336bf82e5404d41d', class: "form-row" }, h("div", { key: '0264f0507d4e424e20ab50334ba4ab7b47b09a21', class: "form-group" }, h("label", { key: '9edd52e8be58ce08fbcc2a41131eedb873118ed6', class: "form-label" }, h("span", { key: '3cf11c65ee0b5dd7c8292198643d560a07cd0dae', class: "required" }, "*"), "C\u00F3digo postal"), h("input", { key: '27d4e2778d959edbf41b929af2b9d42768d7970b', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && h("span", { key: '4aa0b6d39a97406dfe46fd9552aba92f01b75575', class: "error-message" }, this.formErrors.zipcode)), h("div", { key: 'f8f23653a2702f1907bce04cf300f6c384e25606', class: "form-group" }, h("label", { key: '539fcbb8c4272ade2545e6d3e0f192cf3f2807a4', class: "form-label" }, h("span", { key: '0d343d4f6c0a8c3dd4ba8b00e2d1af87d732e969', class: "required" }, "*"), "Correo electr\u00F3nico:"), h("input", { key: 'cc13283c527c53f54808aed96ada16f3b9daf6a7', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && h("span", { key: '1b1bd7846f05f11d894550d0a0fa22d8fc8c6ba4', class: "error-message" }, this.formErrors.email))), h("div", { key: '236feb774283965aaf4038e8c34b79c20467b64d', class: "form-group existing-customer" }, h("label", { key: 'da698ad0d7fc2c10318c061763f4523546eae390', class: "form-label" }, h("span", { key: '7e05e2afc564ae6d9f0685aa959b73e4b08c6ebf', class: "required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: '36d6dc1fa3276487c90c4f7dc0e57dcb2be0ac0d', class: "radio-group horizontal" }, h("label", { key: 'b4f5b27abf98cd81c33b8cdbcb1c9b001ed66bbe', class: "radio-label" }, h("input", { key: '95b4bd907ce7c6e711fb29a6c9f564d490b53447', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), h("span", { key: '4658a0a02dad4910abcb1558418ac43005e7cbea', class: "radio-custom" }), h("span", { key: '99c0626890d48aff3e5d3c2c64bad27d774b0dcb', class: "radio-text" }, "S\u00ED")), h("label", { key: '6ac7653c1263c60adb2e11310a76bb16fff697db', class: "radio-label" }, h("input", { key: 'ecc6b2c0c2b293407fea5197aa999dd12527b181', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), h("span", { key: '2337987d047019faa419de4db247dcaadd892710', class: "radio-custom" }), h("span", { key: '59e68d9372cb5b1a8b3639cef1d6d6d73cee0c52', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (h("span", { key: 'a0bd452e77948bae5aef81715346b910889ea5fa', class: "error-message" }, this.formErrors.existingCustomer))), h("div", { key: '276b369032ecf9d25836be9fbe91ac806fc65c1a', class: "btn-container" }, h("button", { key: 'f03d5bbe83a5d16741cd63fd77234db38c340197', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (h("span", { class: "btn-loading" }, h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
    }
    static get is() { return "step-shipping"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["step-shipping.scss"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["step-shipping.css"]
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
            "isLoading": {},
            "error": {},
            "name": {},
            "secondName": {},
            "lastname": {},
            "secondLastname": {},
            "idType": {},
            "idNumber": {},
            "expirationDate": {},
            "phone": {},
            "phone2": {},
            "businessName": {},
            "position": {},
            "address": {},
            "city": {},
            "zipcode": {},
            "email": {},
            "existingCustomer": {},
            "formErrors": {},
            "touched": {}
        };
    }
}
//# sourceMappingURL=step-shipping.js.map
