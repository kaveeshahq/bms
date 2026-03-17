import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Member, CreateMemberDto, UpdateMemberDto } from '../../models/member.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MemberService {
private apiUrl = `${environment.apiUrl}/api/members`;
  constructor(private http: HttpClient) {}

  getAll(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Member[]>(this.apiUrl, { params });
  }

  getById(id: number) {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  getByMemberId(memberId: string) {
    return this.http.get<Member>(`${this.apiUrl}/lookup/${memberId}`);
  }

  create(dto: CreateMemberDto) {
    return this.http.post<Member>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateMemberDto) {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}