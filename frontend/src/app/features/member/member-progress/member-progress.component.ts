import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth.service';
import { AttendanceLog, FeedbackAverages, FeedbackEntry, RiskScore, riskCategoryFromScore } from '../../../core/types';

interface AttendanceCount { count: number; }

@Component({
  selector: 'app-member-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Tu cuenta</div>
          <h1 class="page-title">Mi progreso</h1>
          <p class="page-subtitle">Historial de actividad, feedback y evolución</p>
        </div>
      </div>

      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ attendanceCount()?.count ?? 0 }}</div>
            <div class="stat-label">Asistencias (7d)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" [class]="riskIconClass()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-5"/>
            </svg>
          </div>
          <div>
            <div class="stat-value" [style.color]="riskColor()">{{ riskScoreFormatted() }}</div>
            <div class="stat-label">Score de riesgo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-success">{{ avgEffort() }}</div>
            <div class="stat-label">Esfuerzo promedio</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ avgEnergy() }}</div>
            <div class="stat-label">Energía promedio</div>
          </div>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header">
          <h3 class="card-title">Estado de riesgo</h3>
          <span class="badge" [class]="riskBadgeClass()">{{ riskLabel() }}</span>
        </div>
        <div
          class="progress-bar progress-thick"
          role="progressbar"
          aria-label="Score de riesgo"
          [attr.aria-valuenow]="riskBarWidth()"
          aria-valuemin="0"
          aria-valuemax="100">
          <div class="progress-fill" [style.width.%]="riskBarWidth()" [style.background]="riskBarBg()"></div>
        </div>
        <div class="row-between" style="font-size:11px;color:var(--color-text-muted);margin-top:8px;letter-spacing:0.04em;text-transform:uppercase">
          <span>Bajo riesgo</span>
          <span>Alto riesgo</span>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header">
          <h3 class="card-title">Calendario de asistencias</h3>
          <span style="font-size:12px;color:var(--color-text-muted)">Últimos 30 días</span>
        </div>
        <div class="attendance-calendar">
          @for (d of calendarDays(); track d.label) {
            <div
              class="attendance-day"
              [class.checked]="d.checked"
              [attr.aria-label]="(d.checked ? 'Asististe el ' : 'No asististe el ') + d.fullLabel"
              [title]="d.fullLabel">
              <span class="attendance-day-label">{{ d.label }}</span>
            </div>
          }
        </div>
        <div class="row" style="margin-top: var(--space-4);font-size:12px;color:var(--color-text-muted)">
          <span class="row" style="gap:6px">
            <span class="attendance-day" style="width:14px;height:14px;cursor:default"></span>
            <span>Sin asistencia</span>
          </span>
          <span class="row" style="gap:6px">
            <span class="attendance-day checked" style="width:14px;height:14px;cursor:default"></span>
            <span>Asististe</span>
          </span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Historial de feedback</h3>
        </div>
        @if (feedbackEntries().length === 0) {
          <div class="empty-state" style="padding: var(--space-8) var(--space-4);background:transparent;border:0">
            <p class="empty-text">Aún no registraste feedback. Empezá después de tu próxima sesión.</p>
          </div>
        } @else {
          <div class="stack-sm">
            @for (f of recentFeedback(); track f.id) {
              <div class="feedback-row">
                <span class="feedback-emoji" [class]="feedbackEmojiClass(f.effortLevel)">
                  {{ effortEmoji(f.effortLevel) }}
                </span>
                <div style="flex:1;min-width:0">
                  <div class="row" style="gap: var(--space-4);font-size:14px">
                    <span>Esfuerzo: <strong style="font-variant-numeric:tabular-nums">{{ f.effortLevel }}</strong>/5</span>
                    <span>Energía: <strong style="font-variant-numeric:tabular-nums">{{ f.energyLevel }}</strong>/5</span>
                  </div>
                  @if (f.note) {
                    <div style="color:var(--color-text-secondary);margin-top:4px;font-size:13px;line-height:1.5">{{ f.note }}</div>
                  }
                </div>
                <span style="font-size:12px;color:var(--color-text-muted);white-space:nowrap">{{ formatDate(f.date) }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .attendance-calendar {
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      gap: 6px;
    }
    @media (max-width: 640px) {
      .attendance-calendar { grid-template-columns: repeat(10, 1fr); }
    }
    .attendance-day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: var(--color-bg-elevated);
      color: var(--color-text-muted);
      font-size: 11px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      transition: all var(--duration-fast) var(--ease-out);
    }
    .attendance-day.checked {
      background: var(--color-primary);
      color: var(--color-text-inverse);
      box-shadow: 0 1px 2px rgba(22, 56, 41, 0.2);
    }

    .feedback-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-md);
      transition: border-color var(--duration-fast) var(--ease-out);
    }
    .feedback-row:hover { border-color: var(--color-border); }

    .feedback-emoji {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      background: var(--color-bg-elevated);
    }
    .feedback-emoji.high { background: var(--color-success-bg); }
    .feedback-emoji.mid  { background: var(--color-accent-bg); }
    .feedback-emoji.low  { background: var(--color-warning-bg); }
  `],
})
export class MemberProgressComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private userId = this.auth.user()?.id;

  attendanceCount = toSignal(
    this.http.get<AttendanceCount>(`/api/v1/attendance/user/${this.userId}/count?days=7`),
  );
  attendanceAll = toSignal(
    this.http.get<AttendanceLog[]>(`/api/v1/attendance/user/${this.userId}`),
    { initialValue: [] },
  );
  averages = toSignal(
    this.http.get<FeedbackAverages>(`/api/v1/feedback/user/${this.userId}/averages?last=5`),
  );
  risk = toSignal(this.http.get<RiskScore>(`/api/v1/risk/${this.userId}`));
  feedbackEntries = toSignal(
    this.http.get<FeedbackEntry[]>(`/api/v1/feedback/user/${this.userId}`),
    { initialValue: [] },
  );

  recentFeedback = computed(() => this.feedbackEntries().slice(0, 12));

  calendarDays = computed(() => {
    const dates = new Set<string>();
    for (const a of this.attendanceAll()) {
      if (a.date) {
        const d = new Date(a.date);
        dates.add(toLocalDateKey(d));
      }
    }
    const days: { label: string; fullLabel: string; checked: boolean }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = toLocalDateKey(d);
      days.push({
        label: String(d.getDate()),
        fullLabel: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        checked: dates.has(key),
      });
    }
    return days;
  });

  avgEffort = computed(() => this.averages()?.avgEffort?.toFixed(1) ?? '—');
  avgEnergy = computed(() => this.averages()?.avgEnergy?.toFixed(1) ?? '—');

  riskScore = computed(() => this.risk()?.score ?? 0);
  riskScoreFormatted = computed(() => this.riskScore() ? this.riskScore()!.toFixed(2) : '—');
  riskBarWidth = computed(() => Math.min((this.riskScore() || 0) * 100, 100));

  riskCategory = computed(() => riskCategoryFromScore(this.riskScore() || null));

  riskColor = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'var(--color-danger)';
    if (c === 'medium') return 'var(--color-warning)';
    if (c === 'low') return 'var(--color-success)';
    return 'var(--color-text)';
  });

  riskBarBg = computed(() => this.riskColor());

  riskIconClass = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'stat-icon-danger';
    if (c === 'medium') return 'stat-icon-warning';
    return 'stat-icon-success';
  });

  riskBadgeClass = computed(() => {
    const c = this.riskCategory();
    if (c === 'high') return 'badge-danger';
    if (c === 'medium') return 'badge-warning';
    return 'badge-success';
  });

  riskLabel = computed(() => {
    const c = this.riskCategory();
    return c === 'high' ? 'Alto' : c === 'medium' ? 'Medio' : c === 'low' ? 'Bajo' : '—';
  });

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }

  effortEmoji(level: number) {
    if (level >= 4) return '💪';
    if (level >= 2) return '👍';
    return '😐';
  }

  feedbackEmojiClass(level: number) {
    if (level >= 4) return 'high';
    if (level >= 2) return 'mid';
    return 'low';
  }
}

function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function pad2(n: number) { return String(n).padStart(2, '0'); }
