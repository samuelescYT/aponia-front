import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ServicioDisponibilidadApiService } from './servicio-disponibilidad-api.service';
import { ServicioDisponibilidad } from '../../shared/models/servicio-disponibilidad.model';

@Injectable({ providedIn: 'root' })
export class ServicioDisponibilidadService {
  private disponibilidadesSubject = new BehaviorSubject<ServicioDisponibilidad[]>([]);
  disponibilidades$ = this.disponibilidadesSubject.asObservable();

  constructor(private api: ServicioDisponibilidadApiService) {}

  loadAll(): void {
    this.api.getAll().subscribe(data => this.disponibilidadesSubject.next(data));
  }

  create(data: ServicioDisponibilidad): Observable<void> {
    return this.api.create(data).pipe(tap(() => this.loadAll()));
  }

  update(id: string, data: ServicioDisponibilidad): Observable<void> {
    return this.api.update({ ...data, id }).pipe(tap(() => this.loadAll()));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.loadAll()));
  }
}
