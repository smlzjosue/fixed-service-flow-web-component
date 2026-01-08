# Plan de Trabajo: Loader en Transicion Location → Plans (GPON/VRAD)

> **Fecha:** 2026-01-08
> **Flujo afectado:** GPON/VRAD (Standard Flow)
> **Problema:** Pantalla en blanco durante carga de planes
> **Direccion de prueba:** `Urb bosques de la sierra calle coqui grillo`

---

## Resumen Ejecutivo

Cuando el usuario valida una direccion con cobertura GPON/VRAD y hace clic en "¡Lo quiero!", el componente se queda en **blanco** mientras se cargan los planes de internet. Esto ocurre porque el loader de `step-plans` no se renderiza correctamente durante la carga inicial.

---

## Analisis del Problema

### Flujo Actual (GPON/VRAD)

```
[step-location]
Usuario ingresa: "Urb bosques de la sierra calle coqui grillo"
    ↓
Click "Validar" → API getInternetPlans → Cobertura GPON detectada
    ↓
InfoWindow: "¡Tu area posee nuestro servicio!"
    ↓
Click "¡Lo quiero!" → handleInfoWindowContinue() → onNext()
    ↓
[fixed-service-flow] handleStepChange('forward') → currentStep = 2
    ↓
Renderiza <step-plans>
    ↓
[step-plans] componentWillLoad() → await loadPlans()
    ↓
*** PROBLEMA: Pantalla en blanco ***
    ↓
API getPlansInternet completa → isLoading = false → Render
```

### Causa Raiz Tecnica

**Archivo:** `step-plans.tsx` (lineas 40-52)

```typescript
async componentWillLoad() {
  await this.loadPlans();  // ← BLOQUEA el primer render
  // ...
}
```

**Comportamiento de Stencil.js:**
- `componentWillLoad()` con `await` **bloquea** el primer render hasta que la promesa se resuelve
- `this.isLoading = true` se ejecuta, pero el render NO ocurre porque estamos en `componentWillLoad`
- La API tarda 1-3 segundos
- `this.isLoading = false` se ejecuta
- `componentWillLoad()` termina
- **AHORA** ocurre el primer render, pero `isLoading` ya es `false`

**Resultado:** El loader nunca se muestra porque el primer render ocurre DESPUES de que la carga termino.

### Solucion Comprobada

En `step-catalogue.tsx` (lineas 950-960 del historial) se aplico la misma solucion:

```typescript
// ANTES (problema)
async componentWillLoad() {
  await this.loadProducts();  // Bloquea render
}

// DESPUES (solucion)
componentWillLoad() {
  // Sync: configurar estado inicial
  this.filterOptions = catalogueService.getProductTypeFilters();
}

componentDidLoad() {
  // Async: cargar datos (loader ya visible)
  this.loadProducts();
}
```

---

## Arquitectura de Archivos Involucrados

```
src/components/
├── fixed-service-flow/
│   └── fixed-service-flow.tsx      # Orquestador (renderiza step-plans)
└── steps/
    ├── step-location/
    │   └── step-location.tsx       # Paso 1: Mapa y validacion
    └── step-plans/
        ├── step-plans.tsx          # Paso 2: Seleccion de planes ← MODIFICAR
        └── step-plans.scss         # Estilos (loader ya existe) ✓
```

---

## Fases de Implementacion

### FASE 1: Corregir Lifecycle de step-plans

**Objetivo:** Mostrar loader durante carga inicial de planes

**Archivo:** `src/components/steps/step-plans/step-plans.tsx`

#### 1.1 Cambiar componentWillLoad a sincrono

**Antes:**
```typescript
async componentWillLoad() {
  await this.loadPlans();

  const storedPlanId = plansService.getStoredPlanId();
  if (storedPlanId > 0) {
    const storedPlan = this.plans.find(p => p.planId === storedPlanId);
    if (storedPlan) {
      this.selectedPlan = storedPlan;
      flowActions.selectPlan(storedPlan);
    }
  }
}
```

**Despues:**
```typescript
componentWillLoad() {
  // Sync: Solo configuracion inicial
  // El estado isLoading ya es true por defecto
}
```

- [ ] Remover `async` de `componentWillLoad`
- [ ] Remover `await this.loadPlans()`
- [ ] Remover logica de plan almacenado (mover a componentDidLoad)

