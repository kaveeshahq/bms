import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  userEmail = '';
  userInitial = '';

  constructor(private authService: AuthService) {
    this.userEmail = this.authService.getEmail() ?? 'User';
    this.userInitial = this.userEmail.charAt(0).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}