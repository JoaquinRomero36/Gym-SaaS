export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  gymId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  gym_id: string;
  name: string;
  email: string;
  password: string;
}
