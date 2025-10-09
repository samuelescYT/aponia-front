import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioDisponibilidadService } from '../../../../core/servicios-disponibilidad/servicio-disponibilidad.service';

@Component({
  selector: 'app-disponibilidad-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './disponibilidad-list.component.html',
})
export class DisponibilidadListComponent {
  service = inject(ServicioDisponibilidadService);
  disponibilidades$ = this.service.disponibilidades$;

  ngOnInit(): void {
    this.service.loadAll();
  }

  onDelete(id: string): void {
    const ok = confirm('¿Eliminar esta disponibilidad?');
    if (ok) {
      this.service.delete(id).subscribe({
        error: (err) => console.error('Error eliminando disponibilidad', err),
      });
    }
  }

  trackById(index: number, item: any): any {
    return item.id;
  }
}
