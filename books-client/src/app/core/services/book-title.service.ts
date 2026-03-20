import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { 
  BookTitle, 
  BookTitleList, 
  CreateBookTitleDto, 
  UpdateBookTitleDto,
  UpdateBookCopyCountDto 
} from '../../models/book-title.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookTitleService {
  private apiUrl = `${environment.apiUrl}/api/book-titles`;

  constructor(private http: HttpClient) {}

  /**
   * Get all book titles with optional search
   */
  getAll(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<BookTitleList[]>(this.apiUrl, { params });
  }

  /**
   * Get a specific book title by ID (includes all copies)
   */
  getById(id: number) {
    return this.http.get<BookTitle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get a book title by ISBN
   */
  getByISBN(isbn: string) {
    return this.http.get<BookTitle>(`${this.apiUrl}/isbn/${isbn}`);
  }

  /**
   * Create a new book title with initial copies
   */
  create(dto: CreateBookTitleDto) {
    return this.http.post<BookTitle>(this.apiUrl, dto);
  }

  /**
   * Update book title metadata (title, author, publisher, etc.)
   */
  update(id: number, dto: UpdateBookTitleDto) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Delete a book title (only if no copies are borrowed)
   */
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Update the total copy count (add or remove copies)
   */
  updateCopyCount(id: number, newTotalCopies: number) {
    const dto: UpdateBookCopyCountDto = { newTotalCopies };
    return this.http.put<BookTitle>(`${this.apiUrl}/${id}/copies`, dto);
  }

  /**
   * Delete a specific copy
   */
  deleteCopy(copyId: number) {
    return this.http.delete(`${this.apiUrl}/copies/${copyId}`);
  }

  /**
   * Get count of available copies for a title
   */
  getAvailableCopyCount(id: number) {
    return this.http.get<{ availableCopies: number }>(`${this.apiUrl}/${id}/available-count`);
  }
}
