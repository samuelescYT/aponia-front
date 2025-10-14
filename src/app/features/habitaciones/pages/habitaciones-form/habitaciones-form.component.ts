import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { Habitacion } from '../../../../shared/models/habitacion.model';
import { HabitacionTipo } from '../../../../shared/models/habitacion-tipo.model';
import { HabitacionService } from '../../../../core/services/habitaciones/habitaciones.service';

@Component({
  selector: 'app-habitaciones-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './habitaciones-form.component.html',
})
export class HabitacionesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HabitacionService);
  private tiposService = inject(HabitacionTipoService);

  tipos: HabitacionTipo[] = [];
  isEdit = false;
  id: string | null = null;

  loading = false;
  saving = false;

  form = this.fb.nonNullable.group({
    numero: [0, [Validators.required, Validators.min(1)]],
    activa: this.fb.nonNullable.control<boolean>(true),
    tipoId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.tiposService.listActivos().subscribe({
      next: (data) => (this.tipos = data),
      error: (err) => console.error('Error cargando tipos', err),
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loading = true;
      this.service.getById(this.id).subscribe({
        next: (habitacion) => {
          this.form.patchValue({
            numero: habitacion.numero,
            activa: habitacion.activa,
            tipoId: habitacion.tipo?.id || '',
          });
        },
        complete: () => (this.loading = false),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const habitacion: Omit<Habitacion, 'id'> = {
      numero: value.numero,
      activa: value.activa,
      tipo: { id: value.tipoId } as HabitacionTipo,
    };

    const done = () => {
      this.saving = false;
      this.router.navigate(['/dashboard-admin/habitaciones']);
    };
    const fail = (err: unknown) => {
      console.error('Error guardando habitación', err);
      this.saving = false;
      alert('Ocurrió un error guardando.');
    };

    this.saving = true;

    if (this.isEdit && this.id) {
      this.service.update(this.id, { id: this.id, ...habitacion }).subscribe({ next: done, error: fail });
    } else {
      this.service.create(habitacion).subscribe({ next: done, error: fail });
    }
  }
}
