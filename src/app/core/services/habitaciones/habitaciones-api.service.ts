import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Habitacion } from './../../../shared/models/habitacion.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HabitacionesApiService {
  private baseUrl = 'http://localhost:8083/api/habitaciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/all`);
  }

  getActivas(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/activos`);
  }

  getByTipo(tipoId: string): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/tipo/${tipoId}`);
  }

  getById(id: string): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.baseUrl}/find/${id}`);
  }

  create(habitacion: Habitacion, tipoId?: string): Observable<void> {
    const params = tipoId ? { params: { tipoId } } : {};
    return this.http.post<void>(`${this.baseUrl}/add`, habitacion, params);
  }

  update(habitacion: Habitacion, tipoId?: string): Observable<void> {
    const params = tipoId ? { params: { tipoId } } : {};
    return this.http.put<void>(`${this.baseUrl}/update`, habitacion, params);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}
