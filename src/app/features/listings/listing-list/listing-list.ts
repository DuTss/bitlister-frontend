import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../shared/models/listing.model';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listing-list.html',
  styleUrl: './listing-list.css'
})
export class ListingList implements OnInit {
  private listingService = inject(ListingService);

  listings: Listing[] = [];
  loading = true;
  errorMessage = '';

  // Filtres
  searchTerm = '';
  selectedCategory = 'Toutes';

  categories: string[] = [
    'Toutes',
    'Électronique',
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
}
