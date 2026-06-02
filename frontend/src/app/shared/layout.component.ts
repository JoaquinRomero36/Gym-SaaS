import { Component, ChangeDetectionStrategy, inject, signal, computed, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent, NavItem, NavSection } from './sidebar.component';
import { UserRole, roleLabel } from '../core/types';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-navbar
        [userName]="userName()"
        [userEmail]="userEmail()"
        [roleLabel]="roleLabelText()"
        [theme]="theme.theme()"
        (logout)="onLogout()"
        (toggleTheme)="theme.toggle()"
        (toggleSidebar)="sidebarOpen.set(!sidebarOpen())"
      />

      <div class="app-body">
        <app-sidebar
          [sections]="navSections()"
          [open]="sidebarOpen()"
          (navigated)="sidebarOpen.set(false)"
        />

        @if (sidebarOpen()) {
          <div class="sidebar-backdrop" (click)="sidebarOpen.set(false)" aria-hidden="true"></div>
        }

        <main class="app-content">
          <div class="app-content-inner animate-fade">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      inset: var(--navbar-height) 0 0 0;
      background: rgba(26, 26, 26, 0.4);
      backdrop-filter: blur(2px);
      z-index: 30;
      animation: fadeIn 0.2s var(--ease-out);
    }
    @media (min-width: 1024px) {
      .sidebar-backdrop { display: none; }
    }
  `],
})
export class LayoutComponent {
  private auth = inject(AuthService);
  protected theme = inject(ThemeService);

  userName = computed(() => this.auth.user()?.name ?? '');
  userEmail = computed(() => this.auth.user()?.email ?? '');
  roleLabelText = computed(() => roleLabel(this.auth.user()?.role));

  sidebarOpen = signal(false);

  navSections = computed<NavSection[]>(() => {
    const role = this.auth.user()?.role as UserRole | undefined;
    if (role === 'admin') {
      return [
        {
          label: 'General',
          items: [
            { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
          ],
        },
        {
          label: 'Gestión',
          items: [
            { label: 'Coaches', route: '/admin/coaches', icon: 'coaches' },
          ],
        },
      ];
    }
    if (role === 'coach') {
      return [
        {
          label: 'General',
          items: [
            { label: 'Mis miembros', route: '/coach/dashboard', icon: 'members' },
          ],
        },
        {
          label: 'Entrenamiento',
          items: [
            { label: 'Rutinas', route: '/coach/routines', icon: 'routine' },
            { label: 'Crear rutina', route: '/coach/routines/create', icon: 'plus' },
          ],
        },
      ];
    }
    return [
      {
        label: 'Tu cuenta',
        items: [
          { label: 'Resumen', route: '/member/dashboard', icon: 'dashboard' },
        ],
      },
      {
        label: 'Entrenamiento',
        items: [
          { label: 'Mi rutina', route: '/member/routine', icon: 'routine' },
          { label: 'Feedback', route: '/member/feedback', icon: 'star' },
          { label: 'Mi progreso', route: '/member/progress', icon: 'chart' },
          { label: 'Notificaciones', route: '/member/notifications', icon: 'bell' },
        ],
      },
    ];
  });

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024) this.sidebarOpen.set(false);
  }

  onLogout() {
    this.auth.logout();
  }
}
