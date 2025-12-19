# Plan de Desarrollo Mobile Responsive

> **Análisis basado en capturas 4.png, 5.png, 6.png y 7.png**
> **Fecha:** 2025-12-19

---

## Resumen Ejecutivo

Las capturas móviles revelan diferencias significativas en el diseño que requieren implementación de:
1. **Sistema de pasos internos en step-form** (2 secciones: Identificación y Contacto)
2. **Ajustes responsive para todos los componentes**
3. **Componente stepper/progress indicator**

---

## Análisis Detallado por Captura

### Captura 4.png - step-contract (Con Contrato)
| Elemento | Estado Desktop | Estado Mobile | Cambio Requerido |
|----------|---------------|---------------|------------------|
| Título | "Selecciona un tipo de contrato" | Igual | Sin cambios |
| Tabs | Horizontal | Horizontal, full-width | Ajustar width 50% cada tab |
| Cards de contrato | Cards anchas | Cards full-width | `width: 100%` en mobile |
| Barra lateral card | Presente | Presente | Sin cambios |
| Botón Continuar | Centrado | Full-width con margin | `width: calc(100% - 32px)` |
| Link Regresar | Debajo del botón | Igual | Sin cambios |

### Captura 5.png - step-contract (Sin Contrato)
| Elemento | Estado Desktop | Estado Mobile | Cambio Requerido |
|----------|---------------|---------------|------------------|
| Card Sin Contrato | Card ancha | Card full-width | `width: 100%` en mobile |
| Precio mostrado | "$160.00" | Igual | Verificar actualización |

### Captura 6.png - step-form (Sección Identificación)
| Elemento | Estado Desktop | Estado Mobile | Cambio Requerido |
|----------|---------------|---------------|------------------|
| **STEPPER** | No existe | 2 pasos circulares | **NUEVO COMPONENTE** |
| Layout campos | 2 columnas | 1 columna | Media query |
| Campos visibles | Todos | Solo identificación | **LÓGICA DE SECCIONES** |
| Segundo nombre | Con asterisco | Sin asterisco (opcional) | Ya implementado |
| ID Type dropdown | Inline con input | Dropdown separado | Ajuste de layout |

### Captura 7.png - step-form (Sección Contacto)
| Elemento | Estado Desktop | Estado Mobile | Cambio Requerido |
|----------|---------------|---------------|------------------|
| Stepper | Paso 2 activo | Círculo 2 resaltado | Actualizar estado |
| Teléfono 2 | Sin asterisco | Sin asterisco | Ya implementado |
| Radio Si/No | Horizontal | Horizontal | Sin cambios |
| Dirección | Campos separados | Campos full-width | Media query |

---

## Plan de Implementación por Fases

### FASE 1: Componente UI Stepper (Prioridad Alta)
**Tiempo estimado:** 1 sesión
**Archivos a crear/modificar:**
- `src/components/ui/ui-stepper/ui-stepper.tsx` (NUEVO)
- `src/components/ui/ui-stepper/ui-stepper.scss` (NUEVO)

**Especificación del componente:**
```tsx
interface StepperProps {
  steps: Array<{ label: string; completed?: boolean }>;
  currentStep: number;
}

// Uso:
<ui-stepper
  steps={[
    { label: 'Identificación' },
    { label: 'Contacto' }
  ]}
  current-step={1}
/>
```

**Diseño visual (según captura 6.png):**
- Círculos numerados (1, 2)
- Línea conectora entre círculos
- Círculo activo: fondo cyan, texto blanco
- Círculo inactivo: fondo gris claro, texto gris
- Labels debajo de cada círculo

---

### FASE 2: Lógica de Secciones en step-form (Prioridad Alta)
**Tiempo estimado:** 1-2 sesiones
**Archivos a modificar:**
- `src/components/steps/step-form/step-form.tsx`
- `src/components/steps/step-form/step-form.scss`

**Cambios requeridos:**

#### 2.1 Estado interno para sección actual
```tsx
@State() currentSection: 'identification' | 'contact' = 'identification';
```

#### 2.2 Campos por sección

**Sección 1 - Identificación:**
- *Nombre
- Segundo nombre (opcional)
- *Apellido
- *Segundo apellido
- *Identificación (tipo + número)
- *Fecha de vencimiento

