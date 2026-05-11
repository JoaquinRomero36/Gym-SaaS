import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        @for (item of items(); track item.route) {
          <a [routerLink]="item.route"
             routerLinkActive="active"
             class="sidebar-link">
            <span class="sidebar-icon">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </nav>
      <div class="sidebar-footer">AI Gym Retention v1.0</div>
    </aside>
  `,
})
export class SidebarComponent {
  items = input<NavItem[]>([]);
}
