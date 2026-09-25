import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeAdmins: number;
  activeManagers: number;
  activeViewers: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/admin';

  getMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.apiUrl}/metrics`);
  }

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: string, newRole: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/role`, { role: newRole });
  }

  toggleUserStatus(userId: string, isActive: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/status`, { isActive });
  }
}