import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitacionService } from '../../../../core/services/habitaciones/habitaciones.service';
import { Habitacion } from '../../../../shared/models/habitacion.model';

@Component({
  selector: 'app-habitaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitaciones-list.component.html',
})
export class HabitacionesListComponent implements OnInit {
  private service = inject(HabitacionService);
  habitaciones = signal<Habitacion[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.listAll().subscribe({
      next: (data) => {
        this.habitaciones.set(data);
        console.log(this.habitaciones());
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando habitaciones', err);
        this.loading.set(false);
      },
    });
  }

  onDelete(id: string) {
    if (confirm('¿Eliminar esta habitación?')) {
      this.service.delete(id).subscribe({
        next: () => this.load(),
        error: (err) => console.error('Error eliminando habitación', err),
      });
    }
  }
}
