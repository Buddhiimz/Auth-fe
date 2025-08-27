// Guard to protect routes and redirect unauthenticated users

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;  // allow access if user is logged in
  } else {
    router.navigate(['/login']);  // redirect to login if not authenticated
    return false;
  }
};