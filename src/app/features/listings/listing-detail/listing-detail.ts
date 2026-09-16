import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { AuthService } from '../../../core/services/auth.service';
import { Listing } from '../../../shared/models/listing.model';
import { SatsToEurPipe } from '../../../shared/pipes/sats-to-eur.pipe';
import { SatsToBtcPipe } from '../../../shared/pipes/sats-to-btc.pipe';
import { MeetupModalComponent } from '../../../shared/components/meetup-modal/meetup-modal';
import { LightningModalComponent } from '../../../shared/components/lightning-modal/lightning-modal';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SatsToEurPipe, SatsToBtcPipe, MeetupModalComponent, LightningModalComponent],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css'
})
export class ListingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingService = inject(ListingService);
  private authService = inject(AuthService);

  showLightningModal = false;
  showMeetupModal = false;
  listing: Listing | null = null;
  loading = true;
  errorMessage = '';

  get isOwner(): boolean {
    const currentUser = this.authService.currentUser();
    return !!(currentUser && this.listing?.seller && (currentUser._id === this.listing.seller._id || currentUser.pseudo === this.listing.seller.pseudo));
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

  contactSeller(listing: any): void {
    // 1. Définir un nom de room unique (ex: ID de l'annonce)
    const roomId = listing._id;

    // 2. Récupérer l'ID du vendeur (destinataire)
    const sellerId = listing.userId; // ou listing.seller._id selon ton modèle

    // 3. Rediriger vers la route du chat avec le recipientId en Query Param
    this.router.navigate(['/chat', roomId], {
      queryParams: { recipientId: sellerId }
    });
  }

  onLightningPaymentSuccess(paymentHash: string): void {
    console.log('Paiement validé avec le hash :', paymentHash);
    // Optionnel : afficher un message de succès ou mettre à jour le statut
    if (this.listing) {
      this.listingService.updateStatus(this.listing._id, 'SOLD').subscribe({
        next: () => {
          alert('Paiement réussi ! L\'annonce est maintenant marquée comme vendue.');
          this.router.navigate(['/']);
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur lors de la mise à jour du statut de l\'annonce');
        }
      });
    }
  }
}
