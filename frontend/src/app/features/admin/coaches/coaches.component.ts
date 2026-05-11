import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-coaches',
  standalone: true,
  template: `
    <div class="bg-white rounded shadow p-6">
      <h2 class="text-lg font-bold mb-4">Coaches del sistema</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left border-b">
            <th class="pb-2">Nombre</th><th class="pb-2">Email</th><th class="pb-2">Gym</th>
          </tr>
        </thead>
        <tbody>
          @for (c of coaches(); track c.id) {
            <tr class="border-b last:border-0">
              <td class="py-2">{{ c.name }}</td>
              <td class="py-2">{{ c.email }}</td>
              <td class="py-2">{{ c.gym_id }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CoachesComponent {
  private http = inject(HttpClient);
  coaches = toSignal(this.http.get<any[]>('/api/v1/coaches'), { initialValue: [] });
}
