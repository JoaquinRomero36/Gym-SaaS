import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="landing-gradient">
      <nav class="landing-nav">
        <a routerLink="/" class="navbar-brand">
          <div class="navbar-logo">G</div>
          <span>AI Gym Retention</span>
        </a>
        <div style="display:flex;align-items:center;gap: var(--space-2)">
          @if (auth.isAuthenticated()) {
            <a [routerLink]="dashboardLink()" class="btn btn-primary btn-sm">Ir al panel →</a>
          } @else {
            <a routerLink="/login" class="btn btn-ghost">Ingresar</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Empezar</a>
          }
        </div>
      </nav>

      <section class="landing-hero">
        <div class="landing-pill">
          <span>IA aplicada a retención de clientes</span>
        </div>
        <h1 class="hero-title">
          Reducí la deserción<br>
          con <em>inteligencia artificial</em>
        </h1>
        <p class="hero-subtitle">
          Plataforma premium para gimnasios que predice qué miembros están por abandonar
          y dispara acciones automatizadas para retenerlos. Multi-tenant, lista para escalar.
        </p>
        <div class="hero-cta">
          @if (!auth.isAuthenticated()) {
            <a routerLink="/register" class="btn btn-primary btn-lg">Comenzar gratis</a>
            <a routerLink="/login" class="btn btn-secondary btn-lg">Ya tengo cuenta</a>
          } @else {
            <a [routerLink]="dashboardLink()" class="btn btn-primary btn-lg">Ir al panel</a>
          }
        </div>
      </section>

      <section class="landing-features">
        <div class="stack-lg">
          <div style="text-align:center;max-width:640px;margin:0 auto var(--space-10)">
            <div class="page-eyebrow">Capacidades</div>
            <h2 style="font-family:var(--font-display);font-size:clamp(28px, 4vw, 40px);font-weight:400;letter-spacing:-0.02em;line-height:1.1;margin:0">
              Todo lo que necesita tu gimnasio,<br>
              <em style="color:var(--color-primary)">en un solo lugar</em>
            </h2>
          </div>
          <div class="grid-3">
            <article class="feature-card">
              <div class="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="M7 16l4-4 4 4 5-5"/>
                </svg>
              </div>
              <h3 class="feature-title">Predicción de abandono</h3>
              <p class="feature-desc">
                Modelo de machine learning que analiza 7 features de comportamiento y calcula
                un score de riesgo en tiempo real para cada miembro.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon" style="background:var(--color-accent-bg);color:var(--color-accent-dark)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 class="feature-title">Mensajería con IA</h3>
              <p class="feature-desc">
                Mensajes personalizados generados automáticamente según el nivel, actividad
                y estado emocional de cada miembro.
              </p>
            </article>

            <article class="feature-card">
              <div class="feature-icon" style="background:var(--color-info-bg);color:var(--color-info)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3 class="feature-title">Multi-tenant SaaS</h3>
              <p class="feature-desc">
                Arquitectura multi-gimnasio con aislamiento total de datos, roles diferenciados
                y paneles separados para admin, coach y miembro.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer class="landing-footer">
        <div style="max-width:var(--content-max);margin:0 auto">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap: var(--space-3)">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="navbar-logo" style="width:28px;height:28px;font-size:14px">G</div>
              <span style="font-family:var(--font-display);color:var(--color-text-secondary)">AI Gym Retention</span>
            </div>
            <div>Proyecto demo · Angular + NestJS + Python</div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  protected auth = inject(AuthService);

  dashboardLink(): string {
    const role = this.auth.role();
    return role ? `/${role}/dashboard` : '/login';
  }
}
