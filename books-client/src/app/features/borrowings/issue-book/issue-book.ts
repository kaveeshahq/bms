import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BorrowingService } from '../../../core/services/borrowing.service';
import { BookTitleService } from '../../../core/services/book-title.service';
import { MemberService } from '../../../core/services/member.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BookTitle, BookCopy } from '../../../models/book-title.model';
import { Member } from '../../../models/member.model';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-issue-book',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './issue-book.html',
  styleUrl: './issue-book.css'
})
export class IssueBook implements OnInit, OnDestroy {
  currentTheme$!: Observable<string>;
  private destroy$ = new Subject<void>();

  // Step 1 - Member
  memberIdInput = '';
  foundMember: Member | null = null;
  memberError = '';
  lookingUpMember = false;

  // Step 2 - Book Title
  bookTitleInput = '';
  foundBookTitle: BookTitle | null = null;
  bookError = '';
  lookingUpBook = false;
  availableCopies: BookCopy[] = [];

  // Step 3 - Copy Selection & Submission
  selectedCopyNumber: number | null = null;
  dueDays = 14;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private borrowingService: BorrowingService,
    private bookTitleService: BookTitleService,
    private memberService: MemberService,
    private themeService: ThemeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  lookupMember() {
    this.memberError = '';
    this.foundMember = null;

    if (!this.memberIdInput.trim()) {
      this.memberError = 'Please enter a Member ID';
      return;
    }

    this.lookingUpMember = true;
    this.cdr.markForCheck();

    this.memberService.getByMemberId(this.memberIdInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.foundMember = member;
          this.lookingUpMember = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.memberError = 'Member not found. Check the ID and try again.';
          this.lookingUpMember = false;
          this.cdr.markForCheck();
        }
      });
  }

  lookupBookTitle() {
    this.bookError = '';
    this.foundBookTitle = null;
    this.availableCopies = [];
    this.selectedCopyNumber = null;

    if (!this.bookTitleInput.trim()) {
      this.bookError = 'Please enter a Title, Author, or ISBN';
      return;
    }

    this.lookingUpBook = true;
    this.cdr.markForCheck();

    this.bookTitleService.getAll(this.bookTitleInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (titles) => {
          if (titles.length === 0) {
            this.bookError = 'No books found matching your search.';
          } else {
            this.foundBookTitle = (titles as BookTitle[])[0]; // Auto-select first match
            
            // Get detailed view with all copies
            this.bookTitleService.getById(titles[0].id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (fullTitle) => {
                  this.foundBookTitle = fullTitle;
                  this.availableCopies = fullTitle.copies.filter(c => c.status === 'Available');
                  
                  if (this.availableCopies.length === 0) {
                    this.bookError = 'This book has no available copies.';
                  } else if (this.availableCopies.length === 1) {
                    this.selectedCopyNumber = this.availableCopies[0].copyNumber;
                  }
                  this.lookingUpBook = false;
                  this.cdr.markForCheck();
                },
                error: () => {
                  this.bookError = 'Failed to load book details.';
                  this.lookingUpBook = false;
                  this.cdr.markForCheck();
                }
              });
          }
          this.lookingUpBook = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.bookError = 'Failed to search for books.';
          this.lookingUpBook = false;
          this.cdr.markForCheck();
        }
      });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.foundMember) {
      this.errorMessage = 'Please find a member first.';
      return;
    }

    if (!this.foundBookTitle) {
      this.errorMessage = 'Please find a book title first.';
      return;
    }

    if (this.availableCopies.length > 0 && !this.selectedCopyNumber) {
      this.errorMessage = 'Please select a copy to issue.';
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.borrowingService.issue({
      bookTitleId: this.foundBookTitle.id,
      memberId: this.foundMember.id,
      copyNumber: this.selectedCopyNumber ?? undefined,
      dueDays: this.dueDays
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Book issued successfully!';
          setTimeout(() => this.router.navigate(['/borrowings']), 1500);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to issue book. Please try again.';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  canSubmit(): boolean {
    return Boolean(
      this.foundMember &&
      this.foundBookTitle &&
      this.availableCopies.length > 0 &&
      (this.selectedCopyNumber !== null) &&
      !this.isSubmitting
    );
  }
}