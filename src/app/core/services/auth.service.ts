import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environnement';
import { AuthResponse, User } from '../../shared/models/user.model';
import { CryptoService } from './crypto.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  private CryptoService = inject(CryptoService);

  currentUser = signal<User | null>(this.getUserFromStorage());

  register(credentials: { email: string; pseudo: string; password: string; lightningAddress?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verification locale de l'expiration du token
  private isTokenExpired(token: string): boolean {
    try {
      // Décodage de la partie Payload du JWT (base64)
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;

      const payload = JSON.parse(atob(payloadBase64));

      // Si pas de champ exp, on considère le token comme valide ou illimité
      if (!payload.exp) return false;

      // exp est exprimé en secondes, Date.now() est en millisecondes
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (e) {
      // Si le token est corrompu/illisible
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Si le token est présent mais expiré, on nettoie le storage et réinitialise le signal
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  updateCurrentUser(updatedUser: User): void {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.currentUser.set(updatedUser);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private getUserFromStorage(): any {
    const userJson = localStorage.getItem('user');

    if (!userJson || userJson === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Erreur lors du parse du user depuis le localStorage:', e);
      localStorage.removeItem('user');
      return null;
    }
  }

  async registerPublicKey(userId: string): Promise<void> {
    try {
      const keyPair = await this.CryptoService.generateKeyPair();
      const publicKeyPem = await this.CryptoService.exportPublicKey(keyPair.publicKey);

      await firstValueFrom(
        this.http.put(`http://localhost:3000/api/users/${userId}/public-key`, {
          publicKey: publicKeyPem
        })
      );
    } catch (err) {
      console.error('❌ Erreur lors de l\'enregistrement de la clé publique :', err);
    }
  }
}
