import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse, Gym } from '../../../core/types';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="landing-gradient flex-center" style="min-height:100vh;padding: var(--space-6)">
      <div style="width:100%;max-width:440px">
        <div style="text-align:center;margin-bottom: var(--space-7)">
          <a routerLink="/" style="display:inline-flex;align-items:center;gap:12px;text-decoration:none">
            <div class="navbar-logo" style="width:48px;height:48px;font-size:22px">G</div>
          </a>
          <h1 style="font-family:var(--font-display);font-size:24px;font-weight:500;letter-spacing:-0.015em;margin:16px 0 4px">Crear cuenta</h1>
          <p style="font-size:14px;color:var(--color-text-secondary);margin:0">Sumate a AI Gym Retention</p>
        </div>

        <div class="card animate-fade">
          <form (ngSubmit)="onSubmit()" class="stack" style="gap: var(--space-5)">
            <div class="input-group">
              <label class="input-label" for="reg-name">Nombre</label>
              <input id="reg-name" [(ngModel)]="name" name="name" placeholder="Tu nombre" class="input" required>
            </div>
            <div class="input-group">
              <label class="input-label" for="reg-email">Email</label>
              <input id="reg-email" [(ngModel)]="email" name="email" type="email" placeholder="tu@email.com" class="input" required>
            </div>
            <div class="input-group">
              <label class="input-label" for="reg-pass">Contraseña</label>
              <input id="reg-pass" [(ngModel)]="password" name="password" type="password" placeholder="Mínimo 8 caracteres" class="input" required minlength="8">
            </div>
            <div class="input-group">
              <label class="input-label" for="reg-gym">Gimnasio</label>
              <select id="reg-gym" [(ngModel)]="gymId" name="gymId" class="input" required>
                <option value="">Seleccioná un gimnasio</option>
                @for (g of gyms(); track g.id) {
                  <option [value]="g.id">{{ g.name }}</option>
                }
              </select>
            </div>

            @if (error()) {
              <div class="alert alert-danger" role="alert">
                <span class="alert-icon">!</span>
                <div class="alert-content">{{ error() }}</div>
              </div>
            }
            @if (success()) {
              <div class="alert alert-success">
                <span class="alert-icon">✓</span>
                <div class="alert-content">{{ success() }}</div>
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn btn-primary btn-block" style="height:44px">
              @if (loading()) {
                <span class="spinner"></span>
                <span>Creando…</span>
              } @else {
                <span>Crear cuenta</span>
              }
            </button>
          </form>

          <div class="divider" style="margin: var(--space-5) 0 var(--space-4)"></div>

          <p style="color:var(--color-text-secondary);margin:0;text-align:center;font-size:14px">
            ¿Ya tenés cuenta?
            <a routerLink="/login" style="color:var(--color-primary);font-weight:500">Ingresá</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  gymId = '';

  loading = signal(false);
  error = signal('');
  success = signal('');

  gyms = toSignal(
    this.http.get<Gym[]>('/api/v1/gyms/public/list').pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  onSubmit() {
    this.error.set('');
    this.success.set('');
    if (!this.gymId) {
      this.error.set('Seleccioná un gimnasio para registrarte.');
      return;
    }
    this.loading.set(true);
    this.auth.register({ gym_id: this.gymId, name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: (_res: AuthResponse) => {
          this.success.set('Registro exitoso. Redirigiendo al panel…');
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.status === 400
            ? 'El ID de gym es obligatorio. Usá el seed para crear uno.'
            : 'No pudimos crear la cuenta. Intentá de nuevo.');
        },
      });
  }
}
