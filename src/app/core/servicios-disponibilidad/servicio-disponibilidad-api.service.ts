import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicioDisponibilidad } from '../../shared/models/servicio-disponibilidad.model';

@Injectable({ providedIn: 'root' })
export class ServicioDisponibilidadApiService {
  private readonly baseUrl = 'http://localhost:8083/api/habitaciones-tipos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServicioDisponibilidad[]> {
    return this.http.get<ServicioDisponibilidad[]>(`${this.baseUrl}/all`);
  }

  getById(id: string): Observable<ServicioDisponibilidad> {
    return this.http.get<ServicioDisponibilidad>(`${this.baseUrl}/find/${id}`);
  }

  listarDisponibles(servicioId: string, fecha: string, capacidad = 1): Observable<ServicioDisponibilidad[]> {
    return this.http.get<ServicioDisponibilidad[]>(`${this.baseUrl}/servicio/${servicioId}/fecha/${fecha}?capacidad=${capacidad}`);
  }

  listarPorRango(servicioId: string, inicio: string, fin: string): Observable<ServicioDisponibilidad[]> {
    return this.http.get<ServicioDisponibilidad[]>(`${this.baseUrl}/servicio/${servicioId}/rango?inicio=${inicio}&fin=${fin}`);
  }

  buscarDisponibilidad(servicioId: string, fecha: string, horaInicio: string): Observable<ServicioDisponibilidad> {
    return this.http.get<ServicioDisponibilidad>(`${this.baseUrl}/buscar?servicioId=${servicioId}&fecha=${fecha}&horaInicio=${horaInicio}`);
  }

  existeDisponibilidad(servicioId: string, fecha: string, horaInicio: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe?servicioId=${servicioId}&fecha=${fecha}&horaInicio=${horaInicio}`);
  }

  create(data: ServicioDisponibilidad): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/add`, data);
  }

  update(data: ServicioDisponibilidad): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/update`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}
