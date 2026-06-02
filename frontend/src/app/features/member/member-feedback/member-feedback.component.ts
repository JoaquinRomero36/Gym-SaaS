import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-feedback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="max-width:560px">
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Feedback</div>
          <h1 class="page-title">¿Cómo te sentiste hoy?</h1>
          <p class="page-subtitle">Tu feedback ayuda a tu coach a entender tu progreso</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" class="card stack-lg">
        <div>
          <div class="row-between" style="margin-bottom: var(--space-3)">
            <label class="input-label" for="effort">Nivel de esfuerzo</label>
            <span class="badge" [class]="effortBadgeClass()">{{ effortLabel() }}</span>
          </div>
          <div class="rating-row" role="radiogroup" aria-labelledby="effort">
            @for (n of [1,2,3,4,5]; track n) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="effort() === n"
                class="rating-btn"
                [class.selected-effort]="effort() === n"
                (click)="effort.set(n)">
                {{ n }}
              </button>
            }
          </div>
          <div class="row-between" style="font-size:11px;color:var(--color-text-muted);margin-top:8px;letter-spacing:0.04em;text-transform:uppercase">
            <span>Muy fácil</span>
            <span>Al límite</span>
          </div>
        </div>

        <div>
          <div class="row-between" style="margin-bottom: var(--space-3)">
            <label class="input-label" for="energy">Nivel de energía</label>
            <span class="badge" [class]="energyBadgeClass()">{{ energyLabel() }}</span>
          </div>
          <div class="rating-row" role="radiogroup" aria-labelledby="energy">
            @for (n of [1,2,3,4,5]; track n) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="energy() === n"
                class="rating-btn"
                [class.selected-energy]="energy() === n"
                (click)="energy.set(n)">
                {{ n }}
              </button>
            }
          </div>
          <div class="row-between" style="font-size:11px;color:var(--color-text-muted);margin-top:8px;letter-spacing:0.04em;text-transform:uppercase">
            <span>Agotado</span>
            <span>Lleno de energía</span>
          </div>
        </div>

        @if (sent()) {
          <div class="alert alert-success" role="status">
            <span class="alert-icon">✓</span>
            <div class="alert-content">¡Feedback registrado! Redirigiendo al panel…</div>
          </div>
        }

        <button type="submit" [disabled]="sent()" class="btn btn-primary btn-block" style="height:46px">
          @if (sent()) {
            <span>✓ Enviado</span>
          } @else {
            <span>Enviar feedback</span>
          }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .rating-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .rating-btn {
      height: 56px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-out);
    }
    .rating-btn:hover {
      border-color: var(--color-border-strong);
      background: var(--color-surface-2);
      color: var(--color-text);
    }
    .rating-btn:focus-visible {
      outline: none;
      box-shadow: var(--shadow-ring);
    }
    .selected-effort {
      background: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
      color: var(--color-text-inverse) !important;
      transform: scale(1.04);
      box-shadow: 0 4px 12px rgba(22, 56, 41, 0.2);
    }
    .selected-energy {
      background: var(--color-accent) !important;
      border-color: var(--color-accent) !important;
      color: white !important;
      transform: scale(1.04);
      box-shadow: 0 4px 12px rgba(184, 137, 58, 0.25);
    }
  `],
})
export class MemberFeedbackComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  effort = signal(3);
  energy = signal(3);
  sent = signal(false);

  effortLabel = () => {
    const labels = ['', 'Muy fácil', 'Suave', 'Moderado', 'Intenso', 'Al límite'];
    return labels[this.effort()];
  };

  energyLabel = () => {
    const labels = ['', 'Agotado', 'Bajo', 'Normal', 'Activo', 'Imparable'];
    return labels[this.energy()];
  };

  effortBadgeClass = () => {
    const e = this.effort();
    if (e >= 4) return 'badge-danger';
    if (e === 3) return 'badge-warning';
    return 'badge-success';
  };

  energyBadgeClass = () => {
    const e = this.energy();
    if (e >= 4) return 'badge-accent';
    if (e === 3) return 'badge-success';
    return 'badge-neutral';
  };

  onSubmit() {
    const user = this.auth.user();
    if (!user) return;
    this.http.post('/api/v1/feedback', {
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      effort_level: this.effort(),
      energy_level: this.energy(),
    }).subscribe(() => {
      this.sent.set(true);
      setTimeout(() => this.router.navigate(['/member/dashboard']), 900);
    });
  }
}
