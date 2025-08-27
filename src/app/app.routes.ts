// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(c => c.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register').then(c => c.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];