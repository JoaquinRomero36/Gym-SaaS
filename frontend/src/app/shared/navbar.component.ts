import {
  Component, ChangeDetectionStrategy,
  input, output, signal, computed, inject, HostListener, ElementRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Theme } from '../core/theme.service';
import { roleLabel } from '../core/types';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <button
          type="button"
          class="sidebar-toggle"
          (click)="toggleSidebar.emit()"
          aria-label="Alternar menú">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <a routerLink="/" class="navbar-brand">
          <div class="navbar-logo">G</div>
          <span>AI Gym Retention</span>
        </a>
      </div>

      <div class="navbar-right">
        @if (roleLabel()) {
          <span class="badge badge-primary">{{ roleLabel() }}</span>
        }

        <button
          type="button"
          class="theme-toggle"
          (click)="toggleTheme.emit()"
          [attr.aria-label]="theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
          @if (theme() === 'dark') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          } @else {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
        </button>

        <div class="user-menu" (click)="$event.stopPropagation()">
          <button
            type="button"
            class="navbar-user"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            aria-haspopup="menu">
            <div class="navbar-user-info">
              <span class="navbar-user-name">{{ userName() }}</span>
              <span class="navbar-user-role">{{ roleLabel() }}</span>
            </div>
            <div class="avatar avatar-sm">{{ initials() }}</div>
          </button>

          @if (menuOpen()) {
            <div class="user-dropdown animate-scale" role="menu">
              <div class="user-dropdown-header">
                <div class="user-dropdown-name">{{ userName() }}</div>
                <div class="user-dropdown-email">{{ userEmail() }}</div>
              </div>
              <div class="user-dropdown-divider"></div>
              <button type="button" class="user-dropdown-item" (click)="logout.emit(); menuOpen.set(false)" role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }

    .sidebar-toggle {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: none;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-out);
    }
    .sidebar-toggle:hover {
      background: var(--color-bg-elevated);
      color: var(--color-text);
    }
    .sidebar-toggle:focus-visible {
      outline: none;
      box-shadow: var(--shadow-ring);
    }
    @media (max-width: 1023px) {
      .sidebar-toggle { display: inline-flex; }
    }

    .user-menu { position: relative; }
    .user-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      min-width: 240px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 6px;
      z-index: 60;
      transform-origin: top right;
    }
    .user-dropdown-header {
      padding: 12px 14px 10px;
    }
    .user-dropdown-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--color-text);
    }
    .user-dropdown-email {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-top: 2px;
    }
    .user-dropdown-divider {
      height: 1px;
      background: var(--color-border-light);
      margin: 4px 0;
    }
    .user-dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 12px;
      background: transparent;
      border: 0;
      border-radius: var(--radius-sm);
      font-size: 14px;
      color: var(--color-text);
      cursor: pointer;
      text-align: left;
      transition: background-color var(--duration-fast) var(--ease-out);
    }
    .user-dropdown-item:hover {
      background: var(--color-bg-elevated);
    }
    .user-dropdown-item:focus-visible {
      outline: none;
      box-shadow: var(--shadow-ring);
    }
  `],
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private host = inject(ElementRef<HTMLElement>);

  userName = input<string>('');
  userEmail = input<string>('');
  roleLabel = input<string>('');
  theme = input<Theme>('light');

  logout = output<void>();
  toggleTheme = output<void>();
  toggleSidebar = output<void>();

  menuOpen = signal(false);

  initials = computed(() => {
    const name = this.userName() || this.auth.user()?.name || '';
    return name.trim().charAt(0).toUpperCase() || '?';
  });

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.menuOpen()) return;
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.menuOpen.set(false);
  }
}
