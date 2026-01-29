import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  gameService = inject(GameService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  joinCode: string = '';

  activeGames: any[] = [];
  showActiveGames: boolean = false;

  get user() {
    return this.authService.currentUser;
  }

  async ngOnInit() {
    // We allow non-logged in users to view the home page now
    // if (!this.authService.isLoggedIn) {
    //   this.router.navigate(['/login']);
    // }

    await this.loadActiveGames();
  }

  async loadActiveGames() {
    try {
      const result = await this.gameService.getActiveGames();
      this.activeGames = result.items;
      this.cdr.detectChanges(); // Force update after async load
    } catch (err) {
      console.error('Failed to load active games:', err);
    }
  }

  toggleActiveGames() {
    this.showActiveGames = !this.showActiveGames;
  }

  createGame() {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/create-game']);
  }

  joinGame(code?: string) {
    const codeToJoin = code || this.joinCode;
    if (codeToJoin && codeToJoin.length === 6) {
      this.router.navigate(['/game', codeToJoin.toUpperCase()]);
    } else {
      alert('Please enter a valid 6-character code.');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
