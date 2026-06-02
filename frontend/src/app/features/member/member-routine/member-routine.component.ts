import { Component, inject, signal, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Routine } from '../../../core/types';

@Component({
  selector: 'app-member-routine',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Entrenamiento</div>
          <h1 class="page-title">Mi rutina de hoy</h1>
          <p class="page-subtitle">Tildá los ejercicios a medida que los completes</p>
        </div>
      </div>

      @if (completed()) {
        <div class="card-accent mb-24" style="display:flex;align-items:center;gap: var(--space-3)">
          <div class="stat-icon stat-icon-success" style="width:42px;height:42px;font-size:20px">🎉</div>
          <div>
            <div style="font-family:var(--font-display);font-size:16px;font-weight:500">¡Sesión completada!</div>
            <div style="color:var(--color-text-secondary);font-size:13px">Registramos tu asistencia de hoy. Volvé mañana para más.</div>
          </div>
        </div>
      }

      @if (error()) {
        <div class="alert alert-danger mb-16" role="alert">
          <span class="alert-icon">!</span>
          <div class="alert-content">{{ error() }}</div>
        </div>
      }

      @if (routines().length === 0 && !loading()) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M8 2v4M16 2v4M3 10h18"/>
            </svg>
          </div>
          <h3 class="empty-title">Sin rutina asignada</h3>
          <p class="empty-text">Tu coach aún no te asignó una rutina. Hablá con él en tu próxima visita al gimnasio.</p>
        </div>
      } @else {
        <div class="stack-lg">
          @for (r of routines(); track r.id) {
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">{{ r.name }}</h3>
                  <p class="card-subtitle">{{ r.exercises?.length ?? 0 }} ejercicios · ~{{ estimatedMinutes(r.exercises?.length ?? 0) }} min</p>
                </div>
                <span class="badge badge-primary">Hoy</span>
              </div>

              <div class="stack-sm">
                @for (e of r.exercises; track e.id; let i = $index) {
                  <label class="exercise-item" [class.done]="isChecked(e.id)">
                    <span class="exercise-num">{{ i + 1 }}</span>
                    <input
                      type="checkbox"
                      class="checkbox"
                      [checked]="isChecked(e.id)"
                      (change)="toggleExercise(e.id)"
                      [attr.aria-label]="'Marcar ' + e.name + ' como completado'">
                    <span style="flex:1;font-weight:500;font-size:14px">{{ e.name }}</span>
                    <span class="exercise-detail">{{ e.sets }} × {{ e.reps }}</span>
                  </label>
                }
              </div>

              <div style="margin-top: var(--space-5);padding-top: var(--space-4);border-top:1px solid var(--color-border-light);display:flex;justify-content:flex-end">
                <button class="btn btn-primary" (click)="completeSession()" [disabled]="saving() || completed()">
                  @if (saving()) {
                    <span class="spinner"></span>
                    <span>Registrando…</span>
                  } @else if (completed()) {
                    <span>✓ Completado</span>
                  } @else {
                    <span>Completar sesión</span>
                  }
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MemberRoutineComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private userId = this.auth.user()?.id;
  private storageKey = `member_routine_${this.userId}`;

  routines = toSignal(
    this.http.get<Routine[]>(`/api/v1/routines?user_id=${this.userId}`),
    { initialValue: [] },
  );

  completed = signal(false);
  saving = signal(false);
  loading = signal(false);
  error = signal('');
  checked = signal<Record<string, boolean>>(this.readSaved());

  isChecked(id: string | undefined) { return !!id && !!this.checked()[id]; }

  toggleExercise(id: string | undefined) {
    if (!id) return;
    this.checked.update(c => ({ ...c, [id]: !c[id] }));
    this.persist();
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
        this.saving.set(false);
        this.completed.set(true);
        if (isPlatformBrowser(this.platformId)) {
          try { localStorage.removeItem(this.storageKey); } catch {}
        }
        setTimeout(() => this.router.navigate(['/member/dashboard']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'No pudimos registrar la asistencia. Intentá de nuevo.');
      },
    });
  }

  estimatedMinutes(count: number) {
    return Math.max(15, count * 6);
  }

  private readSaved(): Record<string, boolean> {
    if (!isPlatformBrowser(this.platformId)) return {};
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) ?? '{}');
    } catch {
      return {};
    }
  }

  private persist() {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.checked())); } catch {}
  }
}
