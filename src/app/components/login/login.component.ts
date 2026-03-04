import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);

  readonly isSignUp = signal<boolean>(false);
  readonly username = signal<string>('');
  readonly password = signal<string>('');
  readonly confirmPassword = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  toggleMode(): void {
    this.isSignUp.update(v => !v);
    this.resetForm();
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    if (this.isSignUp()) {
      this.handleRegister();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin(): void {
    const user = this.username().trim();
    const pass = this.password();

    if (!user || !pass) {
      this.snackbar.showError('Please fill in all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.authService.login({ username: user, password: pass }).subscribe({
      next: () => {
        this.snackbar.showSuccess('Login successful!');
        this.router.navigate(['/dashboard']);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleRegister(): void {
    const user = this.username().trim();
    const pass = this.password();
    const confirm = this.confirmPassword();

    if (!user || !pass || !confirm) {
      this.snackbar.showError('Please fill in all required fields.');
      return;
    }

    if (pass !== confirm) {
      this.snackbar.showError('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.authService.register({ username: user, password: pass, role: '' }).subscribe({
      next: (response) => {
        this.snackbar.showSuccess(response || 'User created successfully');
        this.isSignUp.set(false);
        this.resetForm();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private resetForm(): void {
    this.username.set('');
    this.password.set('');
    this.confirmPassword.set('');
  }
}
