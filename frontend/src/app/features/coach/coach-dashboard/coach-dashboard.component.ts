import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <h1 class="page-title">Mis Miembros</h1>
        <p class="page-subtitle">{{ members().length }} miembros asignados</p>
      </div>

      @if (members().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3 class="empty-title">Sin miembros</h3>
          <p class="empty-text">Aún no tenés miembros asignados.</p>
        </div>
      }

      <div style="display:flex;flex-direction:column;gap:8px">
        @for (m of members(); track m.id) {
          <a [routerLink]="['/coach/members', m.id]" class="member-card">
            <div style="display:flex;align-items:center;gap:16px">
              <div class="avatar" style="background:#eef2ff;color:#4f46e5">{{ m.name.charAt(0) }}</div>
              <div>
                <div style="font-weight:600;font-size:14px;margin-bottom:2px">{{ m.name }}</div>
                <div style="font-size:13px;color:var(--color-text-secondary)">{{ m.email }} · {{ m.level }}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="badge" [class.badge-success]="m.status === 'active'" [class.badge-danger]="m.status !== 'active'">
                {{ m.status }}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </a>
        }
      </div>
    </div>
  `,
})
export class CoachDashboardComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  userId = this.auth.user()?.id;
  members = toSignal(this.http.get<any[]>(`/api/v1/users?coach_id=${this.userId}`), { initialValue: [] });
}
