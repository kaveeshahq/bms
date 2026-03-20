import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  currentTheme$!: Observable<string>;

  constructor(private themeService: ThemeService) {
    this.currentTheme$ = this.themeService.getTheme$();
  }

  ngOnInit() {
    // Subscribe to theme changes and apply to document
    this.currentTheme$.subscribe(theme => {
      document.documentElement.setAttribute('data-theme', theme);
    });
  }
}