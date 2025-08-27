// Component for user registration

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, RegisterUser } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);  // show spinner during requests
  errorMessage = signal<string | null>(null);  // error messages
  successMessage = signal<string | null>(null);  // success messages

  // Form group with validation rules
  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
    confirmPassword: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required, this.phoneValidator]],
    dateOfBirth: ['', [Validators.required, this.dateValidator]],
    role: ['User', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Handle form submission
  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.registerForm.value;
    const dob = new Date(formData.dateOfBirth!);
    const formattedDob = dob.toISOString().split('T')[0]; // YYYY-MM-DD

    // Prepare data for backend
    const userData: RegisterUser = {
    FullName: formData.fullName!,
    Email: formData.email!,
    Password: formData.password!, 
    ConfirmPassword: formData.confirmPassword!, 
    PhoneNumber: formData.phoneNumber!,
    DateOfBirth: formattedDob,
    Role: formData.role!
  };

    // Send registration request
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading.set(false);
        //if (response.success) {
        if (response) {
          this.successMessage.set('Registration successful! Redirecting to login...');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMessage.set(response);
          //this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  // Helpers 
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // get user-friendly error messages
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['passwordFormat']) return field.errors['passwordFormat'];
      if (field.errors['phoneFormat']) return 'Phone number must contain only digits';
      if (field.errors['dateFormat']) return 'Please enter a valid past date';
    }

    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return '';
  }

  // map field names to display names
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: {[key: string]: string} = {
      fullName: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      phoneNumber: 'Phone number',
      dateOfBirth: 'Date of birth',
      role: 'Role'
    };
    return displayNames[fieldName] || fieldName;
  }

// Custom Validators 
  // Validates password: must contain letters & numbers
  private passwordValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.value;
    if (!password) return null;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return (hasLetter && hasNumber) ? null : { passwordFormat: 'Password must contain both letters and numbers' };
  }

  // Validates phone number: digits only
  private phoneValidator(control: AbstractControl): {[key: string]: any} | null {
    const phone = control.value;
    return /^\d+$/.test(phone) ? null : { phoneFormat: true };
  }

  // Validates date: must be in the past
  private dateValidator(control: AbstractControl): {[key: string]: any} | null {
    const date = control.value;
    if (!date) return null;
    const selectedDate = new Date(date);
    return selectedDate < new Date() ? null : { dateFormat: true };
  }

  // Validates that password and confirmPassword match
  private passwordMatchValidator(form: AbstractControl): {[key: string]: any} | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
