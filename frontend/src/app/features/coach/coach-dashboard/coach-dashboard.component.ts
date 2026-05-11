import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <h2 class="text-xl font-bold mb-4">Mis Miembros</h2>
      <div class="grid gap-3">
        @for (m of members(); track m.id) {
          <a [routerLink]="['/coach/members', m.id]" class="bg-white rounded shadow p-4 flex justify-between items-center hover:shadow-md transition">
            <div>
              <p class="font-medium">{{ m.name }}</p>
              <p class="text-sm text-gray-500">{{ m.email }} · {{ m.level }}</p>
            </div>
            <span [class]="m.status === 'active' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">{{ m.status }}</span>
          </a>
        }
      </div>
    </div>
  `,
})
export class CoachDashboardComponent {
  private http = inject(HttpClient);
  members = toSignal(this.http.get<any[]>('/api/v1/users'), { initialValue: [] });
}
