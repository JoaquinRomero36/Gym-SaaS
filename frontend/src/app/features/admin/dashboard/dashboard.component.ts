import { Component, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
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

      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eff6ff;color:#2563eb">✅</div>
          <div>
            <div class="stat-value" style="color:#2563eb">{{ stats()?.activeUsers ?? '-' }}</div>
            <div class="stat-label">Activos</div>
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
        <div class="stat-card">
          <div class="stat-icon" style="background:#f8fafc;color:#475569">📊</div>
          <div>
            <div class="stat-value" style="color:#475569">{{ stats()?.usersAtLowRisk ?? '-' }}</div>
            <div class="stat-label">Riesgo bajo</div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:24px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Desglose por estado</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0">
            @for (item of statusBreakdown(); track item.label) {
              <div>
                <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px">
                  <span [style.fontWeight]="'500'" [style.color]="'var(--color-text)'">{{ item.label }}</span>
                  <span [style.fontWeight]="'600'">{{ item.count }}</span>
                </div>
                <div class="progress-bar" style="height:8px">
                  <div class="progress-fill" [style.width.%]="item.pct" [style.background]="item.color" style="height:8px;border-radius:4px"></div>
                </div>
              </div>
            }
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Resumen rápido</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
              <span style="font-size:14px;color:var(--color-text-secondary)">Miembros</span>
              <span style="font-weight:600;font-size:16px">{{ stats()?.totalMembers ?? '-' }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
              <span style="font-size:14px;color:var(--color-text-secondary)">Coaches</span>
              <span style="font-weight:600;font-size:16px">{{ stats()?.totalCoaches ?? '-' }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
              <span style="font-size:14px;color:var(--color-text-secondary)">Riesgo medio</span>
              <span style="font-weight:600;font-size:16px;color:#d97706">{{ stats()?.usersAtMediumRisk ?? '-' }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
              <span style="font-size:14px;color:var(--color-text-secondary)">Riesgo bajo</span>
              <span style="font-weight:600;font-size:16px;color:#059669">{{ stats()?.usersAtLowRisk ?? '-' }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
              <span style="font-size:14px;color:var(--color-text-secondary)">Inactivos</span>
              <span style="font-weight:600;font-size:16px;color:#94a3b8">{{ stats()?.inactiveUsers ?? '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      @if ((stats()?.recentRisks?.length ?? 0) > 0) {
        <div class="card">
          <div class="card-header">
            <span class="card-title">Usuarios con mayor riesgo</span>
          </div>
          <div style="display:flex;flex-direction:column">
            <div style="display:grid;grid-template-columns:1fr 100px 100px;gap:8px;padding:8px 0;border-bottom:1px solid var(--color-border-light);font-size:12px;color:var(--color-text-muted);font-weight:600;text-transform:uppercase">
              <span>Nombre</span>
              <span style="text-align:center">Score</span>
              <span style="text-align:center">Categoría</span>
            </div>
            @for (r of stats()?.recentRisks ?? []; track r.userId) {
              <div style="display:grid;grid-template-columns:1fr 100px 100px;gap:8px;padding:10px 0;border-bottom:1px solid var(--color-border-light);align-items:center">
                <span style="font-size:14px;font-weight:500">{{ r.userName }}</span>
                <span style="text-align:center;font-size:14px;font-weight:600" [style.color]="riskScoreColor(r.score)">{{ r.score.toFixed(4) }}</span>
                <span style="text-align:center">
                  <span class="badge" [class.badge-danger]="r.category === 'high'" [class.badge-warning]="r.category === 'medium'" [class.badge-success]="r.category === 'low'">
                    {{ r.category }}
                  </span>
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);
  stats = toSignal(this.http.get<any>('/api/v1/stats'));

  statusBreakdown = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalUsers || 1;
    return [
      { label: 'Activos', count: s.activeUsers ?? 0, pct: ((s.activeUsers ?? 0) / total) * 100, color: '#059669' },
      { label: 'Inactivos', count: s.inactiveUsers ?? 0, pct: ((s.inactiveUsers ?? 0) / total) * 100, color: '#94a3b8' },
      { label: 'Churned', count: s.churnedUsers ?? 0, pct: ((s.churnedUsers ?? 0) / total) * 100, color: '#dc2626' },
    ];
  });

  riskScoreColor(score: number): string {
    if (score >= 0.7) return '#dc2626';
    if (score >= 0.4) return '#d97706';
    return '#059669';
  }
}
