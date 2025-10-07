import { Imagen } from './imagen.model';
import { Habitacion } from './habitacion.model';

export interface HabitacionTipo {
  id: string;
  nombre: string;
  descripcion?: string | null;
  aforoMaximo: number;
  precioPorNoche: number;
  activa: boolean;

  habitaciones?: Habitacion[]; // LAZY en backend
  imagenes?: Imagen[];         // LAZY en backend
}
