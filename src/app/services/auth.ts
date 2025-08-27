// src/app/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface RegisterUser {
  FullName: string;
  Email: string;
  Password: string;       
  ConfirmPassword: string; 
  PhoneNumber: string;
  DateOfBirth: string;
  Role: string;
}

export interface LoginUser {
  Email: string;    
  Password: string; 
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
  token?: string;   
  user?: User;      
  message?: string; 
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

  // Check if a user is already logged in when the app starts
  // If a valid token exists, load the current user; otherwise, clear auth
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

  // Register a new user
  register(userData: RegisterUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData);
  }

  // Login user and save token & user info, then go to dashboard
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

  // Get currently logged-in user from backend and update state
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

  // Logout user and clear all auth data
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  // --------------------- Private Helpers ---------------------

  // Save token and user info to localStorage & reactive state
  private setAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
  }

  // Clear token and user info from localStorage & reactive state
  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Check if token has expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  // Send forgot password request to backend
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot`, { Email: email });
  }

  // Send reset password request to backend
  resetPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset`, {
      Token: token,
      NewPassword: newPassword,
      ConfirmPassword: confirmPassword
    });
  }
}
