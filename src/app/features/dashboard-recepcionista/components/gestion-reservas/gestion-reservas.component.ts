import { Component, OnInit, signal, computed } from '@angular/core';
import { ReservasApiService } from '../../../../core/services/reservas/reserva-api.service';
import { Reserva, EstadoReserva } from '../../../../shared/models/reserva.model';

@Component({
  selector: 'app-gestion-reservas',
  templateUrl: './gestion-reservas.component.html',
})
export class GestionReservasComponent implements OnInit {
  reservas = signal<Reserva[]>([]);
  filtro = signal<'todas' | 'activas'>('todas');
  cargando = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  reservaSeleccionada = signal<Reserva | null>(null);

  reservasFiltradas = computed(() => {
  const todas = this.reservas();
  return this.filtro() === 'activas'
    ? todas.filter(r => r.estado === 'ACTIVA' as EstadoReserva)
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
    this.reservas.set(data);
  },
  error: (err) => {
    console.error('❌ Error al obtener reservas:', err);
  }
});

  }

  verDetalle(reserva: Reserva): void {
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
}
