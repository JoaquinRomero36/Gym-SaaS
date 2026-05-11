import { Component, inject } from '@angular/core';
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
            <div class="stat-value" style="color:#4f46e5">{{ gyms()?.length ?? '-' }}</div>
            <div class="stat-label">Gimnasios</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fffbeb;color:#d97706">⚠️</div>
          <div>
            <div class="stat-value" style="color:#d97706">-</div>
            <div class="stat-label">En riesgo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5;color:#059669">📨</div>
          <div>
            <div class="stat-value" style="color:#059669">-</div>
            <div class="stat-label">Mensajes enviados</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 style="font-size:15px;font-weight:600;margin:0 0 8px">Bienvenido al panel</h3>
        <p style="font-size:14px;color:var(--color-text-secondary);margin:0">Las métricas se mostrarán cuando el sistema tenga datos cargados. Usá el seed para poblar información de prueba.</p>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);
  gyms = toSignal(this.http.get<any[]>('/api/v1/gyms'));
}
