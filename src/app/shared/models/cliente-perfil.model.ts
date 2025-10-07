import { ISODateTime } from './common';
import { Usuario } from './usuario.model';

export interface ClientePerfil {
  /** PK y FK a Usuario */
  usuarioId: string;
  usuario?: Usuario;

  nombreCompleto: string;
  telefono?: string | null;
  fechaRegistro: ISODateTime; // @CreationTimestamp
}
