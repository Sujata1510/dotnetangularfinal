import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent)
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'manager-dashboard',
    loadComponent: () =>
      import('./features/manager-dashboard/manager-dashboard').then((m) => m.ManagerDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['Admin', 'Manager'] }
  },
  {
    path: 'viewer-dashboard',
    loadComponent: () =>
      import('./features/viewer-dashboard/viewer-dashboard').then((m) => m.ViewerDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['Admin', 'Manager', 'Viewer'] }
  },
  { path: '**', redirectTo: 'login' }
];
