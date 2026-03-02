import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeModeState = signal<ThemeMode>('light');
  readonly themeMode = this.themeModeState.asReadonly();

  constructor() {
    this.applyTheme('light');
  }

  toggleTheme(): void {
    const next: ThemeMode = this.themeModeState() === 'light' ? 'dark' : 'light';
    this.themeModeState.set(next);
    this.applyTheme(next);
  }

  private applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
  }
}
