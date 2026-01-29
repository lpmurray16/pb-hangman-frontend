import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent implements OnInit {
  games: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.loadGames();
  }

  async loadGames() {
    console.log('AdminComponent: Starting loadGames');
    this.loading = true;
    this.error = null;
    try {
      console.log('AdminComponent: Calling gameService.getAllGames');
      this.games = await this.gameService.getAllGames();
      console.log('AdminComponent: Games loaded', this.games);
    } catch (error) {
      console.error('Error loading games:', error);
      this.error = 'Failed to load games. Please check your connection or permissions.';
    } finally {
      console.log('AdminComponent: Finished loadGames');
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteGame(gameId: string) {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await this.gameService.deleteGame(gameId);
      this.games = this.games.filter((g) => g.id !== gameId);
      this.cdr.detectChanges(); // Manually trigger change detection to update UI
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  }
}
