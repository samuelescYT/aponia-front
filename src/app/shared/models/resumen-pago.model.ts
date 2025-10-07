import { ISODateTime } from './common';
import { Reserva } from './reserva.model';

export interface ResumenPago {
  /** PK = reserva_id */
  reservaId: string;
  reserva?: Reserva;

  totalHabitaciones: number;
  totalServicios: number;
  totalReserva: number;
  totalPagado: number;
  saldoPendiente: number;

  ultimaActualizacion: ISODateTime; // @UpdateTimestamp
}
