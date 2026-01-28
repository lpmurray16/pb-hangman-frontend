import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home';
import { CreateGame } from './create-game/create-game';
import { Game } from './game/game';
import { AdminComponent } from './admin/admin';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

// Guard to check if user is logged in
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  }

  return router.parseUrl('/login');
};

// Guard to check if user is admin
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn && authService.currentUser?.id === '1rwvkt8qzn5wwfb') {
    return true;
  }

  return router.parseUrl('/home');
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'create-game',
    component: CreateGame,
    canActivate: [authGuard],
  },
  {
    path: 'game/:id',
    component: Game,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
