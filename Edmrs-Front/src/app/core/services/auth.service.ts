import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, UserSession } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  getToken(): string | null{
    return this.token();
  }
  getUserRole(): string[]{
    return this.userRoles();
  }

  // Set this to your API backend URL
  private readonly apiUrl = 'https://localhost:7001/api/auth';

  currentUser = signal<UserSession | null>(this.getUserFromStorage());
  token = signal<string | null>(localStorage.getItem('edmrs_token'));

  isAuthenticated = computed(() => !!this.token());
  userRoles = computed(() =>{
    const roles = this.currentUser()?.roles;
    if (!roles) return [];
    if(Array.isArray(roles)) return roles;
  if(typeof roles === 'string') return [(roles as string)];
return[];});

  isAdmin = computed(() => this.userRoles().includes('Admin'));
  isManager = computed(() => this.userRoles().includes('Manager'));
  isViewer = computed(() => this.userRoles().includes('Viewer'));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.isSuccess && res.token) {
          localStorage.setItem('edmrs_token', res.token);
          this.token.set(res.token);

          const session: UserSession = {
            email: res.email,
            fullName: res.fullName,
            roles: res.roles || []
          };

          localStorage.setItem('edmrs_user', JSON.stringify(session));
          this.currentUser.set(session);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('edmrs_token');
    localStorage.removeItem('edmrs_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  redirectUserByRole(): void {
    const roles = this.userRoles().map((r) => r.toLowerCase().trim());

    if (roles.includes('admin')) {
      this.router.navigate(['/admin-dashboard']);
    } else if (roles.includes('manager')) {
      this.router.navigate(['/manager-dashboard']);
    } else {
      this.router.navigate(['/viewer-dashboard']);
    }
  }

  private getUserFromStorage(): UserSession | null {
    const userStr = localStorage.getItem('edmrs_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}