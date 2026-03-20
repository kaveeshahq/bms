import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  userEmail = '';
  userInitial = '';
  currentTheme$!: Observable<string>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.userEmail = this.authService.getEmail() ?? 'User';
    this.currentTheme$ = this.themeService.getTheme$();
    this.userInitial = this.userEmail.charAt(0).toUpperCase();
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    // Apply theme to the layout element
    this.currentTheme$.subscribe(theme => {
      const element = document.querySelector('app-layout');
      if (element) {
        element.setAttribute('data-theme', theme);
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}