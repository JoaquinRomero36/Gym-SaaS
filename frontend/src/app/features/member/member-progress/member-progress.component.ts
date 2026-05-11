import { Component, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-member-progress',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h2 class="text-xl font-bold mb-4">Mi Progreso</h2>
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded shadow p-4">
        <p class="text-sm text-gray-500">Asistencias (7 días)</p>
        <p class="text-3xl font-bold text-indigo-600">{{ attendanceCount()?.count ?? 0 }}</p>
      </div>
      <div class="bg-white rounded shadow p-4">
        <p class="text-sm text-gray-500">Score de riesgo</p>
        <p class="text-3xl font-bold" [class]="riskClass()">{{ risk()?.score ?? '-' }}</p>
      </div>
    </div>
  `,
})
export class MemberProgressComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;

  attendanceCount = toSignal(this.http.get<any>(`/api/v1/attendance/user/${this.userId}/count?days=7`));
  risk = toSignal(this.http.get<any>(`/api/v1/risk/${this.userId}`));

  riskClass = computed(() => {
    const s = this.risk()?.score;
    if (!s) return 'text-gray-400';
    return s >= 0.7 ? 'text-red-600' : s >= 0.4 ? 'text-orange-500' : 'text-green-600';
  });
}
