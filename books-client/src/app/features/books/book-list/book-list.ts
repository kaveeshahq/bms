import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BookTitleService } from '../../../core/services/book-title.service';
import { BookTitle } from '../../../models/book-title.model';
import { ThemeService } from '../../../core/services/theme.service';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList implements OnInit, OnDestroy {
  bookTitles: BookTitle[] = [];
  searchTerm = '';
  isLoading = true;
  currentTheme$ = of('light');
  private destroy$ = new Subject<void>();

  constructor(
    private bookTitleService: BookTitleService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    this.loadBookTitles();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookTitles() {
    this.isLoading = true;
    this.bookTitleService.getAll(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.bookTitles = data as BookTitle[];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading book titles', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  onSearch() {
    this.loadBookTitles();
  }

  deleteBookTitle(id: number) {
    if (confirm('Are you sure you want to delete this book title and all its copies?')) {
      this.bookTitleService.delete(id).subscribe({
        next: () => this.loadBookTitles(),
        error: (err) => console.error('Error deleting book title', err)
      });
    }
  }

  getAvailabilityPercentage(book: BookTitle): number {
    if (book.totalCopies === 0) return 0;
    return Math.round((book.availableCopies / book.totalCopies) * 100);
  }

  getStatusColor(available: number, total: number): string {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'warn';
    if (percentage <= 25) return 'accent';
    return 'primary';
  }
}