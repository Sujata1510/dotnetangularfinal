export interface LoginRequest {
  email: string;
  password: string;
}

/** CamelCase body returned by POST /api/auth/login. */
export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
  fullName?: string;
  roles?: string[];
  message?: string;
}

export interface UserSession {
  email: string;
  fullName: string;
  roles: string[];
  expiresAt: string | null;
}
