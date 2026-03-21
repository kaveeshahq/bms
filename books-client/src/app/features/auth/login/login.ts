import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  isRegisterMode = false;
  email = '';
  password = '';
  confirmPassword = '';
  role = 'Member';
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          this.authService.saveToken(response.token, response.email, response.role);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMessage = 'Invalid email or password. Please try again.';
        }
      });
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: (response) => {
        this.successMessage = '✓ Account created! Signing you in...';
        this.isLoading = false;
        setTimeout(() => {
          this.authService.saveToken(response.token, response.email, response.role);
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Try a different email.';
      }
    });
  }

  toggleAuthMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.role = 'Member';
  }
}