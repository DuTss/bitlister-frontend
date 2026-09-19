import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface Conversation {
  _id: string; // chatRoomId
  lastTimestamp: string | Date;
  senderId: string;
  recipientId: string;
  otherUser?: {
    _id: string;
    pseudo: string;
  };
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css'
})
export class ChatList implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  conversations: Conversation[] = [];
  currentUserId: string = '';

  ngOnInit(): void {
    // 1. Récupération synchrone garantie de l'ID utilisateur
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
      console.error('❌ Aucun utilisateur trouvé pour charger la liste des messages.');
      return;
    }

    this.currentUserId = realUserId;

    // 2. Appel de l'API : les pseudos sont déjà inclus grâce au $lookup backend
    this.http.get<Conversation[]>(`http://localhost:3000/api/chat/user/${this.currentUserId}/conversations`)
      .subscribe({
        next: (data) => {
          this.conversations = data;
        },
        error: (err) => console.error('Erreur chargement conversations :', err)
      });
  }

  openChat(conv: Conversation): void {
    const otherUserId = conv.senderId === this.currentUserId ? conv.recipientId : conv.senderId;

    this.router.navigate(['/chat', conv._id], {
      queryParams: { recipientId: otherUserId }
    });
  }
}
