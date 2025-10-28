import { EstadoReserva, Reserva } from './../../../shared/models/reserva.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';

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

  getAllReservas() {
  return this.http.get<Reserva[]>(`${this.baseUrl}/all`, { withCredentials: true });
}

actualizarReserva(clienteId: string, reservaId: string, data: ReservaHabitacionRequest) {
  return this.http.put<ReservaHabitacionResponse>(
    `${this.baseUrl}/cliente/${clienteId}/reserva/${reservaId}`,
    data,
    { withCredentials: true }
  );
}

getServiciosPorReserva(reservaId: string): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8083/api/reservas-servicios/reserva/${reservaId}`);
}

eliminarServicioReserva(servicioReservaId: string): Observable<void> {
  return this.http.delete<void>(`http://localhost:8083/api/reservas-servicios/delete/${servicioReservaId}`);
}

completarCheckout(reserva: any): Observable<any> {
  console.log('🔍 Buscando estanciaId en reserva:', reserva);
  
  // Buscar la estanciaId directamente en el objeto reserva que ya tenemos
  let estanciaId: string | null = null;
  
  if (reserva.estancias && reserva.estancias.length > 0) {
    estanciaId = reserva.estancias[0].id;
  } else if (reserva.estancia) {
    estanciaId = reserva.estancia.id;
  }
  
  console.log('🔍 EstanciaId encontrada:', estanciaId);
  
  if (!estanciaId) {
    throw new Error('No se encontró estancia para esta reserva');
  }
  
  // Hacer checkout en la estancia
  return this.http.post(
    `http://localhost:8083/api/estancias/${estanciaId}/checkout`, 
    {},
    { responseType: 'text' }
  ).pipe(
    map((response: string) => {
      console.log('✅ Respuesta del checkout:', response);
      return { success: true, message: response };
    })
  );
}
}
