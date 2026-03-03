import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/inicio/inicio.component').then((m) => m.InicioComponent),
      },
      {
        path: 'socios',
        loadComponent: () =>
          import('./features/socios/lista-socios.component').then((m) => m.ListaSociosComponent),
      },
      {
        path: 'libros',
        loadComponent: () =>
          import('./features/libros/lista-libros.component').then((m) => m.ListaLibrosComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];

