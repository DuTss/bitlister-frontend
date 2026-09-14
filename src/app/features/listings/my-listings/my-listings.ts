import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../shared/models/listing.model';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-listings.html',
  styleUrl: './my-listings.css'
})
export class MyListings implements OnInit {
  private listingService = inject(ListingService);

  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  activeTab: 'ALL' | 'ACTIVE' | 'SOLD' | 'ARCHIVED' = 'ALL';

  ngOnInit(): void {
    this.fetchMyListings();
  }

  fetchMyListings(): void {
    this.loading = true;
    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de charger vos annonces.';
        this.loading = false;
      }
    });
  }

  setFilter(tab: 'ALL' | 'ACTIVE' | 'SOLD' | 'ARCHIVED'): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeTab === 'ALL') {
      this.filteredListings = [...this.listings];
    } else {
      this.filteredListings = this.listings.filter(l => l.status === this.activeTab);
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  changeStatus(listing: Listing, newStatus: 'ACTIVE' | 'SOLD' | 'ARCHIVED'): void {
    if (!listing._id || listing.status === newStatus) return;

    this.listingService.updateStatus(listing._id, newStatus).subscribe({
      next: (res) => {
        listing.status = res.listing.status;
        this.applyFilter();
        this.showSuccess('Statut mis à jour avec succès.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du changement de statut.';
      }
    });
  }

  onDelete(id: string | undefined): void {
    if (!id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?')) {
      return;
    }

    this.listingService.deleteListing(id).subscribe({
      next: () => {
        this.listings = this.listings.filter(l => l._id !== id);
        this.applyFilter();
        this.showSuccess('Annonce supprimée.');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression.';
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
