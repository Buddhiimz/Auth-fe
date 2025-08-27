// src/app/auth/reset-password/reset-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';  
import { AuthService } from '../../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,  // ✅ same as others if using standalone
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'], // ✅ make sure this line exists
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  message: string = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute   // ✅ token comes from reset link
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    // ✅ get token automatically from query params or route
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        console.log('Received token:', this.token);
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    const { newPassword, confirmPassword } = this.resetForm.value;

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
