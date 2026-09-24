export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  isSuccess: boolean;
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  message: string;
}

export interface UserSession {
  email: string;
  fullName: string;
  roles: string[];
}