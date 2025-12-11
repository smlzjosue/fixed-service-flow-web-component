# Roles y Especialidades del Equipo

## Proyecto: Fixed Service Flow (Stencil.js)

---

## Rol Principal Asignado

### Arquitecto Principal - Stencil.js & Web Components

**Responsabilidades:**
- Diseño de arquitectura del Web Component
- Definición de estructura de proyecto
- Decisiones técnicas sobre patrones y mejores prácticas
- Revisión de código y estándares
- Integración con sistemas externos

---

## Matriz de Especialidades

| Área | Especialidad | Nivel | Responsabilidades |
|------|--------------|-------|-------------------|
| **Stencil.js Core** | Componentes standalone, decoradores, lifecycle | Experto | Arquitectura de componentes, optimización |
| **Web Components** | Custom Elements, Shadow DOM, slots | Experto | Encapsulación, interoperabilidad |
| **State Management** | @stencil/store, @State, reactive patterns | Experto | Diseño del store, flujo de datos |
| **TypeScript** | Tipado estricto, interfaces, generics | Experto | Definición de tipos, type safety |
| **JSX/TSX** | Rendering, condicionales, listas | Experto | Templates, renderizado eficiente |
| **CSS/SCSS** | Shadow DOM styling, CSS variables, theming | Experto | Sistema de diseño, tokens |
| **Forms** | Form-associated elements, validación | Experto | Formularios reactivos, UX |
| **API Integration** | REST, fetch, error handling | Avanzado | Servicios, comunicación backend |
| **Google Maps** | Maps JavaScript API, Geocoding | Avanzado | Integración de mapas |
| **Testing** | Jest, Stencil testing utilities | Avanzado | Tests unitarios e integración |

---

## Conocimientos Técnicos Detallados

### 1. Stencil.js

#### Decoradores Dominados
```typescript
@Component()    // Definición de componentes
@Prop()         // Props públicos (inmutables/mutables, reflect)
@State()        // Estado interno reactivo
@Event()        // Emisión de eventos personalizados
@Listen()       // Escucha de eventos DOM
@Watch()        // Observadores de cambios
@Method()       // Métodos públicos
@Element()      // Referencia al host element
```

#### Lifecycle Methods
```typescript
connectedCallback()       // Conexión al DOM
disconnectedCallback()    // Desconexión del DOM
componentWillLoad()       // Antes del primer render
componentDidLoad()        // Después del primer render
componentWillRender()     // Antes de cada render
componentDidRender()      // Después de cada render
componentShouldUpdate()   // Control de re-render
componentWillUpdate()     // Antes de actualización
componentDidUpdate()      // Después de actualización
```

#### Patrones Avanzados
- Lazy loading de componentes
- Functional components
- Host element manipulation
- Slot projection
- CSS Shadow Parts
- Form-associated custom elements

### 2. State Management

#### @stencil/store
```typescript
import { createStore } from '@stencil/store';

const { state, onChange, reset, dispose } = createStore({
  currentStep: 1,
  data: null
});

// Uso reactivo
onChange('currentStep', (newVal) => {
  console.log('Step changed:', newVal);
});
```

#### Patrones de Estado
- Single source of truth
- Immutable updates
- Derived state
- State persistence (sessionStorage)
- State reset on flow completion

### 3. Routing Interno

#### @stencil-community/router
```typescript
import { createRouter, Route, match } from '@stencil-community/router';

const Router = createRouter();

// En render()
<Router.Switch>
  <Route path={match('/step/:id')} render={({id}) => <step-component step={id} />} />
</Router.Switch>
```

#### Navegación Sin URL (Preferido para Web Component Embebible)
```typescript
// Navegación basada en estado, sin modificar URL del padre
@State() currentStep: number = 1;

renderStep() {
  switch(this.currentStep) {
    case 1: return <step-location />;
    case 2: return <step-plans />;
    // ...
  }
}
```

### 4. Styling

#### Shadow DOM Styling
```scss
:host {
  display: block;
  --primary-color: #DA291C;
  --secondary-color: #0097A9;
}

:host(.loading) {
  opacity: 0.5;
  pointer-events: none;
}

::slotted(*) {
  margin: 0;
}
```

#### CSS Custom Properties (Theming)
```scss
// Componente
:host {
  --button-bg: var(--fixed-flow-primary, #DA291C);
  --button-text: var(--fixed-flow-button-text, white);
}

// Desde el padre
fixed-service-flow {
  --fixed-flow-primary: #FF0000;
}
```

