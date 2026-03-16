import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BorrowingService } from '../../../core/services/borrowing.service';
import { BookService } from '../../../core/services/book.service';
import { MemberService } from '../../../core/services/member.service';
import { Book } from '../../../models/book.model';
import { Member } from '../../../models/member.model';
import { IssueBorrowingDto } from '../../../models/borrowing.model';

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
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './issue-book.html',
  styleUrl: './issue-book.css'
})
export class IssueBook implements OnInit {
  availableBooks: Book[] = [];
  members: Member[] = [];
  errorMessage = '';
  successMessage = '';

  formData: IssueBorrowingDto = {
    bookId: 0,
    memberId: 0,
    dueDays: 14
  };

  constructor(
    private borrowingService: BorrowingService,
    private bookService: BookService,
    private memberService: MemberService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load only available books
    this.bookService.getAll().subscribe({
      next: (books) => {
        this.availableBooks = books.filter(b => b.status === 'Available');
      }
    });

    // Load active members
    this.memberService.getAll().subscribe({
      next: (members) => {
        this.members = members.filter(m => m.isActive);
      }
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    this.borrowingService.issue(this.formData).subscribe({
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