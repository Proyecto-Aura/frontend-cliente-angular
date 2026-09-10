
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- **Plantilla SIEMPRE en archivo `.html` separado** (`templateUrl: './x.html'`), en todos los componentes sin excepción — convención del equipo por consistencia y tooling (Angular Language Service, formateo, type-check de la plantilla). Nada de `template:` inline.
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Rutas de `templateUrl` / `styleUrl` siempre relativas al `.ts` del componente.
- Si una plantilla se vuelve enorme, el problema es el componente (hace demasiado): partilo en sub-componentes, no basta con mover el HTML.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Project Structure

Follows the "Franco's ERP — Guía Rápida" conventions (this is the **ecommerce** front; `frontend-francos` is the company/ERP portal).

```
src/
├── environments/            # environment.ts (dev) · environment.prod.ts (swap en build vía fileReplacements)
└── app/
    ├── layouts/
    │   └── store-layout/    # header + footer + <router-outlet> · shell público (varios módulos)
    ├── shared/
    │   ├── ui/              # 100% reutilizable, sin rutas ni servicios: header/ footer/ + primitivas
    │   ├── data-access/     # api-client + interceptors/ (base-url · error · auth-token)   [ext. a la Guía]
    │   ├── auth/            # session (signals) · auth-guard · guest-guard                 [ext. a la Guía]
    │   ├── models/          # tipos transversales (Usuario, Rol)                            [ext. a la Guía]
    │   └── utils/           # constants · validators/                                       [ext. a la Guía]
    └── modules/
        └── <modulo>/
            ├── components/       # sin URL propia · carpetas con prefijo: <modulo>-<qué-es>/
            ├── layout/           # solo si lo usa ESE módulo → <modulo>-layout/
            ├── pages/            # tiene URL propia · listado = accion-sustantivo (listar-productos)
            ├── services/         # <algo>-api.ts · <algo>-store.ts                          [ext. a la Guía]
            ├── models/           # <algo>.model.ts                                          [ext. a la Guía]
            └── <modulo>.route.ts # export const <MODULO>_ROUTES: Routes
```

Módulos: `auth` · `catalogo` · `carrito` · `checkout` · `cuenta` · `nosotros` · `contacto`.
El sidebar solo existe en `cuenta` (`modules/cuenta/components/cuenta-sidebar/` + `layout/cuenta-layout/`).

### Reglas para ubicar algo nuevo

- ¿Tiene URL propia? → `pages/`. Si no → `components/`.
- ¿Un layout lo usa 1 sola feature? → vive dentro de ella (`<modulo>-layout/`). ¿Varias? → `layouts/`.
- ¿Es 100% reutilizable, sin rutas ni servicios? → `shared/ui/`.
- Carpeta de componente = `<modulo>-<qué-es>/` (prefijo del módulo). Ej: `auth-input/`, `catalogo-product-card/`, `cuenta-pago-badge/`.
- Página chica sin sub-partes → un solo archivo `pages/<algo>.ts` (sin carpeta).

### Rutas

- Cada módulo expone `<modulo>.route.ts` con `export const <MODULO>_ROUTES: Routes`.
- `app.routes.ts` (raíz) usa `loadChildren` para módulos con hijos y `loadComponent` para páginas sueltas.
- Las secciones internas se montan como `children` del layout del módulo (`store-layout` para lo público, `cuenta-layout` para cuenta).
- `''` → redirige a `catalogo`.

### Estilos

- Tailwind v4, **sin `tailwind.config.js`**. Paleta y fuentes en `src/styles.css` con `@theme`.
- Solo clases utilitarias en el HTML. **Nunca** un `.css` por componente (única excepción actual: `modules/nosotros/pages/nosotros.css`, pieza cinemática a medida, con comentario explicando el porqué).
- Mobile-first: clase sin prefijo = default; `sm: md: lg: xl: 2xl:` sobreescriben hacia arriba.
- Nada de porcentajes a mano para layout: `flex-1`. Para mostrar/ocultar por tamaño: reemplazar `flex` por `hidden` (p. ej. `hidden lg:flex`), no combinar.

### Componentes con Signals

- `input()` / `output()` / `model()` (two-way) / `signal()` (estado interno). Sin `@Input()`/`@Output()`, sin `Subject` de RxJS para esto.
