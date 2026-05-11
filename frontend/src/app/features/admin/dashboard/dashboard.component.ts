import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayoutComponent } from '../../../shared/layout.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded shadow p-4">
          <p class="text-gray-500 text-sm">Usuarios activos</p>
          <p class="text-3xl font-bold">{{ stats()?.active_users ?? '-' }}</p>
        </div>
        <div class="bg-white rounded shadow p-4">
          <p class="text-gray-500 text-sm">En riesgo</p>
          <p class="text-3xl font-bold text-orange-600">{{ stats()?.at_risk ?? '-' }}</p>
        </div>
        <div class="bg-white rounded shadow p-4">
          <p class="text-gray-500 text-sm">Mensajes enviados</p>
          <p class="text-3xl font-bold text-indigo-600">{{ stats()?.messages_sent ?? '-' }}</p>
        </div>
      </div>
    </app-layout>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);
  stats = toSignal(this.http.get<any>('/api/v1/gyms'));
}
