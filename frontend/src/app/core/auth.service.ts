import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserInfo } from './types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/v1/auth';
  readonly user = signal<UserInfo | null>(null);
  readonly token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const data: AuthResponse = JSON.parse(saved);
      this.token.set(data.access_token);
      this.user.set(data.user);
    }
  }

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
      tap(res => this._save(res)),
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this._save(res)),
    );
  }

  logout() {
    localStorage.removeItem('auth');
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private _save(res: AuthResponse) {
    localStorage.setItem('auth', JSON.stringify(res));
    this.token.set(res.access_token);
    this.user.set(res.user);
  }
}
