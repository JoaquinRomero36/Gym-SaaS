import { Component, inject, computed, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, switchMap, of, catchError, tap, finalize } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { Member, RiskScore, UserRole } from '../../../core/types';
import { riskCategoryFromScore } from '../../../core/types';

interface ActionState {
  calc: Set<string>;
  msg: Set<string>;
}

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Tus miembros</div>
          <h1 class="page-title">Panel del coach</h1>
          <p class="page-subtitle">{{ members().length }} miembros asignados · {{ activeCount() }} activos</p>
        </div>
      </div>

      <div class="grid-3 mb-24">
        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ members().length }}</div>
            <div class="stat-label">Total miembros</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ activeCount() }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-danger">{{ highRiskCount() }}</div>
            <div class="stat-label">Alto riesgo</div>
          </div>
        </div>
      </div>

      @if (members().length === 0 && !loading()) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="empty-title">Sin miembros asignados</h3>
          <p class="empty-text">Aún no tenés miembros. Creá una rutina y asignala para empezar a gestionar tu cartera.</p>
          <div class="empty-action">
            <a routerLink="/coach/routines/create" class="btn btn-primary">+ Nueva rutina</a>
          </div>
        </div>
      } @else {
        <div class="stagger stack-sm">
          @for (m of members(); track m.id) {
            <div class="member-card">
              <a
                [routerLink]="['/coach/members', m.id]"
                class="member-info"
                [attr.aria-label]="'Ver detalle de ' + m.name">
                <div class="avatar">{{ m.name.charAt(0).toUpperCase() }}</div>
                <div class="member-meta">
                  <div class="member-name">{{ m.name }}</div>
                  <div class="member-sub">{{ m.email }} · {{ m.level }}</div>
                </div>
              </a>

              <div class="member-actions">
                <span class="badge" [class.badge-success]="m.status === 'active'" [class.badge-danger]="m.status !== 'active'">
                  {{ statusLabel(m.status) }}
                </span>

                @if (memberRisk(m); as risk) {
                  <span class="badge" [class]="riskBadgeClass(risk.category)">
                    Riesgo {{ (risk.score * 100).toFixed(0) }}%
                  </span>
                }

                <button
                  type="button"
                  class="btn-icon"
                  [class.is-loading]="isCalcLoading(m.id)"
                  [disabled]="isCalcLoading(m.id)"
                  (click)="calculateRisk(m)"
                  title="Recalcular riesgo"
                  [attr.aria-label]="'Recalcular riesgo de ' + m.name">
                  @if (isCalcLoading(m.id)) {
                    <span class="spinner spinner-sm spinner-on-surface"></span>
                  } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12a9 9 0 1 1-9-9c2.49 0 4.74 1 6.36 2.64L21 8"/>
                      <polyline points="21 3 21 8 16 8"/>
                    </svg>
                  }
                </button>

                <button
                  type="button"
                  class="btn-icon"
                  [class.is-loading]="isMsgLoading(m.id)"
                  [disabled]="isMsgLoading(m.id)"
                  (click)="sendMessage(m)"
                  title="Enviar mensaje"
                  [attr.aria-label]="'Enviar mensaje a ' + m.name">
                  @if (isMsgLoading(m.id)) {
                    <span class="spinner spinner-sm spinner-on-surface"></span>
                  } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  }
                </button>

                <a
                  [routerLink]="['/coach/members', m.id]"
                  class="btn-icon"
                  title="Ver detalle"
                  [attr.aria-label]="'Ver detalle de ' + m.name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .btn-icon.is-loading { pointer-events: none; }
  `],
})
export class CoachDashboardComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  private userId = this.auth.user()?.id;

  private refresh$ = new Subject<void>();
  private membersResource = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<Member[]>(`/api/v1/users?coach_id=${this.userId}`)),
    ),
    { initialValue: [] as Member[] },
  );

  private risksResource = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<RiskScore[]>(`/api/v1/risk/all`).pipe(catchError(() => of([] as RiskScore[])))),
    ),
    { initialValue: [] as RiskScore[] },
  );

  members = this.membersResource;
  risks = this.risksResource;

  loading = signal(false);
  actionState = signal<ActionState>({ calc: new Set(), msg: new Set() });

  constructor() {
    queueMicrotask(() => this.refresh$.next());
  }

  activeCount = computed(() => this.members().filter(m => m.status === 'active').length);

  highRiskCount = computed(() => {
    const ids = new Set(this.members().map(m => m.id));
    return this.risks().filter(r => r.category === 'high' && ids.has(r.user_id)).length;
  });

  memberRisk(member: Member): RiskScore | null {
    return this.risks().find(r => r.user_id === member.id) ?? null;
  }

  isCalcLoading(id: string) { return this.actionState().calc.has(id); }
  isMsgLoading(id: string) { return this.actionState().msg.has(id); }

  statusLabel(status: string) {
    return status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Churned';
  }

  riskBadgeClass(category: string) {
    if (category === 'high') return 'badge badge-danger';
    if (category === 'medium') return 'badge badge-warning';
    return 'badge badge-success';
  }

  calculateRisk(member: Member) {
    if (this.isCalcLoading(member.id)) return;
    this.updateAction(s => ({ ...s, calc: new Set([...s.calc, member.id]) }));
    this.http.post(`/api/v1/risk/calculate/${member.id}`, {}).pipe(
      catchError(() => of(null)),
      finalize(() => {
        this.updateAction(s => {
          const next = new Set(s.calc); next.delete(member.id);
          return { ...s, calc: next };
        });
        this.refresh$.next();
      }),
    ).subscribe();
  }

  sendMessage(member: Member) {
    if (this.isMsgLoading(member.id)) return;
    this.updateAction(s => ({ ...s, msg: new Set([...s.msg, member.id]) }));
    this.http.post(`/api/v1/jobs/messaging/${member.id}`, {}).pipe(
      catchError(() => of(null)),
      finalize(() => {
        this.updateAction(s => {
          const next = new Set(s.msg); next.delete(member.id);
          return { ...s, msg: next };
        });
      }),
    ).subscribe();
  }

  private updateAction(fn: (s: ActionState) => ActionState) {
    this.actionState.update(fn);
  }
}
