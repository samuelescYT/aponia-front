import { HabitacionTipo } from './habitacion-tipo.model';

export interface Habitacion {
  id: string;
  numero: number;
  activa: boolean;
  tipo?: HabitacionTipo | null; // 👈 vuelve a existir
  tipoId?: string | null;
  tipoNombre?: string | null;
}
