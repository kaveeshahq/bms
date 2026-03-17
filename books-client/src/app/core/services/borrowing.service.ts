import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Borrowing, IssueBorrowingDto } from '../../models/borrowing.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BorrowingService {
private apiUrl = `${environment.apiUrl}/api/borrowings`;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Borrowing[]>(this.apiUrl);
  }

  getByMember(memberId: number) {
    return this.http.get<Borrowing[]>(`${this.apiUrl}/member/${memberId}`);
  }

  issue(dto: IssueBorrowingDto) {
    return this.http.post<Borrowing>(`${this.apiUrl}/issue`, dto);
  }

  return(borrowingId: number) {
    return this.http.post<Borrowing>(`${this.apiUrl}/return/${borrowingId}`, {});
  }

  renew(borrowingId: number) {
    return this.http.post(`${this.apiUrl}/renew/${borrowingId}`, {});
  }
}