import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 30px;">
      <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 15px;">
        <h1>Admin Control Center</h1>
        <div>
          <span>Welcome, <strong>{{ authService.currentUser()?.fullName }}</strong> (System Admin)</span>
          <button (click)="authService.logout()" style="margin-left: 15px; background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Logout</button>
        </div>
      </header>
      <div style="margin-top: 20px;">
        <h3>Full Privileges Granted</h3>
        <p>User Management, Master Data Configuration, Data Quality Rule Execution.</p>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
}