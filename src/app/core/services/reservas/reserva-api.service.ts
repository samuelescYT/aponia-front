import { EstadoReserva, Reserva } from './../../../shared/models/reserva.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ReservaHabitacionRequest {
  tipoHabitacionId: string;
  entrada: string; // ISO yyyy-MM-dd
  salida: string;
  numeroHuespedes: number;
  notas?: string;
}

export interface ReservaHabitacionResponse {
  id: string;
  codigo: string;
  estado: EstadoReserva;
  total: number;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class ReservasApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8083/api/reservas';

  getReservasByCliente(clienteId: string) {
    return this.http.get<Reserva[]>(`${this.baseUrl}/cliente/${clienteId}`, {
      withCredentials: true,
    });
  }

  crearReservaCliente(clienteId: string, data: ReservaHabitacionRequest) {
    return this.http.post<ReservaHabitacionResponse>(
      `${this.baseUrl}/cliente/${clienteId}/habitaciones`,
      data,
      { withCredentials: true }
    );
  }

  cancelarReserva(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/cancelar`, {}, { withCredentials: true });
  }
}
