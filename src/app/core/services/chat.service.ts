import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface EncryptedMessage {
  chatRoomId: string;
  senderId: string;
  recipientId: string;
  encryptedForRecipient: string;
  encryptedForSender: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.SERVER_URL);
  }

  // Rejoindre un canal de discussion (Room)
  joinRoom(chatRoomId: string): void {
    this.socket.emit('joinRoom', chatRoomId);
  }

  // Envoyer un message chiffré
  sendMessage(message: EncryptedMessage): void {
    this.socket.emit('sendMessage', message);
  }

  // Envoyer sa clé publique dans la room
  sendPublicKey(data: { chatRoomId: string, senderId: string, publicKey: string }): void {
    this.socket.emit('share_public_key', data);
  }

  // Écouter la clé publique du correspondant
  onReceivePublicKey(): Observable<{ senderId: string, publicKey: string }> {
    return new Observable((observer) => {
      this.socket.on('receive_public_key', (data) => {
        observer.next(data);
      });
    });
  }

  // Demander la clé publique du correspondant dans la room
  requestPublicKey(chatRoomId: string, senderId: string): void {
    this.socket.emit('request_public_key', { chatRoomId, senderId });
  }

  // Écouter les demandes de clé publique
  onRequestPublicKey(): Observable<{ senderId: string }> {
    return new Observable((observer) => {
      this.socket.on('public_key_requested', (data) => {
        observer.next(data);
      });
    });
  }

  // Écouter les messages entrants
  onReceiveMessage(): Observable<EncryptedMessage> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (data: EncryptedMessage) => {
        observer.next(data);
      });
    });
  }
}
