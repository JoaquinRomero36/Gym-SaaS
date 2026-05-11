import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <h1 class="text-lg font-semibold">AI Gym Retention</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm opacity-90">{{ role() }}</span>
        <span class="text-sm font-medium">{{ userName() }}</span>
        <button (click)="logout.emit()" class="text-sm underline hover:no-underline opacity-80">Salir</button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  role = input<string>('');
  userName = input<string>('');
  logout = output<void>();
}
