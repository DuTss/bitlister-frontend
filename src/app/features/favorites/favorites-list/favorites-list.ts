import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { Listing } from '../../../shared/models/listing.model';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites-list.html',
  styleUrl: './favorites-list.css'
})
export class FavoritesList implements OnInit {
  private userService = inject(UserService);

  favorites: Listing[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.userService.getFavorites().subscribe({
      next: (data) => {
        this.favorites = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la récupération des favoris.';
        this.loading = false;
      }
    });
  }

  removeFavorite(event: Event, listingId: string | undefined): void {
    event.preventDefault();
    if (!listingId) return; // Sécurité si l'ID est indéfini

    this.userService.toggleFavorite(listingId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(item => item._id !== listingId);
      }
    });
  }
}
