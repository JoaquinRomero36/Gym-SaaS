import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-feedback',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="animate-fade" style="max-width:520px">
      <div class="page-header">
        <h1 class="page-title">Feedback de la sesión</h1>
        <p class="page-subtitle">Decinos cómo te sentiste después de entrenar</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <div style="margin-bottom:24px">
          <label class="input-label" style="margin-bottom:12px">Nivel de esfuerzo</label>
          <div style="display:flex;gap:8px">
            @for (n of [1,2,3,4,5]; track n) {
              <button type="button" (click)="effort.set(n)"
                      [style]="effort() === n
                        ? 'background:var(--color-primary);color:white;border-color:var(--color-primary);transform:scale(1.05)'
                        : 'background:white;color:#94a3b8;border-color:#e2e8f0'"
                      style="flex:1;height:52px;border-radius:var(--radius-md);border:2px solid;font-size:18px;font-weight:700;cursor:pointer;transition:all 0.15s">
                {{ n }}
              </button>
            }
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--color-text-muted);margin-top:6px;padding:0 4px">
            <span>Muy fácil</span>
            <span>Muy intenso</span>
          </div>
        </div>

        <div style="margin-bottom:24px">
          <label class="input-label" style="margin-bottom:12px">Nivel de energía</label>
          <div style="display:flex;gap:8px">
            @for (n of [1,2,3,4,5]; track n) {
              <button type="button" (click)="energy.set(n)"
                      [style]="energy() === n
                        ? 'background:#059669;color:white;border-color:#059669;transform:scale(1.05)'
                        : 'background:white;color:#94a3b8;border-color:#e2e8f0'"
                      style="flex:1;height:52px;border-radius:var(--radius-md);border:2px solid;font-size:18px;font-weight:700;cursor:pointer;transition:all 0.15s">
                {{ n }}
              </button>
            }
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--color-text-muted);margin-top:6px;padding:0 4px">
            <span>Sin energía</span>
            <span>Lleno de energía</span>
          </div>
        </div>

        @if (sent()) {
          <div style="background:var(--color-success-bg);color:var(--color-success);padding:12px 16px;border-radius:var(--radius-md);font-size:13px;margin-bottom:16px;display:flex;align-items:center;gap:8px">
            ✅ ¡Feedback registrado! Seguí así 💪
          </div>
        }

        <button type="submit" [disabled]="sent()" class="btn btn-primary" style="width:100%;height:44px">
          {{ sent() ? 'Enviado' : 'Enviar feedback' }}
        </button>
      </form>
    </div>
  `,
})
export class MemberFeedbackComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  effort = signal(3);
  energy = signal(3);
  sent = signal(false);

  onSubmit() {
    const user = this.auth.user();
    if (!user) return;
    this.http.post('/api/v1/feedback', {
      user_id: user.id, gym_id: user.gym_id,
      date: new Date().toISOString().split('T')[0],
      effort_level: this.effort(),
      energy_level: this.energy(),
    }).subscribe(() => this.sent.set(true));
  }
}
