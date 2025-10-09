import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Servicio } from '../../shared/models/servicio.model';
import { ServicioApiService } from './servicio-api.service';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private _serviciosSubject = new BehaviorSubject<Servicio[]>([]);
  servicios$: Observable<Servicio[]> = this._serviciosSubject.asObservable();

  constructor(private api: ServicioApiService) {
    this.loadAll();
  }

  /** Cargar todos los servicios del backend */
  private loadAll(): void {
    this.api.listAll()
      .subscribe({
        next: (servicios) => {
          this._serviciosSubject.next(servicios);
        },
        error: (err) => {
          console.error('Error cargando servicios', err);
        }
      });
  }

  /** Obtener snapshot actual */
  getServiciosSnapshot(): Servicio[] {
    return this._serviciosSubject.getValue();
  }

  /** Buscar servicio en el estado local */
  getById(id: string): Servicio | undefined {
    return this._serviciosSubject.getValue().find(s => s.id === id);
  }

  /** Refrescar desde backend */
  reload(): void {
    this.loadAll();
  }

  /** Crear nuevo servicio */
  create(data: Omit<Servicio, 'id'>): Observable<void> {
    return this.api.create(data).pipe(
      tap(() => this.loadAll())
    );
  }

  /** Actualizar servicio */
  update(id: string, patch: Partial<Servicio>): Observable<void> {
    const actual = this.getById(id);
    if (!actual) {
      return this.api.update({ id, ...patch } as Servicio).pipe(
        tap(() => this.loadAll())
      );
    }
    const actualizado: Servicio = { ...actual, ...patch, id };
    return this.api.update(actualizado).pipe(
      tap(() => this.loadAll())
    );
  }

  /** Eliminar servicio */
  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => this.loadAll())
    );
  }
}