#### 1.2 Agregar componentDidLoad con carga asincrona

**Agregar despues de componentWillLoad:**
```typescript
componentDidLoad() {
  // El loader ya se esta mostrando (isLoading = true por defecto)
  this.initializePlans();
}

private async initializePlans() {
  await this.loadPlans();

  // Restaurar plan seleccionado si existe en session
  const storedPlanId = plansService.getStoredPlanId();
  if (storedPlanId > 0) {
    const storedPlan = this.plans.find(p => p.planId === storedPlanId);
    if (storedPlan) {
      this.selectedPlan = storedPlan;
      flowActions.selectPlan(storedPlan);
    }
  }
}
```

- [ ] Crear metodo `componentDidLoad()`
- [ ] Crear metodo privado `initializePlans()`
- [ ] Mover logica de carga y restauracion de plan

#### 1.3 Verificar estado inicial de isLoading

**Verificar que este correcto:**
```typescript
@State() isLoading: boolean = true;  // ← Debe ser true por defecto
```

- [ ] Confirmar que `isLoading` inicia en `true`

---

### FASE 2: Loader de Transicion en Orquestador (Opcional)

**Objetivo:** Mostrar loader durante transicion entre cualquier paso

**Archivo:** `src/components/fixed-service-flow/fixed-service-flow.tsx`

> **Nota:** Esta fase es opcional. La Fase 1 deberia resolver el problema principal.
> Implementar solo si se desea un loader global durante transiciones.

#### 2.1 Agregar estado de transicion

```typescript
@State() isTransitioning: boolean = false;
```

- [ ] Agregar estado `isTransitioning`

#### 2.2 Modificar handleStepChange

```typescript
private handleStepChange = async (direction: 'forward' | 'backward') => {
  this.isTransitioning = true;

  const from = this.currentStep;
  // ... resto de la logica

  // Dar tiempo minimo para mostrar loader (UX)
  await new Promise(resolve => setTimeout(resolve, 100));

  this.isTransitioning = false;
};
```

- [ ] Envolver logica en estado de transicion
- [ ] Agregar delay minimo para UX

#### 2.3 Mostrar loader durante transicion

```typescript
render() {
  if (this.isLoading || this.isTransitioning) {
    return (
      <Host>
        {this.renderLoading()}
      </Host>
    );
  }
  // ...
}
```

- [ ] Modificar condicion de render para incluir `isTransitioning`

---

### FASE 3: Testing y Validacion

**Objetivo:** Verificar funcionamiento correcto

#### 3.1 Prueba de direccion GPON

- [ ] Abrir componente en `http://localhost:3335`
- [ ] Ingresar: `Urb bosques de la sierra calle coqui grillo`
- [ ] Click "Validar"
- [ ] Verificar InfoWindow: "¡Tu area posee nuestro servicio!"
- [ ] Click "¡Lo quiero!"
- [ ] **Verificar:** Loader "Cargando planes..." se muestra
- [ ] **Verificar:** Planes se cargan y muestran correctamente

#### 3.2 Prueba de regreso

- [ ] En step-plans, click "Regresar"
- [ ] Verificar que regresa a step-location
- [ ] Click "¡Lo quiero!" nuevamente
- [ ] **Verificar:** Loader se muestra correctamente

#### 3.3 Prueba de plan preseleccionado

- [ ] Seleccionar un plan
- [ ] Click "Regresar"
- [ ] Click "¡Lo quiero!"
- [ ] **Verificar:** El plan previamente seleccionado esta marcado

---

## Checklist de Implementacion

### Fase 1 - step-plans.tsx
- [x] 1.1 Remover `async` de `componentWillLoad()`
- [x] 1.1 Remover `await this.loadPlans()`
- [x] 1.1 Remover logica de plan almacenado de componentWillLoad
- [x] 1.2 Crear metodo `componentDidLoad()`
- [x] 1.2 Crear metodo `initializePlans()`
- [x] 1.2 Mover carga de planes a initializePlans
- [x] 1.2 Mover restauracion de plan a initializePlans
- [x] 1.3 Verificar `isLoading: boolean = true`

### Fase 2 - fixed-service-flow.tsx (Opcional)
- [ ] 2.1 Agregar `@State() isTransitioning: boolean = false`
- [ ] 2.2 Modificar `handleStepChange()` con estado de transicion
- [ ] 2.3 Modificar `render()` para mostrar loader durante transicion

