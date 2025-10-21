// src/app/core/auth/auth.service.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
      console.log('🔐 Intentando login con:', { email, password: '***' });
      console.log('📤 Enviando a:', `${this.api}/login`);
      
      const body = { email, password };
      console.log('📦 Body completo:', body);
      
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(
          `${this.api}/login`, 
          body, 
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      );
      
      console.log('📥 Respuesta del login:', res);
      
      if (res?.ok) {
        console.log('✅ Login exitoso, restaurando sesión...');
        await this.restoreSession();
        console.log('👤 Usuario después de restaurar:', this.user());
        return true;
      }
      
      console.warn('⚠️ Login falló: res.ok es false');
      return false;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('📛 Mensaje de error:', error.error);
      console.error('🔢 Status:', error.status);
      console.error('📝 Status text:', error.statusText);
      
      // Mostrar el mensaje de error del backend si existe
      if (error.error?.error) {
        console.error('🚨 Error del backend:', error.error.error);
      }
      
      return false;
    }
  }

  // ===================== REGISTER CLIENTE =====================
  async register(nombreCompleto: string, email: string, telefono: string, password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(
          `${this.api}/register`,
          { nombreCompleto, email, telefono, password },
          { withCredentials: true }
        )
      );
      
      if (res?.ok) {
        await this.restoreSession();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en register:', error);
      return false;
    }
  }

  // ===================== REGISTER ADMIN =====================
  async registerAdmin(nombreCompleto: string, email: string, telefono: string, password: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse>(
          `${this.api}/register-admin`,
          { nombreCompleto, email, telefono, password },
          { withCredentials: true }
        )
      );
      
      if (res?.ok) {
        await this.restoreSession();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en registerAdmin:', error);
      return false;
    }
  }

  // ===================== RESTORE SESSION =====================
  async restoreSession(): Promise<void> {
    try {
      console.log('🔄 Restaurando sesión desde /me...');
      
      const res = await firstValueFrom(
        this.http.get<ApiResponse>(`${this.api}/me`, { withCredentials: true })
      );
      
      console.log('📥 Respuesta de /me:', res);
      
      if (res?.ok && res.id && res.email && res.rol) {
        const usuario = {
          id: res.id,
          email: res.email,
          nombreCompleto: res.nombreCompleto ?? null,
          rol: res.rol,
        };
        
        console.log('✅ Usuario restaurado:', usuario);
        this.user.set(usuario);
      } else {
        console.warn('⚠️ Respuesta de /me inválida');
        this.user.set(null);
      }
    } catch (err: any) {
      if (err.status === 401) {
        // Sesión expirada o inexistente
        console.log('⚠️ Sin sesión activa (401)');
        this.user.set(null);
        return;
      }
      
      console.error('❌ Error restaurando sesión:', err);
      this.user.set(null);
    }
  }

  // ===================== LOGOUT =====================
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.api}/logout`, {}, { withCredentials: true })
      );
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.user.set(null);
    }
  }

  // ===================== CHANGE PASSWORD =====================
async cambiarPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<boolean> {
  try {
    const res = await firstValueFrom(
      this.http.post<any>(
        `${this.api}/password`,
        { currentPassword, newPassword, confirmPassword },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    );

    if (res?.ok) {
      console.log('✅ Contraseña actualizada correctamente');
      return true;
    } else {
      console.warn('⚠️ Error al cambiar contraseña:', res?.error);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error en cambiarPassword:', error);
    return false;
  }
}

  
}