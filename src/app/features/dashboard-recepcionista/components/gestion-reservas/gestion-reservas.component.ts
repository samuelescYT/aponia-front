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

        // adaptamos cada reserva devuelta por el backend para incluir cliente y las fechas
        const adaptadas: ReservaConEstancia[] = (data as any[]).map((r: any) => ({
          // mantenemos todas las propiedades originales (id, codigo, estado, notas, resumenPago, etc.)
          ...(r as object) as ReservaConEstancia,
          // construimos cliente si el template lo espera como cliente.nombreCompleto/email
          cliente: {
            // @ts-ignore: quizá el tipo Usuario exige id/rol; esto solo se pone para que el template acceda a nombreCompleto/email
            id: r.clienteId ?? (r.cliente?.id ?? null),
            rol: (r.cliente?.rol ?? null) as any,
            nombreCompleto: r.clienteNombre ?? r.cliente?.nombreCompleto ?? null,
            email: r.clienteEmail ?? r.cliente?.email ?? null,
            // otras props de Usuario no necesarias aquí
          } as any,
          // fechas traídas desde DTO del backend (entrada/salida son propiedades planas en tu DTO)
          entrada: r.entrada ?? null,
          salida: r.salida ?? null,
        }));

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

  verDetalle(reserva: ReservaConEstancia): void {
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
