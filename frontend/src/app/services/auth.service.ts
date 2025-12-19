import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, LoginCredentials, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem(this.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          const data = response.data;
          // Transform snake_case to camelCase
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            roles: data.user.roles,
            activeRole: data.user.activeRole || data.user.role,
            firstName: data.user.first_name || data.user.firstName || '',
            lastName: data.user.last_name || data.user.lastName || '',
            isActive: data.user.is_active !== undefined ? data.user.is_active : data.user.isActive
          };
          return {
            token: data.token,
            user: user,
            expiresIn: data.expiresIn
          };
        }),
        tap((authResponse: AuthResponse) => {
          // Store token and user data
          localStorage.setItem(this.tokenKey, authResponse.token);
          localStorage.setItem(this.userKey, JSON.stringify(authResponse.user));
          this.currentUserSubject.next(authResponse.user);
        })
      );
  }

  /**
   * Logout current user
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuthData();
        })
      );
  }

  /**
   * Clear authentication data and prevent back navigation
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.clear(); // Clear all localStorage
    this.currentUserSubject.next(null);
    
    // Navigate to login and replace history to prevent back button
    this.router.navigate(['/login'], { replaceUrl: true }).then(() => {
      // Clear browser history
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, '', window.location.href);
      };
    });
  }

  /**
   * Verify if token is valid
   */
  verifyToken(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/verify`);
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(
        map(response => response.data),
        tap((data: any) => {
          localStorage.setItem(this.tokenKey, data.token);
        })
      );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Get all roles for current user
   */
  getUserRoles(): string[] {
    const user = this.currentUserValue;
    return user?.roles || (user?.role ? [user.role] : []);
  }

  /**
   * Switch active role
   */
  switchRole(newRole: string): void {
    const user = this.currentUserValue;
    if (!user) return;

    const userRoles = this.getUserRoles();
    if (!userRoles.includes(newRole)) {
      console.error('User does not have access to role:', newRole);
      return;
    }

    // Update active role
    const updatedUser = { ...user, role: newRole, activeRole: newRole };
    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);

    // Navigate to appropriate dashboard
    this.navigateToDashboard(newRole);
  }

  /**
   * Navigate to dashboard based on role
   */
  private navigateToDashboard(role: string): void {
    switch (role) {
      case 'student':
        this.router.navigate(['/student/dashboard']);
        break;
      case 'faculty':
        this.router.navigate(['/faculty/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'seating_manager':
        this.router.navigate(['/seating-manager']);
        break;
      case 'club_coordinator':
        this.router.navigate(['/club/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
