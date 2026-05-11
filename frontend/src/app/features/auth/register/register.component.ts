import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../core/types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center">Registro</h2>
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <input [(ngModel)]="name" name="name" placeholder="Nombre" class="border rounded px-3 py-2 text-sm" required>
          <input [(ngModel)]="email" name="email" type="email" placeholder="Email" class="border rounded px-3 py-2 text-sm" required>
          <input [(ngModel)]="password" name="password" type="password" placeholder="Contraseña" class="border rounded px-3 py-2 text-sm" required>
          @if (error) { <p class="text-red-600 text-sm">{{ error }}</p> }
          @if (success) { <p class="text-green-600 text-sm">{{ success }}</p> }
          <button type="submit" class="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">Registrarse</button>
        </form>
        <p class="text-center text-sm mt-4">
          ¿Ya tenés cuenta? <a routerLink="/login" class="text-indigo-600 underline">Ingresá</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  name = ''; email = ''; password = '';
  error = ''; success = '';

  onSubmit() {
    this.error = ''; this.success = '';
    this.auth.register({ gym_id: '', name: this.name, email: this.email, password: this.password }).subscribe({
      next: (_res: AuthResponse) => {
        this.success = 'Registro exitoso. Redirigiendo...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => this.error = 'Error al registrarse',
    });
  }
}
