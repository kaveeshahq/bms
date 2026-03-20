import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BookTitleService } from '../../../core/services/book-title.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BookTitle } from '../../../models/book-title.model';
import { InventoryModal } from '../inventory-modal/inventory-modal';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail implements OnInit, OnDestroy {
  bookTitle: BookTitle | null = null;
  currentTheme$ = of('light');
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private bookTitleService: BookTitleService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    this.loadBookTitle(id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookTitle(id: number) {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.bookTitleService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.bookTitle = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading book title', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteBookTitle() {
    if (
      this.bookTitle &&
      confirm(
        'Are you sure you want to delete this book title?\nAll copies will be deleted as well.',
      )
    ) {
      this.bookTitleService
        .delete(this.bookTitle.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.router.navigate(['/books']),
          error: (err) => console.error('Error deleting book title', err),
        });
    }
  }

  openInventoryModal() {
    if (!this.bookTitle) return;

    const dialogRef = this.dialog.open(InventoryModal, {
      width: '600px',
      maxWidth: '90vw',
      data: { bookTitle: this.bookTitle },
      panelClass: 'inventory-modal-panel',
      autoFocus: false,
    });

    // Scroll to top when modal opens to ensure it's visible
    window.scrollTo({ top: 0, behavior: 'smooth' });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.bookTitle = result;
          this.cdr.markForCheck();
        }
      });
  }

  getAvailabilityPercentage(): number {
    if (!this.bookTitle || this.bookTitle.totalCopies === 0) return 0;
    return Math.round((this.bookTitle.availableCopies / this.bookTitle.totalCopies) * 100);
  }

  getAvailabilityColor(): string {
    const percentage = this.getAvailabilityPercentage();
    if (percentage === 0) return 'warn';
    if (percentage <= 25) return 'accent';
    return 'primary';
  }
}
