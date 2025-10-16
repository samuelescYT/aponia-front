import { HabitacionTipoService } from './../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HabitacionTipo } from '../../../../shared/models/habitacion-tipo.model';

@Component({
  selector: 'app-habitaciones-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './habitaciones-list.component.html',
})
export class HabitacionesClienteListComponent implements OnInit {
  private readonly service = inject(HabitacionTipoService);
  tipos = signal<HabitacionTipo[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.service.listActivos().subscribe({
      next: (data) => {
        this.tipos.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
