import { HabitacionTipo } from './habitacion-tipo.model';

export interface Habitacion {
  id: string;
  tipoId: string;       // FK column: tipo_id
  tipo?: HabitacionTipo;

  numero: number;
  activa: boolean;
}
