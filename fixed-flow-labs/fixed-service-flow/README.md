# Fixed Service Flow

[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

Web Component para solicitud de servicio fijo empresarial - Claro Puerto Rico.

## Tabla de Contenidos

- [Instalacion](#instalacion)
- [Uso Basico](#uso-basico)
- [Props](#props)
- [Eventos](#eventos)
- [Integracion con Frameworks](#integracion-con-frameworks)
- [Theming](#theming)
- [Desarrollo](#desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)

## Instalacion

### NPM

```bash
npm install fixed-service-flow
```

### CDN

```html
<script type="module" src="https://unpkg.com/fixed-service-flow/dist/fixed-service-flow/fixed-service-flow.esm.js"></script>
```

## Uso Basico

```html
<fixed-service-flow
  api-url="https://uat-tienda.claropr.com"
  google-maps-key="YOUR_GOOGLE_MAPS_API_KEY"
></fixed-service-flow>

<script>
  const flow = document.querySelector('fixed-service-flow');

  flow.addEventListener('flowComplete', (e) => {
    console.log('Solicitud completada:', e.detail);
  });

  flow.addEventListener('flowError', (e) => {
    console.error('Error:', e.detail);
  });

  flow.addEventListener('flowCancel', () => {
    console.log('Flujo cancelado');
  });

  flow.addEventListener('stepChange', (e) => {
    console.log('Paso actual:', e.detail);
  });
</script>
```

## Props

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `api-url` | `string` | Si | - | URL base de la API (ej: `https://uat-tienda.claropr.com`) |
| `google-maps-key` | `string` | Si | - | API Key de Google Maps con Places y Maps JS habilitados |
| `debug` | `boolean` | No | `false` | Habilita logs de depuracion en consola |

## Eventos

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `flowComplete` | `{ requestId, plan, location }` | Solicitud completada exitosamente |
| `flowError` | `{ message, step, code }` | Error durante el flujo |
| `flowCancel` | `void` | Usuario cancelo el flujo |
| `stepChange` | `{ currentStep, previousStep }` | Cambio de paso en el flujo |

### Ejemplo de Payload flowComplete

```javascript
{
  requestId: "12345",
  plan: {
    planId: 1,
    planName: "Internet 100 Mbps",
    price: 49.99
  },
  location: {
    address: "123 Main St",
    city: "San Juan",
    zipCode: "00901",
    latitude: 18.4655,
    longitude: -66.1057,
    serviceType: "GPON"
  }
}
```

## Flujo de Usuario

```
[1. UBICACION] -> [2. PLANES] -> [3. CONTRATO] -> [4. FORMULARIO] -> [5. CONFIRMACION]
```

1. **Ubicacion** - Mapa con autocompletado, geolocalizacion y validacion de cobertura
2. **Planes** - Seleccion de planes disponibles (GPON, VRAD, Claro Hogar)
3. **Contrato** - Tipo de contrato (con/sin plazo: 12/24 meses)
4. **Formulario** - Datos personales, empresariales y direccion
5. **Confirmacion** - Resultado de la solicitud (exito/error)

## Integracion con Frameworks

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { defineCustomElements } from 'fixed-service-flow/loader';

defineCustomElements();

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<fixed-service-flow
  [attr.api-url]="apiUrl"
  [attr.google-maps-key]="googleMapsKey"
  (flowComplete)="onFlowComplete($event)"
  (flowError)="onFlowError($event)"
></fixed-service-flow>
```

### React

```tsx
import { defineCustomElements } from 'fixed-service-flow/loader';
import { useEffect, useRef } from 'react';

defineCustomElements();

function App() {
  const flowRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const flow = flowRef.current;
    if (flow) {
      flow.addEventListener('flowComplete', handleComplete);
      flow.addEventListener('flowError', handleError);
    }
    return () => {
      if (flow) {
        flow.removeEventListener('flowComplete', handleComplete);
        flow.removeEventListener('flowError', handleError);
      }
    };
  }, []);

  const handleComplete = (e: CustomEvent) => {
    console.log('Completed:', e.detail);
  };

  const handleError = (e: CustomEvent) => {
    console.error('Error:', e.detail);
  };

  return (
    <fixed-service-flow
      ref={flowRef}
      api-url="https://uat-tienda.claropr.com"
      google-maps-key="YOUR_KEY"
    />
  );
}
```

### Vue

```vue
<template>
  <fixed-service-flow
    :api-url="apiUrl"
    :google-maps-key="googleMapsKey"
    @flowComplete="onComplete"
    @flowError="onError"
  />
</template>

<script setup>
import { onMounted } from 'vue';
import { defineCustomElements } from 'fixed-service-flow/loader';

defineCustomElements();

const apiUrl = 'https://uat-tienda.claropr.com';
const googleMapsKey = 'YOUR_KEY';

const onComplete = (e) => {
  console.log('Completed:', e.detail);
};

const onError = (e) => {
  console.error('Error:', e.detail);
};
</script>
```

## Theming

Personaliza los colores usando CSS custom properties:

```css
fixed-service-flow {
  --fsf-color-primary: #DA291C;
  --fsf-color-secondary: #0097A9;
  --fsf-color-success: #44AF69;
  --fsf-color-error: #DA291C;
  --fsf-font-family: 'AMX', sans-serif;
}
```

### Variables Disponibles

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `--fsf-color-primary` | `#DA291C` | Color primario (Rojo Claro) |
| `--fsf-color-secondary` | `#0097A9` | Color secundario (Cyan) |
| `--fsf-color-success` | `#44AF69` | Color de exito |
| `--fsf-color-error` | `#DA291C` | Color de error |
| `--fsf-color-warning` | `#FF8300` | Color de advertencia |
| `--fsf-color-text-primary` | `#333333` | Texto principal |
| `--fsf-color-text-secondary` | `#666666` | Texto secundario |
| `--fsf-color-bg-primary` | `#FFFFFF` | Fondo principal |
| `--fsf-color-bg-secondary` | `#F5F5F5` | Fondo secundario |
| `--fsf-font-family` | `'AMX', sans-serif` | Fuente principal |
| `--fsf-border-radius` | `8px` | Radio de bordes |

## Desarrollo

### Requisitos

- Node.js 18+
- npm 9+

### Instalacion

```bash
git clone <repo>
cd fixed-service-flow
npm install
```

### Comandos

```bash
# Servidor de desarrollo (http://localhost:3333)
npm start

# Build de produccion
npm run build

# Ejecutar tests
npm test

# Watch tests
npm run test.watch

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Formatear codigo
npm run format

# Check formato
npm run format:check
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── fixed-service-flow/   # Componente orquestador principal
│   ├── steps/                # Pasos del flujo
│   │   ├── step-location/    # Paso 1: Mapa y ubicacion
│   │   ├── step-plans/       # Paso 2: Seleccion de planes
│   │   ├── step-contract/    # Paso 3: Tipo de contrato
│   │   ├── step-form/        # Paso 4: Formulario de datos
│   │   └── step-confirmation/# Paso 5: Confirmacion
│   └── ui/                   # Componentes UI reutilizables
│       ├── ui-button/
│       ├── ui-input/
│       ├── ui-select/
│       ├── ui-radio/
│       ├── ui-radio-card/
│       ├── ui-date-picker/
│       └── ui-checkbox/
├── services/                 # Servicios HTTP/API
│   ├── http.service.ts       # Cliente HTTP base
│   ├── token.service.ts      # Autenticacion y tokens
│   ├── coverage.service.ts   # Validacion de cobertura
│   ├── plans.service.ts      # Planes de internet
│   ├── request.service.ts    # Envio de solicitudes
│   └── maps.service.ts       # Google Maps integration
├── store/                    # Estado global
│   ├── flow.store.ts         # Store principal
│   └── interfaces.ts         # Tipos TypeScript
├── utils/                    # Utilidades
│   ├── validators.ts         # Validaciones de formulario
│   ├── formatters.ts         # Formateo de datos
│   ├── constants.ts          # Constantes
│   └── environment.ts        # Configuracion de entorno
└── global/                   # Estilos globales
    ├── variables.scss        # Design tokens
    ├── mixins.scss           # Mixins SCSS
    ├── reset.scss            # CSS reset
    └── global.scss           # Estilos globales
```

## API Endpoints

El componente utiliza los siguientes endpoints de la API:

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `api/Token/getToken` | POST | Obtener token de autenticacion |
| `api/Catalogue/getInternetPlans` | POST | Validar cobertura por coordenadas |
| `api/Plans/getPlansInternet` | POST | Obtener planes disponibles |
| `api/Orders/internetServiceRequest` | POST | Enviar solicitud de servicio |

### Headers Requeridos

```
Authorization: Bearer {token}
App: shop
Platform: web
X-Correlation-ID: {correlationId}
```

## Browser Support

- Chrome (ultimas 2 versiones)
- Firefox (ultimas 2 versiones)
- Safari (ultimas 2 versiones)
- Edge (ultimas 2 versiones)

## Google Maps API

El componente requiere una API Key de Google Maps con las siguientes APIs habilitadas:

- Maps JavaScript API
- Places API
- Geocoding API

Configuracion recomendada:
- Restriccion de dominio para seguridad
- Cuota de solicitudes adecuada al trafico esperado

## Licencia

MIT

---

Desarrollado para **Claro Puerto Rico** - Mi Claro Empresas
