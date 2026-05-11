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
    <div style="display:flex;flex-direction:column;height:100vh">
      <app-navbar [role]="roleLabel()" [userName]="userName()" (logout)="onLogout()" />
      <div style="display:flex;flex:1;overflow:hidden">
        <app-sidebar [items]="navItems()" />
        <main style="flex:1;overflow-y:auto;padding:32px;background:var(--color-bg)">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  user = this.auth.user;
  userName = computed(() => this.user()?.name ?? '');
  roleLabel = computed(() => {
    const r = this.user()?.role;
    return r === 'admin' ? 'Administrador' : r === 'coach' ? 'Coach' : 'Miembro';
  });

  navItems = computed<NavItem[]>(() => {
    const role = this.user()?.role;
    if (role === 'admin') return [
      { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
      { label: 'Coaches', route: '/admin/coaches', icon: '👥' },
    ];
    if (role === 'coach') return [
      { label: 'Dashboard', route: '/coach/dashboard', icon: '📊' },
      { label: 'Rutinas', route: '/coach/routines', icon: '📋' },
      { label: 'Nueva Rutina', route: '/coach/routines/create', icon: '➕' },
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
