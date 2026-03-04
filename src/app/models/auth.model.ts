export interface LoginRequest {
  readonly username: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface RegisterRequest {
  readonly username: string;
  readonly password: string;
  readonly role: string;
}
