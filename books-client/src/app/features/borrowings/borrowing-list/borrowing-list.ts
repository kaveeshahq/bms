import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BorrowingService } from '../../../core/services/borrowing.service';
import { Borrowing } from '../../../models/borrowing.model';

@Component({
  selector: 'app-borrowing-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './borrowing-list.html',
  styleUrl: './borrowing-list.css'
})
export class BorrowingList implements OnInit {
  borrowings: Borrowing[] = [];
  displayedColumns = ['book', 'member', 'issueDate', 'dueDate', 'status', 'fine', 'actions'];

  constructor(
    private borrowingService: BorrowingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBorrowings();
  }

  loadBorrowings() {
    this.borrowingService.getAll().subscribe({
      next: (data) => {
        this.borrowings = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading borrowings', err)
    });
  }

  returnBook(id: number) {
    if (confirm('Confirm return of this book?')) {
      this.borrowingService.return(id).subscribe({
        next: () => this.loadBorrowings(),
        error: (err) => console.error('Error returning book', err)
      });
    }
  }

  renewBook(id: number) {
    if (confirm('Renew this borrowing for 14 more days?')) {
      this.borrowingService.renew(id).subscribe({
        next: () => this.loadBorrowings(),
        error: (err) => console.error('Error renewing book', err)
      });
    }
  }
}