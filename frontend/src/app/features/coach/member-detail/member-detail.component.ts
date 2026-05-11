import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  template: `
    @if (member(); as m) {
      <div class="bg-white rounded shadow p-6 mb-6">
        <h2 class="text-xl font-bold">{{ m.name }}</h2>
        <p class="text-gray-500">{{ m.email }} · {{ m.level }} · {{ m.status }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded shadow p-4">
          <p class="text-sm text-gray-500">Score de riesgo</p>
          <p class="text-2xl font-bold" [class]="riskColor()">{{ risk()?.score ?? '-' }}</p>
        </div>
        <div class="bg-white rounded shadow p-4">
          <p class="text-sm text-gray-500">Última asistencia</p>
          <p class="text-lg font-medium">{{ lastAttendance()?.date ?? 'Sin datos' }}</p>
        </div>
      </div>

      <div class="bg-white rounded shadow p-6">
        <h3 class="font-bold mb-3">Feedback reciente</h3>
        @for (f of feedbacks(); track f.id) {
          <div class="flex gap-4 border-b py-2 last:border-0">
            <span>Esfuerzo: {{ f.effortLevel }}/5</span>
            <span>Energía: {{ f.energyLevel }}/5</span>
            <span class="text-gray-400 text-sm">{{ f.date }}</span>
          </div>
        } @empty {
          <p class="text-gray-400">Sin feedback registrado</p>
        }
      </div>
    }
  `,
})
export class MemberDetailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private userId = this.route.snapshot.paramMap.get('id')!;

  member = toSignal(this.http.get<any>(`/api/v1/users/${this.userId}`));
  risk = toSignal(this.http.get<any>(`/api/v1/risk/${this.userId}`));
  lastAttendance = toSignal(this.http.get<any>(`/api/v1/attendance/user/${this.userId}/last`));
  feedbacks = toSignal(this.http.get<any[]>(`/api/v1/feedback/user/${this.userId}`), { initialValue: [] });

  riskColor = () => {
    const s = this.risk()?.score;
    if (!s) return 'text-gray-400';
    if (s >= 0.7) return 'text-red-600';
    if (s >= 0.4) return 'text-orange-500';
    return 'text-green-600';
  };
}
