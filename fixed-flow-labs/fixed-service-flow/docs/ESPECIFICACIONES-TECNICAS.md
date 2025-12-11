# Especificaciones Técnicas - Fixed Service Flow

## Basado en: Flujo `store-businesses` de TEL

Este documento contiene las especificaciones técnicas extraídas del flujo funcional existente en el proyecto TEL, para servir como referencia en la implementación del Web Component con Stencil.js.

---

## 0. Flujo de Inicialización (CRÍTICO)

> **IMPORTANTE:** Antes de cualquier otra operación, se debe obtener el token de autenticación.
> El token es fundamental para todo el proceso y también es el token del carrito.

### 0.1 Obtener Token (PRIMER PASO OBLIGATORIO)

**Endpoint:** `POST api/Token/getToken`

**Request:**
```json
{
  "agentName": ""
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "correlationId": "abc123-def456-ghi789",
  "hasError": false,
  "message": ""
}
```

**Datos a almacenar:**
| Dato | Almacenamiento | Uso |
|------|----------------|-----|
| `token` | `sessionStorage.setItem('token', data.token)` | Header `Authorization: Bearer {token}` |
| `correlationId` | `sessionStorage.setItem('correlationId', data.correlationId)` | Header `X-Correlation-ID` |

### 0.2 Secuencia de Inicialización

```
[INICIO]
    ↓
¿Existe token en sessionStorage?
    ↓ NO                    ↓ SÍ
    ↓                       ↓
POST api/Token/getToken     Usar token existente
    ↓                       ↓
Almacenar token y           ↓
correlationId               ↓
    ↓                       ↓
    └───────────────────────┘
              ↓
    [CONTINUAR CON FLUJO]
         ↓
    Paso 1: Mapa (getInternetPlans)
         ↓
    Paso 2: Planes (getPlansInternet)
         ↓
    Paso 3: Contrato (datos locales)
         ↓
    Paso 4: Formulario (datos locales)
         ↓
    Paso 5: Enviar (internetServiceRequest)
```

### 0.3 Código de Referencia (TEL)

**Archivo:** `TEL/frondend/src/app/services/auth.service.ts` (líneas 208-219)

```typescript
async getToken() {
  let result = new Promise<boolean>(async (resolve) => {
    await this.Service.getToken({
      agentName: this.UserApp.getName(),
    }).subscribe(async (data: any) => {
      this.http.setToken(data.token);           // ← Almacena token
      this.http.setCorrelationId(data.correlationId);  // ← Almacena correlationId
      await this.Global.initAppWeb(data);
      resolve(true);
    });
  });
  return result;
}
```

**Archivo:** `TEL/frondend/src/app/services/services.service.ts` (líneas 11-25)

```typescript
getToken(data: any = {}) {
  const resultObserv = new Observable(observer => {
    this.http.post('api/Token/getToken', data).subscribe({
      next: (data) => {
        observer.next(data);
      },
      error: (e) => {
        observer.next(e);
      },
      complete: () => {}
    });
  });
  return resultObserv;
}
```

### 0.4 Verificación de Token (Guard)

**Archivo:** `TEL/frondend/src/app/services/auth.service.ts` (líneas 70-75)

```typescript
// En el guard de rutas, se verifica si existe token
if (
  this.session != 'auth' &&
  sessionStorage.getItem('token') == null &&
  environment.flowLoad.toLowerCase() == 'web'
) {
  await this.getToken();  // ← Si no hay token, obtenerlo
}
```

---

## 1. API Endpoints

### 1.1 Validación de Cobertura (Mapa)

**Endpoint:** `POST api/Catalogue/getInternetPlans`

**Request:**
```json
{
  "latitud": "18.333036",
  "longitud": "-66.4161211"
}
```

**Response (éxito):**
```json
{
  "priorityService": "GPON",
  "attributes": [
    {
      "createD_BY": "0",
      "creatioN_DATE": "2019-07-10 16:29:28.0",
      "expiratioN_DATE": null,
      "polygoN_SHAPE": "H",
      "polygoN_TYPE": 5,
      "polygoN_URL": "https://icc.claropr.com/geojson/GPON.geojson.gz",
      "servicE_DEFAULT": "N",
      "servicE_ID": 22,
      "servicE_MESSAGE": "Tenemos fibra óptica en tu área y podrás navegar con velocidades de hasta 1,000 megas.",
      "servicE_NAME": "GPON",
      "servicE_PRIORITY": 1,
      "updateD_BY": "0",
      "updateD_DATE": "2019-09-24 09:44:14.0"
    },
    {
      "servicE_ID": 24,
      "servicE_MESSAGE": "Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas.",
      "servicE_NAME": "CLARO HOGAR",
      "servicE_PRIORITY": 5,
      "servicE_DEFAULT": "Y"
    }
  ],
  "hasError": false,
  "errorDisplay": "",
  "errorDesc": "",
  "errorNum": 0,
  "errorSubject": "",
  "message": ""
}
```

