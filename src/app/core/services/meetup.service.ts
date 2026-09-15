import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MeetupPlace {
  name: string;
  type: string;
  note: string;
}

export interface MeetupResponse {
  city: string;
  places: MeetupPlace[];
}

@Injectable({
  providedIn: 'root'
})
export class MeetupService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/meetups'; // Ajuste si nécessaire avec ton environnement

  getMeetupPoints(city: string): Observable<MeetupResponse> {
    return this.http.get<MeetupResponse>(`${this.apiUrl}?city=${encodeURIComponent(city)}`);
  }
}
