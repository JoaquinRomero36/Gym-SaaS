import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { AuthResponse } from '../../../core/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <input [(ngModel)]="email" name="email" type="email" placeholder="Email"
                 class="border rounded px-3 py-2 text-sm" required>
          <input [(ngModel)]="password" name="password" type="password" placeholder="Contraseña"
                 class="border rounded px-3 py-2 text-sm" required>
          @if (error) { <p class="text-red-600 text-sm">{{ error }}</p> }
          <button type="submit" class="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
            Ingresar
          </button>
        </form>
        <p class="text-center text-sm mt-4">
          ¿No tenés cuenta? <a routerLink="/register" class="text-indigo-600 underline">Registrate</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  error = '';

  onSubmit() {
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: AuthResponse) => {
        this.router.navigate([`/${res.user.role}/dashboard`]);
      },
      error: () => this.error = 'Credenciales inválidas',
    });
  }
}
