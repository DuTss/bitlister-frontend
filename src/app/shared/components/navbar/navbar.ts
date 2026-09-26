import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  public authService = inject(AuthService);
  private router = inject(Router);

  // État d'ouverture/fermeture du menu burger mobile
  isMenuOpen = false;

  constructor() {
    // Ferme le menu burger automatiquement à chaque changement de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.closeMenu();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }
}
