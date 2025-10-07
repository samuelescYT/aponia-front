import { ISODate } from './common';
import { Reserva } from './reserva.model';
import { HabitacionTipo } from './habitacion-tipo.model';
import { Habitacion } from './habitacion.model';

export interface Estancia {
  id: string;

  reservaId: string;
  reserva?: Reserva;

  tipoHabitacionId: string;     // FK tipo_habitacion_id
  tipoHabitacion?: HabitacionTipo;

  checkIn: boolean;
  checkOut: boolean;

  entrada: ISODate;             // LocalDate
  salida: ISODate;              // LocalDate

  numeroHuespedes: number;
  precioPorNoche: number;
  totalEstadia: number;

  habitacionAsignadaId?: string | null;
  habitacionAsignada?: Habitacion | null;
}
