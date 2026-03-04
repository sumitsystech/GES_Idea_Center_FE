import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error';

export interface SnackbarMessage {
  readonly text: string;
  readonly type: SnackbarType;
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly messageState = signal<SnackbarMessage | null>(null);
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly message = this.messageState.asReadonly();

  showSuccess(text: string): void {
    this.show({ text, type: 'success' });
  }

  showError(text: string): void {
    this.show({ text, type: 'error' });
  }

  dismiss(): void {
    this.messageState.set(null);
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private show(msg: SnackbarMessage): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.messageState.set(msg);
    this.hideTimeout = setTimeout(() => {
      this.messageState.set(null);
      this.hideTimeout = null;
    }, 4000);
  }
}
