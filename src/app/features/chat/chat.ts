import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
  private cryptoService = inject(CryptoService);
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);

  chatRoomId: string = '';
  currentUserId: string = 'user_' + Math.floor(Math.random() * 1000); // Id temporaire pour test
  newMessageText: string = '';

  messages: DisplayMessage[] = [];

  private keyPair!: CryptoKeyPair;
  private messageSubscription!: Subscription;

  async ngOnInit(): Promise<void> {
    // 1. Récupérer l'ID de la room depuis l'URL (ex: /chat/:roomId)
    this.chatRoomId = this.route.snapshot.paramMap.get('roomId') || 'demo-room';

    // 2. Générer la paire de clés E2EE pour cette session
    this.keyPair = await this.cryptoService.generateKeyPair();

    // 3. Rejoindre la room WebSockets
    this.chatService.joinRoom(this.chatRoomId);

    // 4. Écouter les messages entrants en temps réel
    this.messageSubscription = this.chatService.onReceiveMessage().subscribe(async (encryptedMsg) => {
      try {
        // Déchiffrer le message reçu avec notre clé privée
        const decryptedText = await this.cryptoService.decryptMessage(
          encryptedMsg.encryptedContent,
          this.keyPair.privateKey
        );

        this.messages.push({
          senderId: encryptedMsg.senderId,
          text: decryptedText,
          timestamp: encryptedMsg.timestamp,
          isMe: encryptedMsg.senderId === this.currentUserId
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

    // Pour la démonstration P2P : Chiffrement du message avec la clé publique locale
    const publicKeyPem = await this.cryptoService.exportPublicKey(this.keyPair.publicKey);
    const recipientPublicKey = await this.cryptoService.importPublicKey(publicKeyPem);
    const encryptedText = await this.cryptoService.encryptMessage(rawText, recipientPublicKey);

    // Émission du message chiffré via Socket.io
    const messagePayload: EncryptedMessage = {
      chatRoomId: this.chatRoomId,
      senderId: this.currentUserId,
      encryptedContent: encryptedText,
      timestamp: new Date()
    };

    this.chatService.sendMessage(messagePayload);
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
