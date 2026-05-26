import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <h1 class="page-title">Hola, {{ userName() }} 👋</h1>
        <p class="page-subtitle">Resumen de tu actividad en el gimnasio</p>
      </div>

      <div class="grid-4" class="mb-24">
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">📅</div>
          <div>
            <div class="stat-value" style="color:var(--color-info)">{{ attendanceCount()?.count ?? 0 }}</div>
            <div class="stat-label">Asistencias (7d)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">📊</div>
          <div>
            <div class="stat-value" [style.color]="riskColor()">{{ riskFormatted() }}</div>
            <div class="stat-label">Score de riesgo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">⭐</div>
          <div>
            <div class="stat-value" style="color:var(--color-success)">{{ avgEffort() }}</div>
            <div class="stat-label">Esfuerzo promedio</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">🔔</div>
          <div>
            <div class="stat-value" style="color:var(--color-warning)">{{ notifications().length }}</div>
            <div class="stat-label">Notificaciones</div>
          </div>
        </div>
      </div>

      <div class="grid-2" class="mb-24">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Estado de riesgo</span>
          </div>
          <div class="progress-bar" style="margin:8px 0">
            <div class="progress-fill" [style.width.%]="riskBarWidth()" [style.background]="riskBarBg()"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-muted)">
            <span>Bajo riesgo</span>
            <span>Alto riesgo</span>
          </div>
          <p style="font-size:13px;color:var(--color-text-secondary);margin:12px 0 0">
            {{ riskMessage() }}
          </p>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Última asistencia</span>
          </div>
          <div style="text-align:center;padding:16px 0">
            <div style="font-size:36px;margin-bottom:8px">🏋️</div>
            <div style="font-size:16px;font-weight:600">{{ lastDateLabel() }}</div>
            <div style="font-size:13px;color:var(--color-text-secondary);margin-top:4px">{{ daysSinceLabel() }}</div>
          </div>
        </div>
      </div>

      @if (notifications().length > 0) {
        <div class="card" class="mb-24">
          <div class="card-header">
            <span class="card-title">Notificaciones recientes</span>
            <a [routerLink]="['/member/notifications']" style="font-size:13px;color:var(--color-primary);text-decoration:none">Ver todas</a>
          </div>
          <div style="display:flex;flex-direction:column">
            @for (n of notifications().slice(0, 3); track n.id) {
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border-light)">
                <span style="font-size:18px">{{ n.status === 'sent' ? '✅' : n.status === 'failed' ? '❌' : '⏳' }}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ n.message }}</div>
                  <div style="font-size:12px;color:var(--color-text-muted)">{{ formatDate(n.createdAt) }}</div>
                </div>
                <span class="badge" [class.badge-success]="n.status === 'sent'" [class.badge-warning]="n.status === 'pending'" [class.badge-danger]="n.status === 'failed'">
                  {{ n.status }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <div class="grid-2">
        <a [routerLink]="['/member/routine']" class="card card-hover" style="text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:16px">
          <div style="font-size:32px">💪</div>
          <div>
            <div style="font-weight:600;font-size:15px;margin-bottom:4px;color:var(--color-text)">Mi Rutina</div>
            <div style="font-size:13px;color:var(--color-text-secondary)">Ver ejercicios asignados para hoy</div>
          </div>
        </a>
        <a [routerLink]="['/member/feedback']" class="card card-hover" style="text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:16px">
          <div style="font-size:32px">⭐</div>
          <div>
            <div style="font-weight:600;font-size:15px;margin-bottom:4px;color:var(--color-text)">Dar Feedback</div>
            <div style="font-size:13px;color:var(--color-text-secondary)">Registrá tu esfuerzo y energía de hoy</div>
          </div>
        </a>
        <a [routerLink]="['/member/progress']" class="card card-hover" style="text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:16px">
          <div style="font-size:32px">📈</div>
          <div>
            <div style="font-weight:600;font-size:15px;margin-bottom:4px;color:var(--color-text)">Mi Progreso</div>
            <div style="font-size:13px;color:var(--color-text-secondary)">Evolución detallada de tu rendimiento</div>
          </div>
        </a>
        <a [routerLink]="['/member/notifications']" class="card card-hover" style="text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:16px">
          <div style="font-size:32px">🔔</div>
          <div>
            <div style="font-weight:600;font-size:15px;margin-bottom:4px;color:var(--color-text)">Notificaciones</div>
            <div style="font-size:13px;color:var(--color-text-secondary)">Historial de mensajes y alertas</div>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class MemberDashboardComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;
  userName = computed(() => this.auth.user()?.name ?? '');

  attendanceCount = toSignal(this.http.get<any>(`/api/v1/attendance/user/${this.userId}/count?days=7`));
  averages = toSignal(this.http.get<any>(`/api/v1/feedback/user/${this.userId}/averages?last=5`));
  risk = toSignal(this.http.get<any>(`/api/v1/risk/${this.userId}`));
  lastAttendance = toSignal(this.http.get<any>(`/api/v1/attendance/user/${this.userId}/last`));
  notifications = toSignal(this.http.get<any[]>(`/api/v1/notifications/user/${this.userId}`), { initialValue: [] });

  avgEffort = computed(() => this.averages()?.avgEffort?.toFixed(1) ?? '-');
  avgEnergy = computed(() => this.averages()?.avgEnergy?.toFixed(1) ?? '-');

  riskScore = computed(() => this.risk()?.score ?? 0);
  riskFormatted = computed(() => this.risk()?.score?.toFixed(2) ?? '-');
  riskBarWidth = computed(() => Math.min((this.riskScore() || 0) * 100, 100));

  riskColor = computed(() => {
    const s = this.riskScore();
    if (!s) return 'var(--color-text-muted)';
    return s >= 0.7 ? 'var(--color-danger)' : s >= 0.4 ? 'var(--color-warning)' : 'var(--color-success)';
  });

  riskBarBg = computed(() => {
    const s = this.riskScore();
    if (!s) return 'var(--color-text-muted)';
    return s >= 0.7 ? 'var(--color-danger)' : s >= 0.4 ? 'var(--color-warning)' : 'var(--color-success)';
  });

  riskMessage = computed(() => {
    const s = this.riskScore();
    if (!s) return 'Aún no hay datos suficientes para calcular tu riesgo.';
    if (s >= 0.7) return 'Tu riesgo de abandono es alto. Te recomendamos hablar con tu coach.';
    if (s >= 0.4) return 'Riesgo moderado. Mantené la constancia para mejorar.';
    return '¡Vas muy bien! Seguí así para mantener un riesgo bajo.';
  });

  lastDateLabel = computed(() => {
    const d = this.lastAttendance()?.date;
    if (!d) return 'Sin asistencias';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}