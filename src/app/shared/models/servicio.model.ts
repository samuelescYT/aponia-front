import { ServicioDisponibilidad } from './servicio-disponibilidad.model';
import { Imagen } from './imagen.model';
import { ReservaServicio } from './reserva-servicio.model';

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string | null;
  lugar: string;

  precioPorPersona: number;
  duracionMinutos: number;
  capacidadMaxima?: number | null;

  disponibilidades?: ServicioDisponibilidad[];
  imagenes?: Imagen[];
  reservasServicios?: ReservaServicio[];
}
