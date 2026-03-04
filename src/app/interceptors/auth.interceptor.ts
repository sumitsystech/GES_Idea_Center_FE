import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const authReq = addToken(req, authService.getAccessToken());

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handleUnauthorized(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (authService.isCurrentlyRefreshing) {
    return authService.refreshComplete$.pipe(
      filter(success => success !== null),
      take(1),
      switchMap(success => {
        if (success) {
          return next(addToken(req, authService.getAccessToken()));
        }
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  return authService.refreshToken().pipe(
    switchMap(() => next(addToken(req, authService.getAccessToken()))),
    catchError(error => {
      authService.clearSession();
      return throwError(() => error);
    })
  );
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/Auth/login') || url.includes('/Auth/register') || url.includes('/Auth/refresh');
}
