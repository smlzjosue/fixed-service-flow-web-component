# Plan de Trabajo - Fixed Service Flow (Stencil.js)

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Fixed Service Flow |
| **Tecnología** | Stencil.js (Web Components) |
| **Tipo** | Web Component Embebible |
| **Cliente** | Claro Puerto Rico - Mi Claro Empresas |
| **Versión** | 1.0.0 |
| **Fecha Inicio** | 2025-12-09 |

---

## Objetivo Principal

Desarrollar un **Web Component standalone** usando Stencil.js que implemente el flujo completo de solicitud de servicio fijo empresarial. El componente será embebido en el proyecto padre (Mi Claro Empresas) que provee header y footer.

### Características Clave
- Web Component estándar (Custom Element)
- Sin dependencia de framework externo
- Embebible en cualquier proyecto (Angular, React, Vue, vanilla)
- Flujo de 5 pasos autocontenido
- Integración con API backend existente
- Integración con Google Maps

---

## Flujo de Usuario

```
[1. Ubicación] → [2. Planes] → [3. Contrato] → [4. Formulario] → [5. Confirmación]
```

---

## Fases de Implementación

### FASE 1: Configuración del Proyecto ✅
> Setup inicial del proyecto Stencil.js

- [x] **1.1** Crear proyecto Stencil.js con `npm init stencil`
- [x] **1.2** Configurar `stencil.config.ts` (output targets, dev server)
- [x] **1.3** Instalar dependencias:
  - [x] `@stencil/store` (state management)
  - [x] `@stencil/sass` (SCSS support)
  - [ ] `@stencil-community/router` (routing interno opcional) - No requerido, navegación por store
- [x] **1.4** Configurar TypeScript (`tsconfig.json`)
- [x] **1.5** Configurar estructura de carpetas
- [x] **1.6** Configurar ESLint y Prettier ✅ (2025-12-10)
- [x] **1.7** Crear archivo de variables de entorno ✅ (2025-12-10)
- [x] **1.8** Verificar build inicial funciona

**Entregable:** ✅ Proyecto Stencil funcional con estructura base

---

### FASE 2: Sistema de Diseño (Design Tokens) ✅
> Implementar tokens de diseño de Claro Puerto Rico

- [x] **2.1** Crear estructura SCSS:
  ```
  src/global/
  ├── variables.scss      # Colores, espaciados, tipografía
  ├── mixins.scss         # Mixins reutilizables
  ├── reset.scss          # CSS reset
  └── global.scss         # Estilos globales
  ```
- [x] **2.2** Definir paleta de colores:
  - [x] Primario: `#DA291C` (Rojo Claro)
  - [x] Secundario: `#0097A9` (Cyan/Teal)
  - [x] Éxito: `#44AF69`
  - [x] Error: `#DA291C`
  - [x] Neutrales: grises (50-900)
