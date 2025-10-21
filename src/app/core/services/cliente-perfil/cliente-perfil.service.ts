import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientePerfil {
  usuarioId: string;
  nombreCompleto: string;
  telefono: string;
  fechaRegistro?: string;
  version?: number;
}

export interface Usuario {
  id: string;
  email: string;
  rol: string;
}

export interface PerfilCompleto {
  usuario: Usuario;
  perfil: ClientePerfil;
}

@Injectable({
  providedIn: 'root'
})
export class ClientePerfilService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8083/api/clientes-perfil';
  private readonly usuariosUrl = 'http://localhost:8083/api/usuarios';

  /**
   * Obtener perfil de cliente por usuario ID
   */
  obtenerPerfil(usuarioId: string): Observable<ClientePerfil> {
    return this.http.get<ClientePerfil>(`${this.apiUrl}/find/${usuarioId}`);
  }

  /**
   * Actualizar perfil de cliente
   */
  actualizarPerfil(perfil: ClientePerfil): Observable<ClientePerfil> {
    return this.http.put<ClientePerfil>(`${this.apiUrl}/update`, perfil);
  }

  /**
   * Obtener información del usuario
   */
  obtenerUsuario(usuarioId: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.usuariosUrl}/find/${usuarioId}`);
  }
}