import { Routes } from '@angular/router';

export const routesPage: Routes = [
  {
    path: 'seguimiento',
    loadComponent: () => import('./seguimiento/seguimiento.component'),
  },
  {
    path: 'pendientes',
    loadComponent: () => import('./pendientes/pendientes.component'),
  },
  {
    path: 'emitidos',
    loadComponent: () => import('./emitidos/emitidos.component'),
  },
  {
    path: '',
    redirectTo: 'seguimiento',
    pathMatch: 'full',
  },
];