**Sección 2 - Contacto:**
- *Teléfono de contacto 1
- Teléfono de contacto 2 (opcional)
- *Nombre legal de Empresa (según IRS)
- *Posición en Empresa
- *Dirección
- *Ciudad
- *Código postal
- *Correo electrónico
- *Cliente existente de Claro PR (Si/No)

#### 2.3 Lógica de navegación
```tsx
private handleContinue() {
  if (this.isMobile()) {
    if (this.currentSection === 'identification') {
      if (this.isIdentificationValid()) {
        this.currentSection = 'contact';
      }
    } else {
      if (this.isFormValid()) {
        this.submitForm();
      }
    }
  } else {
    // Desktop: comportamiento actual
    if (this.isFormValid()) {
      this.submitForm();
    }
  }
}

private handleBack() {
  if (this.isMobile() && this.currentSection === 'contact') {
    this.currentSection = 'identification';
  } else {
    this.onBack();
  }
}
```

#### 2.4 Detección de mobile
```tsx
private isMobile(): boolean {
  return window.innerWidth < 768;
}
```

---

### FASE 3: Estilos Responsive step-form (Prioridad Alta)
**Tiempo estimado:** 1 sesión
**Archivos a modificar:**
- `src/components/steps/step-form/step-form.scss`

**Media queries a agregar:**
```scss
// Breakpoint mobile
$breakpoint-mobile: 768px;

@media (max-width: $breakpoint-mobile) {
  .step-form {
    &__header {
      padding: $spacing-4;

      h1 {
        font-size: $font-size-lg;
      }
    }

    &__stepper {
      display: flex; // Mostrar en mobile
      justify-content: center;
      margin-bottom: $spacing-6;
    }

    &__content {
      padding: $spacing-4;
    }

    &__row {
      flex-direction: column;
      gap: $spacing-4;
    }

    &__field {
      width: 100%;

      &--half {
        width: 100%; // Full width en mobile
      }
    }

    &__btn-submit {
      width: calc(100% - 32px);
      margin: 0 16px;
    }

    &__btn-back {
      display: block;
      text-align: center;
      margin-top: $spacing-4;
    }
  }
}

// Ocultar stepper en desktop
@media (min-width: $breakpoint-mobile + 1) {
  .step-form__stepper {
    display: none;
  }
}
```

---

### FASE 4: Estilos Responsive step-contract (Prioridad Media)
**Tiempo estimado:** 0.5 sesiones
**Archivos a modificar:**
- `src/components/steps/step-contract/step-contract.scss`

**Media queries a agregar:**
```scss
@media (max-width: $breakpoint-mobile) {
  .step-contract {
    &__tabs {
      width: 100%;
    }

    &__tab {
      flex: 1;
      width: 50%;
    }

    &__options {
      padding: $spacing-4;
    }

    &__option-card {
      width: 100%;
    }

    &__btn-continue {
      width: calc(100% - 32px);
      margin: 0 16px;
    }

    &__btn-back {
      display: block;
      text-align: center;
      width: 100%;
      margin-top: $spacing-4;
    }
  }
}
```

---

### FASE 5: Estilos Responsive step-location (Prioridad Media)
**Tiempo estimado:** 0.5 sesiones
**Archivos a modificar:**
- `src/components/steps/step-location/step-location.scss`

**Ajustes necesarios:**
```scss
@media (max-width: $breakpoint-mobile) {
  .step-location {
    &__search-container {
      padding: $spacing-3;
    }

    &__input-group {
      flex-direction: column;

      input {
        border-radius: 10px;
        width: 100%;
      }

      button {
        width: 100%;
        margin-top: $spacing-2;
        border-radius: 10px;
      }
    }

    &__map-container {
      height: 300px; // Altura reducida en mobile
    }

    &__overlay {
      padding: $spacing-4;

      h3 {
        font-size: $font-size-base;
      }
    }
  }
}
```

---

### FASE 6: Estilos Responsive step-plans (Prioridad Media)
**Tiempo estimado:** 0.5 sesiones
**Archivos a modificar:**
- `src/components/steps/step-plans/step-plans.scss`

**Ajustes necesarios:**
```scss
@media (max-width: $breakpoint-mobile) {
  .step-plans {
    &__cards-container {
      flex-direction: column;
      gap: $spacing-4;
    }

    &__plan-card {
      width: 100%;
      max-width: none;
    }

    &__summary-bar {
      flex-direction: column;
      padding: $spacing-3;

      &-info {
        margin-bottom: $spacing-3;
        text-align: center;
      }

      button {
        width: 100%;
      }
    }
  }
}
```

