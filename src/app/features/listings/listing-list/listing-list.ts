import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../shared/models/listing.model';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-list.html',
  styleUrl: './listing-list.css'
})
export class ListingList implements OnInit {
  private listingService = inject(ListingService);

  listings = signal<Listing[]>([]);
  searchQuery = '';

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.listingService.getListings(undefined, this.searchQuery).subscribe({
      next: (data) => this.listings.set(data),
      error: (err) => console.error('Erreur lors de la récupération des annonces:', err)
    });
  }
}
