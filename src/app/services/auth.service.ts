import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://pb-hangman-backend.fly.dev');
  }

  async loginWithGoogle() {
    return this.pb.collection('users').authWithOAuth2({ provider: 'google' });
  }

  logout() {
    this.pb.authStore.clear();
  }

  get client() {
    return this.pb;
  }

  get isLoggedIn() {
    return this.pb.authStore.isValid;
  }

  get currentUser() {
    return this.pb.authStore.model;
  }
}
