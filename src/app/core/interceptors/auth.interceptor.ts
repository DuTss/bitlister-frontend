import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken(); //

  // 1. On injecte le token Bearer dans les en-têtes de la requête
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. On intercepte la réponse pour capturer les erreurs 401 (Token expiré / invalide)
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Session expirée ou invalide. Déconnexion automatique.');
        authService.logout(); // Nettoie le localStorage et réinitialise le Signal
        router.navigate(['/login'], { queryParams: { expired: 'true' } });
      }
      return throwError(() => error);
    })
  );
};
