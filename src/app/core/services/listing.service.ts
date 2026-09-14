import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from '../../shared/models/listing.model';
import { environment } from '../../../environments/environnement';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/listings`;

  getListings(filters?: { search?: string; category?: string }): Observable<Listing[]> {
    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search.trim());
    }
    if (filters?.category && filters.category !== 'Toutes') {
      params = params.set('category', filters.category);
    }

    return this.http.get<Listing[]>(this.apiUrl, { params });
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  createListing(listingData: Partial<Listing>): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, listingData);
  }

  updateListing(id: string, listingData: Partial<Listing>): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, listingData);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/mine`);
  }

  updateStatus(id: string, status: 'ACTIVE' | 'SOLD' | 'ARCHIVED'): Observable<{ message: string; listing: Listing }> {
    return this.http.patch<{ message: string; listing: Listing }>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteListing(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

}
