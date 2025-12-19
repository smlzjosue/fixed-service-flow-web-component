# CLAUDE.md - Guía de Contexto para Sesiones de Trabajo

> **IMPORTANTE:** Lee este archivo primero en cada nueva sesión de trabajo.
> Este documento proporciona el contexto necesario para continuar el desarrollo del proyecto.

---

## ⚠️ REGLA OBLIGATORIA

> **AL FINALIZAR CADA SESIÓN DE TRABAJO, SE DEBE ACTUALIZAR LA SECCIÓN "Estado Actual del Proyecto".**
>
> Esto incluye:
> - Actualizar la fecha de última actualización
> - Marcar tareas completadas
> - Indicar la fase actual y próximo paso
> - Agregar notas relevantes si hay bloqueos o decisiones pendientes

---

## Estado Actual del Proyecto

| Campo | Valor |
|-------|-------|
| **Última actualización** | 2025-12-19 (Sesión 8) |
| **Fase actual** | Fase 11 - Revisión y Correcciones UX |
| **Próximo paso** | Pruebas E2E flujo completo GPON + CLARO HOGAR |
| **Bloqueadores** | Ninguno |
| **Último commit** | `198c9ed` - style(step-contract): update UI to match reference design |

### Progreso por Fases (Verificado 2025-12-12)

| Fase | Descripción | Estado | Items |
|------|-------------|--------|-------|
| 0 | Planificación y documentación | ✅ Completado | - |
| 1 | Configuración del proyecto | ✅ Completado | 8/8 |
| 2 | Sistema de diseño (tokens) | ✅ Completado | 7/7 |
| 3 | Componentes UI base | 🔄 Parcial | 7/17 (+ui-carousel) |
| 4 | Estado global (store) | ✅ Completado | 5/5 |
| 5 | Servicios (APIs) | ✅ Completado | 7/7 (+catalogue.service) |
| 6 | Componentes de pasos | ✅ Completado | 6/6 (+step-catalogue) |
| 7 | Componente orquestador | ✅ Completado | 8/8 (soporta CLARO HOGAR) |
| 8 | Testing | ✅ Completado | Tests unitarios creados |
| 9 | Documentación | ✅ Completado | 4/5 |
| 10 | Build y distribución | ✅ Completado | 4/8 |
| **11** | **Revisión y Correcciones UX** | **⏳ En progreso** | **5/7 ← ACTUAL** |

### Tareas Completadas

**Fase 0 - Planificación:**
- [x] Análisis del proyecto TEL existente
- [x] Extracción de especificaciones técnicas
- [x] Documentación del flujo de token (crítico)
- [x] Creación del plan de trabajo con checklist
- [x] Definición de roles y especialidades
- [x] Revisión de capturas UI/UX

**Fase 1 - Configuración:**
- [x] Crear proyecto Stencil.js (`npm init stencil`)
- [x] Instalar dependencias (@stencil/store, @stencil/sass)
- [x] Configurar stencil.config.ts con SCSS y output targets
- [x] Configurar estructura de carpetas

**Fase 2 - Design System:**
- [x] variables.scss (colores, tipografía, espaciados)
- [x] mixins.scss (responsive, buttons, inputs, cards)
- [x] reset.scss (CSS reset)
- [x] global.scss (CSS custom properties para theming)

**Fase 4 - Store:**
- [x] interfaces.ts (todos los tipos TypeScript)
- [x] flow.store.ts (estado global con @stencil/store)

**Fase 5 - Servicios:**
- [x] http.service.ts (cliente HTTP base)
- [x] token.service.ts (CRÍTICO - autenticación)
- [x] coverage.service.ts (validación cobertura)
- [x] plans.service.ts (planes de internet + **addToCart**)
- [x] request.service.ts (envío de solicitud)
- [x] maps.service.ts (Google Maps integrado)
- [x] catalogue.service.ts (catálogo CLARO HOGAR + **listCatalogue API**)

