import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-routine',
  standalone: true,
  template: `
    <div class="animate-fade" style="max-width:720px">
      <div class="page-header">
        <h1 class="page-title">Mi Rutina</h1>
        <p class="page-subtitle">Ejercicios asignados para hoy</p>
      </div>

      @if (completed.value) {
        <div class="card" style="border-left:4px solid #059669;background:#ecfdf5">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:28px">🎉</span>
            <div>
              <div style="font-weight:600;font-size:15px;color:#059669">¡Sesión completada!</div>
              <div style="font-size:13px;color:var(--color-text-secondary)">Has registrado tu asistencia de hoy.</div>
            </div>
          </div>
        </div>
        <br>
      }

      @if (routines().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3 class="empty-title">Sin rutina asignada</h3>
          <p class="empty-text">Tu coach aún no te asignó una rutina. Consultá con él en tu próxima visita.</p>
        </div>
      }

      @for (r of routines(); track r.id) {
        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <div>
              <h2 style="font-size:17px;font-weight:600;margin:0 0 4px">{{ r.name }}</h2>
              <span style="font-size:13px;color:var(--color-text-secondary)">{{ r.exercises?.length ?? 0 }} ejercicios</span>
            </div>
            <span class="badge badge-primary">Hoy</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            @for (e of r.exercises; track e.id; let i = $index) {
              <label class="exercise-item">
                <div class="exercise-num">{{ i + 1 }}</div>
                <input type="checkbox" style="width:16px;height:16px;accent-color:var(--color-primary);flex-shrink:0">
                <span style="flex:1;font-weight:500;font-size:14px">{{ e.name }}</span>
                <span class="exercise-detail">{{ e.sets }} × {{ e.reps }}</span>
              </label>
            }
          </div>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--color-border-light);display:flex;justify-content:flex-end">
            <button class="btn btn-primary" (click)="completeSession()" [disabled]="saving()" style="opacity:saving() ? 0.6 : 1">
              @if (!saving()) {
                Completar sesión
              } @else {
                Registrando...
              }
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class MemberRoutineComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;
  routines = toSignal(this.http.get<any[]>(`/api/v1/routines?user_id=${this.userId}`), { initialValue: [] });
  completed = signal(false);
  saving = signal(false);

  completeSession() {
    this.saving.set(true);
    const today = new Date().toISOString().split('T')[0];
    this.http.post('/api/v1/attendance', {
      user_id: this.userId,
      date: today,
      completed: true,
    }).subscribe({
      next: () => {
        this.completed.set(true);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        alert('Error al registrar la asistencia. Inténtalo de nuevo.');
      },
    });
  }
}
