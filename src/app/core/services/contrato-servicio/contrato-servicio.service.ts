import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces basadas en tu backend
export interface ReservaServicio {
  id?: string;
  reserva: {
    id: string;
  };
  servicio: {
    id: string;
  };
  fecha: string; // LocalDate en formato ISO (YYYY-MM-DD)
  cantidadPersonas?: number;
  observaciones?: string;
  subtotal?: number;
  estado?: 'PENDIENTE' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO';
}

export interface ReservaServicioRequest {
  reservaId: string;
  servicioId: string;
  fecha: string;
  cantidadPersonas?: number;
  observaciones?: string;
}

export interface HabitacionConCliente {
  id: string;
  numeroHabitacion: string;
  estado: string;
  tipoHabitacion: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  reservaActual?: {
    id: string;
    fechaInicio: string;
    fechaFin: string;
    cliente: {
      id: string;
      nombreCompleto: string;
      email: string;
      telefono: string;
      documento: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReservaServicioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8083/api/reservas-servicios';
  private habitacionUrl = 'http://localhost:8083/api/habitaciones';

  /**
   * Buscar habitación por número y obtener información del cliente
   * Nota: Deberás crear este endpoint en tu backend o usar uno existente
   */
  buscarHabitacionConCliente(numeroHabitacion: string): Observable<HabitacionConCliente> {
    return this.http.get<HabitacionConCliente>(
      `${this.habitacionUrl}/numero/${numeroHabitacion}`
    );
  }

  /**
   * Listar todas las reservas de servicios
   */
  listarTodas(): Observable<ReservaServicio[]> {
    return this.http.get<ReservaServicio[]>(`${this.apiUrl}/all`);
  }

  /**
   * Obtener reservas de servicios por reserva
   */
  obtenerPorReserva(reservaId: string): Observable<ReservaServicio[]> {
    return this.http.get<ReservaServicio[]>(`${this.apiUrl}/reserva/${reservaId}`);
  }

  /**
   * Obtener reservas de un servicio en una fecha específica
   */
  obtenerPorServicioYFecha(servicioId: string, fecha: string): Observable<ReservaServicio[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<ReservaServicio[]>(
      `${this.apiUrl}/servicio/${servicioId}`,
      { params }
    );
  }

  /**
   * Obtener una reserva de servicio por ID
   */
  obtenerPorId(id: string): Observable<ReservaServicio> {
    return this.http.get<ReservaServicio>(`${this.apiUrl}/find/${id}`);
  }

  /**
   * Crear una nueva reserva de servicio
   */
  crear(reservaServicio: ReservaServicio, reservaId: string, servicioId: string): Observable<void> {
    const params = new HttpParams()
      .set('reservaId', reservaId)
      .set('servicioId', servicioId);
    
    return this.http.post<void>(`${this.apiUrl}/add`, reservaServicio, { params });
  }

  /**
   * Actualizar una reserva de servicio existente
   */
  actualizar(
    reservaServicio: ReservaServicio, 
    reservaId?: string, 
    servicioId?: string
  ): Observable<void> {
    let params = new HttpParams();
    if (reservaId) params = params.set('reservaId', reservaId);
    if (servicioId) params = params.set('servicioId', servicioId);
    
    return this.http.put<void>(`${this.apiUrl}/update`, reservaServicio, { params });
  }

  /**
   * Eliminar una reserva de servicio
   */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}