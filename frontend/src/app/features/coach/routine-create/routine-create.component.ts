import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, finalize, tap } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { Member, Exercise, Routine } from '../../../core/types';

interface DraftExercise extends Exercise {
  _key: string;
}

function newKey(): string {
  return (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

@Component({
  selector: 'app-routine-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div style="max-width:720px">
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Entrenamiento</div>
          <h1 class="page-title">{{ editMode() ? 'Editar rutina' : 'Nueva rutina' }}</h1>
          <p class="page-subtitle">{{ editMode() ? 'Modificá los ejercicios de la rutina' : 'Armá una rutina y asignala a un miembro' }}</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" class="card stack-lg">
        <div class="input-group">
          <label class="input-label" for="rt-name">Nombre de la rutina</label>
          <input id="rt-name" [(ngModel)]="name" name="name" placeholder="Ej: Pecho y tríceps" class="input" required>
        </div>

        <div class="input-group">
          <label class="input-label" for="rt-user">Asignar a miembro (opcional)</label>
          <select id="rt-user" [(ngModel)]="userId" name="userId" class="input">
            <option value="">Sin asignar</option>
            @for (m of members(); track m.id) {
              <option [value]="m.id">{{ m.name }} · {{ m.email }}</option>
            }
          </select>
          <span class="input-hint">Podés asignarla después desde la lista de rutinas.</span>
        </div>

        <div>
          <div class="row-between" style="margin-bottom: var(--space-3)">
            <span style="font-family:var(--font-display);font-size:15px;font-weight:500;letter-spacing:-0.01em">Ejercicios</span>
            <button type="button" (click)="addExercise()" class="btn btn-ghost btn-sm" style="color:var(--color-primary)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Agregar ejercicio
            </button>
          </div>

          @if (exercises().length === 0) {
            <div class="empty-state" style="padding: var(--space-6);background:transparent;border-style:dashed">
              <p class="empty-text">Empezá agregando ejercicios a la rutina.</p>
            </div>
          } @else {
            <div class="stack-sm">
              @for (e of exercises(); track e._key; let i = $index) {
                <div class="exercise-edit-row">
                  <span class="exercise-num">{{ i + 1 }}</span>
                  <input
                    [(ngModel)]="e.name"
                    [name]="'name_' + e._key"
                    placeholder="Nombre del ejercicio"
                    class="input"
                    style="flex:1">
                  <div class="exercise-edit-sets">
                    <input
                      [(ngModel)]="e.sets"
                      [name]="'sets_' + e._key"
                      type="number"
                      min="1"
                      max="20"
                      class="input"
                      style="text-align:center;padding:8px">
                    <span class="exercise-edit-label">series</span>
                  </div>
                  <span style="color:var(--color-text-muted)">×</span>
                  <div class="exercise-edit-sets">
                    <input
                      [(ngModel)]="e.reps"
                      [name]="'reps_' + e._key"
                      type="number"
                      min="1"
                      max="50"
                      class="input"
                      style="text-align:center;padding:8px">
                    <span class="exercise-edit-label">reps</span>
                  </div>
                  <button
                    type="button"
                    class="btn-icon btn-icon-danger"
                    (click)="removeExercise(e._key)"
                    title="Quitar"
                    [attr.aria-label]="'Quitar ' + (e.name || 'ejercicio')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>

        @if (error()) {
          <div class="alert alert-danger" role="alert">
            <span class="alert-icon">!</span>
            <div class="alert-content">{{ error() }}</div>
          </div>
        }

        <div class="row" style="justify-content:flex-end;gap: var(--space-2)">
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) { <span class="spinner"></span> }
            {{ editMode() ? 'Guardar cambios' : 'Crear rutina' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .exercise-edit-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--color-surface-2);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
    }
    .exercise-edit-sets {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .exercise-edit-sets .input { width: 56px; }
    .exercise-edit-label {
      font-size: 11px;
      color: var(--color-text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 600;
    }
    @media (max-width: 640px) {
      .exercise-edit-row { flex-wrap: wrap; }
      .exercise-edit-row .input[style*="flex:1"] { flex: 1 1 100%; }
    }
  `],
})
export class RoutineCreateComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  private gymId = this.auth.user()?.gymId ?? '';

  routineId = this.route.snapshot.paramMap.get('id');
  editMode = computed(() => !!this.routineId);

  name = '';
  userId = '';

  members = toSignal(
    this.http.get<Member[]>(`/api/v1/users`).pipe(catchError(() => of([] as Member[]))),
    { initialValue: [] },
  );

  exercises = signal<DraftExercise[]>([
    { _key: newKey(), name: '', sets: 3, reps: 10, order: 0 },
  ]);

  saving = signal(false);
  error = signal('');

  constructor() {
    if (this.routineId) {
      this.http.get<Routine>(`/api/v1/routines/${this.routineId}`).pipe(
        catchError(() => of(null)),
      ).subscribe(r => {
        if (!r) return;
        this.name = r.name;
        this.userId = r.user_id ?? '';
        const list = r.exercises ?? [];
        this.exercises.set(
          list.map((e, i) => ({
            _key: newKey(),
            id: e.id,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            order: i,
          })),
        );
      });
    }
  }

  addExercise() {
    this.exercises.update(list => [
      ...list,
      { _key: newKey(), name: '', sets: 3, reps: 10, order: list.length },
    ]);
  }

  removeExercise(key: string) {
    this.exercises.update(list => list.filter(e => e._key !== key));
  }

  cancel() {
    this.router.navigate(['/coach/routines']);
  }

  onSubmit() {
    this.error.set('');
    if (!this.name?.trim()) {
      this.error.set('Completá el nombre de la rutina.');
      return;
    }
    const valid = this.exercises().filter(e => e.name?.trim());
    if (valid.length === 0) {
      this.error.set('Agregá al menos un ejercicio con nombre.');
      return;
    }

    this.saving.set(true);
    const body = {
      name: this.name.trim(),
      user_id: this.userId || null,
      gym_id: this.gymId,
    };

    const op$ = this.editMode() && this.routineId
      ? this.http.patch<Routine>(`/api/v1/routines/${this.routineId}`, body)
      : this.http.post<Routine>('/api/v1/routines', body);

    op$.pipe(
      catchError(() => {
        this.error.set(this.editMode() ? 'No pudimos guardar los cambios.' : 'No pudimos crear la rutina.');
        this.saving.set(false);
        return of(null);
      }),
      finalize(() => {}),
    ).subscribe(routine => {
      if (!routine) return;
      const id = routine.id ?? this.routineId!;
      const bulk = valid.map((e, i) => ({
        routine_id: id,
        name: e.name.trim(),
        sets: Number(e.sets) || 3,
        reps: Number(e.reps) || 10,
        order: i,
      }));
      this.http.post('/api/v1/exercises/bulk', bulk).pipe(
        catchError(() => of(null)),
      ).subscribe(() => {
        this.saving.set(false);
        this.router.navigate(['/coach/routines']);
      });
    });
  }
}