**Fase 6 - Componentes de Pasos:**
- [x] step-location (mapa con Google Maps integrado + **overlay de validación**)
- [x] step-plans (selección de planes + **llamada a addToCart API**)
- [x] step-contract (tipo de contrato)
- [x] step-form (formulario completo con validaciones)
- [x] step-confirmation (estados éxito/error)
- [x] step-catalogue (catálogo de productos CLARO HOGAR + **cards consistentes**)

**Fase 7 - Orquestador:**
- [x] fixed-service-flow.tsx (componente principal)
- [x] Navegación entre pasos
- [x] Eventos (flowComplete, flowError, stepChange, flowCancel)
- [x] Props (apiUrl, googleMapsKey, debug)

### Notas de la Última Sesión (2025-12-19 - Sesión 8)

- **Refinamiento visual de step-contract** según capturas 1.png y 2.png
- **Ejecutar servidor**: `cd fixed-flow-labs/fixed-service-flow && npm start`
- **Puerto de desarrollo**: http://localhost:3333

### Cambios de Esta Sesión (2025-12-19 - Sesión 8)

**Mejoras UX en step-contract:**

1. **Subtítulo tab "Sin contrato":**
   - Cambiado de "Sin verificación de crédito / 1 mes de plan por adelantado"
   - A: "Plan mensual con pago por adelantado"

2. **Formato simplificado de cards:**
   - Eliminados campos separados (Instalación, Activación, Modem)
   - Ahora solo muestra "Instalación: $X" (suma total de los 3 costos)

3. **Labels de opciones:**
   - Cambiado de "1 año" / "2 años"
   - A: "12 Meses de Contrato" / "24 Meses de Contrato"

4. **Línea divisoria header:**
   - Agregada línea gris con sombra debajo del título
   - `border-bottom: 1px solid $color-gray-300; box-shadow: 0 1px 2px rgba(0,0,0,0.05);`

5. **Barra lateral en cards:**
   - Agregada barra gris (`$color-gray-300`) en cards no seleccionadas
   - Barra cyan (`$color-secondary`) en card seleccionada

6. **Orden de opciones:**
   - Invertido orden en CONTRACT_OPTIONS (interfaces.ts)
   - Ahora: 12 meses primero, 24 meses segundo

---

### Historial - Sesión 7 (2025-12-12)

**Mejoras UX en step-form:**

1. **Mensaje de instrucciones:**
   - Eliminado fondo gris y padding
   - `background: transparent; padding: 0;`

2. **Radio buttons horizontales:**
   - "Licencia de conducir" y "Pasaporte" lado a lado
   - Alineados con el input de identificación

3. **Líneas divisorias:**
   - Eliminadas líneas entre secciones del formulario
   - Solo queda línea arriba del botón submit

4. **Contenedor del formulario:**
   - Borde gris suave de 1px
   - Border-radius en todas las esquinas

5. **Header con divider:**
   - Línea divisoria debajo del título

**Mejoras UX en step-confirmation (éxito):**
- Color verde del título: `#15A045`
- Icono: `ok-check.svg` (nuevo asset)
- Botón "Cerrar" estilo outline
- Botón fuera del contenedor gris
- Header con línea divisoria

**Mejoras UX en step-confirmation (error):**
- Color rojo del título: `#E00814`
- Icono: `error-check.svg` (nuevo asset)
- Botón "Volver a intentar" sólido rojo
- Botón fuera del contenedor gris
- Header con línea divisoria

### Tareas Críticas Pendientes

1. **Pruebas E2E** - Validar flujo completo GPON + CLARO HOGAR con API real
2. **Documentación formal** - Actualizar README con nuevo flujo
3. **Optimización** - Review de bundle size

---

## Resumen Ejecutivo (TL;DR)

**Proyecto:** Web Component standalone para solicitud de servicio fijo empresarial (Claro Puerto Rico)

**Tecnología:** Stencil.js v4.x (genera Web Components estándar)

**Objetivo:** Crear `<fixed-service-flow>` - un componente embebible que implementa un flujo de 5 pasos para solicitar internet fijo empresarial.

