import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-habitacion-tipos-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './tipos-list.component.html',
})
export class HabitacionTiposListComponent {
  service = inject(HabitacionTipoService);

  onDelete(id: string) {
    const ok = confirm('¿Eliminar este tipo?');
    if (ok) this.service.remove(id);
  }
}
