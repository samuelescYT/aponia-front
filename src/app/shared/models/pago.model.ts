import { ISODateTime } from './common';
import { Reserva } from './reserva.model';

export type TipoPago = 'ANTICIPO' | 'PAGO_PARCIAL' | 'PAGO_COMPLETO' | 'REEMBOLSO';
export type EstadoPago = 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO';

export interface Pago {
  id: string;

  reservaId: string;
  reserva?: Reserva;

  tipo: TipoPago;
  monto: number;

  fecha: ISODateTime;     // @CreationTimestamp
  metodoPago?: string | null;

  estado: EstadoPago;     // default PENDIENTE
  concepto?: string | null;
}
