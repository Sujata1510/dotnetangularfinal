import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserSession } from '../models/auth.model';

export const TOKEN_STORAGE_KEY = 'edmrs_token';
export const USER_STORAGE_KEY = 'edmrs_user';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

/**
 * Session signals live here so the HTTP interceptor can clear them
 * without injecting AuthService (which depends on HttpClient).
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionState {
  readonly token = signal<string | null>(readStorage(TOKEN_STORAGE_KEY));
  readonly currentUser = signal<UserSession | null>(readStoredSession());

  persist(token: string, session: UserSession): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
    this.token.set(token);
    this.currentUser.set(session);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    if (this.token() !== null) {
      this.token.set(null);
    }
    if (this.currentUser() !== null) {
      this.currentUser.set(null);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionState);

  readonly currentUser = this.session.currentUser;
  readonly token = this.session.token;

  readonly isAuthenticated = computed(() => {
    const token = this.token();
    if (!token) {
      return false;
    }
    const expiresAt = tokenExpiryMs(token);
    return expiresAt !== null && expiresAt > Date.now();
  });

  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);

  readonly isAdmin = computed(() => this.userRoles().includes('Admin'));
  readonly isManager = computed(() => this.userRoles().includes('Manager') || this.isAdmin());
  readonly isViewer = computed(() => this.userRoles().includes('Viewer') || this.isManager());

  register(body: { employeeCode: string; password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, {
      employeeCode: body.employeeCode,
      password: body.password,
      fullName: 'Viewer',
      role: 'Viewer'
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      map((response) => normalizeLoginResponse(response)),
      tap((response) => {
        const session = toSession(response);
        this.session.persist(response.token, session);
      })
    );
  }

  logout(): void {
    this.session.clear();
    if (!this.router.url.includes('/login')) {
      this.router.navigate(['/login']);
    }
  }

  /** Clears storage and signals. Does not navigate, so interceptors stay non-recursive. */
  clearSession(): void {
    this.session.clear();
  }

  getToken(): string | null {
    return this.token();
  }

  getUserRole(): string[] {
    return this.userRoles();
  }

  homeRouteForCurrentUser(): string {
    const roles = this.userRoles().map((role) => role.toLowerCase());
    if (roles.includes('admin')) {
      return '/admin-dashboard';
    }
    if (roles.includes('manager')) {
      return '/manager-dashboard';
    }
    return '/viewer-dashboard';
  }

  redirectUserByRole(): void {
    const targetRoute = this.homeRouteForCurrentUser();
    const currentRoute = this.router.url.split('?')[0];
    if (currentRoute !== targetRoute) {
      this.router.navigate([targetRoute]);
    }
  }
}

function normalizeLoginResponse(response: LoginResponse): LoginResponse {
  const parsed = decodeJwtPayload(response.token);
  const roleFromBody = response.role || response.roles?.[0] || '';
  const roleFromToken = readClaim(parsed, 'role', ROLE_CLAIM);
  const role = canonicalizeRole(roleFromBody || roleFromToken) ?? 'Viewer';

  return {
    ...response,
    email: response.email || readClaim(parsed, 'email', EMAIL_CLAIM),
    role,
    roles: [role],
    fullName: response.fullName || readClaim(parsed, 'unique_name', NAME_CLAIM) || response.email
  };
}

function toSession(response: LoginResponse): UserSession {
  const role = canonicalizeRole(response.role) ?? 'Viewer';
  return {
    email: response.email,
    fullName: response.fullName || response.email,
    roles: [role],
    expiresAt: response.expiresAt ?? null
  };
}

function canonicalizeRole(role: string | undefined | null): 'Admin' | 'Manager' | 'Viewer' | null {
  const value = (role ?? '').toLowerCase().replace(/[\s_-]/g, '');
  if (value === 'admin') {
    return 'Admin';
  }
  if (value === 'manager' || value === 'datamanager') {
    return 'Manager';
  }
  if (value === 'viewer' || value === 'dataanalyst') {
    return 'Viewer';
  }
  return null;
}

function tokenExpiryMs(token: string): number | null {
  const exp = decodeJwtPayload(token)['exp'];
  return typeof exp === 'number' ? exp * 1000 : null;
}

function readClaim(payload: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return '';
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const segment = token.split('.')[1];
  if (!segment) {
    return {};
  }
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readStoredSession(): UserSession | null {
  const raw = readStorage(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<UserSession> & { role?: string };
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles.map((role) => canonicalizeRole(role)).filter((role): role is 'Admin' | 'Manager' | 'Viewer' => !!role)
      : [];
    if (roles.length === 0 && parsed.role) {
      const single = canonicalizeRole(parsed.role);
      if (single) {
        roles.push(single);
      }
    }
    if (!parsed.email || roles.length === 0) {
      return null;
    }
    return {
      email: parsed.email,
      fullName: parsed.fullName || parsed.email,
      roles,
      expiresAt: parsed.expiresAt ?? null
    };
  } catch {
    return null;
  }
}
