// Component for handling "Forgot Password" functionality

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';  

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'], 
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;  // form group for email input
  message: string = '';  // feedback message for user

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    // Initialize form with email field and validators
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Handle form submission
  onSubmit() {
    if (this.forgotForm.invalid) return;  // stop if form is invalid

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res: any) => {
        this.message = res.message;  // show backend message

        // Navigate to reset-password page if token is received
        if (res.token) {
          this.router.navigate(['/reset'], { queryParams: { token: res.token } });
        }
      },
      error: (err) => {
        this.message = err.error.message || 'Something went wrong';  // show error
      }
    });
  }
}
