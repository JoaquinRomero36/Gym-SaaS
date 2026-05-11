import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-coaches',
  standalone: true,
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <h1 class="page-title">Coaches</h1>
        <p class="page-subtitle">{{ coaches().length }} coaches registrados</p>
      </div>

      @if (coaches().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3 class="empty-title">Sin coaches</h3>
          <p class="empty-text">Aún no hay coaches registrados en el sistema.</p>
        </div>
      }

      <div class="card" style="padding:0;overflow:hidden">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Gym</th>
              </tr>
            </thead>
            <tbody>
              @for (c of coaches(); track c.id) {
                <tr>
                  <td style="font-weight:500">{{ c.name }}</td>
                  <td style="color:var(--color-text-secondary)">{{ c.email }}</td>
                  <td><span class="badge badge-primary">{{ c.gym_id?.substring(0, 8) }}...</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class CoachesComponent {
  private http = inject(HttpClient);
  coaches = toSignal(this.http.get<any[]>('/api/v1/coaches'), { initialValue: [] });
}
