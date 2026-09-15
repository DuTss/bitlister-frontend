import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LightningInvoiceResponse {
  paymentHash: string;
  paymentRequest: string;
  checkingId: string;
}

export interface LightningStatusResponse {
  paid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LightningService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/lightning';

  createInvoice(amountInSats: number, memo: string = 'Achat BitLister'): Observable<LightningInvoiceResponse> {
    return this.http.get<LightningInvoiceResponse>(
      `${this.apiUrl}/create-invoice?amount=${amountInSats}&memo=${encodeURIComponent(memo)}`
    );
  }

  checkStatus(paymentHash: string): Observable<LightningStatusResponse> {
    return this.http.get<LightningStatusResponse>(`${this.apiUrl}/check-invoice/${paymentHash}`);
  }
}
