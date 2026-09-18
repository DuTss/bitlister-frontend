import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../core/services/auth.service';
import { CryptoService } from '../../core/services/crypto.service';
import { ChatService, EncryptedMessage } from '../../core/services/chat.service';

interface DisplayMessage {
  senderId: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private cryptoService = inject(CryptoService);
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private ngZone = inject(NgZone); // Garantit le rafraîchissement Angular de l'UI en temps réel

  chatRoomId: string = '';
  currentUserId: string = '';
  recipientId: string = '';
  newMessageText: string = '';
  recipientPublicKeyPem: string = '';

  messages: DisplayMessage[] = [];

  private keyPair!: CryptoKeyPair;
  private messageSubscription!: Subscription;

  async ngOnInit(): Promise<void> {
    // 1. Récupération des Identifiants
    let realUserId = this.authService.currentUser()?._id;
    if (!realUserId) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          realUserId = parsed._id || parsed.id;
        } catch (e) {
          console.error('Erreur lecture localStorage user', e);
        }
      }
    }

    if (!realUserId) {
      console.error('❌ [INIT] ERREUR : Aucun utilisateur en session.');
      return;
    }

    this.currentUserId = realUserId;
    this.chatRoomId = this.route.snapshot.paramMap.get('roomId') || 'demo-room';

    const recipientParam = this.route.snapshot.queryParamMap.get('recipientId');
    if (recipientParam && recipientParam !== 'undefined') {
      this.recipientId = recipientParam;
    }

    // 2. CRUCIAL : ABONNEMENT SOCKET EN PREMIER (AVANT TOUT AWAIT)
    this.chatService.joinRoom(this.chatRoomId);
    this.initSocketListener();

    // 3. Gestion des clés E2EE (IndexedDB ou Génération)
    let savedPrivateKey = await this.cryptoService.loadPrivateKey(this.currentUserId);
    let myPublicKeyPem = '';

    if (savedPrivateKey) {
      try {
        const res = await this.http.get<{ publicKey: string }>(`http://localhost:3000/api/users/${this.currentUserId}/public-key`).toPromise();
        if (res?.publicKey) myPublicKeyPem = res.publicKey;
      } catch (e) {
        console.warn('Impossible de récupérer sa propre clé publique :', e);
      }

      this.keyPair = {
        privateKey: savedPrivateKey,
        publicKey: myPublicKeyPem
          ? await this.cryptoService.importPublicKey(myPublicKeyPem)
          : (await this.cryptoService.generateKeyPair()).publicKey
      };
    } else {
      this.keyPair = await this.cryptoService.generateKeyPair();
      await this.cryptoService.savePrivateKey(this.currentUserId, this.keyPair.privateKey);

      myPublicKeyPem = await this.cryptoService.exportPublicKey(this.keyPair.publicKey);
      if (this.currentUserId) {
        this.http.put(`http://localhost:3000/api/users/${this.currentUserId}/public-key`, { publicKey: myPublicKeyPem })
          .subscribe({ error: (err) => console.error('PUT Key ERREUR :', err) });
      }
    }

    // 4. Clé publique du destinataire
    if (this.recipientId) {
      this.http.get<{ publicKey: string }>(`http://localhost:3000/api/users/${this.recipientId}/public-key`)
        .subscribe({
          next: (res) => { if (res?.publicKey) this.recipientPublicKeyPem = res.publicKey; },
          error: (err) => console.error('Erreur clé destinataire :', err)
        });
    }

    // 5. Charger l'historique
    this.loadHistory();
  }

  // ÉCOUTEUR TEMPS RÉEL (Ici sont placés les logs de diagnostic)
  private initSocketListener(): void {
    this.messageSubscription = this.chatService.onReceiveMessage().subscribe(async (encryptedMsg: EncryptedMessage) => {

      if (encryptedMsg.senderId === this.currentUserId) {
        return;
      }

      if (!encryptedMsg.encryptedForRecipient) {
        console.error('❌ [SOCKET ERREUR] Champ encryptedForRecipient absent dans le payload !', encryptedMsg);
        return;
      }

      try {
        const decryptedText = await this.cryptoService.decryptMessage(
          encryptedMsg.encryptedForRecipient,
          this.keyPair.privateKey
        );

        // NgZone garantit le rendu visuel instantané dans le template Angular
        this.ngZone.run(() => {
          this.messages.push({
            senderId: encryptedMsg.senderId,
            text: decryptedText,
            timestamp: new Date(encryptedMsg.timestamp),
            isMe: false
          });
        });
      } catch (err) {
        console.error('❌ [SOCKET ERREUR DÉCHIFFREMENT] Erreur WebCrypto :', err);
      }
    });
  }

  // CHARGEMENT DE L'HISTORIQUE
  private loadHistory(): void {
    this.http.get<any[]>(`http://localhost:3000/api/chat/${this.chatRoomId}`).subscribe(async (history) => {
      this.messages = [];
      for (const msg of history) {
        const isMe = msg.senderId === this.currentUserId;
        const blobToDecrypt = isMe ? msg.encryptedForSender : msg.encryptedForRecipient;

        if (!blobToDecrypt) continue;

        try {
          const decryptedText = await this.cryptoService.decryptMessage(blobToDecrypt, this.keyPair.privateKey);
          this.messages.push({
            senderId: msg.senderId,
            text: decryptedText,
            timestamp: new Date(msg.timestamp),
            isMe
          });
        } catch (e) {
          this.messages.push({
            senderId: msg.senderId,
            text: '[Message chiffré — Clé non disponible]',
            timestamp: new Date(msg.timestamp),
            isMe
          });
        }
      }
    });
  }

  // ENVOI DE MESSAGE
  async send(): Promise<void> {
    if (!this.newMessageText.trim()) return;

    const rawText = this.newMessageText;
    this.newMessageText = '';

    try {
      if (!this.recipientPublicKeyPem && this.recipientId) {
        const res = await this.http.get<{ publicKey: string }>(`http://localhost:3000/api/users/${this.recipientId}/public-key`).toPromise();
        if (res?.publicKey) this.recipientPublicKeyPem = res.publicKey;
      }

      if (!this.recipientPublicKeyPem) {
        console.warn('⚠️ [ENVOI ABANDONNÉ] Le destinataire n\'a pas de clé publique.');
        return;
      }

      const recipientKey = await this.cryptoService.importPublicKey(this.recipientPublicKeyPem);
      const myPublicKeyPem = await this.cryptoService.exportPublicKey(this.keyPair.publicKey);
      const myKey = await this.cryptoService.importPublicKey(myPublicKeyPem);

      const encryptedForRecipient = await this.cryptoService.encryptMessage(rawText, recipientKey);
      const encryptedForSender = await this.cryptoService.encryptMessage(rawText, myKey);

      const messagePayload = {
        chatRoomId: this.chatRoomId,
        senderId: this.currentUserId,
        recipientId: this.recipientId,
        encryptedForRecipient,
        encryptedForSender,
        timestamp: new Date()
      };

      this.chatService.sendMessage(messagePayload);

      this.messages.push({
        senderId: this.currentUserId,
        text: rawText,
        timestamp: new Date(),
        isMe: true
      });
    } catch (err) {
      console.error('❌ Erreur envoi message :', err);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