**Tipos de Servicio (servicE_NAME):**
| Código | Descripción |
|--------|-------------|
| `GPON` | Fibra óptica (hasta 1,000 megas) |
| `VRAD` | Internet por DSL |
| `CLARO HOGAR` | Internet inalámbrico (autoinstalable) |

---

### 1.2 Obtener Planes de Internet

**Endpoint:** `POST api/Plans/getPlansInternet`

**Request:**
```json
{
  "catalogID": 0,
  "type": "GPON"
}
```

**Response:**
```json
{
  "planList": [
    {
      "planId": 1501,
      "planName": "INTERNET GPON 1",
      "planSoc": "M000173147000000012BAIL009",
      "planDesc": "<ul><li>Internet fibra 1</li><li>Internet 2</li><li>Internet 3</li></ul>",
      "decPrice": 50.00,
      "decSalePrice": 45.00,
      "bitPromotion": false,
      "features": []
    },
    {
      "planId": 1502,
      "planName": "INTERNET GPON 2",
      "planSoc": "M000173147000000012BAIL010",
      "decPrice": 100.00,
      "bitPromotion": false
    },
    {
      "planId": 1503,
      "planName": "INTERNET GPON 3",
      "planSoc": "M000173147000000012BAIL011",
      "decPrice": 150.00,
      "bitPromotion": false
    }
  ],
  "hasError": false,
  "message": ""
}
```

---

### 1.3 Agregar Plan al Carrito

**Endpoint:** `POST api/Plans/addToCartCurrentPlan`

**Request (FormData):**
```
productId: 12345
cartId: 67890
```

---

### 1.4 Enviar Solicitud de Servicio

**Endpoint:** `POST api/Orders/internetServiceRequest`

**Request (FormData):**
```
type: 1                              // 0=Sin contrato, 1=Con contrato
name: "Juan"
second_name: "Carlos"
last_name: "Pérez"
second_surname: "García"
date_birth: "1990-01-15"
email: "juan@email.com"
telephone1: "7871234567"
telephone2: ""
zipCode: "00725"
address: "16 C. Ruiz Belvis, Caguas, 00725, Puerto Rico"
city: "Caguas"
id_type: "1"                         // 1=Licencia, 2=Pasaporte
id: "1234567890"
identification_expiration: "2028-12-31"
frontFlowId: "12345"
plan_id: "1501"
plan_name: "INTERNET GPON 1"
deadlines: "24"                      // 0, 12, o 24 meses
installation: "0"                    // Costo instalación
activation: "0"                      // Costo activación
moden: "0"                           // Costo modem
claro_customer: "Si"                 // "Si" o "No"
latitud: "18.333036"
longitud: "-66.4161211"
```

**Response (éxito):**
```json
{
  "hasError": false,
  "orderId": "19018",
  "message": "Solicitud creada exitosamente"
}
```

**Response (error):**
```json
{
  "hasError": true,
  "errorDisplay": "Error al procesar la solicitud",
  "errorDesc": "Descripción detallada del error",
  "errorNum": 500
}
```

---

## 2. HTTP Headers

**Headers requeridos para todas las peticiones:**

```typescript
{
  'Authorization': 'Bearer {token}',
  'App': 'shop',                        // o 'tel', 'invaciones'
  'Platform': 'web',                    // o 'movil'
  'X-Correlation-ID': '{correlationId}',
  'Content-Type': 'application/json'    // o sin este para FormData
}
```

**Ubicación del código:** `TEL/frondend/src/app/services/http.service.ts`

---

## 3. Configuración de Tipos de Contrato

**Fuente:** `TEL/frondend/src/app/shared/const/appConst.ts` (líneas 237-272)

```typescript
export const INTERNET = {
  valueModem: 40,
  internetContract: [
    {
      typeId: 1,
      type: 'Con Contrato',
      contract: [
        {
          contractId: 3,
          deadlines: 24,          // 24 meses
          installation: 0,        // Sin costo
          activation: 0,          // Sin costo
          moden: 0                // Sin costo
        },
        {
          contractId: 2,
          deadlines: 12,          // 12 meses
          installation: 25,       // $25.00
          activation: 20,         // $20.00 (POC dice $25)
          moden: 0                // Sin costo
        }
      ]
    },
    {
      typeId: 0,
      type: 'Sin Contrato',
      contract: [{
        contractId: 1,
        deadlines: 0,             // Sin plazo
        installation: 50,         // $50.00
        activation: 40,           // $40.00 (POC dice Sin costo)
        moden: 40                 // $40.00
      }]
    }
  ]
};
```

