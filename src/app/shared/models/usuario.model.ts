export interface Usuario {
  id: string;
  email: string;
  rol: 'ADMIN' | 'CLIENTE' | 'STAFF' | 'RECEPCIONISTA';
  nombreCompleto?: string | null;
  telefono?: string | null;
  cargo?: string | null;
  salario?: number | null;
  fechaContratacion?: string | null;
  fechaRegistro?: string | null;
}
