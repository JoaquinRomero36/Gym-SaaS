import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';

let _id = 0;
function newId() { return ++_id; }

@Component({
  selector: 'app-routine-create',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="animate-fade" style="max-width:640px">
      <div class="page-header">
        <h1 class="page-title">{{ editMode ? 'Editar Rutina' : 'Crear Rutina' }}</h1>
        <p class="page-subtitle">{{ editMode ? 'Modificá los ejercicios de la rutina' : 'Armá una rutina con ejercicios para asignar a un miembro' }}</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <div class="input-group" style="margin-bottom:20px">
          <label class="input-label">Nombre de la rutina</label>
          <input [(ngModel)]="name" name="name" placeholder="Ej: Pecho y tríceps" class="input" required>
        </div>

        <div class="input-group" style="margin-bottom:20px">
          <label class="input-label">Asignar a miembro (opcional)</label>
          <select [(ngModel)]="userId" name="userId" class="input">
            <option value="">Sin asignar</option>
            @for (m of members(); track m.id) {
              <option [value]="m.id">{{ m.name }} ({{ m.email }})</option>
            }
          </select>
        </div>

        <div style="border-top:1px solid var(--color-border-light);padding-top:16px;margin-bottom:16px">
          <div class="flex-between" style="margin-bottom:12px">
            <span style="font-size:14px;font-weight:600;color:var(--color-text)">Ejercicios</span>
            <button type="button" (click)="addExercise()" class="btn btn-ghost" style="color:var(--color-primary);font-weight:500">+ Agregar</button>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            @for (e of exercises(); track e._id) {
              <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#f8fafc;border-radius:var(--radius-md)">
                <span style="font-size:13px;font-weight:700;color:#94a3b8;width:20px;text-align:center">{{ e._id }}</span>
                <input [(ngModel)]="e.name" [name]="'name_'+e._id" placeholder="Nombre" class="input" style="flex:1;font-size:13px;padding:8px 12px">
                <input [(ngModel)]="e.sets" [name]="'sets_'+e._id" type="number" placeholder="S" class="input" style="width:56px;text-align:center;font-size:13px;padding:8px">
                <input [(ngModel)]="e.reps" [name]="'reps_'+e._id" type="number" placeholder="R" class="input" style="width:56px;text-align:center;font-size:13px;padding:8px">
                <button type="button" (click)="removeExercise(e._id)" class="btn btn-ghost" style="color:#dc2626;padding:4px">✕</button>
              </div>
            }
          </div>
        </div>

        @if (error()) {
          <div style="background:var(--color-danger-bg);color:var(--color-danger);padding:12px 16px;border-radius:var(--radius-md);font-size:13px;margin-bottom:16px">{{ error() }}</div>
        }

        <button type="submit" class="btn btn-primary" style="width:100%;height:44px">{{ editMode ? 'Actualizar rutina' : 'Guardar rutina' }}</button>
      </form>
    </div>
  `,
})
export class RoutineCreateComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  routineId: string | null = null;
  editMode = false;
  name = '';
  userId = '';
  gymId = this.auth.user()?.gymId ?? '';
  members = toSignal(this.http.get<any[]>(`/api/v1/users`), { initialValue: [] });
  exercises = signal([{ _id: newId(), name: '', sets: 3, reps: 10 }]);
  error = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.routineId = id;
      this.editMode = true;
      this.http.get<any>(`/api/v1/routines/${id}`).subscribe(r => {
        this.name = r.name;
        this.userId = r.user_id ?? '';
        this.exercises.set((r.exercises ?? []).map((e: any, i: number) => ({
          _id: newId(), id: e.id, name: e.name, sets: e.sets, reps: e.reps, order: i,
        })));
      });
    }
  }

  addExercise() {
    this.exercises.update(e => [...e, { _id: newId(), name: '', sets: 3, reps: 10 }]);
  }

  removeExercise(id: number) {
    this.exercises.update(e => e.filter(x => x._id !== id));
  }

  onSubmit() {
    this.error.set('');
    if (!this.name) { this.error.set('Completá el nombre de la rutina'); return; }

    const body = {
      name: this.name,
      user_id: this.userId || null,
      gym_id: this.gymId,
    };

    const request$ = this.editMode && this.routineId
      ? this.http.patch(`/api/v1/routines/${this.routineId}`, body)
      : this.http.post('/api/v1/routines', body);

    request$.subscribe({
      next: (routine: any) => {
        const id = routine.id ?? this.routineId;
        const bulk = this.exercises().filter(e => e.name).map((e, i) => ({
          routine_id: id, name: e.name, sets: Number(e.sets), reps: Number(e.reps), order: i,
        }));
        if (bulk.length) {
          this.http.post('/api/v1/exercises/bulk', bulk).subscribe(() =>
            this.router.navigate(['/coach/routines'])
          );
        } else {
          this.router.navigate(['/coach/routines']);
        }
      },
      error: () => this.error.set(this.editMode ? 'Error al actualizar rutina' : 'Error al crear rutina'),
    });
  }
}
