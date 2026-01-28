import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private authService: AuthService) {}

  async createGame(word: string) {
    const displayId = this.generateDisplayId();
    // Normalize word: trim whitespace and replace multiple spaces with single space
    const normalizedWord = word.trim().replace(/\s+/g, ' ').toUpperCase();

    const data = {
      word: normalizedWord,
      display_id: displayId,
      status: 'waiting',
      created_by: this.authService.currentUser?.id,
      guesses: JSON.stringify([]), // Store as JSON string if simple array doesn't work, but array should work in PB. Let's assume array.
      wrong_guesses: 0,
    };

    // Note: 'guesses' field in PB can be a JSON type.

    return await this.authService.client.collection('games').create(data);
  }

  async getGame(displayId: string) {
    return await this.authService.client
      .collection('games')
      .getFirstListItem(`display_id="${displayId}"`);
  }

  async updateGame(recordId: string, data: any) {
    return await this.authService.client.collection('games').update(recordId, data);
  }

  async getAllGames() {
    return await this.authService.client.collection('games').getFullList({
      sort: '-created',
    });
  }

  async deleteGame(recordId: string) {
    return await this.authService.client.collection('games').delete(recordId);
  }

  subscribeToGame(recordId: string, callback: (e: any) => void) {
    return this.authService.client.collection('games').subscribe(recordId, callback);
  }

  unsubscribeFromGame(recordId: string) {
    return this.authService.client.collection('games').unsubscribe(recordId);
  }

  private generateDisplayId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
