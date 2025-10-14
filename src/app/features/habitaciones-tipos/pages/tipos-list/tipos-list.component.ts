import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { HabitacionTipo } from '../../../../shared/models/habitacion-tipo.model';

@Component({
  selector: 'app-habitacion-tipos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tipos-list.component.html',
})
export class HabitacionTiposListComponent implements OnInit {
  private service = inject(HabitacionTipoService);
  private cdr = inject(ChangeDetectorRef);

  tipos = signal<HabitacionTipo[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadTipos();
  }

  loadTipos() {
    this.loading.set(true);
    this.service.listAll().subscribe({
      next: (data) => {
        this.tipos.set(data);
        this.loading.set(false);
        this.cdr.detectChanges(); // 🔄 asegura render zoneless
      },
      error: (err) => {
        console.error('Error cargando tipos', err);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  /** Retorna la URL segura de la miniatura con fallback */
  thumbUrl(tipo: HabitacionTipo): string {
    const url = tipo.imagenes?.[0]?.url?.trim();
    if (!url || url === '') {
      return 'img/logo_aponia.png';
    }
    return url;
  }

  /** Si una imagen falla, reemplaza una sola vez para evitar bucles */
 /** Si una imagen falla, reemplaza una sola vez para evitar bucles infinitos */
onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (!img.dataset['fallbackApplied']) {
    img.src = 'img/logo_aponia.png';
    img.dataset['fallbackApplied'] = 'true';
  }
}


  onDelete(id: string) {
    if (confirm('¿Eliminar este tipo?')) {
      this.service.delete(id).subscribe({
        next: () => this.loadTipos(),
        error: (err) => console.error('Error eliminando tipo', err),
      });
    }
  }
}