---

## 4. Configuración de Google Maps

**Ubicación:** `TEL/frondend/src/app/modules/map/pages/template/web/map-web/map-web.component.ts`

```typescript
// Configuración del mapa
const mapConfig = {
  zoom: 17,
  center: { lat: 18.333036, lng: -66.4161211 },  // Centro de Puerto Rico
  streetViewControl: false,
  mapTypeControl: true,
  mapId: '8481b97098c495ab',                      // ID de estilo del mapa
  mapTypeControlOptions: {
    mapTypeIds: ["roadmap", "satellite"]
  }
};

// Tipo de mapa por defecto
map.setMapTypeId('satellite');
```

**API Key de Google Maps:** Se obtiene del environment o se configura externamente.

---

## 5. Almacenamiento en SessionStorage

### 5.1 Datos del Mapa/Ubicación

| Key | Valor | Codificación |
|-----|-------|--------------|
| `planCodeInternet` | "GPON", "VRAD", "CLARO HOGAR" | Base64 (`btoa()`) |
| `latitud` | Coordenada latitud | Base64 (`btoa()`) |
| `longitud` | Coordenada longitud | Base64 (`btoa()`) |
| `askLocation` | Flag de permiso solicitado | Plain text |

### 5.2 Datos del Plan

| Key | Valor | Codificación |
|-----|-------|--------------|
| `planId` | ID del plan seleccionado | Plain text |
| `planPrice` | Precio del plan | Plain text |
| `plan` | Objeto completo del plan | JSON (`JSON.stringify()`) |

### 5.3 Datos del Contrato

| Key | Valor | Codificación |
|-----|-------|--------------|
| `typeContractId` | 0 o 1 | Plain text |
| `contractInstallment` | 0, 12, o 24 | Plain text |
| `contractInstallation` | Costo instalación | Plain text |
| `contractActivation` | Costo activación | Plain text |
| `contractModen` | Costo modem | Plain text |

### 5.4 Datos Globales

| Key | Valor | Codificación |
|-----|-------|--------------|
| `store-businesses` | "true" | Plain text |
| `token` | JWT token | Plain text |
| `correlationId` | ID de correlación | Plain text |
| `app` | "shop", "tel" | Plain text |

---

## 6. Flujo de Navegación

### 6.1 Flujo Normal (TEL)

```
/store-businesses
    ↓
[Mapa - Validación de Cobertura]
    ↓ (servicE_NAME obtenido)
/plans/{servicE_NAME}        // Ej: /plans/GPON
    ↓
[Selección de Plan]
    ↓
/type-contract
    ↓
[Selección de Tipo de Contrato]
    ↓
/internet-request
    ↓
[Formulario de Solicitud]
    ↓
/confirmation                // (implícito vía Nav.goTo())
    ↓
[Confirmación de Solicitud]
```

### 6.2 Casos Especiales

**CLARO HOGAR (Internet Inalámbrico):**
```typescript
if (planCode.toLowerCase() == 'claro hogar') {
  // Redirige a catálogo de routers
  nextRoute = 'catalog/hogar/router';
}
```

---

## 7. Servicios Principales

### 7.1 MapService
**Ubicación:** `TEL/frondend/src/app/modules/map/map.service.ts`

```typescript
class MapService {
  getInternetPlans(data: { latitud: string, longitud: string }): Observable<any>
}
```

### 7.2 PlansService
**Ubicación:** `TEL/frondend/src/app/modules/product-catalog/pages/products/components/plans/plans.service.ts`

```typescript
class PlansService {
  // Getters/Setters para plan actual
  getPlan(): any
  setPlan(plan: any): void
  getPlanId(): number
  setPlanId(value: number): void
  getPrice(): number
  setPrice(value: number): void

  // API calls
  getPlansInternet(catalogID: number, type: string): Observable<any>
  addToCartCurrentPlan(form: FormData): Observable<any>
}
```

### 7.3 typeContractService
**Ubicación:** `TEL/frondend/src/app/modules/type-contract/pages/type-contract.service.ts`

```typescript
class typeContractService {
  // Getters/Setters para contrato
  getTypeId(): number
  setTypeId(value: number): void
  getInstallment(): number
  setInstallment(value: number): void
  getInstallation(): number
  setInstallation(value: number): void
  getActivation(): number
  setActivation(value: number): void
  getModen(): number
  setModen(value: number): void
}
```

### 7.4 internetRequestService
**Ubicación:** `TEL/frondend/src/app/modules/internet-request/pages/internet-request.service.ts`

