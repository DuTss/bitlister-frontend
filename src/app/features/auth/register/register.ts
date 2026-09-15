import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    pseudo: '',
    email: '',
    confirmEmail: '',
    password: '',
    lightningAddress: ''
  };

  errorMessage = '';

  onSubmit(): void {
    // Vérification de la correspondance des e-mails
    if (this.credentials.email !== this.credentials.confirmEmail) {
      this.errorMessage = 'Les adresses e-mail ne correspondent pas.';
      return;
    }

    // Préparation des données pour le service (sans envoyer confirmEmail)
    const { confirmEmail, ...payload } = this.credentials;

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}
