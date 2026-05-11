import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-gradient">
      <nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;max-width:1200px;margin:0 auto">
        <div class="navbar-brand">
          <div class="navbar-logo">G</div>
          <span>AI Gym Retention</span>
        </div>
        <div style="display:flex;gap:12px">
          <a routerLink="/login" class="btn btn-secondary">Ingresar</a>
          <a routerLink="/register" class="btn btn-primary">Registrarse</a>
        </div>
      </nav>

      <section style="max-width:1200px;margin:0 auto;padding:80px 32px 64px;text-align:center">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#eef2ff;color:#4f46e5;font-size:14px;font-weight:500;padding:6px 16px;border-radius:999px;margin-bottom:24px">
          🤖 IA aplicada a retención de clientes
        </div>
        <h1 class="hero-title" style="max-width:720px;margin:0 auto 16px">
          Reducí la deserción<br>
          <span style="color:var(--color-primary)">con inteligencia artificial</span>
        </h1>
        <p class="hero-subtitle" style="margin:0 auto 40px">
          Sistema SaaS para gimnasios que predice qué miembros están por abandonar
          y dispara acciones automatizadas para retenerlos.
        </p>
        <div style="display:flex;gap:16px;justify-content:center">
          <a routerLink="/register" class="btn btn-primary" style="padding:14px 32px;font-size:16px">Comenzá gratis</a>
          <a routerLink="/login" class="btn btn-secondary" style="padding:14px 32px;font-size:16px">Ya tengo cuenta</a>
        </div>
      </section>

      <section style="max-width:1200px;margin:0 auto;padding:0 32px 80px">
        <div class="grid-3">
          <div class="feature-card">
            <div class="feature-icon" style="background:#eef2ff;color:#4f46e5">📊</div>
            <h3 class="feature-title">Predicción de abandono</h3>
            <p class="feature-desc">Modelo ML que analiza 7 features de comportamiento y calcula score de riesgo en tiempo real.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#ecfdf5;color:#059669">💬</div>
            <h3 class="feature-title">Mensajería automatizada</h3>
            <p class="feature-desc">Mensajes personalizados generados por IA según el nivel, actividad y estado de cada miembro.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:#fffbeb;color:#d97706">👥</div>
            <h3 class="feature-title">Multi-tenant SaaS</h3>
            <p class="feature-desc">Arquitectura multi-gimnasio con aislamiento de datos, roles y paneles separados por perfil.</p>
          </div>
        </div>
      </section>

      <footer style="border-top:1px solid var(--color-border);padding:24px;text-align:center;font-size:13px;color:var(--color-text-muted)">
        AI Gym Retention &mdash; Proyecto demo &bull; Angular + NestJS + Python
      </footer>
    </div>
  `,
})
export class LandingComponent {}
