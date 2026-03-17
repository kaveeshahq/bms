import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fine } from '../../models/fine.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class FineService {
private apiUrl = `${environment.apiUrl}/api/fines`;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Fine[]>(this.apiUrl);
  }

  pay(fineId: number) {
    return this.http.post(`${this.apiUrl}/pay/${fineId}`, {});
  }
}