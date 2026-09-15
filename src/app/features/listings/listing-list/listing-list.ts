import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../shared/models/listing.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { SatsToEurPipe } from '../../../shared/pipes/sats-to-eur.pipe';
import { SatsToBtcPipe } from '../../../shared/pipes/sats-to-btc.pipe';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SatsToEurPipe, SatsToBtcPipe],
  templateUrl: './listing-list.html',
  styleUrl: './listing-list.css'
})
export class ListingList implements OnInit {
  private listingService = inject(ListingService);
  private userService = inject(UserService);
  public authService = inject(AuthService);

  listings: Listing[] = [];
  loading = true;
  errorMessage = '';

  // Filtres
  searchTerm = '';
  selectedCategory = 'Toutes';

  categories: string[] = [
    'Toutes',
    'Informatique',
    'Services',
    'Maison',
    'Divers'
  ];

  ngOnInit(): void {
    this.fetchListings();
  }

  fetchListings(): void {
    this.loading = true;
    this.errorMessage = '';

    this.listingService.getListings({
      search: this.searchTerm,
      category: this.selectedCategory
    }).subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des annonces.';
        this.loading = false;
      }
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.fetchListings();
  }

  onSearch(): void {
    this.fetchListings();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'Toutes';
    this.fetchListings();
  }

  isFavorite(listingId: string): boolean {
    const user = this.authService.currentUser();
    return user?.favorites?.includes(listingId) || false;
  }

  toggleFavorite(event: Event, listingId: string): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      alert('Veuillez vous connecter pour ajouter des favoris.');
      return;
    }

    this.userService.toggleFavorite(listingId).subscribe({
      next: (res) => {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.authService.currentUser.set({
            ...currentUser,
            favorites: res.favorites
          });
        }
      }
    });
  }
}
