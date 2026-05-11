import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../core/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="landing-gradient flex-center" style="min-height:100vh;padding:24px">
      <div style="width:100%;max-width:420px">
        <div style="text-align:center;margin-bottom:32px">
          <div class="navbar-logo" style="margin:0 auto 16px;width:56px;height:56px;font-size:24px">G</div>
          <h1 style="font-size:22px;font-weight:700;margin:0 0 4px">AI Gym Retention</h1>
          <p style="font-size:14px;color:var(--color-text-secondary);margin:0">Iniciá sesión para continuar</p>
        </div>

        <div class="card">
          <form (ngSubmit)="onSubmit()" style="display:flex;flex-direction:column;gap:20px">
            <div class="input-group">
              <label class="input-label">Email</label>
              <input [(ngModel)]="email" name="email" type="email" placeholder="tu@email.com" class="input" required>
            </div>
            <div class="input-group">
              <label class="input-label">Contraseña</label>
              <input [(ngModel)]="password" name="password" type="password" placeholder="••••••••" class="input" required>
            </div>

            @if (error()) {
              <div style="background:var(--color-danger-bg);color:var(--color-danger);padding:12px 16px;border-radius:var(--radius-md);font-size:13px">
                {{ error() }}
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn btn-primary" style="height:44px">
              @if (loading()) {
                <div class="spinner"></div>
                Ingresando...
              } @else { Ingresar }
            </button>
          </form>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border-light);text-align:center">
            <p style="font-size:13px;color:var(--color-text-secondary);margin:0">
              ¿No tenés cuenta? <a routerLink="/register" style="color:var(--color-primary);font-weight:500;text-decoration:none">Registrate</a>
            </p>
          </div>

          <div style="margin-top:16px;background:#f8fafc;border-radius:var(--radius-md);padding:12px">
            <p style="font-size:12px;font-weight:600;color:var(--color-text-secondary);margin:0 0 8px">Credenciales de prueba:</p>
            <div style="font-size:12px;color:var(--color-text-muted);display:flex;flex-direction:column;gap:4px">
              <span>Admin: <strong style="color:var(--color-text)">admin&#64;gym.com / admin123</strong></span>
              <span>Coach: <strong style="color:var(--color-text)">coach&#64;gym.com / coach123</strong></span>
              <span>Member: <strong style="color:var(--color-text)">member&#64;gym.com / member123</strong></span>
            </div>
          </div>
        </div>
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

  onSubmit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: AuthResponse) => {
        this.loading.set(false);
        const role = res.user.role;
        this.router.navigate([`/${role === 'member' ? 'member/routine' : role + '/dashboard'}`]);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas. Verificá tu email y contraseña.');
      },
    });
  }
}
