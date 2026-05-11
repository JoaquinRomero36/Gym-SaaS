import { Component, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-progress',
  standalone: true,
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <h1 class="page-title">Mi Progreso</h1>
        <p class="page-subtitle">Resumen de tu actividad</p>
      </div>

      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eff6ff;color:#2563eb">📅</div>
          <div>
            <div class="stat-value" style="color:#2563eb">{{ attendanceCount()?.count ?? 0 }}</div>
            <div class="stat-label">Asistencias (7d)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#eef2ff;color:#4f46e5">📊</div>
          <div>
            <div class="stat-value" [style.color]="riskColor()">{{ riskScoreFormatted() }}</div>
            <div class="stat-label">Score de riesgo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5;color:#059669">⭐</div>
          <div>
            <div class="stat-value" style="color:#059669">{{ avgEffort() }}</div>
            <div class="stat-label">Esfuerzo promedio</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fffbeb;color:#d97706">⚡</div>
          <div>
            <div class="stat-value" style="color:#d97706">{{ avgEnergy() }}</div>
            <div class="stat-label">Energía promedio</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="margin-bottom:12px;font-size:14px;font-weight:600;color:var(--color-text)">Estado de riesgo</div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="riskBarWidth()" [style.background]="riskBarBg()"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-muted);margin-top:6px">
          <span>Bajo riesgo</span>
          <span>Alto riesgo</span>
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
  averages = toSignal(this.http.get<any>(`/api/v1/feedback/user/${this.userId}/averages?last=5`));
  risk = toSignal(this.http.get<any>(`/api/v1/risk/${this.userId}`));

  avgEffort = computed(() => this.averages()?.avgEffort?.toFixed(1) ?? '-');
  avgEnergy = computed(() => this.averages()?.avgEnergy?.toFixed(1) ?? '-');

  riskScore = computed(() => this.risk()?.score ?? 0);
  riskScoreFormatted = computed(() => this.risk()?.score?.toFixed(2) ?? '-');
  riskBarWidth = computed(() => Math.min((this.riskScore() || 0) * 100, 100));

  riskColor = computed(() => {
    const s = this.riskScore();
    if (!s) return '#94a3b8';
    return s >= 0.7 ? '#dc2626' : s >= 0.4 ? '#d97706' : '#059669';
  });

  riskBarBg = computed(() => {
    const s = this.riskScore();
    if (!s) return '#94a3b8';
    return s >= 0.7 ? '#dc2626' : s >= 0.4 ? '#d97706' : '#059669';
  });
}
