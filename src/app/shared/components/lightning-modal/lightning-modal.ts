import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightningService } from '../../../core/services/lightning.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-lightning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lightning-modal.html',
  styleUrl: './lightning-modal.css'
})
export class LightningModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) amountInSats!: number;
  @Input() title: string = 'Règlement en Satoshis';

  @Output() close = new EventEmitter<void>();
  @Output() paid = new EventEmitter<string>(); // Émet le paymentHash quand c'est réglé

  private lightningService = inject(LightningService);

  qrCodeDataUrl: string = '';
  paymentRequest: string = '';
  paymentHash: string = '';

  loading = true;
  isPaid = false;
  copied = false;

  private pollInterval: any;

  ngOnInit(): void {
    this.generateInvoice();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private generateInvoice(): void {
    this.loading = true;
    this.lightningService.createInvoice(this.amountInSats, this.title).subscribe({
      next: async (res) => {
        this.paymentRequest = res.paymentRequest;
        this.paymentHash = res.paymentHash;

        // Générer l'image QR Code en Data URL
        try {
          this.qrCodeDataUrl = await QRCode.toDataURL(this.paymentRequest, {
            width: 280,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
        } catch (err) {
          console.error('Erreur génération QR Code :', err);
        }

        this.loading = false;
        this.startPolling();
      },
      error: (err) => {
        console.error('Erreur génération facture :', err);
        this.loading = false;
      }
    });
  }

  private startPolling(): void {
    // Vérification du statut du paiement toutes les 2 secondes
    this.pollInterval = setInterval(() => {
      if (!this.paymentHash || this.isPaid) return;

      this.lightningService.checkStatus(this.paymentHash).subscribe({
        next: (res) => {
          if (res.paid) {
            this.isPaid = true;
            this.stopPolling();
            this.paid.emit(this.paymentHash);
          }
        }
      });
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  copyInvoice(): void {
    if (this.paymentRequest) {
      navigator.clipboard.writeText(this.paymentRequest);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    }
  }

  onClose(): void {
    this.stopPolling();
    this.close.emit();
  }
}
