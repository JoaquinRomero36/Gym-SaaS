import { Component, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <h1 class="page-title">Panel de Administración</h1>
        <p class="page-subtitle">Métricas globales del sistema</p>
      </div>

      <div class="grid-3" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eef2ff;color:#4f46e5">👥</div>
          <div>
            <div class="stat-value" style="color:#4f46e5">{{ stats()?.totalUsers ?? '-' }}</div>
            <div class="stat-label">Total usuarios</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fffbeb;color:#d97706">⚠️</div>
          <div>
            <div class="stat-value" style="color:#d97706">{{ stats()?.usersAtHighRisk ?? '-' }}</div>
            <div class="stat-label">En riesgo alto</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5;color:#059669">📨</div>
          <div>
            <div class="stat-value" style="color:#059669">{{ stats()?.notificationsSentToday ?? '-' }}</div>
            <div class="stat-label">Mensajes enviados hoy</div>
          </div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eff6ff;color:#2563eb">✅</div>
          <div>
            <div class="stat-value" style="color:#2563eb">{{ stats()?.activeUsers ?? '-' }}</div>
            <div class="stat-label">Usuarios activos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef2f2;color:#dc2626">🚪</div>
          <div>
            <div class="stat-value" style="color:#dc2626">{{ stats()?.churnedUsers ?? '-' }}</div>
            <div class="stat-label">Churned</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#f0fdf4;color:#16a34a">🏋️</div>
          <div>
            <div class="stat-value" style="color:#16a34a">{{ stats()?.todayAttendance ?? '-' }}</div>
            <div class="stat-label">Asistencias hoy</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size:15px;font-weight:600;margin:0 0 8px">Resumen</h3>
        <p style="font-size:14px;color:var(--color-text-secondary);margin:0">
          {{ stats()?.totalUsers ?? 0 }} usuarios registrados ·
          {{ stats()?.activeUsers ?? 0 }} activos ·
          {{ stats()?.totalCoaches ?? '-' }} coaches
        </p>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);
  stats = toSignal(this.http.get<any>('/api/v1/stats'));
}
