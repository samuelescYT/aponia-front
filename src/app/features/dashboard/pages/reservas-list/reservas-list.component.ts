import { Reserva } from './../../../../shared/models/reserva.model';
import { AuthService } from './../../../../core/auth/auth.service';
import { ReservasApiService } from './../../../../core/services/reservas/reserva-api.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './reservas-list.component.html',
})
export class ReservasListComponent implements OnInit {
  private readonly reservasApi = inject(ReservasApiService);
  private readonly auth = inject(AuthService);

  reservas = signal<Reserva[]>([]);
  loading = signal(true);

  ngOnInit() {
    const user = this.auth.user();
    if (!user) return;

    this.reservasApi.getReservasByCliente(user.id).subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

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
}
