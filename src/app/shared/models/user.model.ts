export interface User {
  _id: string;
  username: string;
  email: string;
  lightningAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  username?: string;
  lightningAddress?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
