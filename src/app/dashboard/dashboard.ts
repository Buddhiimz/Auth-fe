// Dashboard component showing current user info

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  
  currentUser = signal<User | null>(null);  // current logged-in user
  loading = signal(true);  // loading spinner

  ngOnInit(): void {
    // Load current user data from backend
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.user) {
          this.currentUser.set(response.user);
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error loading user data:', error);
      }
    });

    // Subscribe to user changes for reactive updates
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser.set(user);
      }
    });
  }

  // Logout user
  onLogout(): void {
    this.authService.logout();
  }

  // Format ISO date string to locale string
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}