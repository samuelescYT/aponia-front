import { HabitacionTipoApiService } from './habitaciones-tipos-api.service';
import { HabitacionTipo } from './../../../shared/models/habitacion-tipo.model';
// src/app/features/habitaciones-tipos/data/habitaciones-tipos.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HabitacionTipoService {
  // Estado interno privado
  private _tiposSubject = new BehaviorSubject<HabitacionTipo[]>([]);
  // Observable que exponen los componentes
  tipos$: Observable<HabitacionTipo[]> = this._tiposSubject.asObservable();

  constructor(private api: HabitacionTipoApiService) {
    // al iniciar servicio, cargar datos
    this.loadAll();
  }

  /** Método interno para cargar todos */
  private loadAll(): void {
    this.api.listAll()
      .subscribe({
        next: (tipos) => {
          this._tiposSubject.next(tipos);
        },
        error: (err) => {
          console.error('Error cargando tipos de habitación', err);
          // opcional: manejar error o dejar estado vacío
        }
      });
  }

  /** Obtenemos los valores actuales (sincrónico) */
  getTiposSnapshot(): HabitacionTipo[] {
    return this._tiposSubject.getValue();
  }

  /** Obtener por id desde el estado local */
  getById(id: string): HabitacionTipo | undefined {
    const arr = this._tiposSubject.getValue();
    return arr.find(t => t.id === id);
  }

  /** Refrescar lista desde backend */
  reload(): void {
    this.loadAll();
  }

  /** Crear nuevo tipo: luego de crear recargar lista */
  create(data: Omit<HabitacionTipo, 'id'>): Observable<void> {
    return this.api.create(data)
      .pipe(
        tap(() => {
          this.loadAll();
        })
      );
  }

  /** Actualizar tipo: luego de actualizar recargar lista */
  update(id: string, patch: Partial<HabitacionTipo>): Observable<void> {
    const actual = this.getById(id);
    if (!actual) {
      // Si no existe localmente, simplemente recargar todo
      return this.api.update({ id, ...patch } as HabitacionTipo).pipe(
        tap(() => this.loadAll())
      );
    }
    const actualizado: HabitacionTipo = { ...actual, ...patch, id };
    return this.api.update(actualizado).pipe(
      tap(() => {
        this.loadAll();
      })
    );
  }

  /** Eliminar tipo: luego de eliminar recargar lista */
  delete(id: string): Observable<void> {
    return this.api.delete(id)
      .pipe(
        tap(() => {
          this.loadAll();
        })
      );
  }
}
