import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-member-feedback',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2 class="text-xl font-bold mb-4">Feedback de la sesión</h2>
    <form (ngSubmit)="onSubmit()" class="bg-white rounded shadow p-6 max-w-md flex flex-col gap-4">
      <div>
        <label class="text-sm font-medium">Esfuerzo (1-5)</label>
        <div class="flex gap-2 mt-1">
          @for (n of [1,2,3,4,5]; track n) {
            <button type="button" (click)="effort.set(n)"
                    [class]="'w-10 h-10 rounded-full border text-sm ' + (effort() === n ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100')">
              {{ n }}
            </button>
          }
        </div>
      </div>
      <div>
        <label class="text-sm font-medium">Energía (1-5)</label>
        <div class="flex gap-2 mt-1">
          @for (n of [1,2,3,4,5]; track n) {
            <button type="button" (click)="energy.set(n)"
                    [class]="'w-10 h-10 rounded-full border text-sm ' + (energy() === n ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100')">
              {{ n }}
            </button>
          }
        </div>
      </div>
      @if (sent()) { <p class="text-green-600 text-sm">¡Feedback registrado!</p> }
      <button type="submit" class="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Enviar</button>
    </form>
  `,
})
export class MemberFeedbackComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  effort = signal(3);
  energy = signal(3);
  sent = signal(false);

  onSubmit() {
    const user = this.auth.user();
    if (!user) return;
    this.http.post('/api/v1/feedback', {
      user_id: user.id, gym_id: user.gym_id,
      date: new Date().toISOString().split('T')[0],
      effort_level: this.effort(),
      energy_level: this.energy(),
    }).subscribe(() => this.sent.set(true));
  }
}
