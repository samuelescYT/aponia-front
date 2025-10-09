import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HabitacionesService } from '../../../../core/services/habitaciones/habitaciones.service';
import { Habitacion } from '../../../../shared/models/habitacion.model';

@Component({
  selector: 'app-habitaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitaciones-list.component.html',
})
export class HabitacionesListComponent {
  private service = inject(HabitacionesService);

  habitaciones$ = this.service.listar();

  onDelete(id: string) {
    const ok = confirm('¿Eliminar esta habitación?');
    if (ok) {
      this.service.eliminar(id).subscribe({
        next: () => {
          // recarga stream tras borrar
          this.habitaciones$ = this.service.listar();
        },
        error: (err) => {
          console.error('Error eliminando habitación', err);
          alert('Error eliminando habitación');
        },
      });
    }
  }

  trackById(index: number, item: Habitacion) {
    return item.id;
  }
}
