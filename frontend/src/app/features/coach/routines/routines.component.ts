import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-routines',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="animate-fade">
      <div class="flex-between mb-24">
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

      <div class="stagger flex-col-gap">
        @for (r of routines(); track r.id) {
          <div class="card-hover" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px">
            <div style="display:flex;align-items:center;gap:16px;flex:1;cursor:pointer" (click)="editRoutine(r.id)">
              <div style="width:40px;height:40px;border-radius:var(--radius-lg);background:var(--color-primary-bg);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-size:18px">🏋️</div>
              <div>
                <div style="font-weight:600;font-size:14px">{{ r.name }}</div>
                <div style="color:var(--color-text-secondary)">{{ r.exercises?.length ?? 0 }} ejercicios</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="color:var(--color-text-muted)">{{ formatDate(r.createdAt) }}</span>
              <button class="btn-icon" title="Editar" (click)="editRoutine(r.id); $event.stopPropagation()" style="padding:6px 10px;font-size:14px">✏️</button>
              <button class="btn-icon" title="Eliminar" (click)="deleteRoutine(r.id, r.name); $event.stopPropagation()" style="padding:6px 10px;font-size:14px">🗑️</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class RoutinesComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  routines = toSignal(this.http.get<any[]>('/api/v1/routines'), { initialValue: [] });

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-AR');
  }

  editRoutine(id: string) {
    this.router.navigate(['/coach/routines/edit', id]);
  }

  deleteRoutine(id: string, name: string) {
    if (!confirm(`¿Eliminar la rutina "${name}"?`)) return;
    this.http.delete(`/api/v1/routines/${id}`).subscribe({
      next: () => this.router.navigateByUrl('/coach/routines', { skipLocationChange: true }).then(() =>
        window.location.reload()
      ),
    });
  }
}
