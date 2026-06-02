import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { Routine } from '../../../core/types';

@Component({
  selector: 'app-routines',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Entrenamiento</div>
          <h1 class="page-title">Rutinas</h1>
          <p class="page-subtitle">{{ routines().length }} rutinas creadas</p>
        </div>
        <div class="page-actions">
          <a routerLink="/coach/routines/create" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva rutina
          </a>
        </div>
      </div>

      @if (routines().length === 0 && !loading()) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M8 2v4M16 2v4M3 10h18"/>
            </svg>
          </div>
          <h3 class="empty-title">Sin rutinas</h3>
          <p class="empty-text">Creá tu primera rutina y asignala a un miembro para empezar.</p>
          <div class="empty-action">
            <a routerLink="/coach/routines/create" class="btn btn-primary">Crear rutina</a>
          </div>
        </div>
      } @else {
        <div class="stagger stack-sm">
          @for (r of routines(); track r.id) {
            <div class="card card-hover" style="padding: var(--space-4) var(--space-5); display:flex;align-items:center;gap: var(--space-4)">
              <a
                [routerLink]="['/coach/routines/edit', r.id]"
                style="display:flex;align-items:center;gap: var(--space-4);flex:1;min-width:0;text-decoration:none;color:inherit">
                <div class="stat-icon stat-icon-primary" style="width:42px;height:42px;border-radius: var(--radius-md)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <path d="M8 2v4M16 2v4M3 10h18"/>
                  </svg>
                </div>
                <div style="min-width:0;flex:1">
                  <div style="font-family:var(--font-display);font-size:16px;font-weight:500;letter-spacing:-0.01em">{{ r.name }}</div>
                  <div style="color:var(--color-text-secondary);font-size:13px;margin-top:2px">{{ r.exercises?.length ?? 0 }} ejercicios · {{ formatDate(r.createdAt) }}</div>
                </div>
              </a>
              <div style="display:flex;align-items:center;gap: var(--space-1);flex-shrink:0">
                <button
                  type="button"
                  class="btn-icon"
                  (click)="editRoutine(r.id)"
                  title="Editar"
                  [attr.aria-label]="'Editar ' + r.name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  class="btn-icon btn-icon-danger"
                  (click)="deleteRoutine(r.id, r.name)"
                  title="Eliminar"
                  [attr.aria-label]="'Eliminar ' + r.name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RoutinesComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  private refresh$ = new Subject<void>();
  private routinesResource = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<Routine[]>(`/api/v1/routines`)),
    ),
    { initialValue: [] as Routine[] },
  );

  routines = this.routinesResource;
  loading = signal(false);

  constructor() {
    queueMicrotask(() => this.refresh$.next());
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  editRoutine(id: string) {
    this.router.navigate(['/coach/routines/edit', id]);
  }

  deleteRoutine(id: string, name: string) {
    if (!confirm(`¿Eliminar la rutina "${name}"? Esta acción no se puede deshacer.`)) return;
    this.http.delete(`/api/v1/routines/${id}`).pipe(
      catchError(() => of(null)),
    ).subscribe(() => this.refresh$.next());
  }
}
