import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, finalize } from 'rxjs';
import { Member, FeedbackEntry, RiskScore, AttendanceLog, riskCategoryFromScore } from '../../../core/types';

interface AttendanceLast { date: string; }

@Component({
  selector: 'app-member-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <div class="page-header">
        <div>
          <a routerLink="/coach/dashboard" class="btn btn-ghost btn-sm" style="margin-bottom: var(--space-3)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver a mis miembros
          </a>
        </div>
      </div>

      @if (member(); as m) {
        <div class="card mb-24">
          <div class="row" style="gap: var(--space-4)">
            <div class="avatar avatar-lg">{{ m.name.charAt(0).toUpperCase() }}</div>
            <div style="flex:1;min-width:0">
              <h1 style="font-family:var(--font-display);font-size:24px;font-weight:500;letter-spacing:-0.015em;margin:0 0 4px">{{ m.name }}</h1>
              <p style="font-size:14px;color:var(--color-text-secondary);margin:0">{{ m.email }} · {{ m.level }}</p>
            </div>
            <div class="row" style="gap: var(--space-2)">
              <span class="badge" [class]="statusBadge(m.status)">{{ statusLabel(m.status) }}</span>
              <button class="btn btn-secondary btn-sm" (click)="calcRisk()" [disabled]="loadingRisk()">
                @if (loadingRisk()) {
                  <span class="spinner spinner-sm spinner-on-surface"></span>
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9c2.49 0 4.74 1 6.36 2.64L21 8"/>
                    <polyline points="21 3 21 8 16 8"/>
                  </svg>
                }
                Recalcular riesgo
              </button>
              <button class="btn btn-primary btn-sm" (click)="sendMsg()" [disabled]="loadingMsg()">
                @if (loadingMsg()) {
                  <span class="spinner spinner-sm"></span>
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                }
                Enviar alerta
              </button>
            </div>
          </div>
        </div>

        @if (actionMsg()) {
          <div class="alert alert-success mb-16" role="status">
            <span class="alert-icon">✓</span>
            <div class="alert-content">{{ actionMsg() }}</div>
          </div>
        }
        @if (actionError()) {
          <div class="alert alert-danger mb-16" role="alert">
            <span class="alert-icon">!</span>
            <div class="alert-content">{{ actionError() }}</div>
          </div>
        }

        <div class="grid-3 mb-24">
          <div class="stat-card">
            <div class="stat-icon" [class]="riskIconClass()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div class="stat-value" [style.color]="riskColor()">{{ risk()?.score?.toFixed(2) ?? '—' }}</div>
              <div class="stat-label">Score de riesgo</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ lastDateLabel() }}</div>
              <div class="stat-label">Última asistencia</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <div class="stat-value text-success">{{ feedbacks().length }}</div>
              <div class="stat-label">Feedbacks registrados</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Feedback reciente</h3>
          </div>
          @if (feedbacks().length === 0) {
            <div class="empty-state" style="padding: var(--space-8) var(--space-4);background:transparent;border:0">
              <p class="empty-text">El miembro aún no registró feedback.</p>
            </div>
          } @else {
            <div class="stack-sm">
              @for (f of recentFeedback(); track f.id) {
                <div class="row" style="padding: var(--space-3) 0;border-bottom:1px solid var(--color-border-light)">
                  <span style="font-size:13px;color:var(--color-text-secondary);width:90px">{{ formatDate(f.date) }}</span>
                  <div class="row" style="gap: var(--space-4);flex:1">
                    <span style="font-size:14px">Esfuerzo: <strong style="font-variant-numeric:tabular-nums">{{ f.effortLevel }}</strong>/5</span>
                    <span style="font-size:14px">Energía: <strong style="font-variant-numeric:tabular-nums">{{ f.energyLevel }}</strong>/5</span>
                  </div>
                  @if (f.note) {
                    <span style="font-size:13px;color:var(--color-text-secondary);font-style:italic;flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">"{{ f.note }}"</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <span class="empty-icon">⏱</span>
          <p class="empty-text">Cargando información del miembro…</p>
        </div>
      }
    </div>
  `,
})
export class MemberDetailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  private userId = this.route.snapshot.paramMap.get('id')!;

  member = toSignal(
    this.http.get<Member>(`/api/v1/users/${this.userId}`).pipe(catchError(() => of(null))),
  );
  risk = toSignal(
    this.http.get<RiskScore>(`/api/v1/risk/${this.userId}`).pipe(catchError(() => of(null))),
  );
  lastAttendance = toSignal(
    this.http.get<AttendanceLast>(`/api/v1/attendance/user/${this.userId}/last`).pipe(catchError(() => of(null))),
  );
  feedbacks = toSignal(
    this.http.get<FeedbackEntry[]>(`/api/v1/feedback/user/${this.userId}`),
    { initialValue: [] },
  );

  loadingRisk = signal(false);
  loadingMsg = signal(false);
  actionMsg = signal('');
  actionError = signal('');

  recentFeedback = computed(() => this.feedbacks().slice(0, 10));

  riskCategory = computed(() => riskCategoryFromScore(this.risk()?.score ?? null));

  riskColor = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'var(--color-danger)';
    if (c === 'medium') return 'var(--color-warning)';
    if (c === 'low') return 'var(--color-success)';
    return 'var(--color-text)';
  });

  riskIconClass = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'stat-icon-danger';
    if (c === 'medium') return 'stat-icon-warning';
    return 'stat-icon-success';
  });

  lastDateLabel = computed(() => {
    const d = this.lastAttendance()?.date;
    if (!d) return '—';
    const date = new Date(d);
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
  });

  statusLabel(status: string) {
    return status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Churned';
  }

  statusBadge(status: string) {
    return status === 'active' ? 'badge-success' : status === 'inactive' ? 'badge-neutral' : 'badge-danger';
  }

  formatDate(d: string): string {
    if (!d) return '';
    const date = new Date(d);
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  calcRisk() {
    this.loadingRisk.set(true);
    this.actionMsg.set('');
    this.actionError.set('');
    this.http.post(`/api/v1/risk/calculate/${this.userId}`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        this.actionError.set(err.error?.message || 'No pudimos recalcular el riesgo.');
        this.loadingRisk.set(false);
        return of(null);
      }),
      finalize(() => this.loadingRisk.set(false)),
    ).subscribe(() => {
      this.actionMsg.set('Riesgo recalculado. Refrescá la página para ver el nuevo valor.');
      setTimeout(() => this.actionMsg.set(''), 4000);
    });
  }

  sendMsg() {
    this.loadingMsg.set(true);
    this.actionMsg.set('');
    this.actionError.set('');
    this.http.post('/api/v1/notifications', {
      user_id: this.userId,
      type: 'alert',
      message: 'Tu coach te recomienda ponerte al día con tus entrenamientos. ¡Te esperamos!',
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.actionError.set(err.error?.message || 'No pudimos enviar la alerta.');
        this.loadingMsg.set(false);
        return of(null);
      }),
      finalize(() => this.loadingMsg.set(false)),
    ).subscribe(() => {
      this.actionMsg.set('Alerta enviada al miembro.');
      setTimeout(() => this.actionMsg.set(''), 4000);
    });
  }
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
