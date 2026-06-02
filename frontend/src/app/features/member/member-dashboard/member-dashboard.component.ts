import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FeedbackAverages, Notification, RiskScore, riskCategoryFromScore } from '../../../core/types';

interface AttendanceCount { count: number; }
interface AttendanceLast { date: string; }

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Tu cuenta</div>
          <h1 class="page-title">Hola, {{ userName() }} <span style="font-family:var(--font-display);font-style:italic;color:var(--color-primary)">👋</span></h1>
          <p class="page-subtitle">Resumen de tu actividad en el gimnasio</p>
        </div>
      </div>

      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ attendanceCount()?.count ?? 0 }}</div>
            <div class="stat-label">Asistencias (7d)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" [class]="riskIconClass()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-5"/>
            </svg>
          </div>
          <div>
            <div class="stat-value" [style.color]="riskColor()">{{ riskFormatted() }}</div>
            <div class="stat-label">Score de riesgo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-success">{{ avgEffort() }}</div>
            <div class="stat-label">Esfuerzo promedio</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ notifications().length }}</div>
            <div class="stat-label">Notificaciones</div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Estado de riesgo</h3>
            <span class="badge" [class]="riskBadgeClass()">{{ riskLabel() }}</span>
          </div>
          <div
            class="progress-bar progress-thick"
            role="progressbar"
            aria-label="Score de riesgo"
            [attr.aria-valuenow]="riskBarWidth()"
            aria-valuemin="0"
            aria-valuemax="100">
            <div class="progress-fill" [style.width.%]="riskBarWidth()" [style.background]="riskBarBg()"></div>
          </div>
          <div class="row-between" style="font-size:11px;color:var(--color-text-muted);margin-top:8px;letter-spacing:0.04em;text-transform:uppercase">
            <span>Bajo riesgo</span>
            <span>Alto riesgo</span>
          </div>
          <p style="color:var(--color-text-secondary);margin: var(--space-4) 0 0;line-height:1.6">{{ riskMessage() }}</p>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Última asistencia</h3>
          </div>
          <div style="text-align:center;padding: var(--space-5) 0">
            <div style="font-size:36px;margin-bottom: var(--space-3);line-height:1">🏋️</div>
            <div style="font-family:var(--font-display);font-size:20px;font-weight:500;letter-spacing:-0.01em">{{ lastDateLabel() }}</div>
            <div style="color:var(--color-text-secondary);margin-top:6px;font-size:14px">{{ daysSinceLabel() }}</div>
          </div>
        </div>
      </div>

      @if (notifications().length > 0) {
        <div class="card mb-24">
          <div class="card-header">
            <h3 class="card-title">Notificaciones recientes</h3>
            <a [routerLink]="['/member/notifications']" class="btn btn-ghost btn-sm">Ver todas →</a>
          </div>
          <div class="stack-sm">
            @for (n of recentNotifications(); track n.id) {
              <div class="row" style="padding: var(--space-3) 0;border-bottom:1px solid var(--color-border-light)">
                <span class="stat-icon" [class]="notifIconBg(n.status)" style="width:36px;height:36px;font-size:16px">
                  {{ n.status === 'sent' ? '✓' : n.status === 'failed' ? '!' : '⏱' }}
                </span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ n.message }}</div>
                  <div style="color:var(--color-text-muted);font-size:12px">{{ formatDate(n.createdAt) }}</div>
                </div>
                <span class="badge" [class]="notifBadgeClass(n.status)">{{ notifLabel(n.status) }}</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="grid-2">
        <a [routerLink]="['/member/routine']" class="card card-hover" style="text-decoration:none;display:flex;align-items:center;gap: var(--space-4)">
          <div class="stat-icon stat-icon-primary" style="width:48px;height:48px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/>
            </svg>
          </div>
          <div>
            <div style="font-family:var(--font-display);font-size:16px;font-weight:500;letter-spacing:-0.01em;margin-bottom:2px;color:var(--color-text)">Mi rutina</div>
            <div style="color:var(--color-text-secondary);font-size:13px">Ejercicios asignados para hoy</div>
          </div>
        </a>
        <a [routerLink]="['/member/feedback']" class="card card-hover" style="text-decoration:none;display:flex;align-items:center;gap: var(--space-4)">
          <div class="stat-icon stat-icon-accent" style="width:48px;height:48px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div style="font-family:var(--font-display);font-size:16px;font-weight:500;letter-spacing:-0.01em;margin-bottom:2px;color:var(--color-text)">Dar feedback</div>
            <div style="color:var(--color-text-secondary);font-size:13px">Registrá tu esfuerzo y energía</div>
          </div>
        </a>
        <a [routerLink]="['/member/progress']" class="card card-hover" style="text-decoration:none;display:flex;align-items:center;gap: var(--space-4)">
          <div class="stat-icon stat-icon-info" style="width:48px;height:48px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <div style="font-family:var(--font-display);font-size:16px;font-weight:500;letter-spacing:-0.01em;margin-bottom:2px;color:var(--color-text)">Mi progreso</div>
            <div style="color:var(--color-text-secondary);font-size:13px">Evolución detallada de tu rendimiento</div>
          </div>
        </a>
        <a [routerLink]="['/member/notifications']" class="card card-hover" style="text-decoration:none;display:flex;align-items:center;gap: var(--space-4)">
          <div class="stat-icon stat-icon-warning" style="width:48px;height:48px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <div style="font-family:var(--font-display);font-size:16px;font-weight:500;letter-spacing:-0.01em;margin-bottom:2px;color:var(--color-text)">Notificaciones</div>
            <div style="color:var(--color-text-secondary);font-size:13px">Historial de mensajes y alertas</div>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class MemberDashboardComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private userId = this.auth.user()?.id;
  protected userName = computed(() => this.auth.user()?.name ?? '');

  attendanceCount = toSignal(
    this.http.get<AttendanceCount>(`/api/v1/attendance/user/${this.userId}/count?days=7`),
  );
  averages = toSignal(
    this.http.get<FeedbackAverages>(`/api/v1/feedback/user/${this.userId}/averages?last=5`),
  );
  risk = toSignal(this.http.get<RiskScore>(`/api/v1/risk/${this.userId}`));
  lastAttendance = toSignal(
    this.http.get<AttendanceLast>(`/api/v1/attendance/user/${this.userId}/last`),
  );
  notifications = toSignal(
    this.http.get<Notification[]>(`/api/v1/notifications/user/${this.userId}`),
    { initialValue: [] },
  );

  recentNotifications = computed(() => this.notifications().slice(0, 3));

  avgEffort = computed(() => this.averages()?.avgEffort?.toFixed(1) ?? '—');

  riskScore = computed(() => this.risk()?.score ?? 0);
  riskFormatted = computed(() => this.riskScore() ? this.riskScore()!.toFixed(2) : '—');
  riskBarWidth = computed(() => Math.min((this.riskScore() || 0) * 100, 100));

  riskCategory = computed(() => riskCategoryFromScore(this.riskScore() || null));

  riskColor = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'var(--color-danger)';
    if (c === 'medium') return 'var(--color-warning)';
    if (c === 'low') return 'var(--color-success)';
    return 'var(--color-text)';
  });

  riskBarBg = computed(() => this.riskColor());

  riskIconClass = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'stat-icon-danger';
    if (c === 'medium') return 'stat-icon-warning';
    return 'stat-icon-success';
  });

  riskBadgeClass = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'badge-danger';
    if (c === 'medium') return 'badge-warning';
    return 'badge-success';
  });

  riskLabel = computed(() => {
    const c = this.riskCategory();
    return c === 'high' ? 'Alto' : c === 'medium' ? 'Medio' : c === 'low' ? 'Bajo' : '—';
  });

  riskMessage = computed(() => {
    const s = this.riskScore();
    if (!s) return 'Aún no hay datos suficientes para calcular tu riesgo. ¡Empezá a registrar asistencia y feedback!';
    if (s >= 0.7) return 'Tu riesgo de abandono es alto. Te recomendamos hablar con tu coach para ajustar tu plan.';
    if (s >= 0.4) return 'Riesgo moderado. Mantené la constancia y no te pierdas más de una semana seguida.';
    return '¡Vas muy bien! Seguí así para mantener un riesgo bajo y aprovechar al máximo tu membresía.';
  });

  lastDateLabel = computed(() => {
    const d = this.lastAttendance()?.date;
    if (!d) return 'Sin asistencias';
    const date = new Date(d);
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  });

  daysSinceLabel = computed(() => {
    const d = this.lastAttendance()?.date;
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return '¡Hoy!';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  });

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  notifIconBg(status: string) {
    if (status === 'sent') return 'stat-icon-success';
    if (status === 'failed') return 'stat-icon-danger';
    return 'stat-icon-muted';
  }

  notifBadgeClass(status: string) {
    if (status === 'sent') return 'badge-success';
    if (status === 'pending') return 'badge-warning';
    if (status === 'failed') return 'badge-danger';
    return 'badge-neutral';
  }

  notifLabel(status: string) {
    return status === 'read' ? 'leída' : status;
  }
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
