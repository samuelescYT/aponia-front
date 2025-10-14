import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habitacion } from '../../../shared/models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionService {
  private readonly baseUrl = 'http://localhost:8083/api/habitaciones';

  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  listAll(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.baseUrl, this.httpOptions);
  }

  listActivas(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/activos`, this.httpOptions);
  }

  listByTipo(tipoId: string): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/tipo/${tipoId}`, this.httpOptions);
  }

  getById(id: string): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.baseUrl}/${id}`, this.httpOptions);
  }

  create(habitacion: Omit<Habitacion, 'id'>): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.baseUrl, habitacion, this.httpOptions);
  }

  update(id: string, habitacion: Habitacion): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, habitacion, this.httpOptions);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.httpOptions);
  }
}
