import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeBorrowings: number;
  pendingFines: number;
  availableBooks: number;
  overdueBooks: number;
  totalFinesAmount: number;
  categoriesCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  userEmail = '';
  stats: DashboardStats = {
    totalBooks: 0,
    totalMembers: 0,
    activeBorrowings: 0,
    pendingFines: 0,
    availableBooks: 0,
    overdueBooks: 0,
    totalFinesAmount: 0,
    categoriesCount: 0
  };
  isLoading = true;
  currentTheme$!: Observable<string>;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.userEmail = this.authService.getEmail() ?? 'User';
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    this.loadStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats() {
    this.isLoading = true;
    this.http.get<DashboardStats>(`${environment.apiUrl}/api/dashboard/stats`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = {
            totalBooks: data.totalBooks || 0,
            totalMembers: data.totalMembers || 0,
            activeBorrowings: data.activeBorrowings || 0,
            pendingFines: data.pendingFines || 0,
            availableBooks: data.availableBooks || 0,
            overdueBooks: data.overdueBooks || 0,
            totalFinesAmount: data.totalFinesAmount || 0,
            categoriesCount: data.categoriesCount || 0
          };
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading stats', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  getAvailablePercentage(): number {
    if (!this.stats || this.stats.totalBooks === 0) {
      return 0;
    }
    const stats = this.stats;
    const percentage = Math.round((stats.availableBooks / stats.totalBooks) * 100);
    return percentage;
  }

  getBorrowingPercentage(): number {
    if (!this.stats || this.stats.totalBooks === 0) {
      return 0;
    }
    const stats = this.stats;
    const percentage = Math.round((stats.activeBorrowings / stats.totalBooks) * 100);
    return percentage;
  }
}