import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';
import { Notification, NotificationStatus, NotificationTrigger } from '../../../core/types';

@Component({
  selector: 'app-member-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Tu cuenta</div>
          <h1 class="page-title">Notificaciones</h1>
          <p class="page-subtitle">Mensajes y alertas de tu coach</p>
        </div>
      </div>

      @if (notifications().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3 class="empty-title">Sin notificaciones</h3>
          <p class="empty-text">Cuando recibas mensajes de tu coach o alertas del sistema, aparecerán acá.</p>
        </div>
      } @else {
        <div class="stack" style="gap: var(--space-3)">
          @for (n of notifications(); track n.id) {
            <article
              class="notif-item"
              [class.notif-read]="n.status === 'read'"
              [style.borderLeft]="'3px solid ' + borderColor(n.status)"
              (click)="markRead(n)"
              (keyup.enter)="markRead(n)"
              tabindex="0"
              [attr.aria-label]="'Notificación: ' + n.message + '. Estado: ' + statusLabel(n.status)">
              <div class="notif-dot" [style.background]="iconBg(n.status)">
                {{ icon(n.status) }}
              </div>
              <div class="notif-content">
                <p class="notif-message" [style.fontWeight]="n.status === 'read' ? '400' : '600'">
                  {{ n.message }}
                </p>
                <div class="notif-meta">
                  <span style="color:var(--color-text-muted)">{{ formatDate(n.createdAt) }}</span>
                  <span class="badge" [class]="triggerBadgeClass(n.trigger)">{{ triggerLabel(n.trigger) }}</span>
                  <span class="badge" [class]="statusBadgeClass(n.status)">{{ statusLabel(n.status) }}</span>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class MemberNotificationsComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private userId = this.auth.user()?.id;
  notifications = toSignal(
    this.http.get<Notification[]>(`/api/v1/notifications/user/${this.userId}`),
    { initialValue: [] },
  );

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  markRead(n: Notification) {
    if (n.status === 'read') return;
    n.status = 'read';
    this.http.patch(`/api/v1/notifications/${n.id}/read`, {}).subscribe();
  }

  statusLabel(status: NotificationStatus) {
    if (status === 'read') return 'leída';
    if (status === 'sent') return 'enviada';
    if (status === 'pending') return 'pendiente';
    if (status === 'failed') return 'fallida';
    return status;
  }

  statusBadgeClass(status: NotificationStatus) {
    if (status === 'sent') return 'badge-success';
    if (status === 'pending') return 'badge-warning';
    if (status === 'failed') return 'badge-danger';
    return 'badge-neutral';
  }

  triggerLabel(trigger: NotificationTrigger) {
    if (trigger === 'high_risk') return 'alto riesgo';
    if (trigger === 'low_feedback') return 'bajo feedback';
    if (trigger === 'inactivity') return 'inactividad';
    if (trigger === 'milestone') return 'hito';
    if (trigger === 'manual') return 'manual';
    return trigger;
  }

  triggerBadgeClass(trigger: NotificationTrigger) {
    if (trigger === 'high_risk') return 'badge-danger';
    if (trigger === 'milestone') return 'badge-success';
    if (trigger === 'inactivity') return 'badge-warning';
    if (trigger === 'low_feedback') return 'badge-info';
    return 'badge-neutral';
  }

  icon(status: NotificationStatus) {
    if (status === 'pending') return '⏱';
    if (status === 'sent') return '✓';
    if (status === 'failed') return '!';
    return '◉';
  }

  iconBg(status: NotificationStatus) {
    if (status === 'pending') return 'var(--color-warning-bg)';
    if (status === 'sent') return 'var(--color-success-bg)';
    if (status === 'failed') return 'var(--color-danger-bg)';
    return 'var(--color-bg-elevated)';
  }

  borderColor(status: NotificationStatus) {
    if (status === 'pending') return 'var(--color-warning)';
    if (status === 'sent') return 'var(--color-success)';
    if (status === 'failed') return 'var(--color-danger)';
    return 'var(--color-border)';
  }
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
