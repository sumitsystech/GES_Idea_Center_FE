import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { SnackbarService } from './snackbar.service';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  private readonly isAuthenticatedState = signal<boolean>(this.hasToken());
  private isRefreshing = false;
  private refreshDone$ = new Subject<boolean>();

  readonly isAuthenticated = this.isAuthenticatedState.asReadonly();
  readonly accessToken = computed(() => localStorage.getItem(TOKEN_KEY));

  get isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  get refreshComplete$(): Observable<boolean> {
    return this.refreshDone$.asObservable();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/Auth/login`, request).pipe(
      tap(response => {
        this.storeTokens(response);
        this.isAuthenticatedState.set(true);
      }),
      catchError(error => {
        const message = error?.error?.message || error?.error || 'Login failed. Please try again.';
        this.snackbar.showError(typeof message === 'string' ? message : 'Login failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/Auth/register`, request, { responseType: 'text' }).pipe(
      catchError(error => {
        const message = error?.error?.message || error?.error || 'Registration failed. Please try again.';
        this.snackbar.showError(typeof message === 'string' ? message : 'Registration failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    this.isRefreshing = true;
    const encodedToken = encodeURIComponent(refreshToken);

    return this.http.post<LoginResponse>(
      `${environment.apiBaseUrl}/Auth/refresh?refreshToken=${encodedToken}`, ''
    ).pipe(
      tap(response => {
        this.storeTokens(response);
        this.isRefreshing = false;
        this.refreshDone$.next(true);
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.refreshDone$.next(false);
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiBaseUrl}/Auth/logout`, '').subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.isAuthenticatedState.set(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      return id ? Number(id) : null;
    } catch {
      return null;
    }
  }

  private storeTokens(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
