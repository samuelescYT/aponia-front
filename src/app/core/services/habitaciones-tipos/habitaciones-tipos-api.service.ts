import { HabitacionTipo } from './../../../shared/models/habitacion-tipo.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitacionTipoApiService {
  private readonly baseUrl = 'http://localhost:8083/api/habitaciones-tipos';

  constructor(private http: HttpClient) {}

  /** Obtener todos los tipos de habitación */
  listAll(): Observable<HabitacionTipo[]> {
    return this.http.get<HabitacionTipo[]>(`${this.baseUrl}/all`);
  }

  /** Obtener solo los tipos activos */
  listActivos(): Observable<HabitacionTipo[]> {
    return this.http.get<HabitacionTipo[]>(`${this.baseUrl}/activos`);
  }

  /** Obtener un tipo por id */
  getById(id: string): Observable<HabitacionTipo> {
    return this.http.get<HabitacionTipo>(`${this.baseUrl}/find/${id}`);
  }

  /** Crear un nuevo tipo (sin id) */
  create(tipo: Omit<HabitacionTipo, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/add`, tipo);
  }

  /** Actualizar un tipo existente (envía todo el objeto tipo) */
  update(tipo: HabitacionTipo): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/update`, tipo);
  }

  /** Eliminar un tipo por id */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}
