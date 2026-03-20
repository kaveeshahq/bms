import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookTitleService } from '../../../core/services/book-title.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BookTitle, BookCopy } from '../../../models/book-title.model';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './inventory-modal.html',
  styleUrl: './inventory-modal.css'
})
export class InventoryModal implements OnInit, OnDestroy {
  currentTheme$!: Observable<string>;
  private destroy$ = new Subject<void>();

  bookTitle: BookTitle;
  isAddingCopy = false;
  newBarcodeId = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { bookTitle: BookTitle },
    public dialogRef: MatDialogRef<InventoryModal>,
    private bookTitleService: BookTitleService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.bookTitle = data.bookTitle;
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    this.refreshBookData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshBookData() {
    this.bookTitleService.getById(this.bookTitle.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.bookTitle = updated;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to refresh book data', err);
          this.errorMessage = 'Failed to refresh inventory.';
          this.cdr.markForCheck();
        }
      });
  }

  addCopy() {
    if (!this.newBarcodeId.trim()) {
      this.errorMessage = 'Please enter a barcode ID (or leave blank)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const newTotalCopies = this.bookTitle.totalCopies + 1;

    this.bookTitleService.updateCopyCount(this.bookTitle.id, newTotalCopies)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.bookTitle = updated;
          this.successMessage = 'Copy added successfully!';
          this.newBarcodeId = '';
          this.isAddingCopy = false;
          this.isLoading = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to add copy. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  removeCopy(copyId: number) {
    if (!confirm('Are you sure you want to remove this copy?')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.bookTitleService.deleteCopy(copyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Copy removed successfully!';
          this.refreshBookData();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to remove copy. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Issued':
        return 'status-issued';
      case 'Reserved':
        return 'status-reserved';
      case 'Damaged':
        return 'status-damaged';
      case 'Lost':
        return 'status-lost';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Available':
        return 'check_circle';
      case 'Issued':
        return 'local_shipping';
      case 'Reserved':
        return 'event_available';
      case 'Damaged':
        return 'build';
      case 'Lost':
        return 'help_outline';
      default:
        return 'info';
    }
  }

  closeModal() {
    this.dialogRef.close(this.bookTitle);
  }
}
