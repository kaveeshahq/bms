import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../../core/services/book.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../models/category.model';
import { CreateBookDto } from '../../../models/book.model';

@Component({
  selector: 'app-book-form',
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
  templateUrl: './book-form.html',
  styleUrl: './book-form.css'
})
export class BookForm implements OnInit {
  isEditing = false;
  bookId: number | null = null;
  errorMessage = '';
  categories: Category[] = [];

formData: CreateBookDto = {
  bookId: '',
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publishedYear: undefined,
  categoryId: 0
};

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories', err)
    });

    this.bookId = this.route.snapshot.params['id']
      ? Number(this.route.snapshot.params['id'])
      : null;

    if (this.bookId) {
      this.isEditing = true;
      this.bookService.getById(this.bookId).subscribe({
 next: (book) => {
  this.formData = {
    bookId: book.bookId,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publisher: book.publisher ?? '',
    publishedYear: book.publishedYear,
    categoryId: book.categoryId
  };
},
        error: (err) => console.error('Error loading book', err)
      });
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.isEditing && this.bookId) {
      this.bookService.update(this.bookId, this.formData).subscribe({
        next: () => this.router.navigate(['/books']),
        error: () => this.errorMessage = 'Failed to update book. Please try again.'
      });
    } else {
      this.bookService.create(this.formData).subscribe({
        next: () => this.router.navigate(['/books']),
        error: () => this.errorMessage = 'Failed to add book. Please try again.'
      });
    }
  }
}