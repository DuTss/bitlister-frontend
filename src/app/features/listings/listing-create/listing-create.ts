import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { BitcoinService } from '../../../core/services/bictoin.service';
import { Listing } from '../../../shared/models/listing.model';
import { SatsToBtcPipe } from '../../../shared/pipes/sats-to-btc.pipe';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [FormsModule, SatsToBtcPipe],
  templateUrl: './listing-create.html',
  styleUrl: './listing-create.css'
})
export class ListingCreate {
  private listingService = inject(ListingService);
  private bitcoinService = inject(BitcoinService); // Injection
  private router = inject(Router);

  listing: Partial<Listing> = {
    title: '',
    description: '',
    priceInSats: undefined,
    category: 'Divers',
    location: ''
  };

  priceInEur: number | undefined = undefined; // Variable temporaire pour le champ EUR
  errorMessage = '';

  /**
   * Appelé lorsque l'utilisateur tape dans le champ Satoshis
   */
  onSatsInput(): void {
    if (this.listing.priceInSats && this.listing.priceInSats > 0) {
      const eurVal = this.bitcoinService.convertSatsToEur(this.listing.priceInSats);
      this.priceInEur = Number(eurVal.toFixed(2));
    } else {
      this.priceInEur = undefined;
    }
  }

  /**
   * Appelé lorsque l'utilisateur tape dans le champ Euros
   */
  onEurInput(): void {
    if (this.priceInEur && this.priceInEur > 0) {
      this.listing.priceInSats = this.bitcoinService.convertEurToSats(this.priceInEur);
    } else {
      this.listing.priceInSats = undefined;
    }
  }

  onSubmit(): void {
    if (!this.listing.title || !this.listing.description || !this.listing.priceInSats || !this.listing.location) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.listingService.createListing(this.listing).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la création de l\'annonce';
      }
    });
  }
}
