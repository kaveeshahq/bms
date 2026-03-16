import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fine } from '../../models/fine.model';

@Injectable({
  providedIn: 'root'
})
export class FineService {
  private apiUrl = 'http://localhost:5164/api/fines';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Fine[]>(this.apiUrl);
  }

  pay(fineId: number) {
    return this.http.post(`${this.apiUrl}/pay/${fineId}`, {});
  }
}