**Estado Actual:** Fases 1-7 completadas. Google Maps API y Testing pendientes.

---

## Ubicación del Proyecto

```
/Volumes/JesdlozWork/Proyectos/E1/tienda-project/
└── fixed-flow-labs/                    ← CARPETA DEL PROYECTO
    ├── docs/                           ← Documentación
    │   ├── CLAUDE.md                   ← ESTE ARCHIVO (leer primero)
    │   ├── PLAN-DE-TRABAJO-STENCIL.md  ← Checklist de implementación
    │   ├── ESPECIFICACIONES-TECNICAS.md ← APIs, endpoints, configs
    │   ├── ROLES-EQUIPO.md             ← Especialidades técnicas
    │   ├── historial-interacciones-stencil.md ← Historial completo
    │   ├── POC-MiClaro empresas-servicio fijo (1).pdf ← Diseño UI/UX
    │   └── capturas/                   ← Screenshots de referencia (1-11.png)
    ├── fixed-service-flow/             ← PROYECTO STENCIL.JS (NUEVO)
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── fixed-service-flow/ ← Componente orquestador
    │   │   │   └── steps/              ← 5 pasos del flujo
    │   │   ├── services/               ← Servicios HTTP/API
    │   │   ├── store/                  ← Estado global
    │   │   ├── utils/                  ← Validadores, formatters
    │   │   └── global/                 ← SCSS design tokens
    │   ├── dist/                       ← Build de producción
    │   ├── www/                        ← Build de desarrollo
    │   └── stencil.config.ts
    └── fixed-internet-service/         ← Proyecto Angular existente (referencia)
```

---

## Orden de Lectura Recomendado

### Para Entender el Proyecto (Contexto)

1. **Este archivo** (`CLAUDE.md`) - Resumen y navegación
2. **`historial-interacciones-stencil.md`** - Historia completa del proyecto
3. **`capturas/`** - Ver imágenes 1.png a 11.png para entender el flujo visual

### Para Implementar (Desarrollo)

1. **`ESPECIFICACIONES-TECNICAS.md`** - APIs, endpoints, estructuras de datos
2. **`PLAN-DE-TRABAJO-STENCIL.md`** - Checklist de tareas por fase
3. **`ROLES-EQUIPO.md`** - Patrones técnicos y mejores prácticas de Stencil.js

### Referencia Visual

- **`POC-MiClaro empresas-servicio fijo (1).pdf`** - Diseño original (incluye header/footer)
- **`capturas/`** - Diseño real del componente embebible (sin header/footer)

---

## Flujo de Usuario (5 Pasos + Inicialización)

```
[0. TOKEN]  →  [1. UBICACIÓN]  →  [2. PLANES]  →  [3. CONTRATO]  →  [4. FORMULARIO]  →  [5. CONFIRMACIÓN]
     │               │                 │                │                  │                    │
 getToken       Google Maps       3 cards GPON      2 tabs:             Datos:              Estados:
 (automático)   Validar dir.      $50/$100/$150  Con/Sin contrato    - Personales         - Éxito
                Cobertura         Barra sticky    12/24 meses        - Empresa            - Error
                                                                     - Dirección
```

> ⚠️ **Paso 0 (Token)** es automático e invisible para el usuario, pero OBLIGATORIO antes de cualquier API.

---

## APIs Principales

### ⚠️ PASO 0 CRÍTICO: Obtener Token (OBLIGATORIO)

> **IMPORTANTE:** Antes de cualquier otra operación API, se DEBE obtener el token.
> El token es fundamental para todo el proceso y también funciona como token del carrito.

| Endpoint | Request | Response |
|----------|---------|----------|
| `POST api/Token/getToken` | `{ "agentName": "" }` | `{ token, correlationId, hasError }` |

**Secuencia de inicialización:**
```
[INICIO] → ¿Existe token en sessionStorage?
   → NO: POST api/Token/getToken → Almacenar token y correlationId
   → SÍ: Usar token existente
→ [CONTINUAR CON FLUJO]
```

