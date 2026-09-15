import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export interface EncryptedMessage {
  chatRoomId: string;
  senderId: string;
  encryptedContent: string;
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
    this.socket.emit('join_chat', chatRoomId);
  }

  // Envoyer un message chiffré
  sendMessage(messageData: EncryptedMessage): void {
    this.socket.emit('send_message', messageData);
  }

  // Écouter les messages entrants
  onReceiveMessage(): Observable<EncryptedMessage> {
    return new Observable((observer) => {
      this.socket.on('receive_message', (data: EncryptedMessage) => {
        observer.next(data);
      });
    });
  }
}
