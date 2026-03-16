import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BorrowingService } from '../../../core/services/borrowing.service';
import { BookService } from '../../../core/services/book.service';
import { MemberService } from '../../../core/services/member.service';
import { Book } from '../../../models/book.model';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-issue-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './issue-book.html',
  styleUrl: './issue-book.css'
})
export class IssueBook {
  // Step 1 - Member
  memberIdInput = '';
  foundMember: Member | null = null;
  memberError = '';

  // Step 2 - Book
  bookIdInput = '';
  foundBook: Book | null = null;
  bookError = '';

  // Step 3
  dueDays = 14;
  errorMessage = '';
  successMessage = '';

  constructor(
    private borrowingService: BorrowingService,
    private bookService: BookService,
    private memberService: MemberService,
    private router: Router
  ) {}

  lookupMember() {
    this.memberError = '';
    this.foundMember = null;

    if (!this.memberIdInput) {
      this.memberError = 'Please enter a Member ID';
      return;
    }

    this.memberService.getByMemberId(this.memberIdInput).subscribe({
      next: (member) => {
        this.foundMember = member;
      },
      error: () => {
        this.memberError = 'Member not found. Check the ID and try again.';
      }
    });
  }

  lookupBook() {
    this.bookError = '';
    this.foundBook = null;

    if (!this.bookIdInput) {
      this.bookError = 'Please enter a Book ID';
      return;
    }

    this.bookService.getByBookId(this.bookIdInput).subscribe({
      next: (book) => {
        this.foundBook = book;
        if (book.status !== 'Available') {
          this.bookError = 'This book is not available for issuing.';
        }
      },
      error: () => {
        this.bookError = 'Book not found. Check the ID and try again.';
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.foundMember || !this.foundBook) {
      this.errorMessage = 'Please find both member and book first.';
      return;
    }

    this.borrowingService.issue({
      bookId: this.foundBook.id,
      memberId: this.foundMember.id,
      dueDays: this.dueDays
    }).subscribe({
      next: () => {
        this.successMessage = 'Book issued successfully!';
        setTimeout(() => this.router.navigate(['/borrowings']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to issue book.';
      }
    });
  }
}