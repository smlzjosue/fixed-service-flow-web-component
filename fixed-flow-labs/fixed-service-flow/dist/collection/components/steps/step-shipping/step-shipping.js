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
        return (h(Host, { key: '7ae7bebbb3e13d31265012fdf1d0007a58ccc549' }, h("div", { key: 'f066b9f78003b4258a216e967babf70875c34b7c', class: "step-shipping" }, h("p", { key: '8c695e5687cd17c583a7e97ceac601f8b6979994', class: "info-message" }, "Por favor, ingresa la informaci\u00F3n personal solicitada. Su nombre y apellido deben ser iguales a su identificaci\u00F3n de gobierno."), this.error && (h("div", { key: '45e0af3f13e97a0198cf137b156f14912b156186', class: "error-alert" }, h("svg", { key: 'cae16b40569a38151eecf91e3e8bc2fa8700dbd1', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, h("circle", { key: 'b8f331848eeb1b0fd5023e98bbe7908cf8a5fedf', cx: "12", cy: "12", r: "10" }), h("line", { key: '75b258a0c98e884c39bc0f39d80a7f69c7c6836b', x1: "12", y1: "8", x2: "12", y2: "12" }), h("line", { key: '774cca2fac86dc19a44a94070945f25bba002a53', x1: "12", y1: "16", x2: "12.01", y2: "16" })), h("span", { key: '24dd26e600ecafd36b87e6098a165b8fb93d2b48' }, this.error))), h("div", { key: '86453f1110b995cf95be698da80ba6b350cde36c', class: "form-container" }, h("div", { key: '1337c15029ef62ecaaae17ed5c76b0b474d944ba', class: "form-row" }, h("div", { key: 'c2c0440e02e1576eb32f4a44ced18ccd5392ee0e', class: "form-group" }, h("label", { key: 'cd7e142575dc19cd01d3a53452a77ed4108a19cc', class: "form-label" }, h("span", { key: 'cb6791589c6bedf4ec4dd49a90c6818ebc9b0af0', class: "required" }, "*"), "Nombre:"), h("input", { key: '7c7f6bb56d58cc613dedd42f7bb5adeed98ac7cd', type: "text", class: { 'form-input': true, error: this.touched.name && !!this.formErrors.name }, value: this.name, onInput: this.handleInputChange('name'), placeholder: "Ingresar nombre" }), this.touched.name && this.formErrors.name && h("span", { key: 'b11ec748d53b4d4362505b5a0eece2410160f135', class: "error-message" }, this.formErrors.name)), h("div", { key: '496739bac23e60c715b318e87de60462d773d4fb', class: "form-group" }, h("label", { key: '2bd5afa3a5a16eba18c6e691630920461c5aca38', class: "form-label" }, "Segundo nombre:"), h("input", { key: '5cd35e05777bfb2378c9330d6f23fe67f4db5350', type: "text", class: "form-input", value: this.secondName, onInput: this.handleInputChange('secondName'), placeholder: "Ingresar segundo nombre (Opcional)" }))), h("div", { key: '8811ecafcce92d5f2c50c6a16fff637844806571', class: "form-row" }, h("div", { key: '0642b4e824009299d108a85ecd63ed56ea897145', class: "form-group" }, h("label", { key: '6affa3bde930d01c3e53213404e9e3cb3161ec0b', class: "form-label" }, h("span", { key: '312a964f1c56afc5085bf4481cc5f877682ed8e0', class: "required" }, "*"), "Apellido:"), h("input", { key: 'af8d81aa3dce7d5ffcef342c375bc6226e09ce25', type: "text", class: { 'form-input': true, error: this.touched.lastname && !!this.formErrors.lastname }, value: this.lastname, onInput: this.handleInputChange('lastname'), placeholder: "Ingresar apellido" }), this.touched.lastname && this.formErrors.lastname && h("span", { key: '6ddd4e10b4e772a0b957306e034a7e6619fd8f30', class: "error-message" }, this.formErrors.lastname)), h("div", { key: '26fcf42cb306506823d12836350d1ccf1f9f0a3e', class: "form-group" }, h("label", { key: 'd5afc6f663e81951e9011364de82d1f1e2c04abb', class: "form-label" }, h("span", { key: '072ccacda1555a2043ff6b0f3c3eba951602de24', class: "required" }, "*"), "Segundo apellido:"), h("input", { key: 'eb014bd7177ea3465600e8f37ab537c3d9fba78a', type: "text", class: { 'form-input': true, error: this.touched.secondLastname && !!this.formErrors.secondLastname }, value: this.secondLastname, onInput: this.handleInputChange('secondLastname'), placeholder: "Ingresar segundo apellido" }), this.touched.secondLastname && this.formErrors.secondLastname && h("span", { key: '65f296fad407839bdea2d890339a93d56941a661', class: "error-message" }, this.formErrors.secondLastname))), h("div", { key: '9b1491d42acf45a8f74c7ba661cc4c1432bf9726', class: "form-row" }, h("div", { key: 'a23a636f4e8da464edab56a4ae8416fab184c0d8', class: "form-group" }, h("label", { key: 'c88823048a64f456cba72feb0d9938019b54620e', class: "form-label" }, h("span", { key: 'a7b1b2011cd618e8163d9d44bc5381bfd79706c6', class: "required" }, "*"), "Identificaci\u00F3n:"), h("div", { key: 'c978d3b5795a62479a951aa17bd23f2330121b51', class: "id-field" }, h("div", { key: 'a8d06dc73cea607435ab41e3874917ff8cb8e538', class: "radio-group" }, h("label", { key: '823a2f5fb88a02ef222bc21837e23b4f51ccb23a', class: "radio-label" }, h("input", { key: '190b095513a09becbd9afcb6701bb4ae82d9ea2d', type: "radio", name: "idType", checked: this.idType === 'license', onChange: this.handleRadioChange('idType', 'license') }), h("span", { key: '4e5f43b042d2421f33af32295dcb697283bf3221', class: "radio-custom" }), h("span", { key: '2ff76995b3ea2a91f38c5f576f1e8e9e3e3b8631', class: "radio-text" }, "Licencia de conducir")), h("label", { key: '83cda857f71d2e57235c7db23a33278f8e27a47e', class: "radio-label" }, h("input", { key: 'c941b00e6c0424f7f757809c7a8487b968fa9b7c', type: "radio", name: "idType", checked: this.idType === 'passport', onChange: this.handleRadioChange('idType', 'passport') }), h("span", { key: 'b9bf3cf45f6a7edda73847faf28451945d043e28', class: "radio-custom" }), h("span", { key: 'ff8c1a8cb167efb254bb980ffbbe24ed99b6cdd3', class: "radio-text" }, "Pasaporte"))), h("input", { key: '9e706b1c08c3be90654a22f830da2581dc7e2a69', type: "text", class: { 'form-input': true, 'id-input': true, error: this.touched.idNumber && !!this.formErrors.idNumber }, value: this.idNumber, onInput: this.handleInputChange('idNumber'), placeholder: "Ingresar nro de identificaci\u00F3n" })), this.touched.idType && this.formErrors.idType && h("span", { key: '7dec316ea77a2887e8236f5c62dc07e5329f3d81', class: "error-message" }, this.formErrors.idType), this.touched.idNumber && this.formErrors.idNumber && h("span", { key: 'ace10559a4beade529a1d7d3524929239979978c', class: "error-message" }, this.formErrors.idNumber)), h("div", { key: '5b33f615e67feabab7028f4af6b0aa4eabba0bcd', class: "form-group" }, h("label", { key: 'b56ca9a6e43259a6ee976a26125345e34a983e64', class: "form-label" }, h("span", { key: 'fe80746dd75dabfcc7cc8d4c0a2ad2d17c4e5400', class: "required" }, "*"), "Fecha de vencimiento:"), h("div", { key: '81e26202ef03fbeea5aec79721ec8c7118628ff1', class: "date-input-wrapper" }, h("input", { key: 'db2149d07a0bff3f0e637b9cc6d651d06f503f1b', type: "date", class: { 'form-input': true, error: this.touched.expirationDate && !!this.formErrors.expirationDate }, value: this.expirationDate, onInput: this.handleInputChange('expirationDate'), placeholder: "Seleccionar" })), this.touched.expirationDate && this.formErrors.expirationDate && h("span", { key: 'c9a806a8fbbd89180cf9900207a2b3f1d4f02e80', class: "error-message" }, this.formErrors.expirationDate))), h("div", { key: '40bb0adc01fd7591bfa094c1dac80eda17512281', class: "form-row" }, h("div", { key: 'a9eb8eaf0761e9f2f3ab7ea81dc23c7e7cbe480b', class: "form-group" }, h("label", { key: 'cd16cd0746541416e86740b969e370f6cac9dfad', class: "form-label" }, h("span", { key: '85ec660a4c26378dd7ebc6c3518be92341a125a9', class: "required" }, "*"), "Tel\u00E9fono de contacto 1:"), h("input", { key: '365d37fdb282b8376542da16fc2913ce12813877', type: "tel", class: { 'form-input': true, error: this.touched.phone && !!this.formErrors.phone }, value: this.phone, onInput: this.handleInputChange('phone'), placeholder: "Ingresar nro de tel\u00E9fono" }), this.touched.phone && this.formErrors.phone && h("span", { key: 'ce786b52e786957af6c153c255c1e78e38bb22a7', class: "error-message" }, this.formErrors.phone)), h("div", { key: '53dcfb2c8a47fa4b89ab23aa81707a563e08ffd3', class: "form-group" }, h("label", { key: '2c8c267b276d9a3be5a276533492aace19c6d8b9', class: "form-label" }, "Tel\u00E9fono de contacto 2:"), h("input", { key: '2ee5ac14a47ce62baf7dd70e98359ba0d61578fd', type: "tel", class: "form-input", value: this.phone2, onInput: this.handleInputChange('phone2'), placeholder: "Ingresar nro de tel\u00E9fono" }))), h("div", { key: '9109a6a374b5f018ab50910607ba70fd8bb367b5', class: "form-row" }, h("div", { key: '46f4c3d535f668630abd62d1e82c9830842955f8', class: "form-group" }, h("label", { key: 'a0f5a9abd1dc8f6f55c041b9ddd5602410d8de1d', class: "form-label" }, h("span", { key: 'd7cdd6fca00dba0b402137c39babb3bb0e80072e', class: "required" }, "*"), "Nombre del Negocio:"), h("input", { key: '01266ede5d55ba433117dd69c086223e60915aa9', type: "text", class: { 'form-input': true, error: this.touched.businessName && !!this.formErrors.businessName }, value: this.businessName, onInput: this.handleInputChange('businessName'), placeholder: "Ingresar nombre del negocio" }), this.touched.businessName && this.formErrors.businessName && h("span", { key: '0930d1939f86552449e03d11cc1ee1b27ba8a369', class: "error-message" }, this.formErrors.businessName)), h("div", { key: '672a655b281a976db731fe7ecafd7b060140b190', class: "form-group" }, h("label", { key: '6bde70537ea0af996539eb48bdd69f1df25d567c', class: "form-label" }, h("span", { key: 'f6ac8f9932bb9f50096768474c686905f4c2d267', class: "required" }, "*"), "Posici\u00F3n en la Empresa:"), h("input", { key: '68a45ae95232a17bd6a05927ddb3878a06f65f88', type: "text", class: { 'form-input': true, error: this.touched.position && !!this.formErrors.position }, value: this.position, onInput: this.handleInputChange('position'), placeholder: "Ingresar posici\u00F3n actual" }), this.touched.position && this.formErrors.position && h("span", { key: 'cb4bea9d7785680f39a3b867550153cffbf7cf43', class: "error-message" }, this.formErrors.position))), h("div", { key: '1c2c2012328c63a9fc3dfea778a1df84d8b44bb1', class: "form-row" }, h("div", { key: '6bf3b1bd88ac311bddadb53f243f2b3e0627b677', class: "form-group" }, h("label", { key: '334a6edc7a9c49694932b1c7ebdce0d45a82990c', class: "form-label" }, h("span", { key: '3a28dfac7dacee1d7a88de91db81b9835af03455', class: "required" }, "*"), "Direcci\u00F3n:"), h("input", { key: '2b2535ee98ad8ead3fc164ff8a6f62320e856800', type: "text", class: { 'form-input': true, error: this.touched.address && !!this.formErrors.address }, value: this.address, onInput: this.handleInputChange('address'), placeholder: "Ingresar direcci\u00F3n" }), this.touched.address && this.formErrors.address && h("span", { key: 'd5df9464446c21ff791b6dc78b8dff01f30e138b', class: "error-message" }, this.formErrors.address)), h("div", { key: 'd948573bfc7bfda7c569f6d640ca5bbe2d25862f', class: "form-group" }, h("label", { key: '5b844b6e991312a1c9d18bb6e3b75b2f4f4b7783', class: "form-label" }, h("span", { key: '3efa4f922cf5b11e91ece600003aff619d37c3a4', class: "required" }, "*"), "Ciudad:"), h("input", { key: '2733c88c2ce9a6b9b296c13fdf1841ac4695d097', type: "text", class: { 'form-input': true, error: this.touched.city && !!this.formErrors.city }, value: this.city, onInput: this.handleInputChange('city'), placeholder: "Ingresar ciudad" }), this.touched.city && this.formErrors.city && h("span", { key: 'ffb55325d480121c42cb5ded4568477af6c167e3', class: "error-message" }, this.formErrors.city))), h("div", { key: '7209f9417c681860f688c1abb0b6c86ffb18f084', class: "form-row" }, h("div", { key: '21dff49c47d67c0e34b802eae167fa71c415a47a', class: "form-group" }, h("label", { key: '3e3421aa50ac2fdc8c61a6a20025da2f051ee301', class: "form-label" }, h("span", { key: '447b16da22440ce8960f3f4af090d994b8e367b2', class: "required" }, "*"), "C\u00F3digo postal"), h("input", { key: '637b0cd9b9ef6a74b7c297db23c33dafe5e45745', type: "text", class: { 'form-input': true, error: this.touched.zipcode && !!this.formErrors.zipcode }, value: this.zipcode, onInput: this.handleInputChange('zipcode'), placeholder: "Ingresar c\u00F3digo postal", maxLength: 5 }), this.touched.zipcode && this.formErrors.zipcode && h("span", { key: 'f2b780128a1cd722ece53145dcd89b3283d45cb8', class: "error-message" }, this.formErrors.zipcode)), h("div", { key: 'e2119f2a49006a55ec8f6c531d36f36195dd8cb5', class: "form-group" }, h("label", { key: '4752cfae5f5584e37d258bafce1da8169b72027c', class: "form-label" }, h("span", { key: 'd48f17fe4de363a55e3c33744daa11700f715a23', class: "required" }, "*"), "Correo electr\u00F3nico:"), h("input", { key: '735ac9a4774e60a49bf8f697307254175045bdba', type: "email", class: { 'form-input': true, error: this.touched.email && !!this.formErrors.email }, value: this.email, onInput: this.handleInputChange('email'), placeholder: "Ingresar Correo electr\u00F3nico" }), this.touched.email && this.formErrors.email && h("span", { key: '33b80978f310afb802bfd6970a4de7aacebce137', class: "error-message" }, this.formErrors.email))), h("div", { key: '60795c5c644d4032f0be294dd2a0442ace2ce847', class: "form-group existing-customer" }, h("label", { key: '8545bb07e5946b099563e3309f896abe5555d8e3', class: "form-label" }, h("span", { key: '133b8ff2339a48aa745b33dc1f6fb554af15920e', class: "required" }, "*"), "Cliente existente de Claro PR:"), h("div", { key: '5469554e900b063f4d9f6b04981b2bce6f39ac3c', class: "radio-group horizontal" }, h("label", { key: 'f7d6687aca7e88c348063114d71f26d868544a51', class: "radio-label" }, h("input", { key: '42278570f7941f88f3020447840ee0bc8e1bf7a3', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'yes', onChange: this.handleRadioChange('existingCustomer', 'yes') }), h("span", { key: 'ceaad1ec03f423f5a4a69824f0a51dd8aa7eb1ef', class: "radio-custom" }), h("span", { key: '4ba95da48683351250bd97fab29978828d456035', class: "radio-text" }, "S\u00ED")), h("label", { key: '270fa045386f0df39680e6e64480cdbe59818ab7', class: "radio-label" }, h("input", { key: 'd0667ace3221016a304af893bac31d120ab0e0c5', type: "radio", name: "existingCustomer", checked: this.existingCustomer === 'no', onChange: this.handleRadioChange('existingCustomer', 'no') }), h("span", { key: 'afaee58bb1e820aa109a05b2681e291ee2c4e3d8', class: "radio-custom" }), h("span", { key: 'e4310b9b40f4736635316e4a99b69cb607980e31', class: "radio-text" }, "No"))), this.touched.existingCustomer && this.formErrors.existingCustomer && (h("span", { key: 'ca5c224511a1e8788d07a5434f2ffab43da830d5', class: "error-message" }, this.formErrors.existingCustomer))), h("div", { key: 'c58c51d0ea1ff520b17e4e549b32ad8cc7702b1e', class: "btn-container" }, h("button", { key: '1344359cc5b9fb127f6b8aa77b4af132b88f06ee', class: { 'btn-submit': true, loading: this.isLoading }, onClick: this.handleSubmit, disabled: this.isLoading }, this.isLoading ? (h("span", { class: "btn-loading" }, h("span", { class: "spinner" }), "Procesando...")) : ('Continuar')))))));
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
