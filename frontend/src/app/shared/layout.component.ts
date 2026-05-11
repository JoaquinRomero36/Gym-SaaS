import { Component, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent, NavItem } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="flex flex-col h-screen">
      <app-navbar [role]="roleLabel()" [userName]="userName()" (logout)="onLogout()" />
      <div class="flex flex-1">
        <app-sidebar [items]="navItems()" />
        <main class="flex-1 p-6 overflow-y-auto bg-gray-50">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  user = this.auth.user;
  userName = computed(() => this.user()?.name ?? '');
  roleLabel = computed(() => this.user()?.role ?? '');

  navItems = computed<NavItem[]>(() => {
    const role = this.user()?.role;
    if (role === 'admin') return [
      { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
      { label: 'Coaches', route: '/admin/coaches', icon: '👥' },
    ];
    if (role === 'coach') return [
      { label: 'Dashboard', route: '/coach/dashboard', icon: '📊' },
      { label: 'Rutinas', route: '/coach/routines', icon: '📋' },
      { label: 'Crear Rutina', route: '/coach/routines/create', icon: '➕' },
    ];
    return [
      { label: 'Mi Rutina', route: '/member/routine', icon: '💪' },
      { label: 'Feedback', route: '/member/feedback', icon: '⭐' },
      { label: 'Progreso', route: '/member/progress', icon: '📈' },
      { label: 'Notificaciones', route: '/member/notifications', icon: '🔔' },
    ];
  });

  constructor(private auth: AuthService, private router: Router) {}

  onLogout() {
    this.auth.logout();
  }
}
