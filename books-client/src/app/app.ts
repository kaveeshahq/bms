import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from './book.model';
import { BookService } from './book.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  books: Book[] = [];
  book: Book = { id: 0, title: '', author: '', isbn: '', publicationDate: '' };
  isEditing = false;
  showForm = false;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.books = data;
    });
  }

  openAddForm(): void {
    this.book = { id: 0, title: '', author: '', isbn: '', publicationDate: '' };
    this.isEditing = false;
    this.showForm = true;
  }

  editBook(b: Book): void {
    this.book = { ...b, publicationDate: b.publicationDate.substring(0, 10) };
    this.isEditing = true;
    this.showForm = true;
  }

  saveBook(): void {
    if (this.isEditing) {
      this.bookService.updateBook(this.book.id, this.book).subscribe(() => {
        this.loadBooks();
        this.cancelForm();
      });
    } else {
      this.bookService.addBook(this.book).subscribe(() => {
        this.loadBooks();
        this.cancelForm();
      });
    }
  }

  deleteBook(id: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe(() => {
        this.loadBooks();
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.book = { id: 0, title: '', author: '', isbn: '', publicationDate: '' };
    this.isEditing = false;
  }
}
