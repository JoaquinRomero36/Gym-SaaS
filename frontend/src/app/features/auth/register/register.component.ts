import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../core/types';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
            <div class="input-group">
              <label class="input-label">Gimnasio</label>
              <select [(ngModel)]="gymId" name="gymId" class="input" required>
                <option value="">Seleccioná un gimnasio</option>
                @for (g of gyms(); track g.id) {
                  <option [value]="g.id">{{ g.name }}</option>
                }
              </select>
            </div>

            @if (error()) {
              <div class="alert alert-danger" role="alert" aria-live="polite">
                {{ error() }}
              </div>
            }
            @if (success()) {
              <div class="alert alert-success">
                {{ success() }}
              </div>
            }

            <button type="submit" class="btn btn-primary" style="height:44px">Registrarse</button>
          </form>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border-light);text-align:center">
            <p style="color:var(--color-text-secondary);margin:0">
              ¿Ya tenés cuenta? <a routerLink="/login" style="color:var(--color-primary);font-weight:500;text-decoration:none">Ingresá</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  name = ''; email = ''; password = ''; gymId = '';
  gyms = toSignal(this.http.get<any[]>('/api/v1/gyms/public/list'), { initialValue: [] });
  error = signal(''); success = signal('');

  onSubmit() {
    this.error.set(''); this.success.set('');
    if (!this.gymId) { this.error.set('Seleccioná un gimnasio para registrarte.'); return; }
    this.auth.register({ gym_id: this.gymId, name: this.name, email: this.email, password: this.password })
      .pipe(
        catchError(err => {
          this.error.set(err.status === 400 ? 'El ID de gym es obligatorio. Usá el seed para crear uno.' : 'Error al registrarse. Intentá de nuevo.');
          return throwError(() => err);
        })
      ).subscribe({
        next: (_res: AuthResponse) => {
          this.success.set('Registro exitoso. Redirigiendo...');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: () => {},
      });
  }
}