### APIs del Flujo

| Endpoint | Uso |
|----------|-----|
| `POST api/Catalogue/getInternetPlans` | Validar cobertura por lat/lng |
| `POST api/Plans/getPlansInternet` | Obtener planes (GPON, VRAD) |
| `POST api/Orders/internetServiceRequest` | Enviar solicitud |

**Base URL:** `https://uat-tienda.claropr.com/`

**Headers requeridos (incluir en TODAS las peticiones):**
```
Authorization: Bearer {token}        ← Del getToken
App: shop
Platform: web
X-Correlation-ID: {correlationId}    ← Del getToken
```

Ver detalles completos en `ESPECIFICACIONES-TECNICAS.md` (Sección 0)

---

## Stack Tecnológico

```
Stencil.js v4.x
├── @stencil/core          # Compilador
├── @stencil/store         # Estado global
├── TypeScript 5.x         # Tipado
├── SCSS                   # Estilos (Claro PR theme)
└── Google Maps API        # Mapas
```

---

## Estructura del Componente (A Crear)

```
fixed-service-flow/                 ← Proyecto Stencil a crear
├── src/
│   ├── components/
│   │   ├── fixed-service-flow/     # Componente raíz
│   │   ├── steps/
│   │   │   ├── step-location/      # Paso 1: Mapa
│   │   │   ├── step-plans/         # Paso 2: Planes
│   │   │   ├── step-contract/      # Paso 3: Contrato
│   │   │   ├── step-form/          # Paso 4: Formulario
│   │   │   └── step-confirmation/  # Paso 5: Confirmación
│   │   └── ui/                     # Componentes UI reutilizables
│   ├── services/                   # Servicios HTTP
│   ├── store/                      # Estado global
│   └── global/                     # Estilos globales
├── stencil.config.ts
└── package.json
```

---

## Uso Final del Componente

```html
<!-- En proyecto padre (Mi Claro Empresas) -->
<fixed-service-flow
  api-url="https://uat-tienda.claropr.com"
  google-maps-key="AIzaSyA..."
></fixed-service-flow>

<script>
  document.querySelector('fixed-service-flow')
    .addEventListener('flowComplete', (e) => {
      console.log('Solicitud completada:', e.detail);
    });
</script>
```

---

## Proyecto de Referencia (TEL)

El flujo ya existe implementado en Angular en el proyecto TEL:

```
/Volumes/JesdlozWork/Proyectos/E1/tienda-project/TEL/frondend/src/app/modules/
├── map/                    # Componente de mapa
├── product-catalog/.../plans/  # Selección de planes
├── type-contract/          # Tipo de contrato
└── internet-request/       # Formulario de solicitud
```

**Ruta de acceso:** `/store-businesses` (oculta header/footer)

Ver `ESPECIFICACIONES-TECNICAS.md` para detalles de servicios y APIs extraídos de TEL.

---

## Fases de Implementación

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Configuración proyecto Stencil | ✅ Completado |
| 2 | Sistema de diseño (tokens) | ✅ Completado |
| 3 | Componentes UI base | 🔄 Parcial |
| 4 | Estado global (store) | ✅ Completado |
| 5 | Servicios (APIs) | ✅ Completado |
| 6 | Componentes de pasos | ✅ Completado |
| 7 | Componente orquestador | ✅ Completado |
| 8 | Testing | ⏳ Pendiente |
| 9 | Documentación | 🔄 Parcial |
| 10 | Build y distribución | ✅ Completado |

Ver checklist detallado en `PLAN-DE-TRABAJO-STENCIL.md`

---

## Colores del Sistema de Diseño

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo Claro (Primario) | `#DA291C` | Botones, acentos |
| Cyan/Teal (Secundario) | `#0097A9` | Selección, links, bordes activos |
| Verde (Éxito) | `#44AF69` | Confirmación exitosa |
| Rojo (Error) | `#DA291C` | Errores, alertas |
| Gris oscuro | `#333333` | Texto principal |
| Gris medio | `#666666` | Texto secundario |

