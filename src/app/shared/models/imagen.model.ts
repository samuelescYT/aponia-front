import { HabitacionTipo } from './habitacion-tipo.model';
import { Servicio } from './servicio.model';

export interface Imagen {
  id: string;
  servicioId?: string | null;
  servicio?: Servicio | null;

  tipoHabitacionId?: string | null;
  tipoHabitacion?: HabitacionTipo | null;

  url: string;
}
