export interface User {
  id?: string;
  username: string;
  lightningAddress?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
