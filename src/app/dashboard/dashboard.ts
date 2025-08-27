// src/app/dashboard/dashboard.component.ts
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
  
  currentUser = signal<User | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    // Get current user data
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

    // Also subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser.set(user);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}