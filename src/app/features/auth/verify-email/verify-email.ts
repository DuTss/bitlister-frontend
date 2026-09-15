import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private UserService = inject(UserService);

  loading = true;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.errorMessage = 'Token d\'activation manquant.';
      return;
    }

    this.UserService.verifyEmail(token).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la vérification du compte.';
      }
    });
  }
}
