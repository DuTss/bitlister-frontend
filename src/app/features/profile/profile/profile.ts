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
      lightningAddress: [''], // Pas de Validators.email strict sur les adresses LN
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]]
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

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValues = this.profileForm.getRawValue();

    const payload: any = {
      pseudo: formValues.pseudo,
      lightningAddress: formValues.lightningAddress
    };

    if (formValues.newPassword) {
      payload.currentPassword = formValues.currentPassword;
      payload.newPassword = formValues.newPassword;
    }

    this.userService.updateProfile(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.user = res.user;
        this.submitting = false;

        // Réinitialisation des champs de mot de passe après succès
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: ''
        });
        this.profileForm.get('currentPassword')?.setErrors(null);
        this.profileForm.get('newPassword')?.setErrors(null);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour.';
        this.submitting = false;
      }
    });
  }
}
