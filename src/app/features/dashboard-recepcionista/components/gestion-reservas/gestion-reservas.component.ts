import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ReservasApiService } from '../../../../core/services/reservas/reserva-api.service';
import { Reserva, EstadoReserva } from '../../../../shared/models/reserva.model';
import { CommonModule } from '@angular/common';

type ReservaConEstancia = Reserva & {
  entrada?: string | null;
  salida?: string | null;
  // si quieres, también puedes añadir clienteNombre/clienteEmail aquí, pero no es necesario
};

@Component({
  selector: 'app-gestion-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-reservas.component.html',
  styleUrls: ['./gestion-reservas.component.scss'],
})
export class GestionReservasComponent implements OnInit {
  // usamos el tipo extendido aquí
  reservas = signal<ReservaConEstancia[]>([]);
  cargando = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  reservaSeleccionada = signal<ReservaConEstancia | null>(null);

  // Filtrado
  filtro = signal<'todas' | 'activas'>('todas');
  reservasFiltradas = computed(() => {
    const todas = this.reservas();
    return this.filtro() === 'activas'
      ? todas.filter(r => String(r.estado).toUpperCase() === 'CONFIRMADA')
      : todas;
  });

  constructor(private reservasApi: ReservasApiService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    this.reservasApi.getAllReservas().subscribe({
      next: (data) => {
        console.log('📦 Reservas recibidas:', data);

        // CORRECCIÓN: Declarar adaptadas en el scope correcto
        const adaptadas: ReservaConEstancia[] = (data as any[]).map((r: any) => {
          // Obtenemos las fechas de check-in/check-out desde la estancia
          const fechasEstancia = this.obtenerFechasEstancia(r);
          
          return {
            // Propiedades básicas de la reserva
            ...r,
            // Información del cliente
            cliente: {
              id: r.clienteId ?? (r.cliente?.id ?? null),
              rol: (r.cliente?.rol ?? null) as any,
              nombreCompleto: r.clienteNombre ?? r.cliente?.nombreCompleto ?? null,
              email: r.clienteEmail ?? r.cliente?.email ?? null,
            } as any,
            // Fechas de estancia (check-in/check-out)
            entrada: fechasEstancia.entrada,
            salida: fechasEstancia.salida,
            // Estancia completa si está disponible
            estancia: r.estancia ?? null
          };
        });

        console.log('🔄 Reservas adaptadas:', adaptadas);
        this.reservas.set(adaptadas);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('❌ Error al obtener reservas:', err);
        this.error.set('No se pudieron cargar las reservas');
        this.cargando.set(false);
      },
    });
  }

  private obtenerFechasEstancia(reserva: any): { entrada: string | null, salida: string | null } {
    console.log('🔍 Buscando fechas de estancia para reserva:', reserva.id);
    
    // Opción 1: Si la estancia viene en la respuesta del API
    if (reserva.estancia) {
      console.log('✅ Estancia encontrada en reserva:', reserva.estancia);
      return {
        entrada: reserva.estancia.fechaEntrada ?? reserva.estancia.entrada ?? null,
        salida: reserva.estancia.fechaSalida ?? reserva.estancia.salida ?? null
      };
    }
    
    // Opción 2: Si hay una relación de estancias
    if (reserva.estancias && reserva.estancias.length > 0) {
      const estancia = reserva.estancias[0]; // Tomamos la primera estancia
      console.log('✅ Estancia encontrada en array estancias:', estancia);
      return {
        entrada: estancia.fechaEntrada ?? estancia.entrada ?? null,
        salida: estancia.fechaSalida ?? estancia.salida ?? null
      };
    }
    
    // Opción 3: Si las fechas vienen directamente en la reserva (fallback)
    if (reserva.fechaEntrada || reserva.fechaSalida) {
      console.log('⚠️ Usando fechas directas de reserva (fallback)');
      return {
        entrada: reserva.fechaEntrada ?? null,
        salida: reserva.fechaSalida ?? null
      };
    }
    
    // Opción 4: Si no hay estancia asociada    
    console.log('❌ No se encontró información de estancia');
    return { entrada: null, salida: null };
  }

  verDetalle(reserva: ReservaConEstancia): void {
    console.log('📋 Detalles de reserva:', reserva);
    console.log('🏨 Fechas de estancia - Entrada:', reserva.entrada, 'Salida:', reserva.salida);
    this.reservaSeleccionada.set(reserva);
  }

  cancelarReserva(id: string): void {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;

    this.reservasApi.cancelarReserva(id).subscribe({
      next: () => {
        this.mensaje.set('Reserva cancelada correctamente');
        this.cargarReservas();
      },
      error: (err) => {
        console.error('❌ Error al cancelar reserva:', err);
        this.error.set('No se pudo cancelar la reserva');
      },
    });
  }

  getEstadoBadgeClass(estado: string | undefined | null): string {
    const estadoValido = estado || 'DESCONOCIDO';
    
    const classes: { [key: string]: string } = {
      'CONFIRMADA': 'bg-green-100 text-green-800',
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'CANCELADA': 'bg-red-100 text-red-800',
      'COMPLETADA': 'bg-blue-100 text-blue-800',
      'CHECKED_IN': 'bg-purple-100 text-purple-800',
      'CHECKED_OUT': 'bg-gray-100 text-gray-800',
      'DESCONOCIDO': 'bg-gray-100 text-gray-500'
    };
    
    return classes[estadoValido] || classes['DESCONOCIDO'];
  }

  getEstadoIcon(estado: string | undefined | null): string {
    const estadoValido = estado || 'DESCONOCIDO';
    
    const icons: { [key: string]: string } = {
      'CONFIRMADA': '✅',
      'PENDIENTE': '⏳',
      'CANCELADA': '❌',
      'COMPLETADA': '🏁',
      'CHECKED_IN': '🏨',
      'CHECKED_OUT': '🚪',
      'DESCONOCIDO': '❓'
    };
    
    return icons[estadoValido] || icons['DESCONOCIDO'];
  }

  // Función helper para formatear fechas
  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) {
        return fecha;
      }
      
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const año = date.getFullYear();
      const horas = date.getHours().toString().padStart(2, '0');
      const minutos = date.getMinutes().toString().padStart(2, '0');
      
      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    } catch (error) {
      return fecha;
    }
  }
}
