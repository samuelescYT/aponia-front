import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, Observable } from 'rxjs'; 
import { map, switchMap, catchError } from 'rxjs/operators'; 

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
  activa: boolean; // ← Cambiar de estado a activa
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
  let habitacionId = numeroHabitacion;
  if (/^\d+$/.test(numeroHabitacion)) {
    habitacionId = 'hab_' + numeroHabitacion;
  }
  
  // Primero obtener la habitación
  return this.http.get<any>(`${this.habitacionUrl}/${habitacionId}`).pipe(
    switchMap(habitacionResponse => {
      console.log('🏨 Habitación encontrada:', habitacionResponse);
      
      // Luego buscar la reserva activa para esta habitación
      return this.buscarReservaActiva(habitacionId).pipe(
        map(reservaActiva => {
          return {
            ...this.mapearRespuestaHabitacion(habitacionResponse),
            reservaActual: reservaActiva
          };
        })
      );
    }),
    catchError((error: any) => {
      console.error('❌ Error buscando habitación:', error);
      throw new Error('Habitación no encontrada');
    })
  );
}

private buscarReservaActiva(habitacionId: string): Observable<any> {
  // Necesitarías crear este endpoint en el backend
  return this.http.get<any>(`${this.habitacionUrl}/${habitacionId}/reserva-activa`).pipe(
    catchError(() => of(undefined)) // Si no hay reserva, devolver undefined
  );
}

private mapearRespuestaHabitacion(response: any): HabitacionConCliente {
  return {
    id: response.id,
    numeroHabitacion: response.numero || response.numeroHabitacion,
    activa: response.estado,
    tipoHabitacion: {
      id: response.tipo?.id || response.tipoHabitacion?.id,
      nombre: response.tipo?.nombre || response.tipoHabitacion?.nombre,
      descripcion: response.tipo?.descripcion || response.tipoHabitacion?.descripcion
    },
    reservaActual: undefined // Usar undefined en lugar de null
  };
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