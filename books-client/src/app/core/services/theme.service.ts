import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-mode';
  private themeSubject = new BehaviorSubject<ThemeMode>(this.initializeTheme());

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  /**
   * Get the current theme as an observable
   */
  getTheme$(): Observable<ThemeMode> {
    return this.themeSubject.asObservable();
  }

  /**
   * Get the current theme synchronously
   */
  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: ThemeMode = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Initialize theme from localStorage or browser preference
   */
  private initializeTheme(): ThemeMode {
    // Check localStorage first (user preference)
    const stored = localStorage.getItem(this.THEME_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Check browser preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light
    return 'light';
  }

  /**
   * Apply theme to the DOM and Angular Material
   */
  private applyTheme(theme: ThemeMode): void {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add('dark-theme');
      htmlElement.classList.remove('light-theme');
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#ffffff';
    } else {
      htmlElement.classList.add('light-theme');
      htmlElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }

  /**
   * Listen to system theme changes
   */
  listenToSystemThemeChanges(): void {
    if (!window.matchMedia) return;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only apply system theme if user hasn't set a preference
      if (!localStorage.getItem(this.THEME_KEY)) {
        const theme: ThemeMode = e.matches ? 'dark' : 'light';
        this.setTheme(theme);
      }
    });
  }
}
