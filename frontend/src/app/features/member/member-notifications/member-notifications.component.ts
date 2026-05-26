import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-notifications',
  standalone: true,
  template: `
    <div class="animate-fade" style="max-width:640px">
      <div class="page-header">
        <h1 class="page-title">Notificaciones</h1>
        <p class="page-subtitle">Mensajes y alertas de tu coach</p>
      </div>

      @if (notifications().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🔔</span>
          <h3 class="empty-title">Sin notificaciones</h3>
          <p class="empty-text">Cuando recibas mensajes de tu coach o alertas del sistema, aparecerán acá.</p>
        </div>
      }

      <div style="display:flex;flex-direction:column;gap:12px">
        @for (n of notifications(); track n.id) {
          <div class="notif-item" [class.notif-read]="n.status === 'read'" (click)="markRead(n)" style="cursor:pointer"
               [style.border-left]="'4px solid ' + (n.status === 'pending' ? '#4f46e5' : n.status === 'read' ? '#94a3b8' : n.status === 'sent' ? '#059669' : '#dc2626')"
               [attr.aria-label]="'Notificación: ' + n.message + '. ' + (n.status === 'read' ? 'Leída' : 'Haz clic para marcar como leída')">
            <div class="notif-dot" [style.background]="n.status === 'pending' ? '#eef2ff' : n.status === 'read' ? '#f1f5f9' : n.status === 'sent' ? '#ecfdf5' : '#fef2f2'">
              {{ n.status === 'pending' ? '⏳' : n.status === 'read' ? '👁️' : n.status === 'sent' ? '✅' : '❌' }}
            </div>
            <div class="notif-content">
              <p class="notif-message" [style.fontWeight]="n.status === 'read' ? '400' : '600'">{{ n.message }}</p>
              <div class="notif-meta">
                <span style="font-size:12px;color:var(--color-text-muted)">{{ formatDate(n.createdAt) }}</span>
                <span class="badge" [class.badge-primary]="n.trigger === 'high_risk'"
                      [class.badge-success]="n.trigger === 'milestone'"
                      [class.badge-neutral]="n.trigger === 'manual'">
                  {{ n.trigger }}
                </span>
                <span class="badge" [class.badge-warning]="n.status === 'pending'"
                      [class.badge-success]="n.status === 'sent'"
                      [class.badge-danger]="n.status === 'failed'"
                      [class.badge-neutral]="n.status === 'read'">
                  {{ n.status === 'read' ? 'leída' : n.status }}
                </span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MemberNotificationsComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;
  notifications = toSignal(this.http.get<any[]>(`/api/v1/notifications/user/${this.userId}`), { initialValue: [] });

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  markRead(n: any) {
    if (n.status === 'read') return;
    this.http.patch(`/api/v1/notifications/${n.id}/read`, {}).subscribe();
    n.status = 'read';
  }
}
