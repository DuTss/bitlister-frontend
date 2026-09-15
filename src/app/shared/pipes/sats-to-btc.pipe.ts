import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'satsToBtc',
  standalone: true
})
export class SatsToBtcPipe implements PipeTransform {
  transform(sats: number | undefined | null): string {
    if (sats === undefined || sats === null || sats <= 0) {
      return '0 BTC';
    }
    // 1 BTC = 100 000 000 Satoshis
    const btc = sats / 100_000_000;

    // Formatage propre avec 8 décimales
    return `${btc.toFixed(8)} BTC`;
  }
}