### Fase 3 - Testing
- [ ] 3.1 Prueba direccion GPON (loader visible)
- [ ] 3.2 Prueba de regreso (loader visible)
- [ ] 3.3 Prueba plan preseleccionado (restauracion correcta)

---

## Codigo de Referencia Completo

### step-plans.tsx (Cambios)

```typescript
// ANTES
async componentWillLoad() {
  await this.loadPlans();

  const storedPlanId = plansService.getStoredPlanId();
  if (storedPlanId > 0) {
    const storedPlan = this.plans.find(p => p.planId === storedPlanId);
    if (storedPlan) {
      this.selectedPlan = storedPlan;
      flowActions.selectPlan(storedPlan);
    }
  }
}

// DESPUES
componentWillLoad() {
  // El loader ya se muestra porque isLoading = true por defecto
  // No hacer nada aqui - dejar que el primer render ocurra con el loader
}

componentDidLoad() {
  // Ahora que el componente esta montado y el loader visible,
  // iniciar la carga de datos
  this.initializePlans();
}

private async initializePlans() {
  await this.loadPlans();

  // Restaurar plan seleccionado si existe en session
  const storedPlanId = plansService.getStoredPlanId();
  if (storedPlanId > 0) {
    const storedPlan = this.plans.find(p => p.planId === storedPlanId);
    if (storedPlan) {
      this.selectedPlan = storedPlan;
      flowActions.selectPlan(storedPlan);
    }
  }
}
```

---

## Flujo Esperado Despues de la Correccion

```
[step-location]
Click "¡Lo quiero!" → onNext()
    ↓
[fixed-service-flow] currentStep = 2 → renderiza <step-plans>
    ↓
[step-plans] Primer render con isLoading = true
    ↓
*** LOADER VISIBLE: "Cargando planes..." ***
    ↓
componentDidLoad() → initializePlans() → loadPlans()
    ↓
API getPlansInternet (1-3 segundos)
    ↓
isLoading = false → Re-render con planes
    ↓
Usuario ve los planes de internet
```

---

## Notas Importantes

1. **No modificar step-plans.scss** - Los estilos del loader ya existen y funcionan correctamente (lineas 89-103)

2. **Patron consistente** - Esta misma solucion se aplico en `step-catalogue.tsx` y funciona correctamente

3. **Retrocompatibilidad** - El cambio no afecta la funcionalidad existente, solo mejora la UX

4. **Stencil.js Lifecycle:**
   - `componentWillLoad()`: Se ejecuta ANTES del primer render. Si es async, bloquea el render.
   - `componentDidLoad()`: Se ejecuta DESPUES del primer render. Ideal para cargas asincronas.

---

## Estimacion de Esfuerzo

| Fase | Complejidad | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Baja | 10-15 minutos |
| 2 | Media | 15-20 minutos (opcional) |
| 3 | Baja | 10-15 minutos |
| **Total** | | **35-50 minutos** |

---

---

## Correccion Adicional: step-confirmation.tsx

### Problema Identificado (2026-01-08)

El mismo problema de pantalla en blanco ocurre al pasar de `step-form` a `step-confirmation`:

```typescript
// ANTES (problema)
async componentWillLoad() {
  if (isCatalogueFlow) {
    await this.handleCatalogueFlowConfirmation();  // Bloquea render
  } else {
    await this.submitRequest();  // Bloquea render
  }
}
```

### Solucion Aplicada

```typescript
// DESPUES (solucion)
componentWillLoad() {
  // Sync - permite que el primer render ocurra con loader visible
}

componentDidLoad() {
  this.initializeConfirmation();
}

private async initializeConfirmation() {
  const isCatalogueFlow = this.isCatalogueFlow();
  if (isCatalogueFlow) {
    await this.handleCatalogueFlowConfirmation();
  } else {
    await this.submitRequest();
  }
}
```

### Checklist step-confirmation.tsx
- [x] Remover `async` de `componentWillLoad()`
- [x] Remover logica async de componentWillLoad
- [x] Crear metodo `componentDidLoad()`
- [x] Crear metodo `initializeConfirmation()`
- [x] Mover logica de flujo a initializeConfirmation
- [x] Verificar `status: 'loading'` como estado inicial
- [x] Build exitoso

---

*Documento creado: 2026-01-08*
*Autor: Claude (Arquitecto Stencil.js)*
