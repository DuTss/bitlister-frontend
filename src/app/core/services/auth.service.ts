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
  private CryptoService = inject(CryptoService)

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

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Méthode à ajouter pour rafraîchir le signal et le LocalStorage
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

    // Si la clé n'existe pas, vaut null ou vaut la chaîne "undefined"
    if (!userJson || userJson === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Erreur lors du parse du user depuis le localStorage:', e);
      localStorage.removeItem('user'); // Nettoyage de la valeur corrompue
      return null;
    }
  }

  async registerPublicKey(userId: string): Promise<void> {
  try {
    // 1. Génération de la paire de clés
    const keyPair = await this.CryptoService.generateKeyPair();
    const publicKeyPem = await this.CryptoService.exportPublicKey(keyPair.publicKey);

    // 2. Envoi au backend
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
