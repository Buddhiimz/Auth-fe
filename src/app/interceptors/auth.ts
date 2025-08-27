// Add JWT token to outgoing HTTP requests if available

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();  // get token from AuthService

  if (token) {
    // Clone request and add Authorization header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);  // continue with modified request
  }

  return next(req);  // continue with original request if no token
};