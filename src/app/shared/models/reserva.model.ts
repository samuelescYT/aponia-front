import { ISODateTime } from './common';
import { Usuario } from './usuario.model';
import { Estancia } from './estancia.model';
import { ReservaServicio } from './reserva-servicio.model';
import { Pago } from './pago.model';
import { ResumenPago } from './resumen-pago.model';

export type EstadoReserva =  'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface Reserva {
  id: string;
  codigo: string;

  clienteId: string;    // FK cliente_id
  cliente?: Usuario;

  fechaCreacion: ISODateTime;
  estado: EstadoReserva;
  notas?: string | null;

  estancias?: Estancia[];
  reservasServicios?: ReservaServicio[];
  pagos?: Pago[];
  resumenPago?: ResumenPago;
}
