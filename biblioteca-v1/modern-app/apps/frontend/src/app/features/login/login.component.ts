import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      background: #1a237e;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      background: #fff;
      border-radius: 12px;
      padding: 40px 36px;
      width: 360px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .login-header mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1a237e;
    }
    .login-header h1 {
      margin: 8px 0 4px;
      font-size: 24px;
      font-weight: 700;
      color: #1a237e;
    }
    .login-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    mat-form-field { width: 100%; margin-bottom: 4px; }
    .login-btn {
      width: 100%;
      margin-top: 16px;
      height: 44px;
      font-size: 16px;
    }
    .error-msg {
      color: #c62828;
      font-size: 13px;
      margin-top: 8px;
      text-align: center;
    }
  `],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <mat-icon>auto_stories</mat-icon>
          <h1>Biblioteca</h1>
          <p>Sistema de Gestión de Biblioteca</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="username" autocomplete="username" />
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              [type]="showPass() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
            />
            <button mat-icon-button matSuffix type="button" (click)="showPass.update(v => !v)">
              <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (error()) {
            <p class="error-msg">{{ error() }}</p>
          }

          <button
            mat-flat-button
            class="login-btn"
            type="submit"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <mat-spinner diameter="20" />
            } @else {
              Ingresar
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading  = signal(false);
  error    = signal<string | null>(null);
  showPass = signal(false);

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.form.value;

    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: () => {
        this.loading.set(false);
        this.error.set('Usuario o contraseña incorrectos');
      },
    });
  }
}