- [x] **2.3** Definir tipografía (fuente AMX con fallback system)
- [x] **2.4** Definir espaciados (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- [x] **2.5** Definir breakpoints responsive (xs, sm, md, lg, xl, 2xl)
- [x] **2.6** Definir sombras y bordes (shadow-sm/md/lg/xl, border-radius)
- [x] **2.7** Crear CSS custom properties para theming externo (--fsf-*)

**Entregable:** ✅ Sistema de diseño completo en SCSS

---

### FASE 3: Componentes UI Base 🔄 (Parcial)
> Crear librería de componentes UI reutilizables

#### 3.1 Componentes de Formulario
- [x] **3.1.1** `ui-button` - Botones (primary, secondary, outline, disabled)
- [x] **3.1.2** `ui-input` - Input de texto con validación y errores
- [x] **3.1.3** `ui-select` - Select/dropdown
- [x] **3.1.4** `ui-radio` - Radio buttons
- [x] **3.1.5** `ui-radio-card` - Radio como card seleccionable
- [x] **3.1.6** `ui-date-picker` - Selector de fecha
- [x] **3.1.7** `ui-checkbox` - Checkbox ✅ (2025-12-10)

#### 3.2 Componentes de Layout
- [ ] **3.2.1** `ui-card` - Cards contenedoras (integrado inline en steps)
- [ ] **3.2.2** `ui-tabs` - Tabs navegables (integrado inline en step-contract)
- [ ] **3.2.3** `ui-modal` - Modal/Dialog (integrado inline en step-location)
- [ ] **3.2.4** `ui-divider` - Separador (no creado)

#### 3.3 Componentes de Feedback
- [ ] **3.3.1** `ui-alert` - Alertas (integrado inline en steps)
- [ ] **3.3.2** `ui-loading` - Spinner de carga (integrado inline en steps)
- [ ] **3.3.3** `ui-icon` - Sistema de iconos (SVG inline en cada componente)

#### 3.4 Componentes Especializados
- [ ] **3.4.1** `ui-map` - Wrapper de Google Maps (integrado en step-location como placeholder)
- [ ] **3.4.2** `ui-plan-card` - Card de plan de internet (integrado inline en step-plans)
- [ ] **3.4.3** `ui-contract-option` - Opción de contrato (integrado inline en step-contract)
- [ ] **3.4.4** `ui-summary-bar` - Barra sticky de resumen (integrado inline en step-plans)

**Nota:** Los componentes UI de formulario (3.1) fueron creados. Los componentes de layout y feedback están integrados directamente en los steps.

**Entregable:** 🔄 7/17 componentes UI independientes creados, resto integrado inline

---

### FASE 4: Estado Global (Store) ✅
> Implementar gestión de estado con @stencil/store

- [x] **4.1** Crear store principal `flow.store.ts`:
  ```typescript
  interface FlowState {
    currentStep: number;
    location: LocationData | null;
    selectedPlan: Plan | null;
    contractType: ContractType | null;
    formData: FormData | null;
    isLoading: boolean;
    error: string | null;
  }
  ```
- [x] **4.2** Definir interfaces TypeScript:
  - [x] `LocationData` (coordenadas, dirección, cobertura)
  - [x] `Plan` (id, nombre, precio, características)
  - [x] `ContractType` (tipo, meses, costos)
  - [x] `FormData` (datos personales y empresariales)
- [x] **4.3** Crear acciones del store:
  - [x] `setLocation()`
  - [x] `selectPlan()`
  - [x] `setContractType()`
  - [x] `setFormData()`
  - [x] `nextStep()` / `prevStep()`
  - [x] `resetFlow()`
- [x] **4.4** Implementar persistencia en sessionStorage
- [x] **4.5** Crear hooks/helpers para acceso al store (flowActions)

**Entregable:** ✅ Store funcional con tipado completo

---

### FASE 5: Servicios (API Integration) ✅
> Crear capa de servicios para comunicación con backend

> ⚠️ **CRÍTICO:** El servicio de token DEBE ser el primero en implementarse.
> El token es obligatorio para TODAS las demás llamadas API y también funciona como token del carrito.

#### 5.0 Servicio de Token (PRIMERO - OBLIGATORIO) ✅
- [x] **5.0.1** Crear servicio de token (`token.service.ts`):
  - [x] Endpoint: `POST api/Token/getToken`
  - [x] Request: `{ "agentName": "" }`
  - [x] Response: `{ token, correlationId, hasError, message }`
- [x] **5.0.2** Implementar lógica de inicialización:
  - [x] Verificar si existe token en sessionStorage
  - [x] Si no existe, obtener nuevo token
  - [x] Almacenar `token` en `sessionStorage.setItem('token', data.token)`
  - [x] Almacenar `correlationId` en `sessionStorage.setItem('correlationId', data.correlationId)`
- [x] **5.0.3** Crear guard/verificación de token antes de operaciones API (`ensureToken()`)
- [x] **5.0.4** Exponer métodos: `getToken()`, `hasToken()`, `clearToken()`, `refreshToken()`

#### 5.1 Servicio HTTP Base ✅
- [x] **5.1.1** Crear servicio HTTP base (`http.service.ts`):
  - [x] Manejo de headers (Authorization, Correlation-ID, App, Platform)
  - [x] Interceptores de error (HttpError class)
  - [x] Timeout handling (AbortController)
- [ ] **5.1.2** Crear servicio de autenticación (`auth.service.ts`):
  - [x] Integrar con token.service (integrado en token.service)
  - [ ] Refresh token si es necesario (parcial - refreshToken() existe)
  - [x] Almacenamiento seguro (sessionStorage)
- [x] **5.3** Crear servicio de cobertura (`coverage.service.ts`):
  - [x] Validar cobertura por coordenadas
  - [x] Obtener tipo de servicio disponible (GPON, VRAD, CLARO HOGAR)
- [x] **5.4** Crear servicio de planes (`plans.service.ts`):
  - [x] Listar planes disponibles
  - [x] Obtener detalle de plan
  - [x] Helpers: formatPrice, parsePlanFeatures, getDiscountPercentage
- [x] **5.5** Crear servicio de solicitud (`request.service.ts`):
  - [x] Enviar solicitud de servicio
  - [x] Validar datos antes de envío (validateSubmissionData)
  - [x] Construir payload (buildPayload)
- [x] **5.6** Crear servicio de Google Maps (`maps.service.ts`) ✅ (2025-12-10):
  - [x] Inicializar mapa con AdvancedMarkerElement
  - [x] Geocoding (dirección ↔ coordenadas)
  - [x] Autocompletado de direcciones (restringido a Puerto Rico)
  - [x] Geolocalización del usuario
  - [x] Manejo de marcadores

- [x] **5.7** Crear servicio de catálogo (`catalogue.service.ts`) ✅ (2025-12-11):
  - [x] Endpoint: `POST api/Catalogue/listCatalogue`
  - [x] Catálogo Hogar (catalogId: 6) con subcatálogos
  - [x] Filtros: Internet Inalámbrico (23), Internet + Telefonía (39)
  - [x] Extracción de productos de estructura anidada
  - [x] Helpers: formatInstallmentPrice, truncateText, parseColors

**Entregable:** ✅ Capa de servicios completa (7 servicios)

---

### FASE 6: Componentes de Pasos (Steps) ✅
> Implementar cada paso del flujo

#### 6.1 Step Location (Paso 1) ✅
- [x] **6.1.1** Crear componente `step-location`
- [x] **6.1.2** Integrar mapa Google Maps (satelital) ✅ (2025-12-10)
- [x] **6.1.3** Implementar input de dirección con autocompletado ✅ (2025-12-10)
- [x] **6.1.4** Botón "Utilizar Ubicación Actual" (geolocalización) ✅ (2025-12-10)
- [x] **6.1.5** Botón "Validar" → llamada API cobertura
- [x] **6.1.6** Modal éxito: servicio disponible
- [x] **6.1.7** Modal error: sin cobertura (fondo rojo)
- [x] **6.1.8** Manejar permisos de ubicación del navegador
- [x] **6.1.9** Overlay de validación centrado ✅ (2025-12-11)

#### 6.2 Step Plans (Paso 2) ✅
- [x] **6.2.1** Crear componente `step-plans`
- [x] **6.2.2** Header con título "Elige tu plan" + botón "Regresar"
- [x] **6.2.3** Grid de 3 cards de planes
- [x] **6.2.4** Card con: nombre, "Plan Incluye", precio, botón "Solicitar plan"
- [x] **6.2.5** Estado seleccionado (borde cyan)
- [x] **6.2.6** Barra sticky inferior: Pago mensual | Paga hoy | Continuar
- [x] **6.2.7** Cargar planes desde API

#### 6.3 Step Contract (Paso 3) ✅
- [x] **6.3.1** Crear componente `step-contract`
- [x] **6.3.2** Header con título + botón "Regresar"
- [x] **6.3.3** Tabs: "Con contrato" | "Sin contrato"
- [x] **6.3.4** Tab "Con contrato": radio cards 12 meses / 24 meses
- [x] **6.3.5** Tab "Sin contrato": detalle de costos
- [x] **6.3.6** Indicador visual de tab activo (línea cyan)
- [x] **6.3.7** Botón "Continuar"

#### 6.4 Step Form (Paso 4) ✅
- [x] **6.4.1** Crear componente `step-form`
- [x] **6.4.2** Header con título + botón "Regresar"
- [x] **6.4.3** Sección datos personales:
  - [x] Nombre*, Segundo nombre
  - [x] Apellido*, Segundo apellido*
  - [x] Identificación (radio: Licencia/Pasaporte) + número*
  - [x] Fecha de vencimiento*
  - [x] Teléfono contacto 1*, Teléfono contacto 2
- [x] **6.4.4** Sección datos empresariales:
  - [x] Nombre del Negocio*
  - [x] Posición en la Empresa*
- [x] **6.4.5** Sección dirección (pre-llenada):
  - [x] Dirección*, Ciudad*
  - [x] Código postal*, Correo electrónico*
- [x] **6.4.6** Pregunta cliente existente: Sí / No
- [x] **6.4.7** Validaciones en tiempo real
- [x] **6.4.8** Mensajes de error bajo cada campo
- [x] **6.4.9** Botón "Continuar" (disabled hasta válido)

#### 6.5 Step Confirmation (Paso 5) ✅
- [x] **6.5.1** Crear componente `step-confirmation`
- [x] **6.5.2** Estado "Cargando" mientras envía solicitud
- [x] **6.5.3** Estado "Éxito":
  - [x] Icono check verde
  - [x] "¡Tu solicitud fue enviada con éxito!"
  - [x] "Pronto nos comunicaremos contigo"
  - [x] Botón "Cerrar"
- [x] **6.5.4** Estado "Error":
  - [x] Icono warning rojo
  - [x] "¡Lo sentimos, ha ocurrido un error..."
  - [x] Botón "Volver a intentar"
- [x] **6.5.5** Emitir evento al padre (onComplete/onError)

#### 6.6 Step Catalogue (CLARO HOGAR) ✅ (2025-12-11)
- [x] **6.6.1** Crear componente `step-catalogue`
- [x] **6.6.2** Grid de productos con cards
- [x] **6.6.3** Filtros laterales (tipo de producto)
- [x] **6.6.4** Búsqueda por texto
- [x] **6.6.5** Cards de altura consistente (flexbox)
- [x] **6.6.6** Loading state con spinner centrado
- [x] **6.6.7** Integración con catalogue.service

**Entregable:** ✅ 6 componentes de pasos completamente funcionales

---

### FASE 7: Componente Orquestador ✅
> Componente raíz que maneja el flujo completo

- [x] **7.1** Crear componente `fixed-service-flow`
- [x] **7.2** Definir Props públicos:
  ```typescript
  @Prop() apiUrl: string;
  @Prop() googleMapsKey: string;
  @Prop() debug?: boolean;
  ```
- [x] **7.3** Definir Events emitidos:
  ```typescript
  @Event() flowComplete: EventEmitter<RequestResult>;
  @Event() flowError: EventEmitter<Error>;
  @Event() flowCancel: EventEmitter<void>;
  @Event() stepChange: EventEmitter<number>;
  ```
- [x] **7.4** Implementar navegación entre pasos
- [x] **7.5** Renderizado condicional de paso actual
- [x] **7.6** Manejo de estado loading global
- [x] **7.7** Manejo de errores global
- [x] **7.8** Cleanup en disconnectedCallback

**Entregable:** ✅ Componente orquestador funcional

---

### FASE 8: Testing ✅
> Pruebas unitarias y de integración

- [x] **8.1** Configurar Jest para Stencil (viene preconfigurado)
- [x] **8.2** Tests unitarios componentes UI ✅ (2025-12-10):
  - [x] ui-button.spec.ts
  - [x] ui-input.spec.ts
  - [x] ui-checkbox.spec.ts
  - [x] fixed-service-flow.spec.ts
- [x] **8.3** Tests unitarios servicios ✅ (2025-12-10):
  - [x] http.service.spec.ts
  - [x] coverage.service.spec.ts
  - [x] plans.service.spec.ts
  - [x] token.service.spec.ts
  - [x] request.service.spec.ts
- [ ] **8.4** Tests de integración steps:
  - [ ] step-location
  - [ ] step-plans
  - [ ] step-contract
  - [ ] step-form
  - [ ] step-confirmation
- [ ] **8.5** Test E2E del flujo completo
- [ ] **8.6** Cobertura mínima: 70%

**Entregable:** ✅ Tests unitarios para servicios y componentes UI creados

---

### FASE 9: Documentación ✅
> Documentar uso del componente

- [x] **9.1** README.md completo ✅ (2025-12-10):
  - [x] Instalación (NPM + CDN)
  - [x] Uso básico
  - [x] Props disponibles con tabla
  - [x] Events emitidos con payloads de ejemplo
  - [x] Ejemplos de código para Angular, React, Vue
  - [x] Theming con CSS custom properties
  - [x] Estructura del proyecto
  - [x] API endpoints
- [x] **9.2** Storybook o página de demo (index.html con demo funcional)
- [ ] **9.3** JSDoc en todos los componentes públicos
- [x] **9.4** CHANGELOG.md ✅ (2025-12-10)
- [x] **9.5** Guía de integración en README (sección Integracion con Frameworks)

**Entregable:** ✅ Documentación completa

---

### FASE 10: Build y Distribución ✅
> Preparar para producción

- [x] **10.1** Configurar output targets:
  - [x] `dist` (para npm) - 61MB
  - [x] `dist-custom-elements` (para bundlers)
  - [x] `www` (para desarrollo) - 7.1MB
- [x] **10.2** Configurar minificación y tree-shaking (Stencil default)
- [x] **10.3** Generar tipos TypeScript (`.d.ts`) (docs-readme target)
- [x] **10.4** Configurar package.json para publicación
- [ ] **10.5** Crear bundle UMD para uso sin bundler
- [x] **10.6** Optimizar assets - No hay assets de imagen (iconos SVG inline)
- [ ] **10.7** Configurar CI/CD (opcional)
- [ ] **10.8** Pruebas de integración en proyecto padre real

**Entregable:** ✅ Build funciona correctamente, listo para distribución

---

### FASE 11: Revisión y Correcciones ⏳
> Revisión de lógica, consumo de servicios y correcciones funcionales

#### 11.1 Validación de Lógica de Negocio (PRIORIDAD ALTA)
- [ ] **11.1.1** Verificar flujo completo de token:
  - [ ] getToken se llama al iniciar
  - [ ] Token se almacena correctamente en sessionStorage
  - [ ] Token se incluye en headers de todas las peticiones
  - [ ] correlationId se maneja correctamente
- [ ] **11.1.2** Verificar flujo de cobertura:
  - [ ] Coordenadas se envían correctamente (lat/lng)
  - [ ] Respuesta de cobertura se parsea correctamente (GPON/VRAD/CLARO HOGAR)
  - [ ] Mensaje correcto según tipo de cobertura
  - [ ] Manejo de "sin cobertura"
- [ ] **11.1.3** Verificar flujo de planes:
  - [ ] Planes se cargan desde API correctamente
  - [ ] addToCart se llama al seleccionar plan
  - [ ] deleteFromCart elimina plan anterior si existe
  - [ ] Plan seleccionado se guarda en sessionStorage
- [ ] **11.1.4** Verificar flujo de contrato:
  - [ ] Opciones de contrato (12/24 meses) con costos correctos
  - [ ] Sin contrato muestra costos correctos ($50 inst, $40 act, $40 modem)
  - [ ] Tipo de contrato se guarda en store
- [ ] **11.1.5** Verificar flujo de formulario:
  - [ ] Validaciones funcionan correctamente
  - [ ] Datos se guardan en store
  - [ ] Dirección pre-llenada del paso 1
- [ ] **11.1.6** Verificar envío de solicitud:
  - [ ] Payload construido correctamente
  - [ ] internetServiceRequest se llama con datos completos
  - [ ] Estados de éxito/error se manejan correctamente

#### 11.2 Pruebas con API Real (PRIORIDAD ALTA)
- [ ] **11.2.1** Probar contra UAT: https://uat-tienda.claropr.com
- [ ] **11.2.2** Verificar getToken funciona y devuelve token válido
- [ ] **11.2.3** Probar getInternetPlans con coordenadas de PR
- [ ] **11.2.4** Probar getPlansInternet con código de servicio real
- [ ] **11.2.5** Probar addToCart con plan real
- [ ] **11.2.6** Probar internetServiceRequest (si es posible en UAT)
- [ ] **11.2.7** Documentar errores encontrados y correcciones

#### 11.3 Manejo de Errores y Edge Cases (PRIORIDAD ALTA)
- [ ] **11.3.1** Token expirado → refresh automático
- [ ] **11.3.2** API timeout → mensaje de error y retry
- [ ] **11.3.3** Error 401 → solicitar nuevo token
- [ ] **11.3.4** Error 500 → mensaje genérico al usuario
- [ ] **11.3.5** Sin conexión → detectar y mostrar mensaje
- [ ] **11.3.6** Campos inválidos → mensajes de error claros

#### 11.4 Corrección de Warnings de Código (PRIORIDAD MEDIA)
- [ ] **11.4.1** Refactorizar `@Prop() onNext/onBack` a `@Event()` en steps
- [ ] **11.4.2** Limpiar código comentado o sin usar
- [ ] **11.4.3** Revisar console.logs en modo producción

#### 11.5 Ajustes Visuales y Estilos (PRIORIDAD BAJA - DESPUÉS)
- [ ] **11.5.1** Comparar con capturas de referencia
- [ ] **11.5.2** Ajustar colores, tipografía, espaciados
- [ ] **11.5.3** Verificar responsive en móviles
- [ ] **11.5.4** Corregir deprecations SCSS (@import → @use)
- [ ] **11.5.5** Revisar estados hover/focus/disabled

**Entregable:** Flujo funcional probado con API real, errores corregidos

---

## Estructura Final del Proyecto

```
fixed-service-flow/
├── src/
│   ├── components/
│   │   ├── fixed-service-flow/      # Componente raíz
│   │   │   ├── fixed-service-flow.tsx
│   │   │   ├── fixed-service-flow.scss
│   │   │   └── test/
│   │   ├── steps/
│   │   │   ├── step-location/
│   │   │   ├── step-plans/
│   │   │   ├── step-contract/
│   │   │   ├── step-form/
│   │   │   └── step-confirmation/
│   │   └── ui/
│   │       ├── ui-button/
│   │       ├── ui-input/
│   │       ├── ui-select/
│   │       ├── ui-radio/
│   │       ├── ui-radio-card/
│   │       ├── ui-date-picker/
│   │       ├── ui-checkbox/
│   │       ├── ui-card/
│   │       ├── ui-tabs/
│   │       ├── ui-modal/
│   │       ├── ui-divider/
│   │       ├── ui-alert/
│   │       ├── ui-loading/
│   │       ├── ui-icon/
│   │       ├── ui-map/
│   │       ├── ui-plan-card/
│   │       ├── ui-contract-option/
│   │       └── ui-summary-bar/
│   ├── services/
│   │   ├── token.service.ts          # ⚠️ CRÍTICO - Primer servicio a implementar
│   │   ├── http.service.ts
│   │   ├── auth.service.ts
│   │   ├── coverage.service.ts
│   │   ├── plans.service.ts
│   │   ├── request.service.ts
│   │   └── maps.service.ts
│   ├── store/
│   │   ├── flow.store.ts
│   │   └── interfaces.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── global/
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   ├── reset.scss
│   │   └── global.scss
│   └── index.html
├── stencil.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── CHANGELOG.md
```

---

## Ejemplo de Uso Final

```html
<!-- En proyecto padre (Angular, React, Vue, HTML) -->
<html>
<head>
  <script type="module" src="https://cdn.example.com/fixed-service-flow/fixed-service-flow.esm.js"></script>
</head>
<body>
  <header><!-- Header del padre --></header>

  <main>
    <fixed-service-flow
      api-url="https://uat-tienda.claropr.com"
      google-maps-key="AIzaSyA8TqyXDoMKIggMpXVvsnfgL1K57aUBSuc"
    ></fixed-service-flow>
  </main>

  <footer><!-- Footer del padre --></footer>

  <script>
    const flow = document.querySelector('fixed-service-flow');

    flow.addEventListener('flowComplete', (e) => {
      console.log('Solicitud completada:', e.detail);
    });

    flow.addEventListener('flowError', (e) => {
      console.error('Error en flujo:', e.detail);
    });
  </script>
</body>
</html>
```

---

## Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Bundle size (gzip) | < 100KB |
| Lighthouse Performance | > 90 |
| Cobertura de tests | > 70% |
| Tiempo de carga inicial | < 2s |
| Compatibilidad navegadores | Chrome, Firefox, Safari, Edge (últimas 2 versiones) |

---

## Referencias

- [Documentación Stencil.js](https://stenciljs.com/docs/introduction)
- [POC UI/UX (PDF)](./POC-MiClaro%20empresas-servicio%20fijo%20(1).pdf)
- [Capturas de referencia](./capturas/)
- [Historial de interacciones](./historial-interacciones-stencil.md)
- [Roles del equipo](./ROLES-EQUIPO.md)

---

*Documento generado: 2025-12-09*
*Última actualización: 2025-12-10*

---

## Resumen de Estado por Fase

| Fase | Descripción | Estado | Completado |
|------|-------------|--------|------------|
| 1 | Configuración del Proyecto | ✅ | 8/8 items |
| 2 | Sistema de Diseño (SCSS) | ✅ | 7/7 items |
| 3 | Componentes UI Base | 🔄 Parcial | 7/17 componentes |
| 4 | Estado Global (Store) | ✅ | 5/5 items |
| 5 | Servicios (APIs) | ✅ | 6/6 servicios |
| 6 | Componentes de Pasos | ✅ | 5/5 steps completos |
| 7 | Componente Orquestador | ✅ | 8/8 items |
| 8 | Testing | ✅ | Tests unitarios creados |
| 9 | Documentación | ✅ | 4/5 items |
| 10 | Build y Distribución | ✅ | 4/8 items |
| **11** | **Revisión y Correcciones** | **⏳** | **0/5 secciones** |

### Tareas Completadas (2025-12-10)

1. ✅ **ESLint y Prettier** - Configurados (.eslintrc.json, .prettierrc, .prettierignore)
2. ✅ **Variables de entorno** - Creados (.env.example, environment.ts)
3. ✅ **ui-checkbox** - Componente creado con TSX y SCSS
4. ✅ **maps.service.ts** - Servicio completo de Google Maps
5. ✅ **Google Maps en step-location** - Integrado con mapa, autocompletado, geolocalización
6. ✅ **Tests de servicios** - 5 archivos .spec.ts creados
7. ✅ **Tests de componentes** - 4 archivos .spec.ts creados
8. ✅ **README.md** - Documentación completa con ejemplos de integración
9. ✅ **CHANGELOG.md** - Historial de cambios v1.0.0

### Tareas Pendientes (Opcionales)

1. **JSDoc** - Documentación en código para componentes públicos
2. **Tests E2E** - Tests de integración de steps y flujo completo
3. **Bundle UMD** - Para uso sin bundler
4. **CI/CD** - Pipeline de integración continua

---

## FASE 12: Flujo Completo CLARO HOGAR (E-Commerce) ⏳
> Implementar flujo de compra completo para productos CLARO HOGAR
> Basado en análisis DETALLADO del proyecto TEL (2025-12-11)
> **REFINADO:** Análisis profundo de cada sub-flujo con estructura exacta

### Resumen del Flujo

```
[1. Catálogo]     →  [2. Detalle]      →  [3. Planes]       →  [4. Resumen]
    ↓                    ↓                    ↓                    ↓
Grid productos     Ver producto         Seleccionar plan     Ver orden
Click "Ver más"    Agregar al carrito   Agregar al carrito   Continuar
                                                                  ↓
[8. Confirmación] ←  [7. Pago]         ←  [6. Orden]        ←  [5. Dirección]
    ↓                    ↓                    ↓                    ↓
Éxito/Error        iframe de pago       Crear orden          Formulario envío
```

---

## 🎨 PATRONES DE SCSS (Referencia TEL)

> Los siguientes patrones SCSS deben usarse para mantener consistencia visual con TEL

### Colores del Sistema
```scss
// Primarios
$claro-red: #DA291C;        // Botones primarios, error
$claro-teal: #0097A9;       // Selección, links, breadcrumb activo
$claro-green: #44af69;      // Éxito, confirmación

// Neutrales
$bg-light: #F4F4F4;         // Fondo de cards, order items
$text-primary: #333333;     // Texto principal
$text-secondary: #666666;   // Texto secundario
$border-color: #e0e0e0;     // Bordes

// Sombras
$shadow-card: 0 2px 8px rgba(0, 0, 0, 0.1);
$shadow-strong: 0 4px 16px rgba(0, 0, 0, 0.15);
```

### Mixins Comunes (de TEL)
```scss
// Botón primario (border-radius 30px)
@mixin btn-primary {
  background: $claro-red;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: darken($claro-red, 10%);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

// Input estilo TEL
@mixin input-field {
  height: 44px;
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: $claro-teal;
  }

  &.error {
    border-color: $claro-red;
  }
}

// Card contenedora
@mixin card-container {
  background: white;
  border-radius: 12px;
  box-shadow: $shadow-card;
  padding: 20px;
}

// Grid responsive 2 columnas
@mixin grid-two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

### Breakpoints (de TEL)
```scss
$breakpoints: (
  xs: 320px,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);
```

---

### 12.1 Step Product Detail (Vista de Detalle del Producto) ⏳
> Muestra información detallada del producto seleccionado
> **Referencia TEL:** `product-web.component.ts/html/scss`

#### 12.1.0 Análisis Detallado del Flujo TEL

**Flujo de navegación:**
```
Catálogo → Click "Ver más" → product-web → equipmentDetail API → Mostrar detalle
```

**Estados del componente (TEL):**
```typescript
// De product-web.component.ts
showProduct: boolean = true;      // Vista de detalle
showPlans: boolean = false;       // Vista de planes (navegación interna)
showAccessory: boolean = false;   // Vista de accesorios

// Índices de selección
indexColor: number = 0;           // Color seleccionado
indexStorage: number = 0;         // Storage seleccionado

// Datos del producto
product: any;                     // Producto completo de API
colorPrices: any[];               // Precios por color
storagePrices: any[];             // Precios por almacenamiento
installmentsArray: any[];         // Array de opciones de cuotas
```

**SessionStorage Keys (TEL):**
```typescript
'parentId'      // productId del producto padre
'childrenId'    // productId del SKU seleccionado (color+storage)
'color'         // Nombre del color seleccionado
'indexColor'    // Índice del color en array
'storage'       // Nombre del almacenamiento
'deviceType'    // Tipo: 'phone' | 'tablet' | 'accesory'
'mainId'        // cartId devuelto por addToCart
'product'       // JSON del producto completo (Base64)
```

#### 12.1.1 Crear Componente
- [ ] **12.1.1.1** Crear `step-product-detail/step-product-detail.tsx`
- [ ] **12.1.1.2** Crear `step-product-detail/step-product-detail.scss`
- [ ] **12.1.1.3** Definir props: `productId`, `onNext`, `onBack`
- [ ] **12.1.1.4** Definir estados: `product`, `isLoading`, `error`, `selectedColor`, `selectedStorage`

#### 12.1.2 UI del Detalle (Estructura HTML TEL)

```html
<!-- Estructura de product-web.component.html -->
<div class="product-container">
  <!-- Breadcrumb -->
  <div class="route">
    <span class="route-item" (click)="goBack()">Catálogo</span>
    <span class="separator">></span>
    <span class="route-item active">{{ product.productName }}</span>
  </div>

  <!-- Grid principal: 2 columnas -->
  <div class="product-grid">
    <!-- Columna izquierda: Imagen -->
    <div class="product-image">
      <img [src]="currentImage" [alt]="product.productName" />
      <!-- Thumbnails de colores -->
      <div class="color-thumbnails" *ngIf="product.colors?.length > 1">
        <div *ngFor="let color of product.colors; let i = index"
             [class.selected]="i === indexColor"
             (click)="selectColor(i)">
          <img [src]="color.imgUrl" />
        </div>
      </div>
    </div>

    <!-- Columna derecha: Info -->
    <div class="product-info">
      <h1 class="product-name">{{ product.productName }}</h1>
      <p class="brand">{{ product.brandName }}</p>

      <!-- Selector de color -->
      <div class="color-selector" *ngIf="product.colors?.length">
        <label>Color:</label>
        <div class="color-options">
          <div *ngFor="let color of product.colors; let i = index"
               class="color-circle"
               [style.background]="color.webColor"
               [class.selected]="i === indexColor"
               (click)="selectColor(i)"
               [title]="color.colorName">
          </div>
        </div>
        <span class="color-name">{{ selectedColorName }}</span>
      </div>

      <!-- Selector de almacenamiento -->
      <div class="storage-selector" *ngIf="storagePrices?.length > 1">
        <label>Capacidad:</label>
        <div class="storage-options">
          <button *ngFor="let storage of storagePrices; let i = index"
                  [class.selected]="i === indexStorage"
                  (click)="selectStorage(i)">
            {{ storage.storageName }}
          </button>
        </div>
      </div>

      <!-- Precio -->
      <div class="price-section">
        <div class="installment-price">
          <span class="price-label">Desde</span>
          <span class="price-value">${{ installmentPrice }}/mes</span>
          <span class="installments">× {{ selectedInstallments }} meses</span>
        </div>
        <div class="regular-price">
          <span>Precio regular: ${{ regularPrice }}</span>
        </div>
      </div>

      <!-- Selector de cuotas -->
      <div class="installment-selector">
        <label>Elige tus meses sin intereses:</label>
        <div class="installment-options">
          <button *ngFor="let option of installmentsArray"
                  [class.selected]="option.value === selectedInstallments"
                  (click)="selectInstallments(option.value)">
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Botón agregar al carrito -->
      <button class="btn-add-cart" (click)="addToCart()" [disabled]="isAdding">
        {{ isAdding ? 'Agregando...' : 'Agregar al carrito' }}
      </button>
    </div>
  </div>

  <!-- Descripción y especificaciones -->
  <div class="product-details">
    <div class="description">
      <h3>Descripción</h3>
      <p [innerHTML]="product.longDescription"></p>
    </div>
    <div class="specifications" *ngIf="product.specifications?.length">
      <h3>Especificaciones</h3>
      <table>
        <tr *ngFor="let spec of product.specifications">
          <td class="spec-name">{{ spec.name }}</td>
          <td class="spec-value">{{ spec.value }}</td>
        </tr>
      </table>
    </div>
  </div>
</div>
```

**SCSS del Product Detail (TEL):**
```scss
// De product-web.component.scss
.product-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.route {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;

  .route-item {
    color: #666;
    cursor: pointer;

    &.active {
      color: #0097A9;  // Teal para activo
      font-weight: 500;
    }

    &:hover:not(.active) {
      text-decoration: underline;
    }
  }

  .separator {
    color: #ccc;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.product-image {
  img {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
    object-fit: contain;
  }
}

.color-selector {
  margin: 16px 0;

  .color-options {
    display: flex;
    gap: 12px;
    margin: 8px 0;
  }

  .color-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s;

    &.selected {
      border-color: #0097A9;
    }

    &:hover {
      transform: scale(1.1);
    }
  }
}

.storage-selector {
  margin: 16px 0;

  .storage-options {
    display: flex;
    gap: 12px;
    margin: 8px 0;

    button {
      padding: 8px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;

      &.selected {
        border-color: #0097A9;
        background: rgba(0, 151, 169, 0.1);
      }
    }
  }
}

.price-section {
  margin: 24px 0;

  .installment-price {
    .price-value {
      font-size: 32px;
      font-weight: 700;
      color: #DA291C;
    }
  }

  .regular-price {
    font-size: 14px;
    color: #666;
    text-decoration: line-through;
  }
}

.btn-add-cart {
  width: 100%;
  max-width: 300px;
  @include btn-primary;
}
```

- [ ] **12.1.2.1** Header con breadcrumb (Catálogo > Nombre producto) - color teal #0097A9
- [ ] **12.1.2.2** Grid 2 columnas: imagen izquierda, info derecha
- [ ] **12.1.2.3** Selector de colores con círculos de color real (webColor)
- [ ] **12.1.2.4** Selector de almacenamiento con botones
- [ ] **12.1.2.5** Selector de cuotas (12, 18, 24, 36 meses)
- [ ] **12.1.2.6** Precio con formato: "$XX/mes × N meses" + precio regular tachado
- [ ] **12.1.2.7** Descripción con innerHTML (puede tener HTML)
- [ ] **12.1.2.8** Tabla de especificaciones (2 columnas)
- [ ] **12.1.2.9** Botón "Agregar al carrito" (rojo, border-radius 30px)

#### 12.1.3 Lógica de Negocio (Detalle TEL)

**Flujo de selectColor():**
```typescript
selectColor(index: number): void {
  this.indexColor = index;
  const color = this.product.colors[index];

  // Actualizar imagen
  this.currentImage = color.imgUrl || this.product.imgUrl;

  // Guardar en session
  sessionStorage.setItem('color', color.colorName);
  sessionStorage.setItem('indexColor', String(index));

  // Recalcular storages disponibles para este color
  this.storagePrices = this.getStoragesForColor(index);
  this.indexStorage = 0;

  // Obtener childrenId para este color+storage
  this.updateChildrenId();
}
```

**Flujo de addToCart():**
```typescript
async addToCart(): Promise<void> {
  this.isAdding = true;

  const childrenId = this.product.colors[this.indexColor]
    .storage[this.indexStorage]?.childrenId || this.product.productId;

  const request = {
    token: this.token,
    productId: childrenId,
    installments: this.selectedInstallments,
    decPrice: this.installmentPrice,
    decTotalPrice: this.regularPrice,
    Qty: 1,
    flowId: 6,  // CLARO HOGAR
    parentProductId: 0,
    parentCartId: 0,
    creditClass: 'C',
    // ... otros campos
  };

  const response = await this.cartService.addToCart(request);

  if (!response.hasError) {
    sessionStorage.setItem('mainId', String(response.code));
    this.navigateToPlans();
  }

  this.isAdding = false;
}
```

- [ ] **12.1.3.1** Llamar API `equipmentDetail` al cargar con productId
- [ ] **12.1.3.2** Parsear `colors` → cada color tiene array de `storage`
- [ ] **12.1.3.3** Calcular `childrenId` = product.colors[colorIdx].storage[storageIdx].childrenId
- [ ] **12.1.3.4** Calcular precio: `update_price / installments`
- [ ] **12.1.3.5** Guardar en sessionStorage: parentId, childrenId, color, indexColor, storage, deviceType

#### 12.1.4 API Endpoints

**Request equipmentDetail:**
```json
{
  "productId": 12345,
  "userID": 0,
  "token": "jwt-token-here"
}
```

**Response equipmentDetail:**
```json
{
  "hasError": false,
  "productId": 12345,
  "productName": "Router Inalámbrico AC1200",
  "brandName": "Claro",
  "imgUrl": "https://...",
  "detailImage": "https://...",
  "shortDescription": "Router WiFi de alta velocidad",
  "longDescription": "<p>Descripción completa...</p>",
  "regular_price": 199.99,
  "update_price": 83.33,
  "installments": 24,
  "colors": [
    {
      "colorId": 1,
      "colorName": "Negro",
      "webColor": "#000000",
      "imgUrl": "https://...",
      "storage": [
        {
          "storageId": 1,
          "storageName": "Estándar",
          "childrenId": 12346,
          "priceDiff": 0
        }
      ]
    }
  ],
  "specifications": [
    { "name": "Velocidad", "value": "1200 Mbps" },
    { "name": "Bandas", "value": "Dual Band 2.4GHz/5GHz" }
  ]
}
```

- [ ] **12.1.4.1** `POST api/Catalogue/equipmentDetail` - Detalle del producto
- [ ] **12.1.4.2** Crear `product.service.ts` con métodos específicos

**Entregable:** Componente de detalle de producto funcional con selección de variantes

---

### 12.2 Servicio de Producto (product.service.ts) ⏳
> Gestiona información detallada de productos

#### 12.2.1 Crear Servicio
- [ ] **12.2.1.1** Crear `services/product.service.ts`
- [ ] **12.2.1.2** Definir interfaces: `ProductDetail`, `ProductColor`, `ProductStorage`

#### 12.2.2 Métodos Principales
- [ ] **12.2.2.1** `equipmentDetail(productId)` - Obtiene detalle del producto
- [ ] **12.2.2.2** `getColors(product)` - Extrae colores disponibles
- [ ] **12.2.2.3** `getStorages(product, colorIndex)` - Almacenamientos por color
- [ ] **12.2.2.4** `calculatePrice(product, installments)` - Calcula precio según cuotas
- [ ] **12.2.2.5** `getChildrenId(product, colorIndex, storageIndex)` - Obtiene SKU específico

#### 12.2.3 SessionStorage
- [ ] **12.2.3.1** `setParentId(productId)` - Guarda ID del producto padre
- [ ] **12.2.3.2** `setChildrenId(skuId)` - Guarda ID del SKU seleccionado
- [ ] **12.2.3.3** `getSelectedProduct()` - Recupera producto seleccionado
- [ ] **12.2.3.4** `clearProduct()` - Limpia selección

**Entregable:** Servicio de producto completo

---

### 12.3 Servicio de Carrito Mejorado (cart.service.ts) ⏳
> Gestiona el carrito de compras completo

#### 12.3.1 Crear/Extender Servicio
- [ ] **12.3.1.1** Crear `services/cart.service.ts` (o extender plans.service.ts)
- [ ] **12.3.1.2** Definir interfaces: `CartItem`, `Cart`, `AddToCartRequest`

#### 12.3.2 Métodos del Carrito
- [ ] **12.3.2.1** `addToCart(item)` - Agrega item al carrito (POST api/Card/addToCart)
- [ ] **12.3.2.2** `getCart()` - Obtiene carrito actual (POST api/Card/getCart)
- [ ] **12.3.2.3** `deleteItem(cartId, productId)` - Elimina item (POST api/Card/deleteItem)
- [ ] **12.3.2.4** `updateQuantity(cartId, quantity)` - Actualiza cantidad
- [ ] **12.3.2.5** `clearCart()` - Vacía el carrito

#### 12.3.3 Estructura del CartItem (basado en TEL)
```typescript
interface CartItem {
  token: string;
  productId: number;
  notificationDetailID: number;
  chvSource: string;
  promoCode: string;
  installments: number;
  decPrice: number;
  decDeposit: number;
  decDownPayment: number;
  decTotalPrice: number;
  Qty: number;
  flowId: number;
  ssoToken: string;
  userID: string;
  parentProductId: number;
  parentCartId: number;
  creditClass: string;
  downgradeAllowed: boolean;
  pendingAccelerated: number;
  acceletartedAmount: number;
  pastDueAmount: number;
  delicuency: boolean;
}
```

#### 12.3.4 Reglas de Compra
- [ ] **12.3.4.1** Máximo 4 accesorios por orden
- [ ] **12.3.4.2** Máximo 1 dispositivo con plan
- [ ] **12.3.4.3** Validar combinaciones permitidas

**Entregable:** Servicio de carrito completo con todas las operaciones

---

### 12.4 Step Plans para CLARO HOGAR ⏳
> Vista de planes asociados al producto seleccionado

#### 12.4.1 Actualizar Componente Existente o Crear Nuevo
- [ ] **12.4.1.1** Evaluar si reutilizar `step-plans` o crear `step-product-plans`
- [ ] **12.4.1.2** Adaptar para recibir `parentProductId` y `childrenId`
- [ ] **12.4.1.3** Mostrar planes específicos del producto

#### 12.4.2 UI de Planes
- [ ] **12.4.2.1** Header con nombre del producto + "Regresar"
- [ ] **12.4.2.2** Grid de cards de planes
- [ ] **12.4.2.3** Mostrar precio mensual de cada plan
- [ ] **12.4.2.4** Indicador de "Plan Sugerido" (si aplica)
- [ ] **12.4.2.5** Opción "Mantener plan actual" (si existe)
- [ ] **12.4.2.6** Botón "Seleccionar" en cada plan

#### 12.4.3 Lógica de Negocio
- [ ] **12.4.3.1** Llamar API `getPlans` con datos del producto
- [ ] **12.4.3.2** Si hay plan anterior diferente, eliminarlo del carrito
- [ ] **12.4.3.3** Agregar plan seleccionado al carrito
- [ ] **12.4.3.4** Guardar plan en sessionStorage

#### 12.4.4 API Endpoint
- [ ] **12.4.4.1** `POST api/Plans/getPlans` con payload:
  ```json
  {
    "productId": 123,
    "creditClass": "C",
    "price": 99.99,
    "currentPricePlan": 0,
    "currentParentProductId": 456
  }
  ```

**Entregable:** Vista de planes asociados funcional

---

### 12.5 Step Order Summary (Resumen de Orden) ⏳
> Muestra todos los items del carrito y permite editar/continuar
> **Referencia TEL:** `order-summary-web.component.ts/html/scss`

#### 12.5.0 Análisis Detallado del Flujo TEL

**Estructura del componente (TEL):**
```
order-summary-web/
├── order-summary-web.component.ts
├── order-summary-web.component.html
├── order-summary-web.component.scss
└── components/
    ├── order-items-web/      # Lista de items del carrito
    └── payment-detail-web/   # Desglose de pagos
```

**Layout principal (Grid 2 columnas):**
```scss
// De order-summary-web.component.scss
.summary-container {
  display: grid;
  grid-template-columns: 1fr 420px;  // Items | Detalles
  gap: 24px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.order-items {
  background: #F4F4F4;
  padding: 20px;
  border-radius: 12px;
}

.order-details {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}
```

**Estructura HTML (TEL):**
```html
<!-- order-summary-web.component.html -->
<div class="order-summary-container">
  <h2 class="title">Resumen de tu orden</h2>

  <div class="summary-container">
    <!-- Columna izquierda: Items -->
    <div class="order-items">
      <app-order-items-web
        [cartItems]="cartItems"
        (onEdit)="editItem($event)"
        (onDelete)="deleteItem($event)">
      </app-order-items-web>
    </div>

    <!-- Columna derecha: Detalles de pago -->
    <div class="order-details">
      <app-payment-detail-web
        [cart]="cart"
        [showTerms]="true"
        (onContinue)="proceedToCheckout()">
      </app-payment-detail-web>
    </div>
  </div>
</div>
```

**Componente order-items-web (lista de items):**
```html
<!-- order-items-web.component.html -->
<div class="items-container">
  <div class="item" *ngFor="let item of cartItems">
    <div class="item-grid">
      <!-- Imagen -->
      <div class="item-image">
        <img [src]="item.detailImage || item.imgUrl" [alt]="item.productName" />
      </div>

      <!-- Info -->
      <div class="item-info">
        <h4 class="item-name">{{ item.productName }}</h4>
        <p class="item-variant" *ngIf="item.webColor || item.storage">
          {{ item.webColor }} {{ item.storage ? '- ' + item.storage : '' }}
        </p>
        <p class="item-brand" *ngIf="item.brand">{{ item.brand }}</p>
      </div>

      <!-- Precio -->
      <div class="item-price">
        <span class="monthly">${{ item.decTotalPerMonth | number:'1.2-2' }}/mes</span>
        <span class="installments">× {{ item.installments }} meses</span>
      </div>

      <!-- Acciones -->
      <div class="item-actions">
        <button class="btn-edit" (click)="edit(item)">
          <svg><!-- icono editar --></svg>
        </button>
        <button class="btn-delete" (click)="delete(item)">
          <svg><!-- icono eliminar --></svg>
        </button>
      </div>
    </div>
  </div>
</div>
```

**Componente payment-detail-web (desglose):**
```html
<!-- payment-detail-web.component.html -->
<div class="payment-detail">
  <h3 class="section-title">Detalle de pago</h3>

  <!-- Desglose -->
  <div class="payment-breakdown">
    <div class="line-item">
      <span>Subtotal</span>
      <span>${{ cart.subTotalPrice | number:'1.2-2' }}</span>
    </div>

    <div class="line-item" *ngIf="cart.totalDownPayment > 0">
      <span>Cuota inicial</span>
      <span>${{ cart.totalDownPayment | number:'1.2-2' }}</span>
    </div>

    <div class="line-item" *ngIf="cart.depositAmount > 0">
      <span>Depósito</span>
      <span>${{ cart.depositAmount | number:'1.2-2' }}</span>
    </div>

    <div class="line-item">
      <span>Impuestos (IVU 11.5%)</span>
      <span>${{ cart.totalTax | number:'1.2-2' }}</span>
    </div>

    <div class="line-item total">
      <span>Total a pagar hoy</span>
      <span class="total-amount">${{ totalToday | number:'1.2-2' }}</span>
    </div>
  </div>

  <!-- Cuota mensual -->
  <div class="monthly-section" *ngIf="cart.installmentAmount > 0">
    <div class="line-item highlight">
      <span>Pago mensual</span>
      <span class="monthly-amount">${{ cart.installmentAmount | number:'1.2-2' }}/mes</span>
    </div>
  </div>

  <!-- Términos y condiciones -->
  <div class="terms-section" *ngIf="showTerms">
    <label class="checkbox-container">
      <input type="checkbox" [(ngModel)]="acceptedTerms" />
      <span class="checkmark"></span>
      <span class="terms-text">
        Acepto los <a href="#">términos y condiciones</a>
      </span>
    </label>
  </div>

  <!-- Botón continuar -->
  <button class="btn-continue"
          [disabled]="!acceptedTerms || isProcessing"
          (click)="continue()">
    {{ isProcessing ? 'Procesando...' : 'Procesar orden' }}
  </button>
</div>
```

**SCSS de order-items-web:**
```scss
// De order-items-web.component.scss
.items-container {
  .item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  }

  .item-grid {
    display: grid;
    grid-template-columns: 80px 1fr auto auto;
    gap: 16px;
    align-items: center;

    @media (max-width: 576px) {
      grid-template-columns: 60px 1fr;
      grid-template-rows: auto auto;
    }
  }

  .item-image {
    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: contain;
      border-radius: 8px;
    }
  }

  .item-name {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .item-variant {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .item-price {
    text-align: right;

    .monthly {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #DA291C;
    }

    .installments {
      font-size: 12px;
      color: #666;
    }
  }

  .item-actions {
    display: flex;
    gap: 8px;

    button {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &.btn-edit {
        background: #f0f0f0;
        color: #666;

        &:hover {
          background: #e0e0e0;
        }
      }

      &.btn-delete {
        background: #ffebee;
        color: #DA291C;

        &:hover {
          background: #ffcdd2;
        }
      }
    }
  }
}
```

**SCSS de payment-detail-web:**
```scss
// De payment-detail-web.component.scss
.payment-detail {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
  }

  .payment-breakdown {
    .line-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;

      &.total {
        border-top: 2px solid #333;
        margin-top: 12px;
        padding-top: 12px;
        font-weight: 700;

        .total-amount {
          font-size: 20px;
          color: #DA291C;
        }
      }
    }
  }

  .monthly-section {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;

    .monthly-amount {
      font-size: 24px;
      font-weight: 700;
      color: #0097A9;
    }
  }

  .terms-section {
    margin: 20px 0;

    .checkbox-container {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: #0097A9;
      }

      .terms-text {
        font-size: 14px;
        line-height: 1.4;

        a {
          color: #0097A9;
          text-decoration: underline;
        }
      }
    }
  }

  .btn-continue {
    width: 100%;
    padding: 16px;
    background: #DA291C;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 20px;

    &:hover:not(:disabled) {
      background: darken(#DA291C, 10%);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}
```

#### 12.5.1 Crear Componente
- [ ] **12.5.1.1** Crear `step-order-summary/step-order-summary.tsx`
- [ ] **12.5.1.2** Crear `step-order-summary/step-order-summary.scss`
- [ ] **12.5.1.3** Crear sub-componentes: `order-items`, `payment-detail`
- [ ] **12.5.1.4** Definir props: `onNext`, `onBack`, `onEdit`
- [ ] **12.5.1.5** Definir estados: `cartItems`, `cart`, `acceptedTerms`, `isProcessing`

#### 12.5.2 UI del Resumen (Estructura Detallada)
- [ ] **12.5.2.1** Layout grid 2 columnas (1fr 420px) - responsive a 1 columna en mobile
- [ ] **12.5.2.2** Columna izquierda (order-items):
  - [ ] Fondo #F4F4F4
  - [ ] Cards de items con imagen 80px, info, precio, botones
  - [ ] Grid interno: imagen | info | precio | acciones
- [ ] **12.5.2.3** Columna derecha (payment-detail):
  - [ ] Sticky top: 20px
  - [ ] Box-shadow con fondo blanco
  - [ ] Desglose: Subtotal, Cuota inicial, Depósito, Impuestos, Total
  - [ ] Sección pago mensual con fondo #f8f9fa
  - [ ] Checkbox términos y condiciones
  - [ ] Botón "Procesar orden" (rojo, border-radius 30px)
- [ ] **12.5.2.4** Botones de editar (círculo gris) y eliminar (círculo rojo claro)

#### 12.5.3 Lógica de Negocio (Detalle TEL)

**Flujo de carga:**
```typescript
async loadCart(): Promise<void> {
  this.isLoading = true;
  const response = await cartService.getCart();

  if (!response.hasError) {
    this.cart = response;
    this.cartItems = response.products || [];
    this.calculateTotals();
  }

  this.isLoading = false;
}
```

**Cálculo de totales:**
```typescript
calculateTotals(): void {
  // Total a pagar hoy = Cuota inicial + Depósito + Impuestos
  this.totalToday = (this.cart.totalDownPayment || 0)
                  + (this.cart.depositAmount || 0)
                  + (this.cart.totalTax || 0);

  // Pago mensual viene de la API
  this.monthlyPayment = this.cart.installmentAmount || 0;
}
```

**Eliminar item:**
```typescript
async deleteItem(item: CartItem): Promise<void> {
  const response = await cartService.deleteItem(item.cartId, item.productId);

  if (!response.hasError) {
    // Recargar carrito para actualizar totales
    await this.loadCart();
  }
}
```

- [ ] **12.5.3.1** Llamar `getCart()` al cargar - endpoint `POST api/Card/getCart`
- [ ] **12.5.3.2** Calcular `totalToday` = downPayment + deposit + taxes
- [ ] **12.5.3.3** Mostrar `installmentAmount` como pago mensual
- [ ] **12.5.3.4** Eliminar item con `POST api/Card/deleteItem` y recargar carrito
- [ ] **12.5.3.5** Checkbox de términos debe estar checked para habilitar botón
- [ ] **12.5.3.6** Al hacer click "Procesar orden" → navegar a shipping

#### 12.5.4 API Response getCart

```json
{
  "hasError": false,
  "products": [
    {
      "cartId": 123,
      "productId": 456,
      "productName": "Router AC1200",
      "qty": 1,
      "decPrice": 199.99,
      "decTotalPerMonth": 8.33,
      "installments": 24,
      "webColor": "Negro",
      "storage": null,
      "brand": "Claro",
      "detailImage": "https://..."
    }
  ],
  "subTotalPrice": 199.99,
  "totalPrice": 223.99,
  "depositAmount": 0,
  "totalDownPayment": 0,
  "totalTax": 23.00,
  "installmentAmount": 8.33
}
```

**Entregable:** Vista de resumen de orden con layout 2 columnas y desglose de pagos

---

### 12.6 Step Shipping (Dirección de Envío) ⏳
> Formulario de dirección para envío del producto
> **Referencia TEL:** `shipment-web.component.ts/html/scss`

#### 12.6.0 Análisis Detallado del Flujo TEL

**Estructura de campos (16 campos totales):**
```
Sección 1: Información Personal
├── Nombre*
├── Segundo nombre
├── Apellido*
└── Segundo apellido*

Sección 2: Contacto
├── Email*
├── Teléfono primario* (con directiva de formato)
└── Teléfono secundario (con directiva de formato)

Sección 3: Dirección de Envío
├── Dirección línea 1*
├── Dirección línea 2
├── Urbanización
├── Ciudad*
├── Estado (Puerto Rico - fijo)
└── Código postal* (validado contra lista PR)

Sección 4: Autorizado a Recibir (opcional)
├── Nombre del autorizado
├── Teléfono del autorizado
└── Instrucciones especiales
```

**Estructura HTML (TEL):**
```html
<!-- shipment-web.component.html -->
<div class="shipping-container">
  <h2 class="title">Dirección de Envío</h2>

  <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
    <!-- Sección: Información Personal -->
    <div class="form-section">
      <h3 class="section-title">Información Personal</h3>

      <div class="form-grid">
        <!-- Nombre -->
        <div class="form-group">
          <label for="firstName">Nombre *</label>
          <input type="text" id="firstName" formControlName="firstName"
                 [class.error]="isInvalid('firstName')" />
          <span class="error-message" *ngIf="isInvalid('firstName')">
            El nombre es requerido
          </span>
        </div>

        <!-- Segundo nombre -->
        <div class="form-group">
          <label for="secondName">Segundo nombre</label>
          <input type="text" id="secondName" formControlName="secondName" />
        </div>

        <!-- Apellido -->
        <div class="form-group">
          <label for="lastName">Apellido *</label>
          <input type="text" id="lastName" formControlName="lastName"
                 [class.error]="isInvalid('lastName')" />
          <span class="error-message" *ngIf="isInvalid('lastName')">
            El apellido es requerido
          </span>
        </div>

        <!-- Segundo apellido -->
        <div class="form-group">
          <label for="secondLastName">Segundo apellido *</label>
          <input type="text" id="secondLastName" formControlName="secondLastName"
                 [class.error]="isInvalid('secondLastName')" />
        </div>
      </div>
    </div>

    <!-- Sección: Contacto -->
    <div class="form-section">
      <h3 class="section-title">Información de Contacto</h3>

      <div class="form-grid">
        <!-- Email -->
        <div class="form-group full-width">
          <label for="email">Correo electrónico *</label>
          <input type="email" id="email" formControlName="email"
                 [class.error]="isInvalid('email')" />
          <span class="error-message" *ngIf="isInvalid('email')">
            Ingresa un email válido
          </span>
        </div>

        <!-- Teléfono primario -->
        <div class="form-group">
          <label for="phone1">Teléfono primario *</label>
          <input type="tel" id="phone1" formControlName="phone1"
                 appPhoneMask
                 placeholder="(787) 000-0000"
                 [class.error]="isInvalid('phone1')" />
          <span class="error-message" *ngIf="isInvalid('phone1')">
            Ingresa un teléfono válido
          </span>
        </div>

        <!-- Teléfono secundario -->
        <div class="form-group">
          <label for="phone2">Teléfono secundario</label>
          <input type="tel" id="phone2" formControlName="phone2"
                 appPhoneMask
                 placeholder="(787) 000-0000" />
        </div>
      </div>
    </div>

    <!-- Sección: Dirección -->
    <div class="form-section">
      <h3 class="section-title">Dirección de Envío</h3>

      <div class="form-grid">
        <!-- Dirección línea 1 -->
        <div class="form-group full-width">
          <label for="address1">Dirección *</label>
          <input type="text" id="address1" formControlName="address1"
                 [class.error]="isInvalid('address1')" />
        </div>

        <!-- Dirección línea 2 -->
        <div class="form-group full-width">
          <label for="address2">Apartamento, suite, etc.</label>
          <input type="text" id="address2" formControlName="address2" />
        </div>

        <!-- Urbanización -->
        <div class="form-group">
          <label for="urbanization">Urbanización</label>
          <input type="text" id="urbanization" formControlName="urbanization" />
        </div>

        <!-- Ciudad -->
        <div class="form-group">
          <label for="city">Ciudad *</label>
          <input type="text" id="city" formControlName="city"
                 [class.error]="isInvalid('city')" />
        </div>

        <!-- Estado (fijo Puerto Rico) -->
        <div class="form-group">
          <label for="state">Estado</label>
          <input type="text" id="state" value="Puerto Rico" disabled />
        </div>

        <!-- Código postal -->
        <div class="form-group">
          <label for="zipCode">Código postal *</label>
          <input type="text" id="zipCode" formControlName="zipCode"
                 maxlength="5"
                 [class.error]="isInvalid('zipCode')" />
          <span class="error-message" *ngIf="isInvalid('zipCode')">
            Código postal inválido para Puerto Rico
          </span>
        </div>
      </div>
    </div>

    <!-- Sección: Autorizado (opcional) -->
    <div class="form-section">
      <h3 class="section-title">Autorizado a Recibir (Opcional)</h3>

      <div class="form-grid">
        <div class="form-group">
          <label for="authorizedName">Nombre del autorizado</label>
          <input type="text" id="authorizedName" formControlName="authorizedName" />
        </div>

        <div class="form-group">
          <label for="authorizedPhone">Teléfono del autorizado</label>
          <input type="tel" id="authorizedPhone" formControlName="authorizedPhone"
                 appPhoneMask />
        </div>

        <div class="form-group full-width">
          <label for="instructions">Instrucciones especiales</label>
          <textarea id="instructions" formControlName="instructions" rows="3"></textarea>
        </div>
      </div>
    </div>

    <!-- Botón submit -->
    <div class="form-actions">
      <button type="button" class="btn-back" (click)="goBack()">Regresar</button>
      <button type="submit" class="btn-continue" [disabled]="!shippingForm.valid || isSubmitting">
        {{ isSubmitting ? 'Procesando...' : 'Continuar' }}
      </button>
    </div>
  </form>
</div>
```

**SCSS de shipment-web:**
```scss
// De shipment-web.component.scss
.shipping-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
}

.form-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #0097A9;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }

  .form-group {
    &.full-width {
      grid-column: 1 / -1;
    }
  }
}

.form-group {
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  input, textarea {
    width: 100%;
    height: 44px;
    padding: 0 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #0097A9;
    }

    &.error {
      border-color: #DA291C;
    }

    &:disabled {
      background: #f5f5f5;
      color: #666;
    }
  }

  textarea {
    height: auto;
    padding: 12px 16px;
    resize: vertical;
  }

  .error-message {
    display: block;
    font-size: 12px;
    color: #DA291C;
    margin-top: 4px;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;

  .btn-back {
    padding: 14px 32px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      border-color: #ccc;
    }
  }

  .btn-continue {
    flex: 1;
    max-width: 300px;
    padding: 14px 32px;
    background: #DA291C;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: darken(#DA291C, 10%);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}
```

**Directiva de teléfono (phone.directive.ts de TEL):**
```typescript
// Formatea teléfono como (XXX) XXX-XXXX
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
```

**Validador de código postal Puerto Rico:**
```typescript
// Lista de códigos postales válidos de Puerto Rico (320+ códigos)
const PR_ZIP_CODES = [
  '00601', '00602', '00603', '00604', '00605', '00606', '00610', '00611',
  '00612', '00613', '00614', '00616', '00617', '00622', '00623', '00624',
  // ... más de 320 códigos
  '00985', '00987'
];

export function isValidPRZipCode(zipCode: string): boolean {
  return PR_ZIP_CODES.includes(zipCode);
}
```

#### 12.6.1 Crear Componente
- [ ] **12.6.1.1** Crear `step-shipping/step-shipping.tsx`
- [ ] **12.6.1.2** Crear `step-shipping/step-shipping.scss`
- [ ] **12.6.1.3** Crear helper `formatPhone()` para máscara de teléfono
- [ ] **12.6.1.4** Crear validador `isValidPRZipCode()` con lista de códigos PR

#### 12.6.2 Campos del Formulario (16 campos)

**Información Personal:**
- [ ] **12.6.2.1** `firstName` - Nombre* (requerido)
- [ ] **12.6.2.2** `secondName` - Segundo nombre (opcional)
- [ ] **12.6.2.3** `lastName` - Apellido* (requerido)
- [ ] **12.6.2.4** `secondLastName` - Segundo apellido* (requerido)

**Contacto:**
- [ ] **12.6.2.5** `email` - Correo electrónico* (requerido, validación email)
- [ ] **12.6.2.6** `phone1` - Teléfono primario* (requerido, formato (XXX) XXX-XXXX)
- [ ] **12.6.2.7** `phone2` - Teléfono secundario (opcional, mismo formato)

**Dirección:**
- [ ] **12.6.2.8** `address1` - Dirección línea 1* (requerido)
- [ ] **12.6.2.9** `address2` - Apartamento, suite (opcional)
- [ ] **12.6.2.10** `urbanization` - Urbanización (opcional)
- [ ] **12.6.2.11** `city` - Ciudad* (requerido)
- [ ] **12.6.2.12** `state` - Estado (fijo: "Puerto Rico", disabled)
- [ ] **12.6.2.13** `zipCode` - Código postal* (requerido, 5 dígitos, validado contra lista PR)

**Autorizado (opcional):**
- [ ] **12.6.2.14** `authorizedName` - Nombre del autorizado
- [ ] **12.6.2.15** `authorizedPhone` - Teléfono del autorizado (formato)
- [ ] **12.6.2.16** `instructions` - Instrucciones especiales (textarea)

#### 12.6.3 Validaciones (Detalle)

**Validaciones por campo:**
```typescript
const validations = {
  firstName: { required: true, minLength: 2, maxLength: 50 },
  lastName: { required: true, minLength: 2, maxLength: 50 },
  secondLastName: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone1: { required: true, pattern: /^\(\d{3}\) \d{3}-\d{4}$/ },
  address1: { required: true, minLength: 5 },
  city: { required: true, minLength: 2 },
  zipCode: { required: true, pattern: /^\d{5}$/, customValidator: isValidPRZipCode },
};
```

- [ ] **12.6.3.1** Campos requeridos con asterisco visual
- [ ] **12.6.3.2** Email con regex estándar
- [ ] **12.6.3.3** Teléfono con máscara en tiempo real (formatPhone)
- [ ] **12.6.3.4** Código postal validado contra lista de 320+ códigos PR
- [ ] **12.6.3.5** Mensaje de error debajo de cada campo inválido
- [ ] **12.6.3.6** Botón "Continuar" disabled hasta form válido

#### 12.6.4 API Endpoint

**Request api/Address/create:**
```json
{
  "firstName": "Juan",
  "secondName": "",
  "lastName": "Pérez",
  "secondLastName": "García",
  "email": "juan@example.com",
  "phone1": "(787) 123-4567",
  "phone2": "",
  "address1": "Calle Principal 123",
  "address2": "Apt 4B",
  "urbanization": "Villa Marina",
  "city": "San Juan",
  "state": "PR",
  "zipCode": "00901",
  "authorizedName": "",
  "authorizedPhone": "",
  "instructions": ""
}
```

**Response api/Address/create:**
```json
{
  "hasError": false,
  "shipmentId": 12345,
  "message": "Dirección guardada correctamente"
}
```

- [ ] **12.6.4.1** `POST api/Address/create` con todos los campos
- [ ] **12.6.4.2** Guardar `shipmentId` en sessionStorage
- [ ] **12.6.4.3** Guardar `zipCode` en sessionStorage (usado luego para orden)
- [ ] **12.6.4.4** Navegar a payment si respuesta exitosa

**Entregable:** Formulario de envío con 16 campos y validaciones completas de Puerto Rico

---

### 12.7 Servicio de Envío (shipping.service.ts) ⏳
> Gestiona datos de dirección de envío

#### 12.7.1 Crear Servicio
- [ ] **12.7.1.1** Crear `services/shipping.service.ts`
- [ ] **12.7.1.2** Definir interfaces: `ShippingAddress`, `ShippingResponse`

#### 12.7.2 Métodos
- [ ] **12.7.2.1** `create(address)` - Crea/valida dirección de envío
- [ ] **12.7.2.2** `getHasShipping()` - Verifica si requiere envío
- [ ] **12.7.2.3** `setShipmentId(id)` - Guarda ID en session
- [ ] **12.7.2.4** `getShipmentId()` - Obtiene ID de session
- [ ] **12.7.2.5** `setZipCode(zipCode)` - Guarda código postal

**Entregable:** Servicio de envío funcional

---

### 12.8 Servicio de Orden (order.service.ts) ⏳
> Gestiona creación de órdenes

#### 12.8.1 Crear Servicio
- [ ] **12.8.1.1** Crear `services/order.service.ts`
- [ ] **12.8.1.2** Definir interfaces: `OrderRequest`, `OrderResponse`, `OrderDetail`

#### 12.8.2 Métodos
- [ ] **12.8.2.1** `createOrder(data)` - Crea la orden (POST api/Orders/creationOfOrder)
- [ ] **12.8.2.2** `getOrder()` - Obtiene detalles de la orden completada
- [ ] **12.8.2.3** `validateCartData()` - Determina tipo de compra
- [ ] **12.8.2.4** `buildOrderPayload()` - Construye payload de la orden

#### 12.8.3 Tipos de Compra
```typescript
interface PurchaseType {
  isMixed: boolean;        // Equipo + Accesorios
  isOnlyAccessory: boolean; // Solo accesorios
  isOnlyDevice: boolean;    // Solo dispositivo
  isOnlyTablet: boolean;    // Solo tablet
  isInternet: boolean;      // Internet
}
```

#### 12.8.4 Payload de Orden
```typescript
{
  flowId: number;          // 1: nueva línea, 2: línea existente, 3: cambio equipo
  frontFlowId: number;     // ID del flujo frontend
  frontFlowName: string;   // Nombre del flujo
  banExisting: string;     // BAN existente (si aplica)
  subscriberExisting: string;
  amount: number;          // Monto total
  email: string;
  zipCode: string;
  deposit: number;         // Depósito (si aplica)
  pastDueAmount: number;   // Saldo vencido (si aplica)
}
```

**Entregable:** Servicio de órdenes completo

---

### 12.9 Step Payment (Vista de Pago) ⏳
> Integra iframe de pago y maneja resultados
> **Referencia TEL:** `payment-web.component.ts/html/scss`

#### 12.9.0 Análisis Detallado del Flujo TEL

**Flujo de pago completo:**
```
1. createOrder() → api/Orders/creationOfOrder
2. Si éxito → construir URL del iframe con hubId
3. Cargar iframe con postMessage de datos
4. Escuchar eventos del iframe:
   - 'dimensions' → ajustar altura
   - 'start' → iframe listo
   - 'canceled' → pago cancelado
   - 'paymentResult' → pago completado (éxito/error)
5. Si éxito → api/Payment/record
6. Si error → api/Payment/error
7. Navegar a confirmation
```

**Estructura del componente (TEL):**
```typescript
// De payment-web.component.ts
export class PaymentWebComponent {
  // Estados
  isLoading: boolean = true;
  orderCreated: boolean = false;
  paymentCompleted: boolean = false;
  paymentError: boolean = false;

  // Datos de orden
  orderId: string = '';
  orderCode: string = '';

  // URL del iframe
  paymentUrl: SafeResourceUrl;
  hubId: string = '';

  // Listener de postMessage
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    this.handleIframeMessage(event);
  }
}
```

**Construcción del URL del iframe (TEL):**
```typescript
buildPaymentUrl(): string {
  // Generar hubId único para esta sesión
  this.hubId = this.generateHubId();

  // URL base del iframe de pago
  const baseUrl = environment.paymentIframeUrl;

  // Parámetros en URL
  return `${baseUrl}?hubId=${this.hubId}`;
}

generateHubId(): string {
  // Formato: timestamp + random
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

**Método jsonData() de TEL (datos para el iframe):**
```typescript
jsonData(): PaymentIframeData {
  const cart = this.cartService.getCachedCart();

  return {
    tokenSSO: this.tokenService.getToken(),
    data: {
      transactionType: 'MULTIPLE',  // Múltiples items de pago
      firstName: this.shippingData.firstName,
      lastName: this.shippingData.lastName,
      email: this.shippingData.email,

      // Permisos de pago
      permissions: {
        provision: true,
        displayConfirmation: true,
        emailNotification: true,
        showInstrument: true,
        storeInstrument: true,
        useBanZipCode: true
      },

      // Datos de cuotas
      installments: {
        locationId: cart.cartUpdateResponse?.locationId || '',
        invoiceNumber: cart.cartUpdateResponse?.invoiceNumber || '',
        installmentCount: this.getInstallmentCount()
      },

      // Items de pago
      paymentItems: this.buildPaymentItems()
    },
    screen: 'payment',
    widthIframe: '100%',
    heightIframe: 'auto',
    name: this.shippingData.firstName,
    lastName: this.shippingData.lastName,
    email: this.shippingData.email,
    subscriber: sessionStorage.getItem('subscriber') || '',
    locationId: cart.cartUpdateResponse?.locationId || 0,
    invoiceNumber: cart.cartUpdateResponse?.invoiceNumber || '',
    amount: this.calculateTotalAmount(),
    paymentItems: this.buildPaymentItems()
  };
}
```

**Construcción de paymentItems (TEL):**
```typescript
buildPaymentItems(): PaymentItem[] {
  const items: PaymentItem[] = [];
  const cart = this.cartService.getCachedCart();

  // Cuota acelerada (INSTALLMENT)
  if (cart.cartUpdateResponse?.pendingAccelerated > 0) {
    items.push({
      type: 'INSTALLMENT',
      amount: cart.cartUpdateResponse.acceletartedAmount || 0
    });
  }

  // Depósito (DEPOSIT)
  if (cart.depositAmount > 0) {
    items.push({
      type: 'DEPOSIT',
      amount: cart.depositAmount
    });
  }

  // Cuota inicial (DOWNPAYMENT)
  if (cart.totalDownPayment > 0) {
    items.push({
      type: 'DOWNPAYMENT',
      amount: cart.totalDownPayment
    });
  }

  // Impuestos (TAXES)
  if (cart.totalTax > 0) {
    items.push({
      type: 'TAXES',
      amount: cart.totalTax
    });
  }

  // Saldo vencido (PASTDUEONLY)
  const pastDue = parseFloat(sessionStorage.getItem('pastDueAmount') || '0');
  if (pastDue > 0) {
    items.push({
      type: 'PASTDUEONLY',
      amount: pastDue
    });
  }

  return items;
}
```

**Manejo de postMessage (TEL):**
```typescript
handleIframeMessage(event: MessageEvent): void {
  // Validar origen del mensaje
  if (!this.isValidOrigin(event.origin)) return;

  const message = event.data;

  switch (message.state) {
    case 'dimensions':
      // Ajustar altura del iframe
      this.adjustIframeHeight(message.data.height);
      break;

    case 'start':
      // Iframe cargado, enviar datos
      this.sendDataToIframe();
      break;

    case 'canceled':
      // Usuario canceló el pago
      this.handlePaymentCanceled();
      break;

    case 'paymentResult':
      // Resultado del pago
      this.handlePaymentResult(message.data);
      break;
  }
}

sendDataToIframe(): void {
  const iframe = document.getElementById('payment-iframe') as HTMLIFrameElement;
  const data = this.jsonData();

  iframe.contentWindow?.postMessage({
    action: 'initPayment',
    data: data
  }, '*');
}

handlePaymentResult(result: PaymentResultData): void {
  if (result.success) {
    // Pago exitoso
    this.recordPaymentSuccess(result);
  } else {
    // Pago fallido
    this.recordPaymentError(result);
  }
}

async recordPaymentSuccess(result: PaymentResultData): Promise<void> {
  const request = {
    orderId: this.orderId,
    operationId: result.operationId,
    authCode: result.authorizationNumber,
    responseCode: result.code,
    amount: result.amount
  };

  await this.paymentService.recordPayment(request);

  // Navegar a confirmación
  this.navigateToConfirmation(true);
}

async recordPaymentError(result: PaymentResultData): Promise<void> {
  const request = {
    orderId: this.orderId,
    operationId: result.operationId,
    responseCode: result.code,
    errorMessage: result.description
  };

  await this.paymentService.recordError(request);

  // Navegar a confirmación con error
  this.navigateToConfirmation(false);
}
```

**SCSS de payment-web:**
```scss
// De payment-web.component.scss
.payment-container {
  padding: 20px;
  padding-top: 40px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.payment-header {
  text-align: center;
  margin-bottom: 32px;

  .title {
    font-size: 24px;
    font-weight: 700;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
    margin-top: 8px;
  }
}

.iframe-container {
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  iframe {
    width: 100%;
    min-height: 400px;
    border: none;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e0e0e0;
    border-top-color: #DA291C;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    font-size: 16px;
    color: #333;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 40px;

  .error-icon {
    width: 64px;
    height: 64px;
    color: #DA291C;
    margin-bottom: 16px;
  }

  .error-title {
    font-size: 20px;
    font-weight: 600;
    color: #DA291C;
    margin-bottom: 8px;
  }

  .error-message {
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;
  }

  .btn-retry {
    padding: 14px 32px;
    background: #DA291C;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background: darken(#DA291C, 10%);
    }
  }
}
```

**Estructura HTML (TEL):**
```html
<!-- payment-web.component.html -->
<div class="payment-container">
  <!-- Loading -->
  <div class="loading-overlay" *ngIf="isLoading">
    <div class="spinner"></div>
    <span class="loading-text">Preparando el pago...</span>
  </div>

  <!-- Header -->
  <div class="payment-header" *ngIf="!isLoading && !paymentError">
    <h2 class="title">Realizar Pago</h2>
    <p class="subtitle">Ingresa los datos de tu tarjeta para completar la compra</p>
  </div>

  <!-- Iframe de pago -->
  <div class="iframe-container" *ngIf="orderCreated && !paymentError">
    <iframe
      id="payment-iframe"
      [src]="paymentUrl"
      title="Formulario de pago">
    </iframe>
  </div>

  <!-- Error -->
  <div class="error-container" *ngIf="paymentError">
    <svg class="error-icon"><!-- icono error --></svg>
    <h3 class="error-title">Error al procesar el pago</h3>
    <p class="error-message">{{ errorMessage }}</p>
    <button class="btn-retry" (click)="retry()">Intentar de nuevo</button>
  </div>
</div>
```

#### 12.9.1 Crear Componente
- [ ] **12.9.1.1** Crear `step-payment/step-payment.tsx`
- [ ] **12.9.1.2** Crear `step-payment/step-payment.scss`
- [ ] **12.9.1.3** Definir estados: `isLoading`, `orderCreated`, `paymentError`, `errorMessage`
- [ ] **12.9.1.4** Implementar listener de window.postMessage

#### 12.9.2 Flujo de Pago (Detalle)
- [ ] **12.9.2.1** Al montar componente → llamar `createOrder()`
- [ ] **12.9.2.2** Guardar `orderId` en sessionStorage
- [ ] **12.9.2.3** Generar `hubId` único: `${Date.now()}-${random()}`
- [ ] **12.9.2.4** Construir URL: `${paymentIframeUrl}?hubId=${hubId}`
- [ ] **12.9.2.5** Mostrar iframe con URL segura
- [ ] **12.9.2.6** Al recibir 'start' → enviar datos con postMessage

#### 12.9.3 Configuración del iframe (Detalle TEL)

**URL del iframe:**
```typescript
const paymentUrl = `https://payment.claropr.com/iframe?hubId=${hubId}`;
```

**Datos enviados al iframe (jsonData):**
```typescript
interface PaymentIframeData {
  tokenSSO: string;
  data: {
    transactionType: 'MULTIPLE';
    firstName: string;
    lastName: string;
    email: string;
    permissions: {
      provision: boolean;
      displayConfirmation: boolean;
      emailNotification: boolean;
      showInstrument: boolean;
      storeInstrument: boolean;
      useBanZipCode: boolean;
    };
    installments: {
      locationId: string;
      invoiceNumber: string;
      installmentCount: number;
    };
    paymentItems: PaymentItem[];
  };
  screen: 'payment';
  widthIframe: '100%';
  heightIframe: 'auto';
  name: string;
  lastName: string;
  email: string;
  subscriber: string;
  locationId: string;
  invoiceNumber: string;
  amount: number;
  paymentItems: PaymentItem[];
}
```

- [ ] **12.9.3.1** Implementar `generateHubId()` - timestamp + random
- [ ] **12.9.3.2** Implementar `jsonData()` con estructura completa
- [ ] **12.9.3.3** Implementar `buildPaymentItems()` con tipos de pago

#### 12.9.4 Manejo de postMessage (Estados del iframe)

**Estado 'dimensions':**
```typescript
// Ajustar altura del iframe
{ state: 'dimensions', data: { height: 600 } }
```

**Estado 'start':**
```typescript
// Iframe listo, enviar datos
{ state: 'start' }
→ postMessage({ action: 'initPayment', data: jsonData() })
```

**Estado 'canceled':**
```typescript
// Usuario canceló
{ state: 'canceled' }
→ Mostrar mensaje, opción de reintentar
```

**Estado 'paymentResult':**
```typescript
// Resultado del pago
{
  state: 'paymentResult',
  data: {
    success: boolean;
    authorizationNumber: string;
    code: string;
    date: string;
    description: string;
    operationId: string;
    operationType: string;
    paymentMethod: string;
    provisioning: any;
    storedInstrument: any;
    paymentCard: any;
  }
}
```

- [ ] **12.9.4.1** Listener `window.addEventListener('message', handler)`
- [ ] **12.9.4.2** Validar origen del mensaje (seguridad)
- [ ] **12.9.4.3** Manejar 'dimensions' → ajustar altura iframe
- [ ] **12.9.4.4** Manejar 'start' → enviar jsonData via postMessage
- [ ] **12.9.4.5** Manejar 'canceled' → mostrar UI de cancelación
- [ ] **12.9.4.6** Manejar 'paymentResult' → llamar record/error API

#### 12.9.5 Tipos de Items de Pago (PaymentItem)

```typescript
type PaymentItemType = 'INSTALLMENT' | 'DEPOSIT' | 'DOWNPAYMENT' | 'TAXES' | 'PASTDUEONLY';

interface PaymentItem {
  type: PaymentItemType;
  amount: number;
}
```

- [ ] **12.9.5.1** `INSTALLMENT` - Cuota acelerada (pendingAccelerated > 0)
- [ ] **12.9.5.2** `DEPOSIT` - Depósito de seguridad (depositAmount > 0)
- [ ] **12.9.5.3** `DOWNPAYMENT` - Cuota inicial (totalDownPayment > 0)
- [ ] **12.9.5.4** `TAXES` - Impuestos (totalTax > 0)
- [ ] **12.9.5.5** `PASTDUEONLY` - Saldo vencido (pastDueAmount de session)

#### 12.9.6 APIs de Pago

**POST api/Payment/record (pago exitoso):**
```json
{
  "orderId": "ORD-123456",
  "operationId": "OP-789",
  "authCode": "AUTH123",
  "responseCode": "00",
  "amount": 223.99
}
```

**POST api/Payment/error (pago fallido):**
```json
{
  "orderId": "ORD-123456",
  "operationId": "OP-789",
  "responseCode": "51",
  "errorMessage": "Fondos insuficientes"
}
```

- [ ] **12.9.6.1** Implementar `recordPayment()` para éxito
- [ ] **12.9.6.2** Implementar `recordError()` para fallo
- [ ] **12.9.6.3** Navegar a confirmation después de ambos casos

**Entregable:** Vista de pago con iframe integrado, postMessage y manejo de resultados

---

### 12.10 Servicio de Pago (payment.service.ts) ⏳
> Gestiona comunicación con gateway de pago

#### 12.10.1 Crear Servicio
- [ ] **12.10.1.1** Crear `services/payment.service.ts`
- [ ] **12.10.1.2** Definir interfaces: `PaymentItem`, `PaymentResult`, `PaymentError`

#### 12.10.2 Métodos
- [ ] **12.10.2.1** `recordPayment(data)` - Registra pago exitoso (POST api/Payment/record)
- [ ] **12.10.2.2** `recordError(data)` - Registra error de pago (POST api/Payment/error)
- [ ] **12.10.2.3** `buildPaymentItems(cart)` - Construye items para el iframe
- [ ] **12.10.2.4** `getPaymentUrl()` - Obtiene URL del iframe

#### 12.10.3 Manejo de Errores de Pago
- [ ] **12.10.3.1** Tarjeta rechazada
- [ ] **12.10.3.2** Fondos insuficientes
- [ ] **12.10.3.3** Timeout de transacción
- [ ] **12.10.3.4** Error de comunicación
- [ ] **12.10.3.5** Opción de reintentar

**Entregable:** Servicio de pago completo

---

### 12.11 Step Confirmation Mejorado ⏳
> Actualizar confirmación para mostrar detalles de compra
> **Referencia TEL:** `confirmation-web.component.ts/html/scss`

#### 12.11.0 Análisis Detallado del Flujo TEL

**Flujo de confirmación:**
```
1. Recibir parámetro 'success' (boolean) del paso anterior
2. Si success=true → getOrder() para obtener detalles
3. Si success=true → sendConfirmation() para enviar email
4. Mostrar UI según estado (éxito/error)
5. Al cerrar → sessionStorage.clear()
```

**Estructura del componente (TEL):**
```typescript
// De confirmation-web.component.ts
export class ConfirmationWebComponent implements OnInit {
  // Estados
  isSuccess: boolean = false;
  isLoading: boolean = true;

  // Datos de orden
  orderDetails: OrderDetails | null = null;
  orderId: string = '';
  orderNumber: string = '';

  // Error info
  errorMessage: string = '';
  operationId: string = '';

  ngOnInit(): void {
    // Determinar estado basado en query param o prop
    this.isSuccess = this.route.snapshot.queryParams['success'] === 'true';

    if (this.isSuccess) {
      this.loadOrderDetails();
    } else {
      this.loadErrorDetails();
    }
  }

  async loadOrderDetails(): Promise<void> {
    try {
      // Obtener detalles de la orden
      const response = await this.orderService.getOrder();

      if (!response.hasError) {
        this.orderDetails = response;
        this.orderId = response.orderId || sessionStorage.getItem('orderId');
        this.orderNumber = response.orderNumber || '';

        // Enviar email de confirmación
        await this.sendConfirmationEmail();
      }
    } finally {
      this.isLoading = false;
    }
  }

  async sendConfirmationEmail(): Promise<void> {
    const email = sessionStorage.getItem('email');
    if (email) {
      await this.orderService.sendConfirmation(email);
    }
  }

  close(): void {
    // Limpiar toda la sesión
    sessionStorage.clear();

    // Emitir evento al padre
    this.onClose.emit();
  }

  retry(): void {
    // Volver al paso de pago
    this.onRetry.emit();
  }
}
```

**Estructura HTML Estado de Éxito (TEL):**
```html
<!-- confirmation-web.component.html - Estado éxito -->
<div class="confirmation-container" *ngIf="isSuccess && !isLoading">
  <!-- Header con icono -->
  <div class="confirmation-header success">
    <div class="icon-container">
      <svg class="check-icon" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </div>
    <h1 class="title">¡Compra completada!</h1>
    <p class="subtitle">Tu orden ha sido procesada exitosamente</p>
  </div>

  <!-- Detalles de orden -->
  <div class="order-details">
    <div class="detail-row">
      <span class="label">Número de orden:</span>
      <span class="value">{{ orderNumber }}</span>
    </div>
    <div class="detail-row">
      <span class="label">Fecha:</span>
      <span class="value">{{ orderDetails.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
    </div>
    <div class="detail-row">
      <span class="label">Total pagado:</span>
      <span class="value total">${{ orderDetails.total | number:'1.2-2' }}</span>
    </div>
  </div>

  <!-- Productos -->
  <div class="products-summary" *ngIf="orderDetails.products?.length">
    <h3>Productos</h3>
    <div class="product-item" *ngFor="let item of orderDetails.products">
      <img [src]="item.detailImage" [alt]="item.productName" />
      <div class="product-info">
        <span class="name">{{ item.productName }}</span>
        <span class="variant" *ngIf="item.webColor">{{ item.webColor }}</span>
      </div>
      <span class="price">${{ item.decPrice | number:'1.2-2' }}</span>
    </div>
  </div>

  <!-- Plan (si aplica) -->
  <div class="plan-summary" *ngIf="orderDetails.plan">
    <h3>Plan contratado</h3>
    <div class="plan-item">
      <span class="name">{{ orderDetails.plan.planName }}</span>
      <span class="price">${{ orderDetails.plan.price | number:'1.2-2' }}/mes</span>
    </div>
  </div>

  <!-- Información de envío -->
  <div class="shipping-info" *ngIf="orderDetails.shippingAddress">
    <h3>Dirección de envío</h3>
    <p>{{ orderDetails.shippingAddress.firstName }} {{ orderDetails.shippingAddress.lastName }}</p>
    <p>{{ orderDetails.shippingAddress.address1 }}</p>
    <p *ngIf="orderDetails.shippingAddress.address2">{{ orderDetails.shippingAddress.address2 }}</p>
    <p>{{ orderDetails.shippingAddress.city }}, PR {{ orderDetails.shippingAddress.zipCode }}</p>
  </div>

  <!-- Mensaje de email -->
  <div class="email-notice">
    <svg class="email-icon"><!-- icono email --></svg>
    <p>Se ha enviado una confirmación a tu correo electrónico</p>
  </div>

  <!-- Botón cerrar -->
  <button class="btn-close" (click)="close()">
    Cerrar
  </button>
</div>
```

**Estructura HTML Estado de Error (TEL):**
```html
<!-- confirmation-web.component.html - Estado error -->
<div class="confirmation-container error" *ngIf="!isSuccess && !isLoading">
  <!-- Header con icono -->
  <div class="confirmation-header error">
    <div class="icon-container error">
      <svg class="warning-icon" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
    </div>
    <h1 class="title error">Error en el pago</h1>
    <p class="subtitle">{{ errorMessage || 'No se pudo procesar tu pago' }}</p>
  </div>

  <!-- Detalles del error -->
  <div class="error-details" *ngIf="operationId">
    <div class="detail-row">
      <span class="label">Código de operación:</span>
      <span class="value">{{ operationId }}</span>
    </div>
    <p class="error-note">
      Guarda este código por si necesitas contactar a soporte.
    </p>
  </div>

  <!-- Acciones -->
  <div class="error-actions">
    <button class="btn-retry" (click)="retry()">
      Intentar de nuevo
    </button>
    <button class="btn-support" (click)="contactSupport()">
      Contactar soporte
    </button>
  </div>
</div>
```

**SCSS de confirmation-web:**
```scss
// De confirmation-web.component.scss
.confirmation-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.confirmation-header {
  margin-bottom: 32px;

  .icon-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;

    // Estado éxito
    background: #e8f5e9;

    &.error {
      background: #ffebee;
    }
  }

  .check-icon {
    width: 48px;
    height: 48px;
    fill: #44af69;
  }

  .warning-icon {
    width: 48px;
    height: 48px;
    fill: #DA291C;
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;

    &.error {
      color: #DA291C;
    }
  }

  .subtitle {
    font-size: 16px;
    color: #666;
  }
}

.order-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #666;
    }

    .value {
      font-weight: 600;

      &.total {
        font-size: 20px;
        color: #DA291C;
      }
    }
  }
}

.products-summary, .plan-summary, .shipping-info {
  text-align: left;
  margin-bottom: 24px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  .product-info {
    flex: 1;

    .name {
      display: block;
      font-weight: 500;
    }

    .variant {
      font-size: 12px;
      color: #666;
    }
  }

  .price {
    font-weight: 600;
  }
}

.email-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
  margin-bottom: 32px;

  .email-icon {
    width: 24px;
    height: 24px;
    fill: #0097A9;
  }

  p {
    color: #333;
    font-size: 14px;
    margin: 0;
  }
}

