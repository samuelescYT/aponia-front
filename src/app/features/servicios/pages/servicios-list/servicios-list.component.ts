import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioService } from '../../../../core/servicios/servicio.service';
import { Servicio } from '../../../../shared/models/servicio.model';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './servicios-list.component.html',
})
export class ServiciosListComponent {
  service = inject(ServicioService);
  servicios$ = this.service.servicios$;

  onDelete(id: string): void {
    const ok = confirm('¿Eliminar este servicio?');
    if (ok) {
      this.service.delete(id).subscribe({
        next: () => {
          // opcional: mostrar mensaje o recargar
        },
        error: (err) => {
          console.error('Error eliminando servicio', err);
        }
      });
    }
  }

  trackById(index: number, item: Servicio): string {
    return item.id;
  }
}
