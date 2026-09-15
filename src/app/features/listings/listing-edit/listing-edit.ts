import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/services/auth.service';
import { BitcoinService } from '../../../core/services/bictoin.service';
import { SatsToBtcPipe } from '../../../shared/pipes/sats-to-btc.pipe';

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SatsToBtcPipe],
  templateUrl: './listing-edit.html',
  styleUrl: './listing-edit.css'
})
export class ListingEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingService = inject(ListingService);
  private authService = inject(AuthService);
  private bitcoinService = inject(BitcoinService);

  editForm!: FormGroup;
  listingId = '';
  loading = true;
  isSubmitting = false;
  errorMessage = '';

  priceInEur: number | null = null;
  private isUpdatingPrice = false;

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
      category: ['Informatique', Validators.required],
      priceInSats: [null, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Écoute des changements sur les Satoshis pour mettre à jour les Euros
    this.editForm.get('priceInSats')?.valueChanges.subscribe(sats => {
      if (this.isUpdatingPrice) return;
      this.isUpdatingPrice = true;

      if (sats && sats > 0) {
        const eurVal = this.bitcoinService.convertSatsToEur(sats);
        this.priceInEur = Number(eurVal.toFixed(2));
      } else {
        this.priceInEur = null;
      }

      this.isUpdatingPrice = false;
    });
  }

  /**
   * Appelé lorsque l'utilisateur modifie directement le champ EUR
   */
  onEurInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const eurValue = input.value ? parseFloat(input.value) : null;
    this.priceInEur = eurValue;

    if (this.isUpdatingPrice) return;
    this.isUpdatingPrice = true;

    if (eurValue && eurValue > 0) {
      const sats = this.bitcoinService.convertEurToSats(eurValue);
      this.editForm.patchValue({ priceInSats: sats }, { emitEvent: false });
    } else {
      this.editForm.patchValue({ priceInSats: null }, { emitEvent: false });
    }

    this.isUpdatingPrice = false;
  }

  private loadListingData(id: string): void {
    this.listingService.getListingById(id).subscribe({
      next: (listing) => {
        const currentUser = this.authService.currentUser();
        const isOwner = currentUser && listing.seller && (currentUser._id === listing.seller._id || currentUser.pseudo === listing.seller.pseudo);

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

        // Calcul initial de l'équivalent EUR
        if (listing.priceInSats) {
          const eurVal = this.bitcoinService.convertSatsToEur(listing.priceInSats);
          this.priceInEur = Number(eurVal.toFixed(2));
        }

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
