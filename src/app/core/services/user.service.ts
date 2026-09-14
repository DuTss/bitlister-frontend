import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UpdateProfilePayload } from '../../shared/models/user.model';
import { Listing } from '../../shared/models/listing.model';
import { environment } from '../../../environments/environnement';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  // Récupérer le profil
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  // Mettre à jour le profil
  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, payload);
  }

  // Ajouter ou retirer une annonce des favoris (Toggle)
  toggleFavorite(listingId: string): Observable<{ message: string; isFavorite: boolean; favorites: string[] }> {
    return this.http.post<{ message: string; isFavorite: boolean; favorites: string[] }>(
      `${this.apiUrl}/favorites/${listingId}`,
      {}
    );
  }

  // Récupérer la liste complète des annonces favorites
  getFavorites(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/favorites`);
  }

  // Demander l'envoi du mail de modification de mot de passe
  requestPasswordReset(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/request-password-reset`, {});
  }

  // Réinitialiser le mot de passe via le token reçu par mail (Route publique)
  resetPassword(payload: { token: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, payload);
  }
}
