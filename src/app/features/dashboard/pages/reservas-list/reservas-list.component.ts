import { Reserva } from './../../../../shared/models/reserva.model';
import { AuthService } from './../../../../core/auth/auth.service';
import { ReservasApiService } from './../../../../core/services/reservas/reserva-api.service';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ServiciosService } from '../../../../core/services/servicios/servicios.service';
import { HttpClient } from '@angular/common/http';


type FiltroEstado = 'TODAS' | 'ACTIVAS' | 'COMPLETADAS' | 'CANCELADAS';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './reservas-list.component.html',
})
export class ReservasListComponent implements OnInit {
  private readonly reservasApi = inject(ReservasApiService);
  private readonly auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
private serviciosService = inject(ServiciosService);

  // Señales de estado
  reservas = signal<Reserva[]>([]);
  loading = signal(true);
  filtroActual = signal<FiltroEstado>('TODAS');
  serviciosPorReserva = signal<{[key: string]: any[]}>({});
  cargandoServicios = signal<{[key: string]: boolean}>({});

  // Reservas filtradas según el tab seleccionado
  reservasFiltradas = computed(() => {
    const todas = this.reservas();
    const filtro = this.filtroActual();

    switch (filtro) {
      case 'ACTIVAS':
        return todas.filter(r =>  r.estado === 'CONFIRMADA');
      case 'COMPLETADAS':
        return todas.filter(r => r.estado === 'COMPLETADA');
      case 'CANCELADAS':
        return todas.filter(r => r.estado === 'CANCELADA');
      default:
        return todas;
    }
  });

  // Contadores para los badges
  totalReservas = computed(() => this.reservas().length);
  reservasActivas = computed(() => 
    this.reservas().filter(r =>  r.estado === 'CONFIRMADA').length
  );
  reservasCompletadas = computed(() => 
    this.reservas().filter(r => r.estado === 'COMPLETADA').length
  );
  reservasCanceladas = computed(() => 
    this.reservas().filter(r => r.estado === 'CANCELADA').length
  );