.btn-close {
  width: 100%;
  max-width: 300px;
  padding: 16px;
  background: #DA291C;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: darken(#DA291C, 10%);
  }
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;

  .btn-retry {
    padding: 16px;
    background: #DA291C;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-support {
    padding: 16px;
    background: white;
    color: #333;
    border: 2px solid #e0e0e0;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      border-color: #ccc;
    }
  }
}
```

#### 12.11.1 Actualizar Componente Existente
- [ ] **12.11.1.1** Extender `step-confirmation` para soportar flujo e-commerce
- [ ] **12.11.1.2** Agregar prop `success: boolean` para determinar estado
- [ ] **12.11.1.3** Agregar prop `errorMessage?: string` para mensaje de error
- [ ] **12.11.1.4** Agregar prop `operationId?: string` para código de operación

#### 12.11.2 UI de Confirmación (Estructura Detallada)

**Estado de Éxito:**
- [ ] **12.11.2.1** Icono check verde en círculo (#e8f5e9 fondo, #44af69 icono)
- [ ] **12.11.2.2** Título "¡Compra completada!" (28px, bold)
- [ ] **12.11.2.3** Subtítulo "Tu orden ha sido procesada exitosamente"
- [ ] **12.11.2.4** Card de detalles (#f8f9fa fondo):
  - Número de orden
  - Fecha (formato dd/MM/yyyy HH:mm)
  - Total pagado (20px, rojo)
- [ ] **12.11.2.5** Lista de productos comprados con imagen
- [ ] **12.11.2.6** Plan contratado (si aplica)
- [ ] **12.11.2.7** Dirección de envío
- [ ] **12.11.2.8** Aviso de email enviado (fondo #e3f2fd)
- [ ] **12.11.2.9** Botón "Cerrar" (rojo, border-radius 30px)

**Estado de Error:**
- [ ] **12.11.2.10** Icono warning rojo en círculo (#ffebee fondo, #DA291C icono)
- [ ] **12.11.2.11** Título "Error en el pago" (rojo)
- [ ] **12.11.2.12** Mensaje de error específico
- [ ] **12.11.2.13** Código de operación (si existe)
- [ ] **12.11.2.14** Botón "Intentar de nuevo" (rojo)
- [ ] **12.11.2.15** Botón "Contactar soporte" (outline)

#### 12.11.3 Lógica (Detalle TEL)

**Flujo de éxito:**
```typescript
async handleSuccess(): Promise<void> {
  // 1. Obtener detalles de la orden
  const orderResponse = await orderService.getOrder();
  this.orderDetails = orderResponse;

  // 2. Enviar email de confirmación
  const email = sessionStorage.getItem('email');
  await orderService.sendConfirmation(email);
}
```

**Flujo de cierre:**
```typescript
close(): void {
  // Limpiar TODA la sesión
  sessionStorage.clear();

  // Emitir evento al padre
  this.flowComplete.emit({
    orderId: this.orderDetails.orderId,
    success: true
  });
}
```

**APIs utilizadas:**
- `GET/POST api/Orders/getOrder` - Obtiene detalles de la orden
- `POST api/Orders/sendConfirmation` - Envía email de confirmación

- [ ] **12.11.3.1** Al montar, si success=true → llamar `getOrder()`
- [ ] **12.11.3.2** Si success=true → llamar `sendConfirmation(email)`
- [ ] **12.11.3.3** Al cerrar → `sessionStorage.clear()`
- [ ] **12.11.3.4** Emitir evento `flowComplete` con datos de la orden
- [ ] **12.11.3.5** En error, mostrar operationId para soporte

#### 12.11.4 APIs de Confirmación

**Response api/Orders/getOrder:**
```json
{
  "hasError": false,
  "orderId": "ORD-123456",
  "orderNumber": "CL-2025-001234",
  "status": "completed",
  "createdAt": "2025-12-11T15:30:00Z",
  "products": [
    {
      "productId": 456,
      "productName": "Router AC1200",
      "decPrice": 199.99,
      "webColor": "Negro",
      "detailImage": "https://..."
    }
  ],
  "plan": {
    "planId": 789,
    "planName": "Internet 100 Mbps",
    "price": 49.99
  },
  "total": 223.99,
  "shippingAddress": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "address1": "Calle Principal 123",
    "address2": "Apt 4B",
    "city": "San Juan",
    "zipCode": "00901"
  }
}
```

**Request api/Orders/sendConfirmation:**
```json
{
  "email": "juan@example.com"
}
```

**Response api/Orders/sendConfirmation:**
```json
{
  "hasError": false,
  "sent": true,
  "message": "Confirmación enviada exitosamente"
}
```

**Entregable:** Vista de confirmación completa con estados éxito/error y limpieza de sesión

---

### 12.12 Servicio de Confirmación (confirmation.service.ts) ⏳
> Gestiona confirmación y email

#### 12.12.1 Crear Servicio
- [ ] **12.12.1.1** Crear `services/confirmation.service.ts`

#### 12.12.2 Métodos
- [ ] **12.12.2.1** `getOrder()` - Obtiene detalles de orden completada
- [ ] **12.12.2.2** `sendConfirmationEmail(email)` - Envía email de confirmación
- [ ] **12.12.2.3** `clearSession()` - Limpia todos los datos de sesión

**Entregable:** Servicio de confirmación funcional

---

### 12.13 Actualizar Orquestador (fixed-service-flow.tsx) ⏳
> Agregar navegación para el flujo completo e-commerce

#### 12.13.1 Nuevos Pasos
- [ ] **12.13.1.1** Agregar paso "product-detail"
- [ ] **12.13.1.2** Agregar paso "product-plans"
- [ ] **12.13.1.3** Agregar paso "order-summary"
- [ ] **12.13.1.4** Agregar paso "shipping"
- [ ] **12.13.1.5** Agregar paso "payment"
- [ ] **12.13.1.6** Actualizar paso "confirmation"

#### 12.13.2 Flujo de Navegación CLARO HOGAR
```
catalogue → product-detail → product-plans → order-summary → shipping → payment → confirmation
```

#### 12.13.3 Nuevas Props (opcionales)
- [ ] **12.13.3.1** `paymentUrl` - URL del iframe de pago
- [ ] **12.13.3.2** `hubId` - ID de sesión para pagos
- [ ] **12.13.3.3** `flowType` - 'service-request' | 'ecommerce'

**Entregable:** Orquestador actualizado con flujo e-commerce

---

### 12.14 Actualizar Store e Interfaces ⏳
> Agregar estados y tipos para e-commerce

#### 12.14.1 Nuevas Interfaces
- [ ] **12.14.1.1** `ProductDetail` - Detalle completo del producto
- [ ] **12.14.1.2** `CartItem` - Item del carrito
- [ ] **12.14.1.3** `Cart` - Carrito completo con totales
- [ ] **12.14.1.4** `ShippingAddress` - Dirección de envío
- [ ] **12.14.1.5** `Order` - Orden creada
- [ ] **12.14.1.6** `PaymentResult` - Resultado del pago

#### 12.14.2 Actualizar Store
- [ ] **12.14.2.1** Agregar `cart: Cart | null` al estado
- [ ] **12.14.2.2** Agregar `shippingAddress: ShippingAddress | null`
- [ ] **12.14.2.3** Agregar `order: Order | null`
- [ ] **12.14.2.4** Agregar `paymentResult: PaymentResult | null`

#### 12.14.3 Nuevas Acciones
- [ ] **12.14.3.1** `setCart(cart)`
- [ ] **12.14.3.2** `addToCart(item)`
- [ ] **12.14.3.3** `removeFromCart(itemId)`
- [ ] **12.14.3.4** `setShippingAddress(address)`
- [ ] **12.14.3.5** `setOrder(order)`
- [ ] **12.14.3.6** `setPaymentResult(result)`

**Entregable:** Store actualizado para e-commerce

---

### 12.15 Testing del Flujo E-Commerce ⏳
> Pruebas del flujo completo

#### 12.15.1 Tests Unitarios
- [ ] **12.15.1.1** product.service.spec.ts
- [ ] **12.15.1.2** cart.service.spec.ts
- [ ] **12.15.1.3** shipping.service.spec.ts
- [ ] **12.15.1.4** order.service.spec.ts
- [ ] **12.15.1.5** payment.service.spec.ts
- [ ] **12.15.1.6** confirmation.service.spec.ts

#### 12.15.2 Tests de Componentes
- [ ] **12.15.2.1** step-product-detail.spec.ts
- [ ] **12.15.2.2** step-order-summary.spec.ts
- [ ] **12.15.2.3** step-shipping.spec.ts
- [ ] **12.15.2.4** step-payment.spec.ts

#### 12.15.3 Tests E2E
- [ ] **12.15.3.1** Flujo completo: catálogo → confirmación
- [ ] **12.15.3.2** Caso de error de pago
- [ ] **12.15.3.3** Caso de carrito vacío
- [ ] **12.15.3.4** Validaciones de formulario

**Entregable:** Suite de tests completa para e-commerce

---

### 12.16 Documentación del Flujo E-Commerce ⏳
> Documentar el nuevo flujo

- [ ] **12.16.1** Actualizar README con flujo e-commerce
- [ ] **12.16.2** Documentar nuevos endpoints de API
- [ ] **12.16.3** Documentar nuevas props del componente
- [ ] **12.16.4** Documentar eventos emitidos
- [ ] **12.16.5** Crear diagrama de flujo visual
- [ ] **12.16.6** Actualizar CHANGELOG

**Entregable:** Documentación completa del flujo e-commerce

---

## Resumen de Tareas Fase 12

| Sección | Descripción | Items | Estado |
|---------|-------------|-------|--------|
| 12.1 | Step Product Detail | 17 | ⏳ |
| 12.2 | Servicio de Producto | 10 | ⏳ |
| 12.3 | Servicio de Carrito | 12 | ⏳ |
| 12.4 | Step Plans para CLARO HOGAR | 12 | ⏳ |
| 12.5 | Step Order Summary | 15 | ⏳ |
| 12.6 | Step Shipping | 18 | ⏳ |
| 12.7 | Servicio de Envío | 7 | ⏳ |
| 12.8 | Servicio de Orden | 11 | ⏳ |
| 12.9 | Step Payment | 14 | ⏳ |
| 12.10 | Servicio de Pago | 9 | ⏳ |
| 12.11 | Step Confirmation Mejorado | 12 | ⏳ |
| 12.12 | Servicio de Confirmación | 4 | ⏳ |
| 12.13 | Actualizar Orquestador | 9 | ⏳ |
| 12.14 | Actualizar Store e Interfaces | 13 | ⏳ |
| 12.15 | Testing | 14 | ⏳ |
| 12.16 | Documentación | 6 | ⏳ |
| **TOTAL** | | **173 items** | ⏳ |

---

## API Endpoints Requeridos (Fase 12)

| Endpoint | Método | Uso |
|----------|--------|-----|
| `api/Catalogue/equipmentDetail` | POST | Detalle del producto |
| `api/Card/addToCart` | POST | Agregar al carrito |
| `api/Card/getCart` | POST | Obtener carrito |
| `api/Card/deleteItem` | POST | Eliminar del carrito |
| `api/Plans/getPlans` | POST | Planes del producto |
| `api/Shipment/create` | POST | Crear dirección envío |
| `api/Orders/creationOfOrder` | POST | Crear orden |
| `api/Orders/getOrder` | GET | Obtener orden |
| `api/Payment/record` | POST | Registrar pago exitoso |
| `api/Payment/error` | POST | Registrar error pago |
| `api/Confirmation/sendConfirmation` | POST | Enviar email |

---

## 📦 SessionStorage Keys Completo (Fase 12)

> Referencia completa de claves de sessionStorage usadas en el flujo e-commerce (basado en TEL)

### Token y Autenticación
```typescript
'token'           // JWT del servidor - REQUERIDO para TODAS las APIs
'correlationId'   // ID de correlación para tracking
```

### Producto y Variantes
```typescript
'parentId'        // productId del producto padre
'childrenId'      // productId del SKU (color+storage)
'color'           // Nombre del color seleccionado (ej: "Negro")
'indexColor'      // Índice del color en el array (0, 1, 2...)
'storage'         // Nombre del almacenamiento (ej: "64GB")
'indexStorage'    // Índice del storage en el array
'deviceType'      // Tipo: 'phone' | 'tablet' | 'accesory' | 'home'
'product'         // JSON del producto completo (Base64 encoded)
```

### Carrito
```typescript
'mainId'          // cartId devuelto por addToCart (item principal)
'cart'            // JSON del carrito completo
'cartId'          // ID del carrito activo
'cartTotal'       // Total del carrito (string)
'cartProducts'    // JSON de productos en carrito
'discountCoupon'  // Código de descuento aplicado
```

### Plan
```typescript
'planId'          // ID del plan seleccionado
'plan'            // JSON del plan completo
'currentPlanPrice'// Precio del plan actual (si existe)
```

### Envío
```typescript
'shipmentId'      // ID del envío creado
'zipCode'         // Código postal (5 dígitos)
'email'           // Email del cliente (para confirmación)
'shippingAddress' // JSON de la dirección completa
```

### Orden y Pago
```typescript
'orderId'         // ID de la orden creada
'ban'             // BAN de la orden
'subscriber'      // ID del suscriptor (si existe)
'pastDueAmount'   // Saldo vencido (si aplica)
'paymentResult'   // JSON del resultado del pago
'operationId'     // ID de operación de pago
```

### Ubicación (del flujo de cobertura)
```typescript
'latitude'        // Latitud (Base64 encoded)
'longitude'       // Longitud (Base64 encoded)
'address'         // Dirección completa
'city'            // Ciudad
'serviceType'     // 'GPON' | 'VRAD' | 'CLARO HOGAR'
```

### Ejemplo de uso en Stencil.js
```typescript
// Guardar
sessionStorage.setItem('mainId', String(response.code));
sessionStorage.setItem('product', btoa(JSON.stringify(product)));

