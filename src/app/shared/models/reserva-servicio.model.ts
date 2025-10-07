import { ISODate } from './common';
import { Reserva } from './reserva.model';
import { Servicio } from './servicio.model';

export interface ReservaServicio {
  id: string;

  reservaId: string;
  reserva?: Reserva;

  servicioId: string;
  servicio?: Servicio;

  fecha: ISODate;
  horaInicio: string;      // LocalTime
  numeroPersonas: number;
  precioPorPersona: number;
  totalServicio: number;
}
