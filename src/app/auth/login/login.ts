// Component for user login

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);  // show loading spinner
  errorMessage = signal<string | null>(null);  // display error messages

  // Form group with validation rules
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  // Handle form submission
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);

      const { email, password } = this.loginForm.value;

      // Send payload matching backend
      this.authService.login({ 
        Email: email!, 
        Password: password! 
      }).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (!response.token) {
            this.errorMessage.set(response.message || 'Login failed.');
          } else {
            this.errorMessage.set(null); // clear error
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
        }
      });
  }}

   // Mark all form fields as touched to show validation errors
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Check if a specific field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Return user-friendly error message for a field
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}
