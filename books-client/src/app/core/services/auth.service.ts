import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, LoginDto, RegisterDto } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

private apiUrl = `${environment.apiUrl}/api/auth`;
  constructor(private http: HttpClient, private router: Router) {}

  login(data: LoginDto) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  register(data: RegisterDto) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  saveToken(token: string, email: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}