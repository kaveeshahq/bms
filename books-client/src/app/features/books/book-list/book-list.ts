import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookList implements OnInit {
  books: Book[] = [];
  searchTerm = '';
  displayedColumns = ['title', 'author', 'isbn', 'category', 'status', 'actions'];

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getAll(this.searchTerm).subscribe({
      next: (data) => {
        this.books = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading books', err)
    });
  }

  onSearch() {
    this.loadBooks();
  }

  deleteBook(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.delete(id).subscribe({
        next: () => this.loadBooks(),
        error: (err) => console.error('Error deleting book', err)
      });
    }
  }
}