import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book, CreateBookDto, UpdateBookDto } from '../../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:5164/api/books';

  constructor(private http: HttpClient) {}

  getAll(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Book[]>(this.apiUrl, { params });
  }

  getById(id: number) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  getByBookId(bookId: string) {
    return this.http.get<Book>(`${this.apiUrl}/lookup/${bookId}`);
  }

  create(dto: CreateBookDto) {
    return this.http.post<Book>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateBookDto) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}