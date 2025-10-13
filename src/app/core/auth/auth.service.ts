// src/app/core/services/auth.service.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Usuario {
  id: string;
  email: string;
  nombreCompleto?: string | null;
  rol: string;
}

interface ApiResponse {
  ok: boolean;
  id?: string;
  email?: string;
  nombreCompleto?: string;
  rol?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:8083/api/auth';

  // Estado reactivo
  user = signal<Usuario | null>(null);
  loggedIn = computed(() => !!this.user());
  role = computed(() => this.user()?.rol ?? null);

  // ===================== LOGIN =====================
  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await this.http
        .post<ApiResponse>(`${this.api}/login`, { email, password }, { withCredentials: true })
        .toPromise();

      if (res?.ok) {
        await this.restoreSession(); // obtiene los datos reales desde /me
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ===================== REGISTER CLIENTE =====================
  async register(nombreCompleto: string, email: string, telefono: string, password: string): Promise<boolean> {
    try {
      const res = await this.http
        .post<ApiResponse>(
          `${this.api}/register`,
          { nombreCompleto, email, telefono, password },
          { withCredentials: true }
        )
        .toPromise();

      if (res?.ok) {
        await this.restoreSession();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ===================== REGISTER CLIENTE =====================
  async registerAdmin(nombreCompleto: string, email: string, telefono: string, password: string): Promise<boolean> {
    try {
      const res = await this.http
        .post<ApiResponse>(
          `${this.api}/register-admin`,
          { nombreCompleto, email, telefono, password },
          { withCredentials: true }
        )
        .toPromise();

      if (res?.ok) {
        await this.restoreSession();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }


  // ===================== RESTORE SESSION =====================
async restoreSession(): Promise<void> {
  try {
    const res = await this.http
      .get<ApiResponse>(`${this.api}/me`, { withCredentials: true })
      .toPromise();

    if (res?.ok && res.id && res.email && res.rol) {
      this.user.set({
        id: res.id,
        email: res.email,
        nombreCompleto: res.nombreCompleto ?? null,
        rol: res.rol,
      });
    } else {
      this.user.set(null);
    }
  } catch (err: any) {
    // 👇 manejo silencioso de errores esperados
    if (err.status === 401) {
      // Sesión expirada o inexistente, no hay que loguear nada
      this.user.set(null);
      return;
    }

    // 👇 solo loguea si es algo inesperado (como fallo del servidor)
    console.error('Error restaurando sesión:', err);
    this.user.set(null);
  }
}


  // ===================== LOGOUT =====================
  async logout(): Promise<void> {
    try {
      await this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).toPromise();
    } finally {
      this.user.set(null);
    }
  }
}
