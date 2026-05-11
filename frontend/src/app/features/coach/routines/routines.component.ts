import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="animate-fade">
      <div class="flex-between" style="margin-bottom:24px">
        <div>
          <h1 class="page-title" style="margin:0">Rutinas</h1>
          <p class="page-subtitle">{{ routines().length }} rutinas creadas</p>
        </div>
        <a routerLink="/coach/routines/create" class="btn btn-primary">+ Nueva rutina</a>
      </div>

      @if (routines().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3 class="empty-title">Sin rutinas</h3>
          <p class="empty-text">Creá tu primera rutina para asignarla a un miembro.</p>
          <a routerLink="/coach/routines/create" class="btn btn-primary" style="margin-top:16px">Crear rutina</a>
        </div>
      }

      <div style="display:flex;flex-direction:column;gap:8px">
        @for (r of routines(); track r.id) {
          <div class="card-hover" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px">
            <div style="display:flex;align-items:center;gap:16px">
              <div style="width:40px;height:40px;border-radius:var(--radius-lg);background:#eef2ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:18px">🏋️</div>
              <div>
                <div style="font-weight:600;font-size:14px">{{ r.name }}</div>
                <div style="font-size:13px;color:var(--color-text-secondary)">{{ r.exercises?.length ?? 0 }} ejercicios</div>
              </div>
            </div>
            <span style="font-size:12px;color:var(--color-text-muted)">{{ formatDate(r.createdAt) }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class RoutinesComponent {
  private http = inject(HttpClient);
  routines = toSignal(this.http.get<any[]>('/api/v1/routines'), { initialValue: [] });

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-AR');
  }
}
