import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:5164/api/categories';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(this.apiUrl);
  }
}