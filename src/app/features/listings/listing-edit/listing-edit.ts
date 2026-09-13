import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './listing-edit.html',
  styleUrl: './listing-edit.css'
})
export class ListingEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingService = inject(ListingService);
  private authService = inject(AuthService);

  editForm!: FormGroup;
  listingId = '';
  loading = true;
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.listingId = id;
      this.loadListingData(id);
    } else {
      this.errorMessage = 'Identifiant invalide';
      this.loading = false;
    }
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['Électronique', Validators.required],
      priceInSats: [null, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadListingData(id: string): void {
    this.listingService.getListingById(id).subscribe({
      next: (listing) => {
        const currentUser = this.authService.currentUser();
        const isOwner = currentUser && listing.seller && (currentUser._id === listing.seller._id || currentUser.username === listing.seller.username);

        if (!isOwner) {
          this.router.navigate(['/listings', id]);
          return;
        }

        this.editForm.patchValue({
          title: listing.title,
          category: listing.category,
          priceInSats: listing.priceInSats,
          location: listing.location,
          description: listing.description
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de charger l\'annonce.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid || !this.listingId) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.listingService.updateListing(this.listingId, this.editForm.value).subscribe({
      next: () => {
        this.router.navigate(['/listings', this.listingId]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour.';
        this.isSubmitting = false;
      }
    });
  }
}
