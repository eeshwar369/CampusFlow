import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from auth service
    const token = this.authService.token;
    
    // Add authorization header with JWT token if available
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('🔑 Token attached to request:', request.url);
    } else {
      console.log('⚠️ No token available for request:', request.url);
    }

    return next.handle(request).pipe(
      tap(() => {
        // Request successful
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ HTTP Error:', error.status, error.url);
        
        if (error.status === 401) {
          // Only clear auth data if it's not a login request
          if (!request.url.includes('/auth/login')) {
            console.log('🚪 Unauthorized - clearing auth data and redirecting to login');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            this.router.navigate(['/login'], { 
              queryParams: { returnUrl: this.router.url } 
            });
          }
        } else if (error.status === 403) {
          console.log('🚫 Forbidden - insufficient permissions');
        } else if (error.status === 0) {
          console.error('🔌 Network error - backend may be down');
        }
        
        return throwError(() => error);
      })
    );
  }
}
