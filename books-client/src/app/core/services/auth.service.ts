import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, LoginDto, RegisterDto } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5164/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // Send login request to backend
  login(data: LoginDto) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  // Send register request to backend
  register(data: RegisterDto) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  // Save token to localStorage after login
  saveToken(token: string, email: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get role from localStorage
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // Get email from localStorage
  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Logout — clear everything and go to login page
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}