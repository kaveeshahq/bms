import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book, CreateBookDto, UpdateBookDto } from '../../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:5164/api/books';

  constructor(private http: HttpClient) {}

  // Get all books with optional search
  getAll(search?: string) {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Book[]>(this.apiUrl, { params });
  }

  // Get single book by id
  getById(id: number) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  // Create new book
  create(dto: CreateBookDto) {
    return this.http.post<Book>(this.apiUrl, dto);
  }

  // Update existing book
  update(id: number, dto: UpdateBookDto) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  // Delete book
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}