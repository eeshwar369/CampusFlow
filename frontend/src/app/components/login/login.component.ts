import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value)
      .subscribe({
        next: (response) => {
          // Redirect based on user's primary role
          const user = response.user;
          const activeRole = user.activeRole || user.role;
          
          switch (activeRole) {
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
              this.router.navigate(['/seating/dashboard']);
              break;
            case 'club_coordinator':
              this.router.navigate(['/club/dashboard']);
              break;
            default:
              this.router.navigate([this.returnUrl]);
          }
        },
        error: (error) => {
          this.error = error.error?.error?.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
  }
}
