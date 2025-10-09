import { Injectable } from '@angular/core';
import { Servicio } from '../../shared/models/servicio.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServicioApiService {
  private baseUrl = 'http://localhost:8083/api/habitaciones-tipos';

  constructor(private http: HttpClient) {}

  /** Obtener todos los servicios */
  listAll(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.baseUrl}/all`);
  }

  /** Obtener un servicio por id */
  getById(id: string): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.baseUrl}/find/${id}`);
  }

  /** Crear un nuevo servicio (sin id) */
  create(servicio: Omit<Servicio, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/add`, servicio);
  }

  /** Actualizar un servicio existente */
  update(servicio: Servicio): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/update`, servicio);
  }

  /** Eliminar un servicio por id */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}
