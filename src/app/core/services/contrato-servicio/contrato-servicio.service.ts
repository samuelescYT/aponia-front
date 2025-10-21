import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, Observable } from 'rxjs'; 
import { map, switchMap, catchError, tap } from 'rxjs/operators'; 

// Interfaces (se mantienen igual)
export interface ReservaServicio {
  id?: string;
  reserva: {
    id: string;
  };
  servicio: {
    id: string;
  };
  fecha: string;
  cantidadPersonas?: number;
  observaciones?: string;
  subtotal?: number;
  estado?: 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
}

export interface HabitacionConCliente {
  id: string;
  numeroHabitacion: string;
  activa: boolean;
  tipoHabitacion: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  reservaActual?: {
    id: string;
    fechaInicio: string;
    fechaFin: string;
    estado: 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'; // ← CORREGIR aquí también
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
  private estanciaUrl = 'http://localhost:8083/api/estancias';

  /**
   * Buscar habitación por número y obtener información del cliente
   * Usando endpoints que SÍ existen
   */
  // En contrato-servicio.service.ts - REEMPLAZA el método completo
buscarHabitacionConCliente(numeroHabitacion: string): Observable<HabitacionConCliente> {
  let habitacionId = numeroHabitacion;
  if (/^\d+$/.test(numeroHabitacion)) {
    habitacionId = 'hab_' + numeroHabitacion;
  }
  
  console.log('🔍 Buscando habitación con ID:', habitacionId);
  
  // PRIMERO obtener la habitación básica
  return this.http.get<any>(`${this.habitacionUrl}/${habitacionId}`).pipe(
    switchMap(habitacionResponse => {
      console.log('🏨 Habitación base encontrada:', habitacionResponse);
      
      // LUEGO buscar la estancia activa REAL (sin datos simulados)
      return this.buscarEstanciaActivaReal(habitacionId).pipe(
        map(clienteData => {
          console.log('🎯 Datos de cliente REALES:', clienteData);
          
          // ✅ SOLO usar datos REALES del backend
          const habitacionConCliente: HabitacionConCliente = {
            id: habitacionResponse.id,
            numeroHabitacion: habitacionResponse.numero,
            activa: habitacionResponse.activa,
            tipoHabitacion: {
              id: habitacionResponse.tipo?.id,
              nombre: habitacionResponse.tipo?.nombre,
              descripcion: habitacionResponse.tipo?.descripcion
            },
            reservaActual: this.mapearEstanciaAReserva(clienteData) // ← Solo datos reales
          };
          
          console.log('🎯 Habitación con datos REALES:', habitacionConCliente);
          return habitacionConCliente;
        })
      );
    }),
    catchError((error: any) => {
      console.error('❌ Error buscando habitación:', error);
      throw new Error('Habitación no encontrada');
    })
  );
}

// En contrato-servicio.service.ts
private buscarEstanciaActivaReal(habitacionId: string): Observable<any> {
  let habitacionIdFormateado = habitacionId;
  if (/^\d+$/.test(habitacionId)) {
    habitacionIdFormateado = 'hab_' + habitacionId;
  }
  
  const estanciaUrl = `${this.estanciaUrl}/habitacion/${habitacionIdFormateado}/cliente-activo`;
  
  console.log('🔍 Buscando cliente activo REAL en:', estanciaUrl);
  
  return this.http.get<any>(estanciaUrl).pipe(
    tap((clienteData: any) => {
      console.log('✅ Cliente activo REAL encontrado:', clienteData);
    }),
  );
}

private mapearEstanciaAReserva(clienteData: any): any {
  // ✅ Solo mapear si hay datos reales del backend
  if (!clienteData) return undefined;
  
  return {
    id: clienteData.reservaId,
    fechaInicio: clienteData.fechaInicio,
    fechaFin: clienteData.fechaFin,
    estado: clienteData.estado,
    cliente: clienteData.cliente
  };
}

private mapearRespuestaHabitacion(response: any): HabitacionConCliente {
  return {
    id: response.id,
    numeroHabitacion: response.numero || response.numeroHabitacion,
    activa: response.activa !== undefined ? response.activa : true,
    tipoHabitacion: {
      id: response.tipo?.id || response.tipoHabitacion?.id,
      nombre: response.tipo?.nombre || response.tipoHabitacion?.nombre,
      descripcion: response.tipo?.descripcion || response.tipoHabitacion?.descripcion
    },
    reservaActual: undefined
  };
}

  
  

  

  // Los demás métodos se mantienen igual...
  listarTodas(): Observable<ReservaServicio[]> {
    return this.http.get<ReservaServicio[]>(`${this.apiUrl}/all`);
  }

  obtenerPorReserva(reservaId: string): Observable<ReservaServicio[]> {
    return this.http.get<ReservaServicio[]>(`${this.apiUrl}/reserva/${reservaId}`);
  }

  obtenerPorServicioYFecha(servicioId: string, fecha: string): Observable<ReservaServicio[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<ReservaServicio[]>(
      `${this.apiUrl}/servicio/${servicioId}`,
      { params }
    );
  }

  obtenerPorId(id: string): Observable<ReservaServicio> {
    return this.http.get<ReservaServicio>(`${this.apiUrl}/find/${id}`);
  }

  crear(reservaServicio: ReservaServicio, reservaId: string, servicioId: string): Observable<void> {
    const params = new HttpParams()
      .set('reservaId', reservaId)
      .set('servicioId', servicioId);
    
    return this.http.post<void>(`${this.apiUrl}/add`, reservaServicio, { params });
  }

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

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
} 