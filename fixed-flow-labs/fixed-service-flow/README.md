# Fixed Service Flow Web Component

Web Component standalone para solicitud de servicio fijo empresarial - Claro Puerto Rico.

Desarrollado con **Stencil.js v4.x**, genera Web Components estandar que funcionan en cualquier framework (Angular, React, Vue) o vanilla HTML.

## Instalacion

### Desde GitHub Packages

```bash
# Configurar el registry de GitHub en .npmrc
echo "@smlzjosue:registry=https://npm.pkg.github.com" >> .npmrc

# Instalar el paquete
npm install @smlzjosue/fixed-service-flow
```

### Desde CDN (jsDelivr + GitHub)

La forma mas rapida de usar el componente es directamente desde CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/smlzjosue/fixed-service-flow-web-component@main/fixed-flow-labs/fixed-service-flow/dist/fixed-service-flow/fixed-service-flow.esm.js"></script>
```

Tambien puedes especificar una version especifica en lugar de `@main`:

```html
<!-- Version especifica (tag) -->
<script type="module" src="https://cdn.jsdelivr.net/gh/smlzjosue/fixed-service-flow-web-component@v1.1.0/fixed-flow-labs/fixed-service-flow/dist/fixed-service-flow/fixed-service-flow.esm.js"></script>
```

## Uso

### HTML Basico

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Aplicacion - Servicio Fijo</title>

  <!-- Cargar el Web Component desde CDN -->
  <script type="module" src="https://cdn.jsdelivr.net/gh/smlzjosue/fixed-service-flow-web-component@main/fixed-flow-labs/fixed-service-flow/dist/fixed-service-flow/fixed-service-flow.esm.js"></script>
</head>
<body>
  <!-- Web Component embebido -->
  <fixed-service-flow
    api-url="https://uat-tienda.claropr.com"
    google-maps-key="YOUR_GOOGLE_MAPS_API_KEY"
    debug="true"
  ></fixed-service-flow>

  <script>
    // Escuchar eventos del Web Component
    const flow = document.querySelector('fixed-service-flow');

    flow.addEventListener('flowComplete', (e) => {
      console.log('Solicitud completada:', e.detail);
      // e.detail contiene: orderId, plan, contract, customer, location
    });

    flow.addEventListener('flowError', (e) => {
      console.error('Error:', e.detail);
    });

    flow.addEventListener('stepChange', (e) => {
      console.log('Paso cambiado:', e.detail);
      // e.detail contiene: step (numero del paso actual)
    });

    flow.addEventListener('flowCancel', () => {
      console.log('Flujo cancelado');
    });
  </script>
</body>
</html>
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { defineCustomElements } from '@smlzjosue/fixed-service-flow/loader';

defineCustomElements();

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule {}
```

```html
<!-- component.html -->
<fixed-service-flow
  api-url="https://uat-tienda.claropr.com"
  google-maps-key="YOUR_KEY"
  (flowComplete)="onComplete($event)"
  (flowError)="onError($event)"
></fixed-service-flow>
```

### React

```tsx
import { defineCustomElements } from '@smlzjosue/fixed-service-flow/loader';

defineCustomElements();

function App() {
  const handleComplete = (e: CustomEvent) => {
    console.log('Completed:', e.detail);
  };

  return (
    <fixed-service-flow
      api-url="https://uat-tienda.claropr.com"
      google-maps-key="YOUR_KEY"
      onFlowComplete={handleComplete}
    />
  );
}
```

### Vue

```vue
<template>
  <fixed-service-flow
    api-url="https://uat-tienda.claropr.com"
    google-maps-key="YOUR_KEY"
    @flowComplete="onComplete"
  />
</template>

<script setup>
import { defineCustomElements } from '@smlzjosue/fixed-service-flow/loader';

defineCustomElements();

const onComplete = (e) => {
  console.log('Completed:', e.detail);
};
</script>
```

## Props

| Prop | Tipo | Requerido | Descripcion |
|------|------|-----------|-------------|
| `api-url` | `string` | Si | URL base de la API de Claro PR |
| `google-maps-key` | `string` | Si | API Key de Google Maps |
| `debug` | `boolean` | No | Habilita logs de depuracion (default: false) |

## Eventos

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `flowComplete` | `FlowCompleteEvent` | Emitido cuando se completa el flujo exitosamente |
| `flowError` | `FlowErrorEvent` | Emitido cuando ocurre un error |
| `stepChange` | `StepChangeEvent` | Emitido cuando cambia el paso actual |
| `flowCancel` | `void` | Emitido cuando el usuario cancela el flujo |

### FlowCompleteEvent

```typescript
interface FlowCompleteEvent {
  orderId: string;
  plan: Plan;
  contract: Contract;
  customer: FormData;
  location: LocationData;
}
```

## Flujo de Pasos

El componente implementa un flujo de 5 pasos:

1. **Ubicacion** - Validacion de cobertura con Google Maps
2. **Planes** - Seleccion de plan de internet (GPON/VRAD) o catalogo CLARO HOGAR
3. **Contrato** - Tipo de contrato (con/sin contrato, plazos)
4. **Formulario** - Datos personales y empresariales
5. **Confirmacion** - Resultado de la solicitud

## Tipos de Cobertura

- **GPON** - Fibra optica (planes premium)
- **VRAD** - DSL mejorado (planes estandar)
- **CLARO HOGAR** - Internet inalambrico (catalogo de equipos)

## Requisitos

- Google Maps API Key con los siguientes servicios habilitados:
  - Maps JavaScript API
  - Places API
  - Geocoding API

## Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/smlzjosue/fixed-service-flow-web-component.git
cd fixed-service-flow-web-component/fixed-flow-labs/fixed-service-flow

# Instalar dependencias
npm install

# Servidor de desarrollo
npm start
# Abre http://localhost:3333

# Build de produccion
npm run build
```

## Licencia

MIT
