import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="panel">
        <h1>Welcome to Hangman</h1>
        
        <button class="retro-btn primary" (click)="login()">Login with Google</button>
        
        <div class="divider">
          <span>OR</span>
        </div>

        <div class="join-section">
          <label>ENTER GAME CODE:</label>
          <div class="input-group">
            <input 
              type="text" 
              [(ngModel)]="gameCode" 
              placeholder="XXXXXX" 
              maxlength="6"
              (keyup.enter)="joinGame()"
              class="retro-input"
            >
            <button class="retro-btn secondary" (click)="joinGame()" [disabled]="!isValidCode">
              JOIN
            </button>
          </div>
        </div>

        <p *ngIf="error" class="error">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 20px;
      }
      .panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        width: 100%;
        max-width: 400px;
      }
      h1 {
        margin-bottom: 1rem;
        text-align: center;
        line-height: 1.5;
        font-size: 24px;
        text-shadow: 4px 4px 0px #1a1a1a;
      }
      .divider {
        display: flex;
        align-items: center;
        width: 100%;
        color: #666;
        font-size: 14px;
        margin: 10px 0;
      }
      .divider::before, .divider::after {
        content: '';
        flex: 1;
        border-bottom: 2px dashed #666;
      }
      .divider span {
        padding: 0 10px;
      }
      .join-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .input-group {
        display: flex;
        gap: 8px;
      }
      .retro-input {
        flex: 1;
        padding: 12px;
        font-family: inherit;
        font-size: 16px;
        text-transform: uppercase;
        border: 4px solid #1a1a1a;
        background: #fff;
        outline: none;
      }
      .retro-input:focus {
        border-color: #4a4a4a;
      }
      .retro-btn {
        padding: 12px 24px;
        font-family: inherit;
        font-weight: bold;
        text-transform: uppercase;
        border: 4px solid #1a1a1a;
        cursor: pointer;
        box-shadow: 4px 4px 0px #1a1a1a;
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .retro-btn:active {
        transform: translate(2px, 2px);
        box-shadow: 2px 2px 0px #1a1a1a;
      }
      .retro-btn.primary {
        background: #ffcc00;
        width: 100%;
      }
      .retro-btn.secondary {
        background: #00ccff;
      }
      .retro-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        box-shadow: none;
        transform: translate(2px, 2px);
      }
      .error {
        color: #ff3333;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  error = '';
  gameCode = '';

  get isValidCode() {
    return this.gameCode && this.gameCode.length === 6;
  }

  async login() {
    this.error = '';
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (err: any) {
      console.error(err);
      this.error = 'Login failed: ' + (err.message || err);
    }
  }

  joinGame() {
    if (!this.isValidCode) {
      this.error = 'Please enter a valid 6-character code';
      return;
    }
    this.router.navigate(['/game', this.gameCode.toUpperCase()]);
  }
}
