import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../core/types';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="landing-gradient flex-center" style="min-height:100vh;padding: var(--space-6)">
      <div style="width:100%;max-width:420px">
        <div style="text-align:center;margin-bottom: var(--space-7)">
          <a routerLink="/" style="display:inline-flex;align-items:center;gap:12px;text-decoration:none">
            <div class="navbar-logo" style="width:48px;height:48px;font-size:22px">G</div>
          </a>
          <h1 style="font-family:var(--font-display);font-size:24px;font-weight:500;letter-spacing:-0.015em;margin:16px 0 4px">Iniciar sesión</h1>
          <p style="font-size:14px;color:var(--color-text-secondary);margin:0">Ingresá a tu cuenta para continuar</p>
        </div>

        <div class="card animate-fade">
          <form (ngSubmit)="onSubmit()" class="stack" style="gap: var(--space-5)">
            <div class="input-group">
              <label class="input-label" for="login-email">Email</label>
              <input
                id="login-email"
                [(ngModel)]="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                class="input"
                autocomplete="email"
                required>
            </div>
            <div class="input-group">
              <label class="input-label" for="login-pass">Contraseña</label>
              <input
                id="login-pass"
                [(ngModel)]="password"
                name="password"
                type="password"
                placeholder="••••••••"
                class="input"
                autocomplete="current-password"
                required>
            </div>

            @if (error()) {
              <div class="alert alert-danger" role="alert">
                <span class="alert-icon">!</span>
                <div class="alert-content">{{ error() }}</div>
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn btn-primary btn-block" style="height:44px">
              @if (loading()) {
                <span class="spinner"></span>
                <span>Ingresando…</span>
              } @else {
                <span>Ingresar</span>
              }
            </button>
          </form>

          <div class="divider" style="margin: var(--space-5) 0 var(--space-4)"></div>

          <p style="color:var(--color-text-secondary);margin:0;text-align:center;font-size:14px">
            ¿No tenés cuenta?
            <a routerLink="/register" style="color:var(--color-primary);font-weight:500">Registrate</a>
          </p>

          @if (showDemoCredentials) {
            <div style="margin-top: var(--space-5);background:var(--color-bg-elevated);border-radius:var(--radius-md);padding:14px;border:1px dashed var(--color-border)">
              <div style="font-weight:600;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:var(--color-text-secondary);margin-bottom:8px">Credenciales de prueba</div>
              <div class="stack-sm" style="font-size:13px;color:var(--color-text-secondary)">
                <div class="row-between">
                  <span>Admin</span>
                  <span style="font-family:var(--font-mono);color:var(--color-text)">admin&#64;gym.com / admin123</span>
                </div>
                <div class="row-between">
                  <span>Coach</span>
                  <span style="font-family:var(--font-mono);color:var(--color-text)">coach&#64;gym.com / coach123</span>
                </div>
                <div class="row-between">
                  <span>Member</span>
                  <span style="font-family:var(--font-mono);color:var(--color-text)">member&#64;gym.com / member123</span>
                </div>
              </div>
            </div>
          }
        </div>

        <p style="text-align:center;margin-top: var(--space-5);font-size:12px;color:var(--color-text-muted)">
          © AI Gym Retention · Demo project
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  showDemoCredentials = !this.isProduction();

  onSubmit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: AuthResponse) => {
        this.loading.set(false);
        const role = res.user.role;
        this.router.navigate([`/${role}/dashboard`]);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas. Verificá tu email y contraseña.');
      },
    });
  }

  private isProduction(): boolean {
    try { return (window as any).__env?.production ?? false; }
    catch { return false; }
  }
}
