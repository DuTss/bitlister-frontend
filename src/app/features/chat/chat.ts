import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CryptoService } from '../../core/services/crypto.service';
import { ChatService, EncryptedMessage } from '../../core/services/chat.service';
import { HttpClient } from '@angular/common/http';

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

  chatRoomId: string = '';
  currentUserId: string = '';
  newMessageText: string = '';

  recipientPublicKeyPem: string = '';

  messages: DisplayMessage[] = [];

  private keyPair!: CryptoKeyPair;
  private messageSubscription!: Subscription;
  private keySubscription!: Subscription;
  private keyRequestSubscription!: Subscription;

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.currentUser()?._id || '507f1f77bcf86cd799439011';
    this.chatRoomId = this.route.snapshot.paramMap.get('roomId') || 'demo-room';

    // 1. Générer la paire de clés E2EE locales
    this.keyPair = await this.cryptoService.generateKeyPair();
    const myPublicKeyPem = await this.cryptoService.exportPublicKey(this.keyPair.publicKey);

    // 2. Enregistrer la clé publique en BDD pour gérer la messagerie hors-ligne
    if (this.authService.currentUser()?._id) {
      this.http.put(`http://localhost:3000/api/users/${this.currentUserId}/public-key`, {
        publicKey: myPublicKeyPem
      }).subscribe();
    }

    // 3. Récupérer la clé publique du destinataire en BDD (fallback si hors-ligne)
    const recipientId = this.route.snapshot.queryParamMap.get('recipientId');
    if (recipientId && recipientId !== 'undefined') {
      this.http.get<{ publicKey: string }>(`http://localhost:3000/api/users/${recipientId}/public-key`)
        .subscribe({
          next: (res) => {
            if (res?.publicKey) {
              this.recipientPublicKeyPem = res.publicKey;
              console.log('🔑 Clé du destinataire chargée depuis MongoDB !');
            }
          },
          error: (err) => console.log('Destinataire hors-ligne ou sans clé enregistrée :', err)
        });
    }

    // 4. Rejoindre la room WebSockets
    this.chatService.joinRoom(this.chatRoomId);

    // 5. Écouter la clé publique reçue en temps réel
    this.keySubscription = this.chatService.onReceivePublicKey().subscribe((data: { senderId: string, publicKey: string }) => {
      if (data.senderId !== this.currentUserId) {
        this.recipientPublicKeyPem = data.publicKey;
        console.log('🔑 Clé publique du correspondant reçue en direct !');
      }
    });

    // 6. Écouter si un nouvel arrivant demande notre clé
    this.keyRequestSubscription = this.chatService.onRequestPublicKey().subscribe(async (data) => {
      if (data.senderId !== this.currentUserId) {
        this.chatService.sendPublicKey({
          chatRoomId: this.chatRoomId,
          senderId: this.currentUserId,
          publicKey: myPublicKeyPem
        });
      }
    });

    // 7. Diffuser notre clé ET demander celle des autres membres connectés
    this.chatService.sendPublicKey({
      chatRoomId: this.chatRoomId,
      senderId: this.currentUserId,
      publicKey: myPublicKeyPem
    });
    this.chatService.requestPublicKey(this.chatRoomId, this.currentUserId);

    // 8. Charger l'historique depuis MongoDB
    this.http.get<any[]>(`http://localhost:3000/api/chat/${this.chatRoomId}`).subscribe(async (history) => {
      for (const msg of history) {
        try {
          const decryptedText = await this.cryptoService.decryptMessage(
            msg.encryptedContent,
            this.keyPair.privateKey
          );
          this.messages.push({
            senderId: msg.senderId,
            text: decryptedText,
            timestamp: new Date(msg.timestamp),
            isMe: msg.senderId === this.currentUserId
          });
        } catch (e) {
          this.messages.push({
            senderId: msg.senderId,
            text: '[Message chiffré — Clé non disponible]',
            timestamp: new Date(msg.timestamp),
            isMe: msg.senderId === this.currentUserId
          });
        }
      }
    });

    // 9. Écouter les messages entrants en temps réel
    this.messageSubscription = this.chatService.onReceiveMessage().subscribe(async (encryptedMsg) => {
      if (encryptedMsg.senderId === this.currentUserId) {
        return;
      }

      try {
        const decryptedText = await this.cryptoService.decryptMessage(
          encryptedMsg.encryptedContent,
          this.keyPair.privateKey
        );

        this.messages.push({
          senderId: encryptedMsg.senderId,
          text: decryptedText,
          timestamp: encryptedMsg.timestamp,
          isMe: false
        });
      } catch (err) {
        console.error('Erreur déchiffrement message :', err);
      }
    });
  }

  async send(): Promise<void> {
    if (!this.newMessageText.trim()) return;

    const rawText = this.newMessageText;
    this.newMessageText = '';

    try {
      // 1. Clé du destinataire ou fallback locale
      let targetKeyPem = this.recipientPublicKeyPem;

      if (!targetKeyPem) {
        console.warn('⚠️ Clé du destinataire non disponible, fallback sur la clé locale.');
        targetKeyPem = await this.cryptoService.exportPublicKey(this.keyPair.publicKey);
      }

      // 2. Chiffrement
      const recipientPublicKey = await this.cryptoService.importPublicKey(targetKeyPem);
      const encryptedText = await this.cryptoService.encryptMessage(rawText, recipientPublicKey);

      const activeUserId = this.authService.currentUser()?._id || this.currentUserId;

      const messagePayload: EncryptedMessage = {
        chatRoomId: this.chatRoomId,
        senderId: activeUserId,
        encryptedContent: encryptedText,
        timestamp: new Date()
      };

      // 3. Émission Socket.io + Ajout UI
      this.chatService.sendMessage(messagePayload);

      this.messages.push({
        senderId: activeUserId,
        text: rawText,
        timestamp: new Date(),
        isMe: true
      });
    } catch (err) {
      console.error('❌ Erreur lors du chiffrement ou de l\'envoi :', err);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
    if (this.keySubscription) this.keySubscription.unsubscribe();
    if (this.keyRequestSubscription) this.keyRequestSubscription.unsubscribe();
  }
}
