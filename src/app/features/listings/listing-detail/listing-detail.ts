import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/services/auth.service';
import { Listing } from '../../../shared/models/listing.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css'
})
export class ListingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingService = inject(ListingService);
  private authService = inject(AuthService);

  listing: Listing | null = null;
  loading = true;
  errorMessage = '';

  get isOwner(): boolean {
    const currentUser = this.authService.currentUser();
    return !!(currentUser && this.listing?.seller && (currentUser._id === this.listing.seller._id || currentUser.username === this.listing.seller.username));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadListing(id);
    } else {
      this.errorMessage = 'Identifiant d\'annonce invalide';
      this.loading = false;
    }
  }

  loadListing(id: string): void {
    this.listingService.getListingById(id).subscribe({
      next: (data) => {
        this.listing = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible d\'afficher l\'annonce';
        this.loading = false;
      }
    });
  }

  onDelete(): void {
    if (!this.listing?._id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      this.listingService.deleteListing(this.listing._id).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
}
