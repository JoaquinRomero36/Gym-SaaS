import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

let _id = 0;
function newId() { return ++_id; }

@Component({
  selector: 'app-routine-create',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="animate-fade" style="max-width:640px">
      <div class="page-header">
        <h1 class="page-title">Crear Rutina</h1>
        <p class="page-subtitle">Armá una rutina con ejercicios para asignar a un miembro</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="card">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          <div class="input-group">
            <label class="input-label">Nombre de la rutina</label>
            <input [(ngModel)]="name" name="name" placeholder="Ej: Pecho y tríceps" class="input" required>
          </div>
          <div class="input-group">
            <label class="input-label">ID del gym</label>
            <input [(ngModel)]="gymId" name="gymId" placeholder="UUID del gym" class="input" required>
          </div>
        </div>

        <div class="input-group" style="margin-bottom:20px">
          <label class="input-label">ID del usuario (opcional)</label>
          <input [(ngModel)]="userId" name="userId" placeholder="UUID del miembro" class="input">
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

        <button type="submit" class="btn btn-primary" style="width:100%;height:44px">💾 Guardar rutina</button>
      </form>
    </div>
  `,
})
export class RoutineCreateComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  name = '';
  userId = '';
  gymId = '';
  exercises = signal([{ _id: newId(), name: '', sets: 3, reps: 10 }]);
  error = signal('');

  addExercise() {
    this.exercises.update(e => [...e, { _id: newId(), name: '', sets: 3, reps: 10 }]);
  }

  removeExercise(id: number) {
    this.exercises.update(e => e.filter(x => x._id !== id));
  }

  onSubmit() {
    this.error.set('');
    if (!this.name || !this.gymId) { this.error.set('Completá el nombre y el ID del gym'); return; }

    this.http.post('/api/v1/routines', {
      name: this.name,
      user_id: this.userId || null,
      gym_id: this.gymId,
      coach_id: null,
    }).subscribe({
      next: (routine: any) => {
        const bulk = this.exercises().filter(e => e.name).map((e, i) => ({
          routine_id: routine.id, name: e.name, sets: Number(e.sets), reps: Number(e.reps), order: i,
        }));
        if (bulk.length) {
          this.http.post('/api/v1/exercises/bulk', bulk).subscribe(() =>
            this.router.navigate(['/coach/routines'])
          );
        } else {
          this.router.navigate(['/coach/routines']);
        }
      },
      error: () => this.error.set('Error al crear rutina'),
    });
  }
}
