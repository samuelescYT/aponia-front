import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HabitacionesApiService } from '../../../../core/services/habitaciones/habitaciones-api.service';
import { Habitacion } from './../../../../shared/models/habitacion.model';

@Component({
  selector: 'app-habitaciones-list',
  templateUrl: './habitaciones-list.component.html',
})
export class HabitacionesListComponent implements OnInit {
  habitaciones: Habitacion[] = [];
  loading = false;

  constructor(
    private api: HabitacionesApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Error al cargar las habitaciones');
      },
    });
  }

  editar(habitacion: Habitacion): void {
    this.router.navigate(['/habitaciones/form', habitacion.id]);
  }

  eliminar(id: string): void {
    if (confirm('¿Deseas eliminar esta habitación?')) {
      this.api.delete(id).subscribe({
        next: () => this.cargar(),
        error: () => alert('Error al eliminar la habitación'),
      });
    }
  }
}
