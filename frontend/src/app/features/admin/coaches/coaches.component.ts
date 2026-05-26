import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-admin-coaches',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="animate-fade">
      <div class="flex-between" class="mb-24">
        <div>
          <h1 class="page-title" style="margin:0">Coaches</h1>
          <p class="page-subtitle">{{ filteredCoaches().length }} coaches registrados</p>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">+ Nuevo coach</button>
      </div>

      <div style="margin-bottom:16px">
        <input #searchInput (input)="searchTerm.set(searchInput.value)" placeholder="Buscar por nombre o email..." class="input" style="max-width:320px">
      </div>

      @if (filteredCoaches().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3 class="empty-title">{{ coaches().length === 0 ? 'Sin coaches' : 'Sin resultados' }}</h3>
          <p class="empty-text">{{ coaches().length === 0 ? 'Aún no hay coaches registrados en el sistema. Agregá el primer coach para empezar.' : 'No hay coaches que coincidan con la búsqueda.' }}</p>
          @if (coaches().length === 0) {
            <button class="btn btn-primary" style="margin-top:16px" (click)="openCreate()">+ Nuevo coach</button>
          }
        </div>
      }

      <div class="card" style="padding:0;overflow:hidden">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th style="width:140px">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filteredCoaches(); track c.id) {
                <tr>
                  <td style="font-weight:500">{{ c.name }}</td>
                  <td style="color:var(--color-text-secondary)">{{ c.email }}</td>
                  <td>
                    <button class="btn btn-ghost" style="padding:4px 10px;font-size:13px" (click)="openEdit(c)">Editar</button>
                    <button class="btn btn-ghost" style="padding:4px 10px;font-size:13px;color:var(--color-danger)" (click)="deleteCoach(c)">Eliminar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingCoach() ? 'Editar Coach' : 'Nuevo Coach' }}</h2>
            <button class="btn btn-ghost" (click)="closeForm()" style="padding:4px 8px">✕</button>
          </div>
          <form (ngSubmit)="saveCoach()" style="display:flex;flex-direction:column;gap:16px">
            <div class="input-group">
              <label class="input-label">Nombre</label>
              <input [(ngModel)]="formName" name="name" placeholder="Nombre completo" class="input" required>
            </div>
            <div class="input-group">
              <label class="input-label">Email</label>
              <input [(ngModel)]="formEmail" name="email" type="email" placeholder="coach@email.com" class="input" required>
            </div>
            @if (!editingCoach()) {
              <div class="input-group">
                <label class="input-label">Contraseña {{ formPassword ? '(opcional)' : '' }}</label>
                <input [(ngModel)]="formPassword" name="password" type="password" placeholder="••••••••" class="input">
              </div>
            }
            @if (formError()) {
              <div class="alert alert-danger">{{ formError() }}</div>
            }
            <button type="submit" class="btn btn-primary" style="width:100%">{{ editingCoach() ? 'Guardar cambios' : 'Crear coach' }}</button>
          </form>
        </div>
      </div>
    }
  `,
})
export class CoachesComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  gymId = this.auth.user()?.gymId ?? '';

  coaches = toSignal(this.http.get<any[]>('/api/v1/coaches'), { initialValue: [] });
  searchTerm = signal('');

  filteredCoaches = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.coaches().filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  });

  showForm = signal(false);
  editingCoach = signal<any | null>(null);
  formName = '';
  formEmail = '';
  formPassword = '';
  formError = signal('');

  openCreate() {
    this.editingCoach.set(null);
    this.formName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(c: any) {
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
    if (!this.formName || !this.formEmail) {
      this.formError.set('Completá nombre y email');
      return;
    }

    const edit = this.editingCoach();
    if (edit) {
      this.http.patch(`/api/v1/coaches/${edit.id}`, {
        name: this.formName,
        email: this.formEmail,
        password: this.formPassword || undefined,
      }).subscribe({
        next: () => { this.showForm.set(false); window.location.reload(); },
        error: (err: HttpErrorResponse) => this.formError.set(err.error?.message || 'Error al actualizar'),
      });
    } else {
      this.http.post('/api/v1/coaches', {
        gym_id: this.gymId,
        name: this.formName,
        email: this.formEmail,
        password: this.formPassword || undefined,
      }).subscribe({
        next: () => { this.showForm.set(false); window.location.reload(); },
        error: (err: HttpErrorResponse) => this.formError.set(err.error?.message || 'Error al crear coach'),
      });
    }
  }

  deleteCoach(c: any) {
    if (!confirm(`¿Eliminar al coach "${c.name}"?`)) return;
    this.http.delete(`/api/v1/coaches/${c.id}`).subscribe({
      next: () => window.location.reload(),
    });
  }
}
