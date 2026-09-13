import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../shared/models/listing.model';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './listing-create.html',
  styleUrl: './listing-create.css'
})
export class ListingCreate {
  private listingService = inject(ListingService);
  private router = inject(Router);

  listing: Partial<Listing> = {
    title: '',
    description: '',
    priceInSats: undefined,
    category: 'Divers',
    location: ''
  };

  errorMessage = '';

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