```typescript
class internetRequestService {
  create(form: FormData): Observable<any>
}
```

### 7.5 IdService (Datos Personales)
**Métodos utilizados:**
```typescript
class IdService {
  getName(): string
  getSecondName(): string
  getLastname(): string
  getSecondLastname(): string
  getBirthdate(): string
  getEmail(): string
  getPhone(): string
  getId(): string
  getTypeId(): string        // "Id" o "Passport"
  getExpirationDateId(): string
  getIsUser(): string        // "Si" o "No"
}
```

### 7.6 AddressService (Dirección)
**Métodos utilizados:**
```typescript
class AddressService {
  getAddress1(): string
  getCity(): string
  getZipCode(): string
}
```

---

## 8. Mecanismo de Ocultación Header/Footer

### 8.1 Detección de Ruta

**Archivo:** `TEL/frondend/src/app/modules/product-catalog/pages/products/products-catalog.page.ts`

```typescript
ngOnInit() {
  if (this.router.url.includes('store-businesses')) {
    sessionStorage.setItem('store-businesses', 'true');
    this.global.isStoreBusiness = true;
    // Auto-selecciona catálogo 6 (Hogar/Internet)
    this.Catalog.setCurrentCatalog(6);
  }
}
```

### 8.2 Condicionales en Template

**Archivo:** `TEL/frondend/src/app/app.component.html`

```html
<!-- Header oculto cuando isStoreBusiness = true -->
<app-header *ngIf="this.Auth.load==true && !this.Global.isStoreBusiness"></app-header>

<!-- Footer oculto en web cuando store-businesses -->
<app-footer *ngIf="this.Auth.load==true && (this.Global.flowLoad=='movil' || this.Global.loadFooter==true)"></app-footer>
```

### 8.3 globalService Flag

```typescript
class globalService {
  public isStoreBusiness: Boolean = false;
  public loadFooter: Boolean = false;
}
```

---

## 9. Validaciones del Formulario

### 9.1 Campos Requeridos

| Campo | Validación |
|-------|------------|
| Nombre | Requerido, mín 3 caracteres |
| Apellido | Requerido, mín 3 caracteres |
| Segundo Apellido | Requerido, mín 3 caracteres |
| Fecha Nacimiento | Requerido, formato fecha |
| Identificación | Requerido, mín 10 caracteres (según POC) |
| Fecha Vencimiento ID | Requerido, debe ser futura |
| Teléfono 1 | Requerido, formato teléfono PR |
| Dirección | Requerido (pre-llenado del mapa) |
| Ciudad | Requerido |
| Código Postal | Requerido, 5 dígitos |
| Email | Requerido, formato email |
| Cliente Claro PR | Requerido, Sí/No |

### 9.2 Campos Empresariales (Adicionales del POC)

| Campo | Validación |
|-------|------------|
| Nombre del Negocio | Requerido |
| Posición en la Empresa | Requerido |

---

## 10. Mensajes de Usuario

### 10.1 Mensajes del Mapa

| Escenario | Mensaje |
|-----------|---------|
| GPON disponible | "Tenemos fibra óptica en tu área y podrás navegar con velocidades de hasta 1,000 megas." |
| CLARO HOGAR disponible | "Tenemos un poderoso servicio de internet inalámbrico en tu área que tú mismo instalas." |
| Sin cobertura | "¡Fuera de área! Por el momento no contamos con cobertura en tu zona." |
| Error geolocalización | "El servicio de geolocalización falló." |
| Permiso ubicación | "Para detectar correctamente su ubicación en el mapa debe permitir los accesos a su geolocalización" |

### 10.2 Mensajes de Confirmación

| Escenario | Mensaje |
|-----------|---------|
| Éxito | "¡Tu solicitud fue enviada con éxito! Pronto nos comunicaremos contigo." |
| Error | "¡Lo sentimos, ha ocurrido un error en el proceso de solicitud! En este momento estamos presentando inconvenientes en nuestro sistema. Por favor, inténtalo nuevamente." |

---

## 11. Environment Configuration

**Archivo:** `TEL/frondend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  platform: 'web',
  server: 'https://uat-tienda.claropr.com/',
  timeout: 360000,  // 6 minutos
  // Google Maps API Key se configura externamente
};
```

---

## 12. Categorías y Catálogos Relevantes

| ID | Código | URL | Descripción |
|----|--------|-----|-------------|
| 6 | `home` | `hogar` | Catálogo Hogar (muestra mapa) |
| 23 | `router` | `router` | Routers/Modems |
| 39 | `internet` | `internet` | Internet (catálogo especial) |

---

*Documento generado: 2025-12-09*
*Fuente: Proyecto TEL - Flujo store-businesses*
