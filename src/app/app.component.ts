import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnackbarComponent } from './components/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SnackbarComponent],
  template: `
    <router-outlet />
    <app-snackbar />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
