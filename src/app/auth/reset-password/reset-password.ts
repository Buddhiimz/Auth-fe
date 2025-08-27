// Component for resetting user password via token link

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';  
import { AuthService } from '../../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,  
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'], // ✅ make sure this line exists
})
export class ResetPasswordComponent {
  resetForm: FormGroup;  // form group for new password
  message: string = '';  // feedback message
  token: string = '';  // token from reset link

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute   // get token from query params
  ) {
    // Initialize form with validation
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Subscribe to query params to get reset token
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        console.log('Received token:', this.token);
      }
    });
  }

   // Handle form submission
  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    const { newPassword, confirmPassword } = this.resetForm.value;

    // Send reset password request to backend
    this.authService.resetPassword(this.token, newPassword, confirmPassword).subscribe({
      next: (res: any) => {
        this.message = res.message;
      },
      error: (err) => {
        this.message = err.error.message || 'Something went wrong';
      }
    });
  }
}
