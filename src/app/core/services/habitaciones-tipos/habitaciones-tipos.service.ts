import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HabitacionTipo } from '../../../shared/models/habitacion-tipo.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HabitacionTipoService {
  private readonly baseUrl = 'http://localhost:8083/api/habitaciones-tipos';

  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  /** 🔧 Normaliza respuesta: si backend manda string[] → lo convierte a {url: string}[] */
  private normalize = (tipo: any): HabitacionTipo => ({
    ...tipo,
    imagenes: (tipo.imagenes || []).map((img: any) =>
      typeof img === 'string' ? { url: img } : img
    ),
  });

  listAll(): Observable<HabitacionTipo[]> {
    return this.http
      .get<HabitacionTipo[]>(this.baseUrl, this.httpOptions)
      .pipe(map(arr => arr.map(this.normalize)));
  }

  listActivos(): Observable<HabitacionTipo[]> {
    return this.http
      .get<HabitacionTipo[]>(`${this.baseUrl}/activos`, this.httpOptions)
      .pipe(map(arr => arr.map(this.normalize)));
  }

  getById(id: string): Observable<HabitacionTipo> {
    return this.http
      .get<HabitacionTipo>(`${this.baseUrl}/${id}`, this.httpOptions)
      .pipe(map(this.normalize));
  }

  create(tipo: Omit<HabitacionTipo, 'id'>): Observable<HabitacionTipo> {
    return this.http.post<HabitacionTipo>(this.baseUrl, tipo, this.httpOptions);
  }

  update(id: string, tipo: HabitacionTipo): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, tipo, this.httpOptions);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.httpOptions);
  }
}
