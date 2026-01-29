import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../services/game';
import { RetroCheckboxComponent } from '../components/retro-checkbox/retro-checkbox';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RetroCheckboxComponent],
  templateUrl: './create-game.html',
  styleUrl: './create-game.scss',
})
export class CreateGame {
  word: string = '';
  isPrivate: boolean = false;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private gameService: GameService,
    private router: Router,
  ) {}

  async onCreate() {
    if (!this.word || this.word.length < 3) {
      this.error = 'Word must be at least 3 letters long.';
      return;
    }

    // regex to check for letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(this.word)) {
      this.error = 'Word must contain only letters and spaces.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const game = await this.gameService.createGame(this.word, this.isPrivate);
      this.router.navigate(['/game', game['display_id']]);
    } catch (err: any) {
      console.error(err);
      this.error = 'Failed to create game. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
