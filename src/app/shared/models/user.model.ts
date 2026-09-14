export interface User {
  _id: string;
  email: string;
  pseudo: string;
  lightningAddress?: string;
  favorites?: string[]; // Tableau des IDs des annonces favorites
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateProfilePayload {
  pseudo?: string;
  lightningAddress?: string;
  currentPassword?: string;
  newPassword?: string;
}
