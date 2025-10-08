import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { AsyncPipe } from '@angular/common';
import { HabitacionTipo } from '../../../../shared/models/habitacion-tipo.model';

@Component({
  selector: 'app-habitacion-tipos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './tipos-list.component.html',
})
export class HabitacionTiposListComponent {
  service = inject(HabitacionTipoService);

  // Si tu service tiene un observable, lo puedes exponer así
  tipos$ = this.service.tipos$;

  onDelete(id: string) {
    const ok = confirm('¿Eliminar este tipo?');
    if (ok) {
      this.service.delete(id).subscribe({
        next: () => {
          // opcional: mostrar mensaje o actualizar UI
        },
        error: (err) => {
          console.error('Error eliminando tipo', err);
        }
      });
    }
  }

  trackById(index: number, item: any): any {
  return item.id;
}
}
