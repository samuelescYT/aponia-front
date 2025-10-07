import { ClientePerfil } from './cliente-perfil.model';

export type UserRole = 'ADMIN' | 'CLIENTE' | 'STAFF' | 'RECEPCIONISTA';

export interface Usuario {
  id: string;
  email: string;
  passwordHash: string;
  rol: UserRole;

  clientePerfil?: ClientePerfil; // 1:1 LAZY
}
