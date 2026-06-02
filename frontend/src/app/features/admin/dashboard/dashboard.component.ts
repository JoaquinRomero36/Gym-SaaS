import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Stats, riskCategoryFromScore } from '../../../core/types';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">General</div>
          <h1 class="page-title">Panel de administración</h1>
          <p class="page-subtitle">Métricas globales del gimnasio</p>
        </div>
      </div>

      <div class="grid-3 mb-24">
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats()?.totalUsers ?? 0 }}</div>
            <div class="stat-label">Total usuarios</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-danger">{{ stats()?.usersAtHighRisk ?? 0 }}</div>
            <div class="stat-label">En riesgo alto</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats()?.notificationsSentToday ?? 0 }}</div>
            <div class="stat-label">Mensajes hoy</div>
          </div>
        </div>
      </div>

      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-success">{{ stats()?.activeUsers ?? 0 }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats()?.inactiveUsers ?? 0 }}</div>
            <div class="stat-label">Inactivos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-danger">{{ stats()?.churnedUsers ?? 0 }}</div>
            <div class="stat-label">Churned</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ stats()?.todayAttendance ?? 0 }}</div>
            <div class="stat-label">Asistencias hoy</div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Desglose por estado</h3>
          </div>
          <div class="stack" style="gap: var(--space-4)">
            @for (item of statusBreakdown(); track item.label) {
              <div>
                <div class="row-between" style="font-size:13px;margin-bottom:6px">
                  <span style="font-weight:500">{{ item.label }}</span>
                  <span style="font-weight:600;font-variant-numeric:tabular-nums">{{ item.count }}</span>
                </div>
                <div
                  class="progress-bar"
                  role="progressbar"
                  [attr.aria-label]="item.label + ': ' + item.count"
                  [attr.aria-valuenow]="item.pct"
                  aria-valuemin="0"
                  aria-valuemax="100">
                  <div class="progress-fill" [style.width.%]="item.pct" [style.background]="item.color"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Acciones rápidas</h3>
          </div>
          <div class="stack-sm">
            <a routerLink="/admin/coaches" class="btn btn-secondary" style="justify-content:flex-start">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              Gestionar coaches
            </a>
            <a routerLink="/admin/coaches" class="btn btn-secondary" style="justify-content:flex-start">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Agregar nuevo coach
            </a>
          </div>
        </div>
      </div>

      @if (recentRisks().length > 0) {
        <div class="card" style="padding: 0; overflow: hidden">
          <div class="card-header" style="padding: var(--space-5) var(--space-6); margin: 0; border-bottom: 1px solid var(--color-border-light)">
            <div>
              <h3 class="card-title">Usuarios con mayor riesgo</h3>
              <p class="card-subtitle">Los {{ recentRisks().length }} miembros con score más alto</p>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Miembro</th>
                  <th style="width:120px">Score</th>
                  <th style="width:120px">Categoría</th>
                  <th style="width:80px;text-align:right">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (r of recentRisks(); track r.userId) {
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:12px">
                        <div class="avatar avatar-sm">{{ r.userName.charAt(0).toUpperCase() }}</div>
                        <span style="font-weight:500">{{ r.userName }}</span>
                      </div>
                    </td>
                    <td>
                      <span style="font-weight:600;font-variant-numeric:tabular-nums" [style.color]="riskScoreColor(r.score)">
                        {{ r.score.toFixed(2) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [class]="riskBadgeClass(r.category)">
                        {{ categoryLabel(r.category) }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" (click)="viewUser(r.userId)" title="Ver perfil" [attr.aria-label]="'Ver perfil de ' + r.userName">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  stats = toSignal(this.http.get<Stats>('/api/v1/stats'));

  recentRisks = computed(() => this.stats()?.recentRisks ?? []);

  statusBreakdown = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalUsers || 1;
    return [
      { label: 'Activos',  count: s.activeUsers,  pct: (s.activeUsers  / total) * 100, color: 'var(--color-success)' },
      { label: 'Inactivos', count: s.inactiveUsers, pct: (s.inactiveUsers / total) * 100, color: 'var(--color-text-muted)' },
      { label: 'Churned',  count: s.churnedUsers, pct: (s.churnedUsers / total) * 100, color: 'var(--color-danger)' },
    ];
  });

  riskScoreColor(score: number): string {
    const cat = riskCategoryFromScore(score);
    if (cat === 'high') return 'var(--color-danger)';
    if (cat === 'medium') return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  riskBadgeClass(category: string) {
    if (category === 'high') return 'badge-danger';
    if (category === 'medium') return 'badge-warning';
    return 'badge-success';
  }

  categoryLabel(category: string) {
    return category === 'high' ? 'Alto' : category === 'medium' ? 'Medio' : 'Bajo';
  }

  viewUser(userId: string) {
    this.router.navigate(['/coach/members', userId]);
  }
}
