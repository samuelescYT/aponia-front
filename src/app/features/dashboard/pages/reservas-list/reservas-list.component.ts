import { Reserva } from './../../../../shared/models/reserva.model';
import { AuthService } from './../../../../core/auth/auth.service';
import { ReservasApiService } from './../../../../core/services/reservas/reserva-api.service';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';


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

  // Señales de estado
  reservas = signal<Reserva[]>([]);
  loading = signal(true);
  filtroActual = signal<FiltroEstado>('TODAS');

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
      
      // Verificar la estructura de la primera reserva
      if (data.length > 0) {
        console.log('🔍 Estructura de la primera reserva:', data[0]);
        console.log('🏨 Estancias:', data[0].estancias);
        console.log('📅 Entrada:', data[0].estancias?.[0]?.entrada);
      }
      
      // Ordenar por fecha de creación más reciente primero
      const ordenadas = data.sort((a, b) => {
        const fechaA = a.estancias?.[0]?.entrada || '';
        const fechaB = b.estancias?.[0]?.entrada || '';
        return fechaB.localeCompare(fechaA);
      });
      this.reservas.set(ordenadas);
      this.loading.set(false);
    },
    error: (error) => {
      console.error('❌ Error al cargar reservas:', error);
      this.loading.set(false);
    },
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
}