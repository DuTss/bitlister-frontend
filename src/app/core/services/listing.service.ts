import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environnement';
import { Listing } from '../../shared/models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/listings`;

  getListings(category?: string, search?: string): Observable<Listing[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);

    return this.http.get<Listing[]>(this.apiUrl, { params });
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  createListing(listingData: Partial<Listing>): Observable<{ message: string; listing: Listing }> {
    return this.http.post<{ message: string; listing: Listing }>(this.apiUrl, listingData);
  }

  deleteListing(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
