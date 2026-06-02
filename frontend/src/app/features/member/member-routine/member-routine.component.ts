import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-routine',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-fade" style="max-width:720px">
      <div class="page-header">
        <h1 class="page-title">Mi Rutina</h1>
        <p class="page-subtitle">Ejercicios asignados para hoy</p>
      </div>

      @if (completed()) {
        <div class="card" style="border-left:4px solid var(--color-success);background:var(--color-success-bg)">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:28px">🎉</span>
            <div>
              <div style="font-weight:600;font-size:15px;color:var(--color-success)">¡Sesión completada!</div>
              <div style="color:var(--color-text-secondary)">Has registrado tu asistencia de hoy.</div>
            </div>
          </div>
        </div>
        <br>
      }
      @if (error()) {
        <div class="alert alert-danger mb-16">
          {{ error() }}
        </div>
      }

      @if (routines().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3 class="empty-title">Sin rutina asignada</h3>
          <p class="empty-text">Tu coach aún no te asignó una rutina. Consultá con él en tu próxima visita.</p>
        </div>
      }

      @for (r of routines(); track r.id) {
        <div class="card mb-24">
          <div class="card-header">
            <div>
              <h2 style="font-size:17px;font-weight:600;margin:0 0 4px">{{ r.name }}</h2>
              <span style="color:var(--color-text-secondary)">{{ r.exercises?.length ?? 0 }} ejercicios</span>
            </div>
            <span class="badge badge-primary">Hoy</span>
          </div>

          <div class="flex-col-gap">
            @for (e of r.exercises; track e.id; let i = $index) {
              <label class="exercise-item" [class.done]="checkedExercises()[e.id]">
                <div class="exercise-num">{{ i + 1 }}</div>
                <input type="checkbox" style="width:16px;height:16px;accent-color:var(--color-primary);flex-shrink:0"
                  [checked]="checkedExercises()[e.id]" (change)="toggleExercise(e.id)" [attr.aria-label]="'Marcar ' + e.name + ' como completado'">
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
  private router = inject(Router);
  userId = this.auth.user()?.id;
  key = `member_routine_${this.userId}`;
  routines = toSignal(this.http.get<any[]>(`/api/v1/routines?user_id=${this.userId}`), { initialValue: [] });
  completed = signal(false);
  saving = signal(false);
  error = signal('');

  private saved = JSON.parse(localStorage.getItem(this.key) ?? '{}') as Record<string, boolean>;
  checkedExercises = signal<Record<string, boolean>>(this.saved);

  toggleExercise(id: string) {
    this.checkedExercises.update(m => ({ ...m, [id]: !m[id] }));
    localStorage.setItem(this.key, JSON.stringify(this.checkedExercises()));
  }

  completeSession() {
    this.saving.set(true);
    this.error.set('');
    const today = new Date().toISOString().split('T')[0];
    this.http.post('/api/v1/attendance', {
      user_id: this.userId,
      date: today,
      completed: true,
    }).subscribe({
      next: () => {
        this.completed.set(true);
        this.saving.set(false);
        this.router.navigate(['/member/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Error al registrar la asistencia. Intentalo de nuevo.');
      },
    });
  }
}
