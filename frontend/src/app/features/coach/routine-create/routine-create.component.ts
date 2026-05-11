import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routine-create',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-white rounded shadow p-6 max-w-lg">
      <h2 class="text-xl font-bold mb-4">Crear Rutina</h2>
      <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <input [(ngModel)]="name" name="name" placeholder="Nombre de la rutina" class="border rounded px-3 py-2 text-sm" required>

        <div class="flex gap-2 items-center">
          <input [(ngModel)]="userId" name="userId" placeholder="ID del usuario" class="border rounded px-3 py-2 text-sm flex-1">
          <input [(ngModel)]="gymId" name="gymId" placeholder="ID del gym" class="border rounded px-3 py-2 text-sm flex-1">
        </div>

        <h3 class="font-semibold mt-2">Ejercicios</h3>
        @for (e of exercises(); track $index) {
          <div class="flex gap-2 items-center">
            <input [(ngModel)]="e.name" [name]="'name_'+$index" placeholder="Nombre" class="border rounded px-2 py-1 text-sm flex-1">
            <input [(ngModel)]="e.sets" [name]="'sets_'+$index" type="number" placeholder="Sets" class="border rounded px-2 py-1 text-sm w-16">
            <input [(ngModel)]="e.reps" [name]="'reps_'+$index" type="number" placeholder="Reps" class="border rounded px-2 py-1 text-sm w-16">
          </div>
        }
        <button type="button" (click)="addExercise()" class="text-indigo-600 text-sm self-start">+ Agregar ejercicio</button>

        @if (error) { <p class="text-red-600 text-sm">{{ error }}</p> }
        <button type="submit" class="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Guardar Rutina</button>
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
  exercises = signal([{ name: '', sets: 3, reps: 10 }]);
  error = '';

  addExercise() {
    this.exercises.update(e => [...e, { name: '', sets: 3, reps: 10 }]);
  }

  onSubmit() {
    this.error = '';
    if (!this.name || !this.gymId) { this.error = 'Completá nombre y gym ID'; return; }

    this.http.post('/api/v1/routines', { name: this.name, user_id: this.userId || null, gym_id: this.gymId })
      .subscribe({
        next: (routine: any) => {
          const bulk = this.exercises().filter(e => e.name).map((e, i) => ({
            routine_id: routine.id, name: e.name, sets: e.sets, reps: e.reps, order: i,
          }));
          if (bulk.length) {
            this.http.post('/api/v1/exercises/bulk', bulk).subscribe(() =>
              this.router.navigate(['/coach/routines'])
            );
          } else {
            this.router.navigate(['/coach/routines']);
          }
        },
        error: () => this.error = 'Error al crear rutina',
      });
  }
}
