
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
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

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
src/app/
├── layouts/
│   └── module-layout/        # shell: sidebar + header + <router-outlet>, reusado por varios módulos
├── shared/
│   └── ui/                   # 100% reutilizable, sin rutas ni servicios
│       ├── sidebar/
│       └── header/
└── modules/
    └── <modulo>/
        ├── components/       # sin URL propia
        ├── layout/           # solo si lo usa ESE módulo (si lo usan varios → sube a layouts/)
        ├── pages/            # tiene URL propia
        └── <modulo>.route.ts # export const <MODULO>_ROUTES: Routes
```

### Reglas para ubicar algo nuevo

- ¿Tiene URL propia? → `pages/`. Si no → `components/`.
- ¿Un layout lo usa 1 sola feature? → vive dentro de ella. ¿Varias? → `layouts/`.
- ¿Es 100% reutilizable, sin rutas ni servicios? → `shared/ui/`.

### Rutas

- Cada módulo expone `<modulo>.route.ts` con `export const <MODULO>_ROUTES: Routes`.
- `app.routes.ts` (raíz) usa `loadChildren` para módulos con hijos y `loadComponent` para páginas sueltas.
- Las secciones internas se montan como `children` de `module-layout` (que trae sidebar + header).

### Estilos

- Tailwind v4, **sin `tailwind.config.js`**. Paleta y fuentes en `src/styles.css` con `@theme`.
- Solo clases utilitarias en el HTML. **Nunca** un `.css` por componente.
- Mobile-first: clase sin prefijo = default; `sm: md: lg: xl: 2xl:` sobreescriben hacia arriba.
- Nada de porcentajes a mano para layout: `flex-1`. Para mostrar/ocultar por tamaño: reemplazar `flex` por `hidden` (p. ej. `hidden lg:flex`), no combinar.

### Componentes con Signals

- `input()` / `output()` / `model()` (two-way) / `signal()` (estado interno). Sin `@Input()`/`@Output()`, sin `Subject` de RxJS para esto.
