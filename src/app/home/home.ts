import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  joinCode: string = '';

  get user() {
    return this.authService.currentUser;
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  createGame() {
    this.router.navigate(['/create-game']);
  }

  joinGame() {
    if (this.joinCode && this.joinCode.length === 6) {
      this.router.navigate(['/game', this.joinCode.toUpperCase()]);
    } else {
      alert('Please enter a valid 6-character code.');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
