// src/app/core/services/usuarios/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../../../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = 'http://localhost:8083/api/usuarios';
  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  listAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/all`, this.httpOptions);
  }

  getById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/find/${id}`, this.httpOptions);
  }

  // CREATE espera UsuarioCreateRequest (puede incluir perfiles anidados)
  create(body: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/add`, body, this.httpOptions);
  }

  // UPDATE sólo cambia email/password/rol (NO perfiles)
  update(id: string, body: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/update/${id}`, body, this.httpOptions);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, this.httpOptions);
  }

  // Upsert perfiles:
  upsertClientePerfil(id: string, body: { nombreCompleto: string; telefono?: string | null }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/perfil-cliente`, body, this.httpOptions);
  }

  upsertEmpleadoPerfil(id: string, body: {
    nombreCompleto: string;
    telefono?: string | null;
    cargo: string;
    salario?: number | null;
    fechaContratacion?: string | null; // YYYY-MM-DD
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/perfil-empleado`, body, this.httpOptions);
  }
}
