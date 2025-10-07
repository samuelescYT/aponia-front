// src/app/features/habitaciones-tipos/data/habitaciones-tipos.store.ts
import { HabitacionTipo } from '../../shared/models/habitacion-tipo.model';
import { Injectable, signal, computed } from '@angular/core';

const habitaciones_tipos: HabitacionTipo[] = [
  { id: 't-001', nombre: 'Normal',     descripcion: 'Funcional y cómoda para estancias cortas.', aforoMaximo: 2, precioPorNoche: 250000, activa: true },
  { id: 't-002', nombre: 'Executive',  descripcion: 'Espacio adicional y escritorio de trabajo.', aforoMaximo: 2, precioPorNoche: 380000, activa: true },
  { id: 't-003', nombre: 'VIP',        descripcion: 'Amenidades premium y vista privilegiada.',   aforoMaximo: 3, precioPorNoche: 520000, activa: true },
  { id: 't-004', nombre: 'Luxury',     descripcion: 'Máximo confort, sala privada y terraza.',    aforoMaximo: 4, precioPorNoche: 700000, activa: true },
  { id: 't-005', nombre: 'Connecting', descripcion: 'Habitaciones interconectadas para grupos.',  aforoMaximo: 5, precioPorNoche: 600000, activa: true },
];

@Injectable({ providedIn: 'root' })
export class HabitacionTipoService {

  private _tipos = signal<HabitacionTipo[]>([...habitaciones_tipos]);

  // Selectores
  readonly tipos   = computed(() => this._tipos());
  readonly isEmpty = computed(() => this._tipos().length === 0);

  // Queries
  list(): HabitacionTipo[] {
    return this._tipos();
  }

  getById(id: string): HabitacionTipo | undefined {
    return this._tipos().find(t => t.id === id);
  }

  // Commands
  create(data: Omit<HabitacionTipo, 'id'>) {
    const id = crypto.randomUUID?.() ?? `t-${Date.now()}`;
    const nuevo: HabitacionTipo = { id, ...data };
    this._tipos.update(arr => [nuevo, ...arr]);
    return id;
  }

  update(id: string, patch: Partial<HabitacionTipo>) {
    this._tipos.update(arr => arr.map(t => (t.id === id ? { ...t, ...patch, id } : t)));
  }

  remove(id: string) {
    this._tipos.update(arr => arr.filter(t => t.id !== id));
  }
}
