import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../../../shared/models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly baseUrl = 'http://localhost:8083/api/servicios';

  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  listAll(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.baseUrl, this.httpOptions);
  }

  getById(id: string): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.baseUrl}/${id}`, this.httpOptions);
  }

  create(servicio: Omit<Servicio, 'id'>): Observable<Servicio> {
    return this.http.post<Servicio>(this.baseUrl, servicio, this.httpOptions);
  }

  update(id: string, servicio: Servicio): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, servicio, this.httpOptions);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.httpOptions);
  }
}