---

## Comandos Útiles (Una vez creado el proyecto)

```bash
# Desarrollo
npm start                    # Servidor de desarrollo
npm run build               # Build de producción
npm test                    # Ejecutar tests

# Stencil CLI
npm init stencil            # Crear nuevo proyecto
npm install @stencil/store  # Instalar store
```

---

## Notas Importantes

1. **⚠️ TOKEN PRIMERO** - Antes de CUALQUIER llamada API, obtener token con `api/Token/getToken`. Es obligatorio y también es el token del carrito.

2. **Es un Web Component embebible** - NO incluye header/footer (el padre los provee)

3. **Basado en flujo existente** - Replicar funcionalidad de TEL `/store-businesses`

4. **Framework-agnostic** - Debe funcionar en Angular, React, Vue o vanilla HTML

5. **Campos empresariales** - El formulario incluye "Nombre del Negocio" y "Posición en la Empresa" (ver capturas 7-8)

6. **Google Maps satelital** - Mapa inicia en modo satelital con `mapId: '8481b97098c495ab'`

7. **Coordenadas en Base64** - latitud/longitud se guardan codificados con `btoa()`

8. **SessionStorage keys críticas:**
   - `token` - JWT del servidor (requerido para headers)
   - `correlationId` - ID de correlación (requerido para headers)

---

## Preguntas Frecuentes

**¿Dónde está el diseño visual?**
→ `capturas/` (1-11.png) y `POC-MiClaro empresas-servicio fijo (1).pdf`

**¿Cuáles son los endpoints de API?**
→ `ESPECIFICACIONES-TECNICAS.md` sección 1

**¿Qué tareas hay que hacer?**
→ `PLAN-DE-TRABAJO-STENCIL.md` (checklist por fases)

**¿Cómo funciona el flujo actualmente?**
→ Proyecto TEL, ruta `/store-businesses`, ver `ESPECIFICACIONES-TECNICAS.md` sección 6

**¿Qué tecnología usar?**
→ Stencil.js v4.x, ver `ROLES-EQUIPO.md` para patrones y mejores prácticas

---

## Siguiente Paso

**Opción A: Crear Tests (Fase 8)** ← Recomendado
```bash
cd /Volumes/JesdlozWork/Proyectos/E1/tienda-project/fixed-flow-labs/fixed-service-flow
npm test  # Actualmente solo utils.spec.ts
# Crear tests para: servicios, componentes, store
```

**Opción B: Pruebas de integración con API real**
```bash
npm start  # http://localhost:3333
# Probar flujo completo con la API de UAT
```

**Opción C: Documentación formal**
```bash
# Crear README.md de producción
# Crear CHANGELOG.md
# Guía de integración para proyectos padre
```

---

## APIs del Carrito

| Endpoint | Método | Uso |
|----------|--------|-----|
| `api/Card/addToCart` | POST | Agrega plan al carrito |
| `api/Card/deleteItem` | POST | Elimina plan del carrito |
| `api/Card/getCart` | POST | Obtiene carrito actual |
| `api/Plans/addToCartCurrentPlan` | POST | Mantiene plan existente |

---

## APIs del Catálogo (CLARO HOGAR)

| Endpoint | Método | Uso |
|----------|--------|-----|
| `api/Catalogue/listCatalogue` | POST | Lista productos del catálogo Hogar |

**Estructura de Request:**
```json
{
  "catalogId": 6,        // Hogar (padre)
  "pageNo": 1,
  "pageItems": 300,
  "creditClass": "C",
  "orderBy": 7,
  "categoryID": "0",     // Todas las subcategorías
  "brand": "",
  "filter": "",
  "price": "",
  "labels": []
}
```

**Subcatálogos disponibles:**
- `23` = Internet Inalámbrico
- `39` = Internet + Telefonía

---

*Última actualización: 2025-12-12 (Sesión 7)*
