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
  joinCode = '';
  activeGames: any[] = [];
  activeGameCount = 0;
  currentPage = 0;
  hasMoreGames = false;
  isLoadingGames = false;
  gamesError = '';

  get user() {
    return this.authService.currentUser;
  }

  async ngOnInit() {
    await this.loadActiveGames();
  }

  async loadActiveGames(loadMore: boolean = false) {
    if (this.isLoadingGames) return;

    const page = loadMore ? this.currentPage + 1 : 1;
    this.isLoadingGames = true;
    this.gamesError = '';

    try {
      const result = await this.gameService.getActiveGames(page, 5);
      this.activeGames = loadMore ? [...this.activeGames, ...result.items] : result.items;
      this.activeGameCount = result.totalItems;
      this.currentPage = result.page;
      this.hasMoreGames = result.page < result.totalPages;
    } catch (err) {
      console.error('Failed to load active games:', err);
      this.gamesError = 'LIVE FEED UNAVAILABLE';
    } finally {
      this.isLoadingGames = false;
      this.cdr.detectChanges();
    }
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