---

### FASE 7: Estilos Responsive step-confirmation (Prioridad Baja)
**Tiempo estimado:** 0.5 sesiones
**Archivos a modificar:**
- `src/components/steps/step-confirmation/step-confirmation.scss`

**Ajustes necesarios:**
```scss
@media (max-width: $breakpoint-mobile) {
  .step-confirmation {
    padding: $spacing-4;

    &__icon {
      width: 60px;
      height: 60px;
    }

    &__title {
      font-size: $font-size-lg;
    }

    &__message {
      font-size: $font-size-sm;
    }

    &__btn {
      width: calc(100% - 32px);
    }
  }
}
```

---

### FASE 8: Testing y QA (Prioridad Alta)
**Tiempo estimado:** 1 sesión
**Actividades:**
1. Probar en viewport 375px (iPhone SE)
2. Probar en viewport 390px (iPhone 14)
3. Probar en viewport 414px (iPhone Plus)
4. Probar transición desktop ↔ mobile
5. Validar navegación entre secciones de formulario
6. Verificar que el stepper actualiza correctamente

---

## Resumen de Fases

| Fase | Descripción | Prioridad | Sesiones Est. |
|------|-------------|-----------|---------------|
| 1 | Componente ui-stepper | Alta | 1 |
| 2 | Lógica secciones step-form | Alta | 1-2 |
| 3 | Responsive step-form | Alta | 1 |
| 4 | Responsive step-contract | Media | 0.5 |
| 5 | Responsive step-location | Media | 0.5 |
| 6 | Responsive step-plans | Media | 0.5 |
| 7 | Responsive step-confirmation | Baja | 0.5 |
| 8 | Testing y QA | Alta | 1 |
| **TOTAL** | | | **6-7 sesiones** |

---

## Dependencias Entre Fases

```
FASE 1 (ui-stepper)
    ↓
FASE 2 (lógica secciones) ← Depende de Fase 1
    ↓
FASE 3 (responsive form) ← Depende de Fase 2
    ↓
FASES 4-7 (otros responsive) ← Pueden ser paralelas
    ↓
FASE 8 (testing) ← Depende de todas
```

---

## Breakpoints Definidos

| Nombre | Ancho | Uso |
|--------|-------|-----|
| Mobile S | < 375px | Ajustes mínimos |
| Mobile | < 768px | Layout 1 columna, stepper visible |
| Tablet | 768px - 1024px | Transición |
| Desktop | > 1024px | Layout actual |

---

## Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Lógica de secciones compleja | Alto | Crear tests unitarios para validación |
| Resize window bugs | Medio | Usar ResizeObserver o debounced resize |
| Estado perdido al cambiar sección | Alto | Mantener formData en State global |
| Stepper no sincroniza | Medio | Usar @Watch en currentSection |

---

## Criterios de Aceptación

### Fase 1 - ui-stepper
- [ ] Muestra 2 círculos conectados por línea
- [ ] Círculo activo tiene color cyan
- [ ] Labels visibles debajo de círculos
- [ ] Transición suave al cambiar paso

### Fase 2 - Lógica secciones
- [ ] En mobile, formulario muestra solo campos de sección actual
- [ ] Botón "Continuar" avanza a siguiente sección
- [ ] Botón "Regresar" vuelve a sección anterior
- [ ] Validación parcial por sección
- [ ] En desktop, comportamiento sin cambios

### Fase 3-7 - Responsive
- [ ] Campos ocupan 100% width en mobile
- [ ] Botones full-width con margin lateral
- [ ] Sin scroll horizontal
- [ ] Texto legible sin zoom

### Fase 8 - Testing
- [ ] Flujo completo funciona en iPhone SE (375px)
- [ ] Flujo completo funciona en iPhone 14 (390px)
- [ ] Sin errores en consola
- [ ] Transición desktop-mobile sin bugs

---

## Notas Adicionales

1. **El stepper solo aparece en mobile** - En desktop se mantiene el formulario completo

2. **La validación debe ser por sección en mobile** - No permitir avanzar si la sección actual es inválida

3. **El estado del formulario debe persistir** - Al cambiar entre secciones, los datos ingresados no deben perderse

4. **Considerar orientación landscape** - En móviles rotados, podría mostrar el formulario completo

---

*Documento creado: 2025-12-19*
*Basado en análisis de capturas 4.png, 5.png, 6.png, 7.png*
