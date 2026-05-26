import { Component, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .quick-btn {
      display:inline-flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:6px;border:1px solid #e2e8f0;
      background:#fff;color:#64748b;cursor:pointer;transition:all .15s;
      padding:0;flex-shrink:0;
    }
    .quick-btn:hover { background:#f1f5f9;color:#4f46e5;border-color:#c7d2fe; }
    .quick-btn.loading { opacity:.5;pointer-events:none;animation:spin .6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `],
  template: `
    <div class="animate-fade">
      <div class="page-header">
        <h1 class="page-title">Mis Miembros</h1>
        <p class="page-subtitle">{{ members().length }} miembros asignados</p>
      </div>

      <div class="grid-3" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eef2ff;color:#4f46e5">👥</div>
          <div>
            <div class="stat-value" style="color:#4f46e5">{{ members().length }}</div>
            <div class="stat-label">Total miembros</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#eff6ff;color:#2563eb">✅</div>
          <div>
            <div class="stat-value" style="color:#2563eb">{{ activeMembers() }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef2f2;color:#dc2626">⚠️</div>
          <div>
            <div class="stat-value" style="color:#dc2626">{{ highRiskCount() }}</div>
            <div class="stat-label">Alto riesgo</div>
          </div>
        </div>
      </div>

      @if (members().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3 class="empty-title">Sin miembros</h3>
          <p class="empty-text">Aún no tenés miembros asignados. Creá una rutina y asignala para empezar.</p>
          <a routerLink="/coach/routines/create" class="btn btn-primary" style="margin-top:16px">+ Nueva rutina</a>
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
              @if (memberRisk(m); as risk) {
                <span class="badge" [class.badge-danger]="risk >= 0.7" [class.badge-warning]="risk < 0.7 && risk >= 0.4" style="font-size:11px;margin-right:4px">
                  riesgo: {{ (risk * 100).toFixed(0) }}%
                </span>
              }
              <button type="button" class="quick-btn" [class.loading]="loadingCalc().has(m.id)" (click)="calculateRisk($event, m)" style="margin-right:4px" title="Calcular riesgo" [attr.aria-label]="'Calcular riesgo de ' + m.name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
              </button>
              <button type="button" class="quick-btn" [class.loading]="loadingMsg().has(m.id)" (click)="sendMessage($event, m)" style="margin-right:4px" title="Enviar mensaje" [attr.aria-label]="'Enviar mensaje a ' + m.name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </button>
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
  risks = toSignal(this.http.get<any[]>(`/api/v1/risk/all`), { initialValue: [] });
  loadingCalc = signal(new Set<string>());
  loadingMsg = signal(new Set<string>());

  activeMembers = computed(() => this.members().filter((m: any) => m.status === 'active').length);

  highRiskCount = computed(() => {
    const memberIds = new Set(this.members().map((m: any) => m.id));
    return this.risks().filter((r: any) => r.category === 'high' && memberIds.has(r.user_id)).length;
  });

  memberRisk = (member: any): number | null => {
    const r = this.risks().find((r: any) => r.user_id === member.id);
    return r ? r.score : null;
  };

  async calculateRisk(e: MouseEvent, member: any) {
    e.preventDefault();
    e.stopPropagation();
    this.loadingCalc.update(s => new Set([...s, member.id]));
    try {
      await lastValueFrom(this.http.post(`/api/v1/risk/calculate/${member.id}`, {}));
      this.risks = toSignal(this.http.get<any[]>(`/api/v1/risk/all`), { initialValue: [] });
    } catch { }
    this.loadingCalc.update(s => { s.delete(member.id); return new Set(s); });
  }

  async sendMessage(e: MouseEvent, member: any) {
    e.preventDefault();
    e.stopPropagation();
    this.loadingMsg.update(s => new Set([...s, member.id]));
    try {
      await lastValueFrom(this.http.post(`/api/v1/jobs/messaging/${member.id}`, {}));
    } catch { }
    this.loadingMsg.update(s => { s.delete(member.id); return new Set(s); });
  }
}