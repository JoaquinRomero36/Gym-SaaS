import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem { label: string; route: string; icon: string }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-56 bg-white shadow min-h-screen p-4 flex flex-col gap-1">
      @for (item of items(); track item.route) {
        <a [routerLink]="item.route" routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
           class="px-3 py-2 rounded text-sm hover:bg-gray-100 transition flex items-center gap-2">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      }
    </aside>
  `,
})
export class SidebarComponent {
  items = input<NavItem[]>([]);
}