// Leer
const mainId = sessionStorage.getItem('mainId');
const product = JSON.parse(atob(sessionStorage.getItem('product') || ''));

// Limpiar al finalizar
sessionStorage.clear();
```

---

## Orden de Implementación Sugerido

1. **Sprint 1 - Servicios Base:**
   - 12.2 product.service.ts
   - 12.3 cart.service.ts
   - 12.7 shipping.service.ts

2. **Sprint 2 - Vistas de Producto:**
   - 12.1 step-product-detail
   - 12.4 step-plans actualizado

3. **Sprint 3 - Carrito y Resumen:**
   - 12.5 step-order-summary
   - 12.14 Store actualizado

4. **Sprint 4 - Checkout:**
   - 12.6 step-shipping
   - 12.8 order.service.ts
   - 12.9 step-payment
   - 12.10 payment.service.ts

5. **Sprint 5 - Confirmación y Testing:**
   - 12.11 step-confirmation mejorado
   - 12.12 confirmation.service.ts
   - 12.15 Testing

6. **Sprint 6 - Integración Final:**
   - 12.13 Orquestador actualizado
   - 12.16 Documentación

---

*Última actualización: 2025-12-11 (Sesión 5 - Análisis detallado de sub-flujos TEL)*

---

## 📋 Resumen de Análisis por Sub-Flujo

| Sub-Flujo | Componente TEL | Análisis | SCSS |
|-----------|----------------|----------|------|
| Product Detail | product-web | ✅ Completo | ✅ |
| Order Summary | order-summary-web | ✅ Completo | ✅ |
| Shipping | shipment-web | ✅ Completo (16 campos) | ✅ |
| Payment | payment-web | ✅ Completo (iframe+postMessage) | ✅ |
| Confirmation | confirmation-web | ✅ Completo (éxito/error) | ✅ |

**Total de items detallados en FASE 12:** 250+ items con código de referencia
