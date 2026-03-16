import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
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
    private http: HttpClient,
    private cdr: ChangeDetectorRef
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
          this.cdr.markForCheck(); // ← tell Angular to re-render
        },
        error: (err) => console.error('Error loading stats', err)
      });
  }
}