#### CSS Parts (Customización Externa)
```typescript
// Componente
render() {
  return <button part="submit-button">Enviar</button>;
}

// Desde el padre
fixed-service-flow::part(submit-button) {
  font-size: 18px;
}
```

### 5. Forms & Validation

#### Binding de Formularios
```typescript
@State() formData = { name: '', email: '' };

handleInput = (field: string) => (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  this.formData = { ...this.formData, [field]: value };
}

render() {
  return (
    <input
      value={this.formData.name}
      onInput={this.handleInput('name')}
    />
  );
}
```

#### Validación
```typescript
interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

const validators = {
  required: { validate: (v) => !!v, message: 'Campo requerido' },
  email: { validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Email inválido' },
  minLength: (n: number) => ({ validate: (v) => v.length >= n, message: `Mínimo ${n} caracteres` })
};
```

### 6. API Integration

#### HTTP Service Pattern
```typescript
class HttpService {
  private baseUrl: string;
  private token: string;

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }
}
```

### 7. Google Maps Integration

#### Maps Service
```typescript
class MapsService {
  private map: google.maps.Map;
  private marker: google.maps.Marker;

  async initMap(container: HTMLElement, options: google.maps.MapOptions) {
    this.map = new google.maps.Map(container, options);
  }

  async geocode(address: string): Promise<google.maps.GeocoderResult> {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address });
    return result.results[0];
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
}
```

---

## Stack Tecnológico

```
Stencil.js v4.x
├── @stencil/core          # Compilador y runtime
├── @stencil/store         # State management
├── @stencil-community/router  # Routing (opcional)
├── TypeScript 5.x         # Type safety
├── SCSS                   # Styling
├── Jest                   # Testing
└── Web Components API     # Output estándar
```

---

## Responsabilidades por Fase

| Fase | Rol | Actividades |
|------|-----|-------------|
| 1. Setup | Arquitecto | Configuración proyecto, estructura |
| 2. Design System | Arquitecto + UI | Tokens, variables, mixins |
| 3. UI Components | UI Specialist | Componentes base reutilizables |
| 4. Store | Arquitecto | Diseño estado global |
| 5. Services | Backend Integration | APIs, HTTP, Maps |
| 6. Steps | Full Stack | Componentes de flujo |
| 7. Orquestador | Arquitecto | Componente principal |
| 8. Testing | QA | Tests unitarios e integración |
| 9. Docs | Technical Writer | Documentación |
| 10. Build | DevOps | Distribución, CI/CD |

---

## Criterios de Calidad

### Código
- TypeScript strict mode
- ESLint sin warnings
- Prettier formatting
- JSDoc en APIs públicas
- Nombres descriptivos (no abreviaciones)

### Componentes
- Single responsibility
- Props tipados y documentados
- Events con payload tipado
- Estilos encapsulados (Shadow DOM)
- Accesibilidad (ARIA, keyboard nav)

### Testing
- Cobertura > 70%
- Tests para casos edge
- Mocks para servicios externos
- Tests de accesibilidad

### Performance
- Bundle < 100KB gzipped
- Lazy loading donde aplique
- No memory leaks
- Render eficiente (evitar re-renders innecesarios)

---

## Comunicación y Eventos

### Eventos Emitidos por el Componente

```typescript
// Flujo completado exitosamente
@Event() flowComplete: EventEmitter<{
  orderId: string;
  plan: Plan;
  contractType: ContractType;
  customerData: FormData;
}>;

// Error en el flujo
@Event() flowError: EventEmitter<{
  step: number;
  error: Error;
  recoverable: boolean;
}>;

// Usuario cancela el flujo
@Event() flowCancel: EventEmitter<{
  step: number;
  reason?: string;
}>;

// Cambio de paso
@Event() stepChange: EventEmitter<{
  from: number;
  to: number;
  direction: 'forward' | 'backward';
}>;
```

### Props de Configuración

```typescript
// URL base del API
@Prop() apiUrl!: string;

// API Key de Google Maps
@Prop() googleMapsKey!: string;

// ID de correlación para tracking
@Prop() correlationId?: string;

// Paso inicial (para retomar flujo)
@Prop() initialStep?: number = 1;

// Datos pre-cargados (opcional)
@Prop() initialData?: Partial<FlowState>;

// Modo debug
@Prop() debug?: boolean = false;
```

---

*Documento generado: 2025-12-09*
*Proyecto: Fixed Service Flow - Stencil.js*
