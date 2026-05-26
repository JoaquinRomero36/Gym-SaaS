import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-fade" style="max-width:820px">
      <div class="page-header">
        <h1 class="page-title">Mi Progreso</h1>
        <p class="page-subtitle">Historial de actividad, feedback y evolución</p>
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
            <div class="stat-value" [style.color]="riskColor()">{{ riskScoreFormatted() }}</div>
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
          <div class="stat-icon stat-icon-warning">⚡</div>
          <div>
            <div class="stat-value" style="color:var(--color-warning)">{{ avgEnergy() }}</div>
            <div class="stat-label">Energía promedio</div>
          </div>
        </div>
      </div>

      <div class="card" class="mb-24">
        <div style="margin-bottom:12px;font-size:14px;font-weight:600;color:var(--color-text)">Estado de riesgo</div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="riskBarWidth()" [style.background]="riskBarBg()"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-muted);margin-top:6px">
          <span>Bajo riesgo</span>
          <span>Alto riesgo</span>
        </div>
      </div>

      <div class="card" class="mb-24">
        <div style="margin-bottom:16px;font-size:14px;font-weight:600;color:var(--color-text)">Calendario de asistencias (últimos 30 días)</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          @for (d of calendarDays(); track d.label) {
            <div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:11px"
              [style.background]="d.checked ? '#dcfce7' : '#f1f5f9'"
              [style.color]="d.checked ? '#166534' : 'var(--color-text-muted)'"
              [style.fontWeight]="d.checked ? '600' : '400'">
              {{ d.label }}
            </div>
          }
        </div>
      </div>

      <div class="card">
        <div style="margin-bottom:16px;font-size:14px;font-weight:600;color:var(--color-text)">Feedback recibido</div>
        @if (feedbackEntries().length === 0) {
          <div style="color:var(--color-text-muted);font-size:13px;padding:8px 0">Aún no hay feedback registrado.</div>
        }
        <div style="display:flex;flex-direction:column;gap:8px">
          @for (f of feedbackEntries().slice(0, 10); track f.id) {
            <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--color-border-light);border-radius:var(--radius-md)">
              <span style="font-size:18px">{{ f.effort >= 4 ? '💪' : f.effort >= 2 ? '👍' : '😐' }}</span>
              <div style="flex:1">
                <div style="display:flex;gap:12px;font-size:13px">
                  <span>Esfuerzo: <strong>{{ f.effort }}</strong>/5</span>
                  <span>Energía: <strong>{{ f.energy }}</strong>/5</span>
                </div>
                @if (f.comment) {
                  <div style="font-size:12px;color:var(--color-text-secondary);margin-top:2px">{{ f.comment }}</div>
                }
              </div>
              <span style="font-size:11px;color:var(--color-text-muted)">{{ formatDate(f.createdAt) }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class MemberProgressComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;

  attendanceCount = toSignal(this.http.get<any>(`/api/v1/attendance/user/${this.userId}/count?days=7`));
  attendanceAll = toSignal(this.http.get<any[]>(`/api/v1/attendance/user/${this.userId}`), { initialValue: [] });
  averages = toSignal(this.http.get<any>(`/api/v1/feedback/user/${this.userId}/averages?last=5`));
  risk = toSignal(this.http.get<any>(`/api/v1/risk/${this.userId}`));
  feedbackEntries = toSignal(this.http.get<any[]>(`/api/v1/feedback/user/${this.userId}`), { initialValue: [] });

  calendarDays = computed(() => {
    const dates = new Set<string>();
    for (const a of this.attendanceAll()) {
      dates.add(a.date?.substring(0, 10));
    }
    const days: { label: string; checked: boolean }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      days.push({ label: String(d.getDate()), checked: dates.has(key) });
    }
    return days;
  });

  avgEffort = computed(() => this.averages()?.avgEffort?.toFixed(1) ?? '-');
  avgEnergy = computed(() => this.averages()?.avgEnergy?.toFixed(1) ?? '-');

  riskScore = computed(() => this.risk()?.score ?? 0);
  riskScoreFormatted = computed(() => this.risk()?.score?.toFixed(2) ?? '-');
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

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }
}
