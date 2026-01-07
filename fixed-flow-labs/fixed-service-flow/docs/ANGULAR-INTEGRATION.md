# Guia de Integracion - Angular

Esta guia explica como integrar el Web Component `<fixed-service-flow>` en un proyecto Angular.

## Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Instalacion](#instalacion)
3. [Configuracion de Angular](#configuracion-de-angular)
4. [Uso del Componente](#uso-del-componente)
5. [Propiedades (Inputs)](#propiedades-inputs)
6. [Eventos (Outputs)](#eventos-outputs)
7. [Ejemplos Completos](#ejemplos-completos)
8. [Troubleshooting](#troubleshooting)

---

## Requisitos

- Angular 14+ (compatible con Angular 15, 16, 17, 18)
- Node.js 16+
- Google Maps API Key (con Places API habilitado)

---

## Instalacion

### Opcion 1: Via NPM (Recomendado)

```bash
npm install @smlzjosue/fixed-service-flow
```

### Opcion 2: Via CDN

Agregar en el `index.html` de tu proyecto Angular:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/smlzjosue/fixed-service-flow-web-component@v1.2.9/fixed-flow-labs/fixed-service-flow/dist/fixed-service-flow/fixed-service-flow.esm.js"></script>
```

---

## Configuracion de Angular

### Paso 1: Habilitar Custom Elements

Angular necesita saber que `<fixed-service-flow>` es un Web Component externo. Configura el schema `CUSTOM_ELEMENTS_SCHEMA` en tu modulo o componente.

#### Para Modulos (NgModule)

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // <-- Agregar esto
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### Para Standalone Components (Angular 14+)

```typescript
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // <-- Agregar esto
  templateUrl: './app.component.html'
})
export class AppComponent {}
```

### Paso 2: Cargar el Web Component

#### Si instalaste via NPM

Crea un archivo para cargar el componente:

```typescript
// src/app/web-components.loader.ts
import { defineCustomElements } from '@smlzjosue/fixed-service-flow/loader';

export function loadWebComponents() {
  defineCustomElements(window);
}
```

Llama la funcion en `main.ts`:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { loadWebComponents } from './app/web-components.loader';

// Cargar Web Components
loadWebComponents();

bootstrapApplication(AppComponent);
```

O en `app.module.ts` para proyectos con NgModule:

```typescript
// main.ts (NgModule)
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { defineCustomElements } from '@smlzjosue/fixed-service-flow/loader';

defineCustomElements(window);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

#### Si usas CDN

No necesitas configuracion adicional, el script se carga automaticamente.

---

## Uso del Componente

### Template Basico

```html
<!-- app.component.html -->
<fixed-service-flow
  api-url="https://uat-tienda.claropr.com"
  google-maps-key="TU_API_KEY_DE_GOOGLE_MAPS"
  [debug]="true"
  (flowComplete)="onFlowComplete($event)"
  (flowError)="onFlowError($event)"
  (stepChange)="onStepChange($event)"
  (flowCancel)="onFlowCancel()"
></fixed-service-flow>
```

### Componente TypeScript

```typescript
// app.component.ts
import { Component } from '@angular/core';

interface FlowCompleteEvent {
  orderId: string;
  orderData: any;
}

interface FlowErrorEvent {
  step: number;
  error: string;
  details?: any;
}

interface StepChangeEvent {
  from: number;
  to: number;
  stepName: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  onFlowComplete(event: CustomEvent<FlowCompleteEvent>) {
    console.log('Flow completado:', event.detail);
    const { orderId, orderData } = event.detail;

    // Navegar a pagina de confirmacion, mostrar modal, etc.
    alert(`Orden creada exitosamente! ID: ${orderId}`);
  }

  onFlowError(event: CustomEvent<FlowErrorEvent>) {
    console.error('Error en el flow:', event.detail);
    const { step, error, details } = event.detail;

    // Manejar el error (mostrar toast, log, etc.)
  }

  onStepChange(event: CustomEvent<StepChangeEvent>) {
    console.log('Cambio de paso:', event.detail);
    const { from, to, stepName } = event.detail;

    // Analytics, actualizar breadcrumb, etc.
  }

  onFlowCancel() {
    console.log('Usuario cancelo el flow');
    // Redirigir a home, mostrar confirmacion, etc.
  }
}
```

---

## Propiedades (Inputs)

| Propiedad | Atributo HTML | Descripcion | Tipo | Requerido | Default |
|-----------|---------------|-------------|------|-----------|---------|
| `apiUrl` | `api-url` | URL base de la API de Claro | `string` | Si | - |
| `googleMapsKey` | `google-maps-key` | API Key de Google Maps | `string` | Si | - |
| `debug` | `debug` | Activa modo debug (logs en consola) | `boolean` | No | `false` |
| `initialStep` | `initial-step` | Paso inicial del flujo (1-8) | `number` | No | `1` |
| `correlationId` | `correlation-id` | ID de correlacion para tracking | `string` | No | - |

### Ejemplo con todas las propiedades

```html
<fixed-service-flow
  api-url="https://uat-tienda.claropr.com"
  google-maps-key="AIzaSyA8TqyXDoMKIggMpXVvsnfgL1K57aUBSuc"
  [debug]="isDevMode"
  [initial-step]="2"
  correlation-id="user-session-12345"
></fixed-service-flow>
```

---

## Eventos (Outputs)

| Evento | Descripcion | Payload |
|--------|-------------|---------|
| `flowComplete` | Se emite cuando el flujo se completa exitosamente | `{ orderId: string, orderData: object }` |
| `flowError` | Se emite cuando ocurre un error | `{ step: number, error: string, details?: any }` |
| `stepChange` | Se emite cuando el usuario cambia de paso | `{ from: number, to: number, stepName: string }` |
| `flowCancel` | Se emite cuando el usuario cancela el flujo | `void` |

### Escuchar eventos en Angular

```html
<fixed-service-flow
  api-url="..."
  google-maps-key="..."
  (flowComplete)="handleComplete($event)"
  (flowError)="handleError($event)"
  (stepChange)="handleStepChange($event)"
  (flowCancel)="handleCancel()"
></fixed-service-flow>
```

---

## Ejemplos Completos

### Ejemplo 1: Integracion Basica

```typescript
// fixed-service.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fixed-service',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container">
      <fixed-service-flow
        [attr.api-url]="apiUrl"
        [attr.google-maps-key]="googleMapsKey"
        [attr.debug]="debug"
        (flowComplete)="onComplete($event)"
        (flowError)="onError($event)"
      ></fixed-service-flow>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class FixedServiceComponent {
  apiUrl = 'https://uat-tienda.claropr.com';
  googleMapsKey = 'TU_API_KEY';
  debug = true;

  constructor(private router: Router) {}

  onComplete(event: CustomEvent) {
    console.log('Orden completada:', event.detail);
    this.router.navigate(['/confirmacion'], {
      queryParams: { orderId: event.detail.orderId }
    });
  }

  onError(event: CustomEvent) {
    console.error('Error:', event.detail);
  }
}
```

### Ejemplo 2: Con Variables de Entorno

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://uat-tienda.claropr.com',
  googleMapsKey: 'TU_API_KEY_DEV'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tienda.claropr.com',
  googleMapsKey: 'TU_API_KEY_PROD'
};
```

```typescript
// fixed-service.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-fixed-service',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <fixed-service-flow
      [attr.api-url]="config.apiUrl"
      [attr.google-maps-key]="config.googleMapsKey"
      [attr.debug]="!config.production"
      (flowComplete)="onComplete($event)"
    ></fixed-service-flow>
  `
})
export class FixedServiceComponent {
  config = environment;

  onComplete(event: CustomEvent) {
    // Manejar completado
  }
}
```

### Ejemplo 3: Con Servicio de Estado

```typescript
// order.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orderSubject = new BehaviorSubject<any>(null);
  order$ = this.orderSubject.asObservable();

  setOrder(order: any) {
    this.orderSubject.next(order);
  }
}
```

```typescript
// fixed-service.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OrderService } from './order.service';

@Component({
  selector: 'app-fixed-service',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <fixed-service-flow
      api-url="https://uat-tienda.claropr.com"
      google-maps-key="TU_API_KEY"
      (flowComplete)="onComplete($event)"
    ></fixed-service-flow>
  `
})
export class FixedServiceComponent {
  constructor(private orderService: OrderService) {}

  onComplete(event: CustomEvent) {
    this.orderService.setOrder(event.detail.orderData);
  }
}
```

---

## Troubleshooting

### Error: "'fixed-service-flow' is not a known element"

**Causa:** Angular no reconoce el Web Component.

**Solucion:** Asegurate de agregar `CUSTOM_ELEMENTS_SCHEMA` en tu modulo o componente:

```typescript
schemas: [CUSTOM_ELEMENTS_SCHEMA]
```

### Error: "defineCustomElements is not a function"

**Causa:** El loader no se importo correctamente.

**Solucion:** Verifica la importacion:

```typescript
import { defineCustomElements } from '@smlzjosue/fixed-service-flow/loader';
```

### El componente no se renderiza

**Causa:** El Web Component no se cargo.

**Solucion:**
1. Verifica que `defineCustomElements(window)` se llame en `main.ts`
2. Si usas CDN, verifica que el script este en `index.html`
3. Abre DevTools y busca errores de red

### Los eventos no se disparan

**Causa:** Sintaxis incorrecta para eventos de Web Components.

**Solucion:** Usa la sintaxis de Angular para eventos:

```html
<!-- Correcto -->
(flowComplete)="onComplete($event)"

<!-- Incorrecto -->
[flowComplete]="onComplete"
```

### Estilos no se aplican correctamente

**Causa:** El Web Component usa Shadow DOM.

**Solucion:** Los estilos internos estan encapsulados. Para estilos del contenedor:

```css
/* Esto funciona - estilo del contenedor */
fixed-service-flow {
  display: block;
  max-width: 1400px;
  margin: 0 auto;
}

/* Esto NO funciona - estilos internos estan encapsulados */
fixed-service-flow .internal-class {
  /* no aplica */
}
```

### Google Maps no carga

**Causa:** API Key invalida o sin permisos.

**Solucion:**
1. Verifica que el API Key sea valido
2. Habilita "Maps JavaScript API" y "Places API" en Google Cloud Console
3. Configura las restricciones de dominio correctamente

---

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- GitHub Issues: https://github.com/smlzjosue/fixed-service-flow-web-component/issues

---

*Ultima actualizacion: v1.2.9*
