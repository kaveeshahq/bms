import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { BookTitleService } from '../../../core/services/book-title.service';
import { CategoryService } from '../../../core/services/category.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Category } from '../../../models/category.model';
import { CreateBookTitleDto, UpdateBookTitleDto } from '../../../models/book-title.model';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSliderModule
  ],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css'
})
export class BookForm implements OnInit, OnDestroy {
  isEditing = false;
  bookId: number | null = null;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  categories: Category[] = [];
  currentTheme$!: Observable<string>;
  private destroy$ = new Subject<void>();

  formData: CreateBookTitleDto = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishedYear: undefined,
    totalCopies: 1,
    categoryId: 0
  };

  formDataUpdate: UpdateBookTitleDto = {
    title: '',
    author: '',
    publisher: '',
    publishedYear: undefined,
    categoryId: 0
  };

  constructor(
    private bookTitleService: BookTitleService,
    private categoryService: CategoryService,
    private themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    this.categoryService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading categories', err)
      });

    this.bookId = this.route.snapshot.params['id']
      ? Number(this.route.snapshot.params['id'])
      : null;

    if (this.bookId) {
      this.isEditing = true;
      this.bookTitleService.getById(this.bookId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (book) => {
            this.formDataUpdate = {
              title: book.title,
              author: book.author,
              publisher: book.publisher ?? '',
              publishedYear: book.publishedYear,
              categoryId: book.categoryId
            };
            this.formData.totalCopies = book.totalCopies;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error loading book title', err);
            this.errorMessage = 'Failed to load book details.';
            this.cdr.markForCheck();
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (!this.validateForm()) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    if (this.isEditing && this.bookId) {
      this.bookTitleService.update(this.bookId, this.formDataUpdate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Book updated successfully!';
            setTimeout(() => this.router.navigate(['/books']), 1500);
          },
          error: (err) => {
            console.error('Error updating book', err);
            this.errorMessage = 'Failed to update book. Please try again.';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.bookTitleService.create(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Book added successfully!';
            setTimeout(() => this.router.navigate(['/books']), 1500);
          },
          error: (err) => {
            console.error('Error creating book', err);
            this.errorMessage = 'Failed to add book. Please try again.';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  private validateForm(): boolean {
    const data = this.isEditing ? this.formDataUpdate : this.formData;

    if (!data.title?.trim()) {
      this.errorMessage = 'Title is required';
      return false;
    }

    if (!data.author?.trim()) {
      this.errorMessage = 'Author is required';
      return false;
    }

    if (!data.categoryId) {
      this.errorMessage = 'Please select a category';
      return false;
    }

    if (!this.isEditing) {
      const createData = this.formData as CreateBookTitleDto;
      if (!createData.isbn?.trim()) {
        this.errorMessage = 'ISBN is required';
        return false;
      }
      if (createData.totalCopies < 1) {
        this.errorMessage = 'At least 1 copy is required';
        return false;
      }
    }

    return true;
  }

  isCreateMode(): boolean {
    return !this.isEditing;
  }
}