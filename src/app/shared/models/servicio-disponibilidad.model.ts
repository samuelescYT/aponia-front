import { ISODate } from './common';
import { Servicio } from './servicio.model';

export interface ServicioDisponibilidad {
  id: string;

  servicioId: string;
  servicio?: Servicio;

  fecha: ISODate;       // LocalDate
  horaInicio: string;   // LocalTime (HH:mm[:ss])
  horaFin: string;      // LocalTime

  capacidadDisponible: number;
}
