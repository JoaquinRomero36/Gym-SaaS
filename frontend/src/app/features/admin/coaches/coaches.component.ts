import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, tap, catchError, of } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { Coach } from '../../../core/types';

@Component({
  selector: 'app-admin-coaches',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div>
      <div class="page-header">
        <div>
          <div class="page-eyebrow">Gestión</div>
          <h1 class="page-title">Coaches</h1>
          <p class="page-subtitle">{{ filteredCoaches().length }} coaches en tu gimnasio</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" (click)="openCreate()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo coach
          </button>
        </div>
      </div>

      <div class="input-search" style="margin-bottom: var(--space-5)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearch($event)"
          placeholder="Buscar por nombre o email…"
          class="input"
          aria-label="Buscar coaches">
      </div>

      @if (filteredCoaches().length === 0 && !loading()) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="empty-title">{{ coaches().length === 0 ? 'Sin coaches' : 'Sin resultados' }}</h3>
          <p class="empty-text">
            {{ coaches().length === 0
                ? 'Aún no hay coaches registrados. Agregá el primero para empezar a gestionar tu equipo.'
                : 'Probá con otro nombre o email.' }}
          </p>
          @if (coaches().length === 0) {
            <div class="empty-action">
              <button class="btn btn-primary" (click)="openCreate()">+ Nuevo coach</button>
            </div>
          }
        </div>
      } @else if (filteredCoaches().length > 0) {
        <div class="card" style="padding: 0; overflow: hidden">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th style="width: 140px; text-align: right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of filteredCoaches(); track c.id) {
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:12px">
                        <div class="avatar avatar-sm">{{ c.name.charAt(0).toUpperCase() }}</div>
                        <span style="font-weight:500">{{ c.name }}</span>
                      </div>
                    </td>
                    <td style="color:var(--color-text-secondary)">{{ c.email }}</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" (click)="openEdit(c)" title="Editar" [attr.aria-label]="'Editar ' + c.name">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button class="btn-icon btn-icon-danger" (click)="deleteCoach(c)" title="Eliminar" [attr.aria-label]="'Eliminar ' + c.name">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" [attr.aria-label]="editingCoach() ? 'Editar coach' : 'Nuevo coach'">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">{{ editingCoach() ? 'Editar coach' : 'Nuevo coach' }}</h2>
              <p class="modal-subtitle">{{ editingCoach() ? 'Modificá los datos del coach' : 'Sumá un nuevo coach a tu equipo' }}</p>
            </div>
            <button type="button" class="btn-icon" (click)="closeForm()" aria-label="Cerrar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form (ngSubmit)="saveCoach()" class="stack" style="gap: var(--space-4)">
            <div class="input-group">
              <label class="input-label" for="coach-name">Nombre</label>
              <input id="coach-name" [(ngModel)]="formName" name="name" placeholder="Nombre completo" class="input" required>
            </div>
            <div class="input-group">
              <label class="input-label" for="coach-email">Email</label>
              <input id="coach-email" [(ngModel)]="formEmail" name="email" type="email" placeholder="coach@email.com" class="input" required>
            </div>
            @if (!editingCoach()) {
              <div class="input-group">
                <label class="input-label" for="coach-pass">Contraseña inicial</label>
                <input id="coach-pass" [(ngModel)]="formPassword" name="password" type="password" placeholder="Mínimo 8 caracteres" class="input">
                <span class="input-hint">Si la dejás vacía, el coach deberá restablecerla.</span>
              </div>
            }
            @if (formError()) {
              <div class="alert alert-danger">
                <span class="alert-icon">!</span>
                <div class="alert-content">{{ formError() }}</div>
              </div>
            }
            <div style="display:flex;gap: var(--space-2);justify-content:flex-end;padding-top: var(--space-2)">
              <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) { <span class="spinner"></span> }
                {{ editingCoach() ? 'Guardar cambios' : 'Crear coach' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CoachesComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private gymId = this.auth.user()?.gymId ?? '';

  private refresh$ = new Subject<void>();
  private coachesResource = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<Coach[]>(`/api/v1/coaches`)),
    ),
    { initialValue: [] as Coach[] },
  );

  coaches = this.coachesResource;
  loading = signal(false);
  searchTerm = signal('');

  filteredCoaches = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    const list = this.coaches();
    if (!q) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  });

  showForm = signal(false);
  editingCoach = signal<Coach | null>(null);
  saving = signal(false);

  formName = '';
  formEmail = '';
  formPassword = '';
  formError = signal('');

  constructor() {
    queueMicrotask(() => this.refresh$.next());
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
  }

  openCreate() {
    this.editingCoach.set(null);
    this.formName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(c: Coach) {
    this.editingCoach.set(c);
    this.formName = c.name;
    this.formEmail = c.email;
    this.formPassword = '';
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  saveCoach() {
    this.formError.set('');
    if (!this.formName?.trim() || !this.formEmail?.trim()) {
      this.formError.set('Completá nombre y email.');
      return;
    }

    this.saving.set(true);
    const edit = this.editingCoach();
    const body = {
      name: this.formName.trim(),
      email: this.formEmail.trim(),
      password: this.formPassword || undefined,
    };

    const op$ = edit
      ? this.http.patch(`/api/v1/coaches/${edit.id}`, body)
      : this.http.post('/api/v1/coaches', { ...body, gym_id: this.gymId });

    op$.pipe(
      catchError((err: HttpErrorResponse) => {
        this.formError.set(err.error?.message || 'Error al guardar.');
        this.saving.set(false);
        return of(null);
      }),
      tap(() => {
        if (edit) this.saving.set(false);
        else this.saving.set(false);
      }),
    ).subscribe(() => {
      this.refresh$.next();
      this.closeForm();
    });
  }

  deleteCoach(c: Coach) {
    if (!confirm(`¿Eliminar al coach "${c.name}"? Esta acción no se puede deshacer.`)) return;
    this.http.delete(`/api/v1/coaches/${c.id}`).pipe(
      catchError(() => of(null)),
    ).subscribe(() => this.refresh$.next());
  }
}
