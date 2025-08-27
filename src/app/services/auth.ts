// src/app/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface RegisterUser {
  FullName: string;
  Email: string;
  Password: string;       // <-- Change here
  ConfirmPassword: string; // optional if backend checks it
  PhoneNumber: string;
  DateOfBirth: string;
  Role: string;
}

export interface LoginUser {
  Email: string;    // match backend
  Password: string; // plain password
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token?: string;   // backend sends this
  user?: User;      // backend sends this
  message?: string; // optional error message
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Backend API URL
  private baseUrl = 'http://localhost:7000/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signals for reactive state
  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  constructor() {
    this.initializeAuth();
  }

  // --------------------- Auth Initialization ---------------------
  private initializeAuth(): void {
    if (typeof window !== 'undefined') {  // ✅ SSR-safe
      const token = this.getToken();
      if (token && !this.isTokenExpired(token)) {
        this.isLoggedIn.set(true);
        this.getCurrentUser().subscribe();
      } else {
        this.clearAuth();
      }
    }
  }

  // --------------------- Auth Methods ---------------------
  register(userData: RegisterUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData);
  }

  login(credentials: LoginUser): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
    .pipe(
      tap(response => {
        // Use only token && user
        if (response.token && response.user) {
          this.setAuth(response.token, response.user);
          this.router.navigate(['/dashboard']); // redirect after login
        }
      })
    );
  }

  getCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/me`)
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.currentUser.set(response.user);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  // --------------------- Private Helpers ---------------------
  private setAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot`, { Email: email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset`, {
      Token: token,
      NewPassword: newPassword,
      ConfirmPassword: confirmPassword
    });
  }
}
