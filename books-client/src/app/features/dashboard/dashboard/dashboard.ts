import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userEmail = '';
  totalBooks = 0;
  totalMembers = 0;
  activeBorrowings = 0;
  pendingFines = 0;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.userEmail = this.authService.getEmail() ?? 'User';
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any>('http://localhost:5164/api/dashboard/stats')
      .subscribe({
        next: (data) => {
          this.totalBooks = data.totalBooks;
          this.totalMembers = data.totalMembers;
          this.activeBorrowings = data.activeBorrowings;
          this.pendingFines = data.pendingFines;
        },
        error: (err) => console.error('Error loading stats', err)
      });
  }

  logout() {
    this.authService.logout();
  }
}