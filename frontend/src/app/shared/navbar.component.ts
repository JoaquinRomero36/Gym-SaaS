import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `
    <header class="navbar">
      <div class="navbar-brand">
        <div class="navbar-logo">G</div>
        <span>AI Gym Retention</span>
      </div>
      <div class="navbar-right">
        <span class="badge badge-primary">{{ role() }}</span>
        <span style="font-size:14px;color:#475569;font-weight:500">{{ userName() }}</span>
        <div class="avatar avatar-sm" style="background:#eef2ff;color:#4f46e5">
          {{ userName().charAt(0) || '?' }}
        </div>
        <button (click)="logout.emit()" class="btn btn-ghost" style="gap:6px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Salir
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  role = input<string>('');
  userName = input<string>('');
  logout = output<void>();
}
