import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  user: User | null = null;
  loading = true;
  submitting = false;

  // Gestion de l'envoi de mail de mot de passe
  sendingEmail = false;
  emailSentMessage = '';

  successMessage = '';
  errorMessage = '';

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }], // L'email ne peut pas être modifié
      lightningAddress: ['']
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.profileForm.patchValue({
          pseudo: profile.pseudo,
          email: profile.email,
          lightningAddress: profile.lightningAddress || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du chargement du profil.';
        this.loading = false;
      }
    });
  }

  // Soumission pour le pseudo et l'adresse Lightning
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValues = this.profileForm.getRawValue();

    const payload = {
      pseudo: formValues.pseudo,
      lightningAddress: formValues.lightningAddress
    };

    this.userService.updateProfile(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.user = res.user;
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour.';
        this.submitting = false;
      }
    });
  }

  // Déclencheur pour recevoir le lien de modification de mot de passe par e-mail
  onRequestPasswordReset(): void {
    this.sendingEmail = true;
    this.emailSentMessage = '';
    this.errorMessage = '';

    this.userService.requestPasswordReset().subscribe({
      next: (res) => {
        this.emailSentMessage = res.message;
        this.sendingEmail = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erreur lors de l'envoi de l'email.";
        this.sendingEmail = false;
      }
    });
  }
}
