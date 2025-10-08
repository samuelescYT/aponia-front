// src/app/core/services/auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  ok: boolean;
  rol?: string;
  error?: string;
}

interface RegisterResponse {
  ok: boolean;
  id?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:8083/api/auth';

  // 🔄 Estado reactivo con signals
  loggedIn = signal(false);
  role = signal<string | null>(null);
  email = signal<string | null>(null);

  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await this.http
        .post<LoginResponse>(`${this.api}/login`, { email, password })
        .toPromise();

      if (res?.ok) {
        this.loggedIn.set(true);
        this.role.set(res.rol ?? null);
        this.email.set(email);
        return true;
      } else {
        this.loggedIn.set(false);
        return false;
      }
    } catch {
      this.loggedIn.set(false);
      return false;
    }
  }

  async register(nombreCompleto: string, email: string, telefono: string, password: string): Promise<boolean> {
    try {
      const res = await this.http
        .post<RegisterResponse>(`${this.api}/register`, {
          nombreCompleto,
          email,
          telefono,
          password,
        })
        .toPromise();

      if (res?.ok) {
        this.loggedIn.set(true);
        this.email.set(email);
        this.role.set('CLIENTE');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.http.post(`${this.api}/logout`, {}).toPromise();
    this.loggedIn.set(false);
    this.role.set(null);
    this.email.set(null);
  }
}
