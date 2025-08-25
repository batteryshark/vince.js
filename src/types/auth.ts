export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface SessionPayload {
  sessionId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export interface AuthError {
  error: string;
  code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'INVALID_SERVICE_KEY' | 'INTERNAL_ERROR';
}