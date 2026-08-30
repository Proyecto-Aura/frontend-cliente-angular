import { Routes } from '@angular/router';

// Patrón de rutas de Franco's (ver Guía Rápida):
//  - Cada módulo expone su propio archivo `xxx.route.ts` con un const UPPER_SNAKE_ROUTES.
//  - `loadChildren` para módulos con hijos, `loadComponent` para páginas sueltas.
//  - Un `module-layout` (sidebar + header + <router-outlet>) envuelve a las secciones internas.
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.route').then((c) => c.AUTH_ROUTES),
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];
