# Changelog

Todos los cambios notables de este proyecto seran documentados en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semantico](https://semver.org/lang/es/).

## [1.1.0] - 2025-12-10

### Agregado

#### Funcionalidades del Mapa (portadas desde TEL)
- **Click en mapa** - Al hacer click en el mapa, se hace reverse geocode y valida cobertura automaticamente (`step-location.tsx:128-150`)
- **Enter para validar** - Presionar Enter en el input de direccion ejecuta la validacion (`step-location.tsx:117-122`)
- **Listener de click en mapa** - Nuevo metodo `addMapClickListener()` en maps.service.ts
- **Metodo clear()** - Para limpiar marcadores del mapa

#### SessionStorage con Base64 (como TEL)
- Almacenamiento de `latitud`, `longitud`, `planCodeInternet` codificados en Base64
- Manejo especial para CLARO HOGAR (remueve `planCodeInternet` del sessionStorage)
- Almacenamiento de datos del plan como JSON (`step-location.tsx:252-281`)

### Arreglado

#### Bug Critico: Parseo JSON con Content-Type text/plain
- **Problema**: El servidor de Claro devuelve `Content-Type: text/plain; charset=utf-8` para respuestas JSON
- **Sintoma**: `response.priorityService` era `undefined` aunque la API retornaba `{"priorityService":"GPON"...}`
- **Solucion**: Modificado `http.service.ts:139-157` para detectar si el contenido empieza con `{` o `[` y parsearlo como JSON independientemente del content-type
- Este fix resuelve el problema donde TEL permitia continuar pero nuestro componente mostraba "Fuera de area" para la misma direccion

### Cambiado

#### Limpieza de Codigo
- Removidos console.log de debug en coverage.service.ts
- Prefijadas variables no utilizadas con `_` para cumplir con TypeScript strict mode (`_inputEl`, `_goToStep`, `_STEP_TITLES`)

---

## [1.0.0] - 2025-12-10

### Agregado

#### Componente Principal
- `<fixed-service-flow>` - Componente orquestador con flujo de 5 pasos
- Props: `api-url`, `google-maps-key`, `debug`
- Eventos: `flowComplete`, `flowError`, `flowCancel`, `stepChange`

#### Pasos del Flujo
- **step-location** - Mapa con Google Maps, autocompletado, geolocalizacion
- **step-plans** - Grid de planes con seleccion y barra de resumen sticky
- **step-contract** - Tabs para tipo de contrato (con/sin plazo)
- **step-form** - Formulario completo con validaciones en tiempo real
- **step-confirmation** - Estados de exito/error con acciones

#### Componentes UI
- `ui-button` - Botones con variantes (primary, secondary, outline)
- `ui-input` - Inputs con validacion y estados de error
- `ui-select` - Select/dropdown personalizado
- `ui-radio` - Radio buttons
- `ui-radio-card` - Radio como cards seleccionables
- `ui-date-picker` - Selector de fecha
- `ui-checkbox` - Checkbox con estados

#### Servicios
- `http.service` - Cliente HTTP con headers de autenticacion
- `token.service` - Gestion de tokens y sessionStorage
- `coverage.service` - Validacion de cobertura por coordenadas
- `plans.service` - Obtencion y formateo de planes
- `request.service` - Envio de solicitudes de servicio
- `maps.service` - Integracion completa con Google Maps API

#### Estado Global
- `flow.store` - Store con @stencil/store
- Acciones: setToken, setLocation, selectPlan, setContract, setFormData
- Persistencia en sessionStorage

#### Sistema de Diseno
- Paleta de colores Claro Puerto Rico
- Tipografia AMX con fallbacks
- Sistema de espaciados (4px base)
- Breakpoints responsive (xs, sm, md, lg, xl, 2xl)
- Mixins SCSS reutilizables

#### Testing
- Tests unitarios para servicios (5 archivos .spec.ts)
- Tests unitarios para componentes UI (4 archivos .spec.ts)
- Configuracion Jest via Stencil

#### Configuracion
- ESLint con @typescript-eslint y Prettier
- Prettier para formateo de codigo
- Variables de entorno (.env.example)
- TypeScript strict mode

### Notas Tecnicas
- Stencil.js v4.27.1
- Shadow DOM para encapsulamiento de estilos
- Build: dist (npm), dist-custom-elements (bundlers), www (dev)
- Compatible con Angular, React, Vue y vanilla JS

---

## Historial de Interacciones (Sesiones con Claude)

### Sesion 3 - 2025-12-10

**Objetivo**: Portar logica del mapa de TEL al componente fixed-service-flow

**Tareas completadas**:
1. Analisis del flujo de mapas en TEL (`map-web.component.ts`, `map.service.ts`)
2. Implementacion de click en mapa para seleccionar ubicacion
3. Implementacion de keypress Enter para validar direccion
4. Implementacion de sessionStorage con codificacion Base64 (patron TEL)
5. Logica especial para CLARO HOGAR
6. **Fix critico**: Parseo JSON cuando servidor devuelve `text/plain`
7. Limpieza de logs de debug

**Archivos modificados**:
- `src/services/maps.service.ts` - Agregado `addMapClickListener()` y `clear()`
- `src/services/http.service.ts` - Fix para parseo JSON con content-type text/plain
- `src/services/coverage.service.ts` - Limpieza de logs
- `src/components/steps/step-location/step-location.tsx` - Click en mapa, Enter key, sessionStorage

**Bug encontrado y resuelto**:
- La misma direccion ("Urb bosques de la sierra calle coqui grillo") funcionaba en TEL pero mostraba "Fuera de area" en nuestro componente
- Causa: El servidor devuelve JSON con `Content-Type: text/plain`
- Solucion: Parsear como JSON si el contenido empieza con `{` o `[`

### Sesion 2 - 2025-12-09

**Objetivo**: Corregir errores de compilacion y completar implementacion

**Tareas completadas**:
1. Correccion de imports en coverage.service.ts
2. Correccion de parametros en llamada API getInternetPlans
3. Implementacion de getServiceDisplayName
4. Implementacion de isClaroHogar helper
5. Verificacion de build exitoso

### Sesion 1 - 2025-12-09

**Objetivo**: Crear web component desde cero para el flujo de servicio fijo

**Tareas completadas**:
1. Estructura inicial del proyecto Stencil.js
2. Implementacion de todos los pasos del flujo (1-5)
3. Componentes UI reutilizables
4. Servicios para API (http, token, coverage, plans, request, maps)
5. Store global con @stencil/store
6. Sistema de diseno (colores, tipografia, espaciados)
7. Tests unitarios basicos
8. Documentacion README.md

---

## Tipos de Cambios

- **Agregado** para nuevas funcionalidades.
- **Cambiado** para cambios en funcionalidades existentes.
- **Obsoleto** para funcionalidades que seran removidas.
- **Removido** para funcionalidades eliminadas.
- **Arreglado** para correcciones de bugs.
- **Seguridad** para vulnerabilidades.
