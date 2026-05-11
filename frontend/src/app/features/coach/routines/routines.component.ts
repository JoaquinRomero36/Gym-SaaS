import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Rutinas</h2>
      <a routerLink="/coach/routines/create" class="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">+ Nueva</a>
    </div>
    <div class="grid gap-3">
      @for (r of routines(); track r.id) {
        <div class="bg-white rounded shadow p-4 flex justify-between items-center">
          <div>
            <p class="font-medium">{{ r.name }}</p>
            <p class="text-sm text-gray-500">{{ r.exercises?.length ?? 0 }} ejercicios</p>
          </div>
          <span class="text-xs text-gray-400">{{ r.createdAt | date }}</span>
        </div>
      } @empty {
        <p class="text-gray-400">Sin rutinas aún</p>
      }
    </div>
  `,
})
export class RoutinesComponent {
  private http = inject(HttpClient);
  routines = toSignal(this.http.get<any[]>('/api/v1/routines'), { initialValue: [] });
}
