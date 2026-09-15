import { Pipe, PipeTransform, inject } from '@angular/core';
import { BitcoinService } from '../../core/services/bictoin.service';

@Pipe({
  name: 'satsToEur',
  standalone: true,
  pure: false // Désactivé pour recalculer si le taux btcRateInEur change
})
export class SatsToEurPipe implements PipeTransform {
  private bitcoinService = inject(BitcoinService);

  transform(sats: number | undefined | null): number {
    if (sats === undefined || sats === null) return 0;
    return this.bitcoinService.convertSatsToEur(sats);
  }
}
