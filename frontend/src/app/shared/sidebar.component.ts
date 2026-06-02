import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  badge?: string | number;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export type IconName =
  | 'dashboard' | 'members' | 'coaches' | 'routine' | 'plus'
  | 'star' | 'chart' | 'bell' | 'settings' | 'logout';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="!open()">
      <div class="sidebar-header">
        <div class="sidebar-greeting">
          <div class="sidebar-greeting-eyebrow">Panel</div>
          <div class="sidebar-greeting-title">Menú</div>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Navegación principal">
        @for (section of sections(); track $index; let last = $last) {
          @if (section.label) {
            <div class="sidebar-section-label">{{ section.label }}</div>
          }
          @for (item of section.items; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="sidebar-link"
              (click)="navigated.emit()">
              <span class="sidebar-icon">
                @switch (item.icon) {
                  @case ('dashboard') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="9" rx="1"/>
                      <rect x="14" y="3" width="7" height="5" rx="1"/>
                      <rect x="14" y="12" width="7" height="9" rx="1"/>
                      <rect x="3" y="16" width="7" height="5" rx="1"/>
                    </svg>
                  }
                  @case ('members') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  }
                  @case ('coaches') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <circle cx="17" cy="7" r="3"/>
                    </svg>
                  }
                  @case ('routine') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2"/>
                      <path d="M8 2v4M16 2v4M3 10h18"/>
                    </svg>
                  }
                  @case ('plus') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  }
                  @case ('star') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  }
                  @case ('chart') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                      <line x1="3" y1="20" x2="21" y2="20"/>
                    </svg>
                  }
                  @case ('bell') {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  }
                  @default {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9"/>
                    </svg>
                  }
                }
              </span>
              <span class="sidebar-label">{{ item.label }}</span>
              @if (item.badge) {
                <span class="sidebar-badge">{{ item.badge }}</span>
              }
            </a>
          }
          @if (!last) { <div class="sidebar-section-spacer"></div> }
        }
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-footer-brand">AI Gym Retention</div>
        <div>v1.0 · premium</div>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: contents; }

    @media (max-width: 1023px) {
      .sidebar {
        position: fixed;
        top: var(--navbar-height);
        left: 0;
        bottom: 0;
        z-index: 40;
        transform: translateX(-100%);
        transition: transform var(--duration) var(--ease-out);
        box-shadow: var(--shadow-xl);
      }
      .sidebar:not(.collapsed) {
        transform: translateX(0);
      }
    }

    .sidebar-greeting {
      padding: 4px 8px;
    }
    .sidebar-greeting-eyebrow {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--color-text-muted);
    }
    .sidebar-greeting-title {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 500;
      letter-spacing: -0.01em;
      color: var(--color-text);
      margin-top: 2px;
    }

    .sidebar-section-spacer { height: 12px; }

    .sidebar-badge {
      margin-left: auto;
      background: var(--color-primary);
      color: var(--color-text-inverse);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: var(--radius-full);
    }

    .sidebar-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      transition: color var(--duration-fast) var(--ease-out);
    }
    .sidebar-link:hover .sidebar-icon,
    .sidebar-link.active .sidebar-icon {
      color: var(--color-primary);
    }

    .sidebar-footer-brand {
      font-family: var(--font-display);
      font-weight: 500;
      color: var(--color-text-secondary);
      margin-bottom: 2px;
      font-size: 12px;
    }
  `],
})
export class SidebarComponent {
  sections = input<NavSection[]>([]);
  open = input<boolean>(true);
  navigated = output<void>();
}
