import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <h1>Welcome to Hangman</h1>
      <button (click)="login()">Login with Google</button>
      <p *ngIf="error" class="error">{{ error }}</p>
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
      }
      h1 {
        margin-bottom: 2rem;
        text-align: center;
        line-height: 1.5;
        font-size: 24px;
        text-shadow: 4px 4px 0px #1a1a1a;
      }
      .error {
        color: #ff3333;
        margin-top: 20px;
        font-size: 12px;
      }
    `,
  ],
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  error = '';

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
}