  ngOnInit() {
  const user = this.auth.user();
  if (!user) return;

  this.reservasApi.getReservasByCliente(user.id).subscribe({
    next: (data) => {
      console.log('📦 Datos recibidos del backend:', data);
      
      // Verificar la estructura de las reservas
      if (data.length > 0) {
        data.forEach((reserva, index) => {
          console.log(`🔍 Reserva ${index + 1}:`, reserva.codigo);
          console.log(`   Estancias:`, reserva.estancias);
          if (reserva.estancias && reserva.estancias.length > 0) {
            const estancia = reserva.estancias[0];
            console.log(`   Habitación asignada:`, estancia.habitacionAsignada);
            console.log(`   Número de habitación:`, estancia.habitacionAsignada?.numero);
          }
        });
      }
      
      // Ordenar por fecha de creación más reciente primero
      const ordenadas = data.sort((a, b) => {
        const fechaA = a.estancias?.[0]?.entrada || '';
        const fechaB = b.estancias?.[0]?.entrada || '';
        return fechaB.localeCompare(fechaA);
      });
      this.reservas.set(ordenadas);
      this.loading.set(false);
      this.cargarServiciosParaReservas(ordenadas);
    },
    error: (error) => {
      console.error('❌ Error al cargar reservas:', error);
      this.loading.set(false);
    },
  });
}


cargarServiciosParaReservas(reservas: Reserva[]) {
  reservas.forEach(reserva => {
    this.cargandoServicios.update(state => ({...state, [reserva.id]: true}));
    
    this.reservasApi.getServiciosPorReserva(reserva.id).subscribe({
      next: async (serviciosReserva) => {
        // Cargar información completa de cada servicio
        const serviciosCompletos = await this.cargarInformacionServicios(serviciosReserva);
        
        this.serviciosPorReserva.update(state => ({
          ...state, 
          [reserva.id]: serviciosCompletos
        }));
        this.cargandoServicios.update(state => ({...state, [reserva.id]: false}));
      },
      error: (error) => {
        console.error(`❌ Error cargando servicios para reserva ${reserva.id}:`, error);
        this.cargandoServicios.update(state => ({...state, [reserva.id]: false}));
      }
    });
  });
}

private async cargarInformacionServicios(serviciosReserva: any[]): Promise<any[]> {
  const serviciosCompletos = [];
  
  for (const servicioReserva of serviciosReserva) {
    try {
      // Necesitamos obtener el servicioId de alguna manera
      // Si no viene en la respuesta, necesitamos otro endpoint
      const servicioId = await this.obtenerServicioId(servicioReserva.id);
      const servicioCompleto = await this.serviciosService.getById(servicioId).toPromise();
      
      serviciosCompletos.push({
        ...servicioReserva,
        servicio: servicioCompleto
      });
    } catch (error) {
      console.error('Error cargando servicio:', error);
      serviciosCompletos.push(servicioReserva);
    }
  }
  
  return serviciosCompletos;
}

// Método para obtener el ID del servicio (necesitas implementarlo)
private async obtenerServicioId(reservaServicioId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    this.http.get<string>(
      `http://localhost:8083/api/reservas-servicios/${reservaServicioId}/servicio-id`,
      { responseType: 'text' as 'json' }  // ← Importante para string response
    ).subscribe({
      next: (servicioId) => {
        console.log(`🔍 ServicioId para ${reservaServicioId}:`, servicioId);
        resolve(servicioId);
      },
      error: (error) => {
        console.error('Error obteniendo servicioId:', error);
        resolve('servicio_default'); // Valor por defecto
      }
    });
  });
}

  // Cambiar filtro activo
  cambiarFiltro(filtro: FiltroEstado) {
    this.filtroActual.set(filtro);
  }

  // Cancelar reserva
  cancelar(id: string) {
    if (!confirm('¿Deseas cancelar esta reserva?')) return;

    this.reservasApi.cancelarReserva(id).subscribe({
      next: () => {
        this.reservas.update((arr) =>
          arr.map((r) => (r.id === id ? { ...r, estado: 'CANCELADA' } : r))
        );
        alert('Reserva cancelada correctamente ✅');
      },
      error: () => alert('Error al cancelar la reserva 😢'),
    });
  }

  // Calcular número de noches
  calcularNoches(reserva: Reserva): number {
    const estancia = reserva.estancias?.[0];
    if (!estancia?.entrada || !estancia?.salida) return 0;
    
    const entrada = new Date(estancia.entrada);
    const salida = new Date(estancia.salida);
    const diffTime = Math.abs(salida.getTime() - entrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calcular total de la reserva
  calcularTotal(reserva: Reserva): number {
    const estancia = reserva.estancias?.[0];
    if (!estancia?.precioPorNoche) return 0;
    
    const noches = this.calcularNoches(reserva);
    return estancia.precioPorNoche * noches;
  }

  editarReserva(id: string) {
  this.router.navigate(['/dashboard/reservas/editar', id]);
}

// En reservas-list.component.ts
getNumeroHabitacion(estancia: any): string {
  if (estancia?.habitacionAsignada?.numero) {
    return `#${estancia.habitacionAsignada.numero}`;
  }
  return 'Por asignar';
}

// En reservas-list.component.ts
obtenerNombreServicio(servicioReserva: any): string {
  console.log('🔍 Datos del servicio para obtener nombre:', servicioReserva);
  
  // Si ya viene con el servicio completo
  if (servicioReserva.servicio?.nombre) {
    return servicioReserva.servicio.nombre;
  }
  const nombresServicios: {[key: string]: string} = {
    'servicio_trekking': 'Trekking al amanecer',
    'servicio_restaurante': 'Restaurante Gourmet',
    'servicio_transporte': 'Transporte Privado', 
    'servicio_wifi': 'Wi-Fi & Cowork',
    'servicio_spa': 'Spa de autor'
  };
  
  // Buscar por servicioId si está disponible
  const servicioId = servicioReserva.servicio?.id || servicioReserva.servicioId;
  if (servicioId && nombresServicios[servicioId]) {
    return nombresServicios[servicioId];
  }
  
  return 'Servicio Adicional';
}
}