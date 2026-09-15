import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BitcoinService {
  private http = inject(HttpClient);

  // API mempool.space (très rapide, sans clé d'API)
  private apiUrl = 'https://mempool.space/api/v1/prices';

  // Signal contenant le prix de 1 BTC en EUR (valeur par défaut indicative au cas où l'API échoue)
  btcRateInEur = signal<number>(85000);

  constructor() {
    this.fetchBtcPrice();
  }

  /**
   * Récupère le taux de change actuel BTC/EUR depuis mempool.space
   */
  fetchBtcPrice() {
    return this.http.get<{ EUR: number }>(this.apiUrl).pipe(
      tap(res => {
        if (res && res.EUR) {
          this.btcRateInEur.set(res.EUR);
        }
      }),
      catchError(err => {
        console.error('Impossible de récupérer le cours BTC depuis mempool.space', err);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Convertit un montant en Satoshis vers son équivalent en Euros
   * (1 BTC = 100 000 000 Satoshis)
   */
  convertSatsToEur(sats: number): number {
    if (!sats || sats <= 0) return 0;
    const btcAmount = sats / 100_000_000;
    return btcAmount * this.btcRateInEur();
  }

  /**
   * Convertit un montant en Euros vers son équivalent en Satoshis
   */
  convertEurToSats(eur: number): number {
    if (!eur || eur <= 0) return 0;
    const btcAmount = eur / this.btcRateInEur();
    return Math.round(btcAmount * 100_000_000);
  }
}
