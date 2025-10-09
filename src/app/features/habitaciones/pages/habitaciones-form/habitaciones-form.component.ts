import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionesApiService } from '../../../../core/services/habitaciones/habitaciones-api.service';
import { HabitacionTipoApiService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos-api.service';
import { Habitacion } from './../../../../shared/models/habitacion.model';
import { HabitacionTipo } from './../../../../shared/models/habitacion-tipo.model';

@Component({
  selector: 'app-habitaciones-form',
  templateUrl: './habitaciones-form.component.html',
})
export class HabitacionesFormComponent implements OnInit {
  habitacion: Habitacion = {
  id: '',
  numero: 0, // ✅ number, no string
  activa: true,
  tipoId: '',
};


  tiposHabitacion: HabitacionTipo[] = [];
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: HabitacionesApiService,
    private tiposApi: HabitacionTipoApiService
  ) {}

  ngOnInit(): void {
    // Cargar tipos de habitación
      this.tiposApi.listAll().subscribe({
      next: (data: HabitacionTipo[]) => (this.tiposHabitacion = data),
    });

    // Detectar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.api.getById(id).subscribe({
        next: (data) => {
          this.habitacion = data;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
    }
  }

  guardar(): void {
    this.loading = true;

    const peticion = this.isEdit
      ? this.api.update(this.habitacion)
      : this.api.create(this.habitacion);

    peticion.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/habitaciones']);
      },
      error: () => {
        this.loading = false;
        alert('Ocurrió un error al guardar la habitación.');
      },
    });
  }
}
