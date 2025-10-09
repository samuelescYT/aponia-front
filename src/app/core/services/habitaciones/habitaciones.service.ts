import { Injectable } from '@angular/core';
import { HabitacionesApiService } from './habitaciones-api.service';
import { Habitacion } from './../../../shared/models/habitacion.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  constructor(private api: HabitacionesApiService) {}

  listar(): Observable<Habitacion[]> {
    return this.api.getAll();
  }

  obtener(id: string): Observable<Habitacion> {
    return this.api.getById(id);
  }

  crear(habitacion: Habitacion, tipoId?: string): Observable<void> {
    return this.api.create(habitacion, tipoId);
  }

  actualizar(habitacion: Habitacion, tipoId?: string): Observable<void> {
    return this.api.update(habitacion, tipoId);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
