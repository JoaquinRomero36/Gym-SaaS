import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  template: `
    <div class="animate-fade">
      @if (member(); as m) {
        <div class="card" style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <div class="avatar avatar-lg" style="background:#eef2ff;color:#4f46e5">{{ m.name.charAt(0) }}</div>
          <div style="flex:1">
            <h1 style="font-size:20px;font-weight:700;margin:0 0 4px">{{ m.name }}</h1>
            <p style="font-size:14px;color:var(--color-text-secondary);margin:0">{{ m.email }} · {{ m.level }}</p>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge" [class.badge-success]="m.status === 'active'" [class.badge-danger]="m.status !== 'active'">
              {{ m.status }}
            </span>
            <button class="btn btn-ghost" style="padding:6px 12px;font-size:13px" (click)="calcRisk()" [disabled]="loadingRisk()" [attr.aria-label]="'Calcular riesgo de ' + m.name">
              {{ loadingRisk() ? '...' : '🔄' }} Riesgo
            </button>
            <button class="btn btn-ghost" style="padding:6px 12px;font-size:13px" (click)="sendMsg()" [disabled]="loadingMsg()" [attr.aria-label]="'Enviar alerta a ' + m.name">
              {{ loadingMsg() ? '...' : '📨' }} Alertar
            </button>
          </div>
        </div>
        @if (actionMsg()) {
          <div style="background:var(--color-success-bg, #ecfdf5);color:var(--color-success, #059669);padding:12px 16px;border-radius:var(--radius-md);font-size:13px;margin-bottom:16px">{{ actionMsg() }}</div>
        }
        @if (actionError()) {
          <div style="background:var(--color-danger-bg);color:var(--color-danger);padding:12px 16px;border-radius:var(--radius-md);font-size:13px;margin-bottom:16px">{{ actionError() }}</div>
        }

        <div class="grid-3" style="margin-bottom:24px">
          <div class="stat-card">
            <div class="stat-icon" style="background:#fef2f2;color:#dc2626">⚠️</div>
            <div>
              <div class="stat-value" [style.color]="riskColor()">{{ risk()?.score?.toFixed(2) ?? '-' }}</div>
              <div class="stat-label">Score de riesgo</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#eff6ff;color:#2563eb">📅</div>
            <div>
              <div class="stat-value" style="color:#2563eb">{{ lastDate() }}</div>
              <div class="stat-label">Última asistencia</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#ecfdf5;color:#059669">⭐</div>
            <div>
              <div class="stat-value" style="color:#059669">{{ feedbacks().length }}</div>
              <div class="stat-label">Feedbacks</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Feedback reciente</span>
          </div>
          @if (feedbacks().length === 0) {
            <p style="text-align:center;padding:24px;color:var(--color-text-muted);font-size:14px">Sin feedback registrado</p>
          }
          <div style="display:flex;flex-direction:column">
            @for (f of feedbacks().slice(0, 10); track f.id) {
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--color-border-light)">
                <span style="font-size:14px;color:var(--color-text-secondary)">{{ f.date }}</span>
                <div style="display:flex;gap:16px">
                  <span style="font-size:14px">Esfuerzo: <strong>{{ f.effortLevel }}</strong>/5</span>
                  <span style="font-size:14px">Energía: <strong>{{ f.energyLevel }}</strong>/5</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MemberDetailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private userId = this.route.snapshot.paramMap.get('id')!;

  member = toSignal(this.http.get<any>(`/api/v1/users/${this.userId}`));
  risk = toSignal(this.http.get<any>(`/api/v1/risk/${this.userId}`));
  lastAttendance = toSignal(this.http.get<any>(`/api/v1/attendance/user/${this.userId}/last`));
  feedbacks = toSignal(this.http.get<any[]>(`/api/v1/feedback/user/${this.userId}`), { initialValue: [] });

  loadingRisk = signal(false);
  loadingMsg = signal(false);
  actionMsg = signal('');
  actionError = signal('');

  lastDate = computed(() => {
    const d = this.lastAttendance()?.date;
    if (!d) return '-';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}`;
  });

  riskColor = computed(() => {
    const s = this.risk()?.score;
    if (!s) return '#94a3b8';
    return s >= 0.7 ? '#dc2626' : s >= 0.4 ? '#d97706' : '#059669';
  });

  calcRisk() {
    this.loadingRisk.set(true);
    this.actionMsg.set('');
    this.actionError.set('');
    this.http.post(`/api/v1/risk/calculate/${this.userId}`, {}).subscribe({
      next: () => {
        this.loadingRisk.set(false);
        this.actionMsg.set('Riesgo recalculado correctamente.');
        setTimeout(() => this.actionMsg.set(''), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingRisk.set(false);
        this.actionError.set(err.error?.message || 'Error al calcular riesgo');
      },
    });
  }

  sendMsg() {
    this.loadingMsg.set(true);
    this.actionMsg.set('');
    this.actionError.set('');
    this.http.post('/api/v1/notifications', {
      user_id: this.userId,
      type: 'alert',
      message: 'Tu coach te recomienda ponerte al día con tus entrenamientos. ¡Te esperamos!',
    }).subscribe({
      next: () => {
        this.loadingMsg.set(false);
        this.actionMsg.set('Alerta enviada al miembro.');
        setTimeout(() => this.actionMsg.set(''), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingMsg.set(false);
        this.actionError.set(err.error?.message || 'Error al enviar alerta');
      },
    });
  }
}
