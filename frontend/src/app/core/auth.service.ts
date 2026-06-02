import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserInfo,
  RefreshResponse,
} from './types';

const STORAGE_KEY = 'auth';

interface PersistedAuth {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

function readPersisted(): PersistedAuth | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedAuth) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API = '/api/v1/auth';

  private readonly initial = readPersisted();
  readonly accessToken = signal<string | null>(this.initial?.access_token ?? null);
  readonly refreshToken = signal<string | null>(this.initial?.refresh_token ?? null);
  readonly user = signal<UserInfo | null>(this.initial?.user ?? null);

  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.user());
  readonly role = computed(() => this.user()?.role ?? null);

  login(data: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, data)
      .pipe(tap(res => this.persist(res)));
  }

  register(data: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.API}/register`, data)
      .pipe(tap(res => this.persist(res)));
  }

  refresh() {
    const token = this.refreshToken();
    if (!token) {
      this.logout();
      throw new Error('No refresh token');
    }
    return this.http
      .post<RefreshResponse>(`${this.API}/refresh`, { refresh_token: token })
      .pipe(
        tap(res => {
          this.accessToken.set(res.access_token);
          this.refreshToken.set(res.refresh_token);
          this.writeStorage();
        }),
      );
  }

  updateTokens(access: string, refresh: string) {
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    this.writeStorage();
  }

  logout(redirect: boolean = true) {
    if (isPlatformBrowser(this.platformId)) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    if (redirect) this.router.navigate(['/login']);
  }

  private persist(res: AuthResponse) {
    this.accessToken.set(res.access_token);
    this.refreshToken.set(res.refresh_token);
    this.user.set(res.user);
    this.writeStorage();
  }

  private writeStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    const payload: PersistedAuth = {
      access_token: this.accessToken()!,
      refresh_token: this.refreshToken()!,
      user: this.user()!,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
  }
}
