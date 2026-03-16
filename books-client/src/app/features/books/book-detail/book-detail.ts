import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetail implements OnInit {
  book: Book | null = null;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    this.bookService.getById(id).subscribe({
      next: (data) => {
        this.book = data;
        this.cdr.markForCheck(); 
      },
      error: (err) => console.error('Error loading book', err)
    });
  }

  deleteBook() {
    if (this.book && confirm('Are you sure you want to delete this book?')) {
      this.bookService.delete(this.book.id).subscribe({
        next: () => this.router.navigate(['/books']),
        error: (err) => console.error('Error deleting book', err)
      });
    }
  }
}