import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (snackbarService.message(); as msg) {
      <div class="snackbar" [class.success]="msg.type === 'success'" [class.error]="msg.type === 'error'">
        <span class="snackbar-text">{{ msg.text }}</span>
        <button class="snackbar-close" (click)="snackbarService.dismiss()">&times;</button>
      </div>
    }
  `,
  styles: [`
    .snackbar {
      position: fixed;
      bottom: 24px;
      left: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-radius: 6px;
      color: var(--color-white);
      font-family: var(--font-family);
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      max-width: 420px;
    }
    .success { background: var(--color-success); }
    .error { background: var(--color-danger); }
    .snackbar-text { flex: 1; }
    .snackbar-close {
      background: none;
      border: none;
      color: var(--color-white);
      font-size: 18px;
      cursor: pointer;
      padding: 0 2px;
      line-height: 1;
      opacity: 0.8;
    }
    .snackbar-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackbarComponent {
  readonly snackbarService = inject(SnackbarService);
}
