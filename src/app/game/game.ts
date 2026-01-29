import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GameService } from '../services/game';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private sub?: Subscription;

  game: any = null;
  loading: boolean = true;
  error: string = '';
  realtimeStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'connecting';
  isEditingHint: boolean = false;

  // Derived state for display
  displayWords: string[][] = []; // Array of words, where each word is an array of letters
  guessedLetters: Set<string> = new Set();

  // Game state
  maxWrongGuesses = 6;
  currentWrongGuesses = 0;

  // Keyboard
  keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  // Hangman ASCII Art
  hangmanStages = [
    `
  +---+
  |   |
      |
      |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
    `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========
GAME OVER`,
  ];

  async ngOnInit() {
    this.sub = this.route.params.subscribe(async (params) => {
      console.log('Route params:', params);
      const displayId = params['id'];
      if (!displayId) {
        console.error('No displayId in route');
        this.error = 'Invalid game ID';
        this.loading = false;
        return;
      }

      try {
        console.log('Loading game with ID:', displayId);
        await this.loadGame(displayId);
        this.initRealtimeSubscription();
      } catch (err) {
        console.error('Error in ngOnInit:', err);
        this.error = 'Game not found';
        this.loading = false;
      }
    });
  }

  async initRealtimeSubscription() {
    if (!this.game?.id) return;

    console.log('Initializing realtime subscription for:', this.game.id);
    this.realtimeStatus = 'connecting';

    // 10 second timeout for connection
    const timer = setTimeout(() => {
      if (this.realtimeStatus === 'connecting') {
        console.warn('Realtime connection timed out');
        this.zone.run(() => {
          this.realtimeStatus = 'error';
          this.cdr.detectChanges();
        });
      }
    }, 10000);

    this.gameService
      .subscribeToGame(this.game.id, (e) => {
        console.log('Raw realtime event received:', e);
        this.zone.run(() => {
          console.log('Processing event in NgZone');
          this.handleRealtimeUpdate(e);
          this.cdr.detectChanges();
        });
      })
      .then(() => {
        clearTimeout(timer);
        console.log('Realtime subscription established successfully');
        this.zone.run(() => {
          this.realtimeStatus = 'connected';
          this.cdr.detectChanges();
        });
      })
      .catch((err) => {
        clearTimeout(timer);
        console.error('Failed to subscribe to realtime updates:', err);
        this.zone.run(() => {
          this.realtimeStatus = 'error';
          this.cdr.detectChanges();
        });
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.game?.id) {
      this.gameService.unsubscribeFromGame(this.game.id);
    }
  }

  handleRealtimeUpdate(e: any) {
    if (e.action === 'update') {
      console.log('Processing realtime update:', e.record);
      this.game = e.record;
      this.processGameState();
    }
  }

  async loadGame(displayId: string) {
    this.loading = true;
    console.log('loadGame started, loading=true');
    try {
      console.log('Fetching game from service...');
      this.game = await this.gameService.getGame(displayId);
      console.log('Game fetched:', this.game);
      this.processGameState();
      console.log('Game state processed');
    } catch (err) {
      console.error('Error loading game:', err);
      this.error = 'Could not load game. It might not exist.';
    } finally {
      this.loading = false;
      console.log('loadGame finished, loading=false');
      this.cdr.detectChanges();
    }
  }

  processGameState() {
    if (!this.game) return;

    // Parse guesses
    let guesses: string[] = [];
    try {
      // Handle both JSON string or array if PB returns array directly
      guesses =
        typeof this.game.guesses === 'string'
          ? JSON.parse(this.game.guesses)
          : this.game.guesses || [];
    } catch (e) {
      guesses = [];
    }

    this.guessedLetters = new Set(guesses);
    this.currentWrongGuesses = this.game.wrong_guesses;

    // Split word into words and letters for rendering
    const fullWord = this.game.word as string;
    this.displayWords = fullWord.split(' ').map((w) => w.split(''));
  }

  isLetterGuessed(letter: string): boolean {
    return this.guessedLetters.has(letter);
  }

  get hangmanArt() {
    return this.hangmanStages[Math.min(this.currentWrongGuesses, this.hangmanStages.length - 1)];
  }

  async makeGuess(letter: string) {
    if (this.isGameOver || this.isGameWon || this.isLetterGuessed(letter)) {
      return;
    }

    // Optimistic update
    this.guessedLetters.add(letter);
    const fullWord = this.game.word as string;

    if (!fullWord.includes(letter)) {
      this.currentWrongGuesses++;
    }

    // Prepare update for backend
    const guessesArray = Array.from(this.guessedLetters);
    const updateData = {
      guesses: JSON.stringify(guessesArray),
      wrong_guesses: this.currentWrongGuesses,
      status: this.isGameWon ? 'won' : this.isGameOver ? 'lost' : 'playing',
    };

    try {
      await this.gameService.updateGame(this.game.id, updateData);
    } catch (err) {
      console.error('Failed to update game guess:', err);
      // TODO: Revert state if needed
    }
  }

  get isGameOver() {
    return this.currentWrongGuesses >= this.maxWrongGuesses;
  }

  get isCreator(): boolean {
    return this.authService.currentUser?.id === this.game?.created_by;
  }

  async saveHint(hintText: string) {
    if (!this.game) return;
    try {
      await this.gameService.updateGame(this.game.id, { hint: hintText });
      // Optimistic update
      this.game.hint = hintText;
      this.isEditingHint = false;
    } catch (err) {
      console.error('Error saving hint:', err);
    }
  }

  toggleEditHint() {
    this.isEditingHint = !this.isEditingHint;
  }

  get isGameWon() {
    if (!this.game) return false;
    const fullWord = this.game.word as string;
    const letters = fullWord.replace(/\s/g, '').split('');
    return letters.every((l) => this.guessedLetters.has(l));
  }
}
