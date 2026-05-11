import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-routine',
  standalone: true,
  template: `
    <h2 class="text-xl font-bold mb-4">Mi Rutina de Hoy</h2>
    @for (r of routines(); track r.id) {
      <div class="bg-white rounded shadow p-4 mb-4">
        <h3 class="font-semibold text-lg mb-2">{{ r.name }}</h3>
        <div class="flex flex-col gap-2">
          @for (e of r.exercises; track e.id) {
            <label class="flex items-center gap-3 border rounded p-3 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" class="accent-indigo-600">
              <span>{{ e.name }}</span>
              <span class="text-sm text-gray-500 ml-auto">{{ e.sets }}x{{ e.reps }}</span>
            </label>
          }
        </div>
      </div>
    } @empty {
      <p class="text-gray-400">No tenés rutinas asignadas todavía.</p>
    }
  `,
})
export class MemberRoutineComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;
  routines = toSignal(this.http.get<any[]>(`/api/v1/routines?user_id=${this.userId}`), { initialValue: [] });
}
