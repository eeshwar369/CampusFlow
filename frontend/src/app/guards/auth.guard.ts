import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.token;
    const currentUser = this.authService.currentUserValue;
    
    // Check if user has valid token
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        replaceUrl: true 
      });
      return false;
    }

    // Check if token is expired
    if (!this.authService.isAuthenticated()) {
      console.log('❌ Token expired, redirecting to login');
      localStorage.clear(); // Clear all data on token expiry
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        replaceUrl: true 
      });
      return false;
    }

    // Check if user data exists
    if (!currentUser) {
      console.log('❌ No user data found, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        replaceUrl: true 
      });
      return false;
    }

    // Check if route has role requirements
    const requiredRoles = route.data['roles'] as string[];
    
    if (requiredRoles && requiredRoles.length > 0) {
      // Check if user has required role
      if (this.authService.hasAnyRole(requiredRoles)) {
        console.log('✅ User authorized for route:', state.url);
        return true;
      } else {
        console.log('❌ User does not have required role:', requiredRoles);
        // Redirect to their dashboard based on role
        this.redirectToDashboard(currentUser.role);
        return false;
      }
    }
    
    // No role requirements, user is authenticated
    console.log('✅ User authenticated, allowing access');
    return true;
  }

  private redirectToDashboard(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student/dashboard']);
        break;
      case 'faculty':
        this.router.navigate(['/faculty/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
