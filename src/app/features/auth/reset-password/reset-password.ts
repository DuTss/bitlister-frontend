import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  token = '';
  submitting = false;
  successMessage = '';
  errorMessage = '';

  resetForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    // Lecture du paramètre ?token=... transmis dans le lien de l'e-mail
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessage = 'Le jeton de réinitialisation est absent ou invalide.';
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) return;

    this.submitting = true;
    this.errorMessage = '';

    this.userService.resetPassword({
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du changement de mot de passe.';
        this.submitting = false;
      }
    });
  }
}
