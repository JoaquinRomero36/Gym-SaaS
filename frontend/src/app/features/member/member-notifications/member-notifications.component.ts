import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-member-notifications',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h2 class="text-xl font-bold mb-4">Notificaciones</h2>
    <div class="flex flex-col gap-2">
      @for (n of notifications(); track n.id) {
        <div class="bg-white rounded shadow p-4 border-l-4"
             [class.border-indigo-500]="n.status === 'pending'"
             [class.border-green-500]="n.status === 'sent'"
             [class.border-red-500]="n.status === 'failed'">
          <p>{{ n.message }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ n.createdAt | date:'short' }} · {{ n.trigger }}</p>
        </div>
      } @empty {
        <p class="text-gray-400">No tenés notificaciones.</p>
      }
    </div>
  `,
})
export class MemberNotificationsComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;
  notifications = toSignal(this.http.get<any[]>(`/api/v1/notifications/user/${this.userId}`), { initialValue: [] });
}
