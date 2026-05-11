import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../core/types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="landing-gradient flex-center" style="min-height:100vh;padding:24px">
      <div style="width:100%;max-width:420px">
        <div style="text-align:center;margin-bottom:32px;animation:fadeIn 0.3s ease-out">
          <div class="navbar-logo" style="margin:0 auto 16px;width:56px;height:56px;font-size:24px">G</div>
          <h1 style="font-size:22px;font-weight:700;margin:0 0 4px">Crear cuenta</h1>
          <p style="font-size:14px;color:var(--color-text-secondary);margin:0">Registrate en AI Gym Retention</p>
        </div>

        <div class="card animate-fade">
          <form (ngSubmit)="onSubmit()" style="display:flex;flex-direction:column;gap:20px">
            <div class="input-group">
              <label class="input-label">Nombre</label>
              <input [(ngModel)]="name" name="name" placeholder="Tu nombre" class="input" required>
            </div>
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
            @if (success()) {
              <div style="background:var(--color-success-bg);color:var(--color-success);padding:12px 16px;border-radius:var(--radius-md);font-size:13px">
                {{ success() }}
              </div>
            }

            <button type="submit" class="btn btn-primary" style="height:44px">Registrarse</button>
          </form>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border-light);text-align:center">
            <p style="font-size:13px;color:var(--color-text-secondary);margin:0">
              ¿Ya tenés cuenta? <a routerLink="/login" style="color:var(--color-primary);font-weight:500;text-decoration:none">Ingresá</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  name = ''; email = ''; password = '';
  error = signal(''); success = signal('');

  onSubmit() {
    this.error.set(''); this.success.set('');
    this.auth.register({ gym_id: '', name: this.name, email: this.email, password: this.password }).subscribe({
      next: (_res: AuthResponse) => {
        this.success.set('Registro exitoso. Redirigiendo...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => this.error.set('Error al registrarse. Intentá de nuevo.'),
    });
  }
}
