import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../../models/category.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
private apiUrl = `${environment.apiUrl}/api/categories`;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(this.apiUrl);
  }
}