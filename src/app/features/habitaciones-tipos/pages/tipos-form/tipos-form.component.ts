import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { HabitacionTipoApiService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos-api.service';

@Component({
  selector: 'app-habitacion-tipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tipos-form.component.html',
})
export class HabitacionTipoFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  // Usamos el servicio de estado para crear/actualizar (recarga lista),
  // y el servicio API para leer 1 registro por id (cuando entramos directo por URL).
  private service = inject(HabitacionTipoService);
  private api     = inject(HabitacionTipoApiService);

  isEdit = false;
  id: string | null = null;

  loading = false;
  saving  = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    aforoMaximo: this.fb.nonNullable.control<number>(1, [Validators.required, Validators.min(1)]),
    descripcion: this.fb.nonNullable.control<string>(''),
    // El backend usa BigDecimal; aquí mandamos number y Jackson lo parsea.
    precioPorNoche: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    activa: this.fb.nonNullable.control<boolean>(true),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.id = id;

    if (!this.isEdit) {
      // Modo crear
      this.form.reset({
        nombre: '',
        aforoMaximo: 1,
        descripcion: '',
        precioPorNoche: 0,
        activa: true,
      });
      return;
    }

    // Modo editar: cargamos el registro desde la API (fiable si entras por URL directa)
    if (id) {
      this.loading = true;
      this.api.getById(id).subscribe({
        next: (tipo) => {
          if (!tipo) {
            this.router.navigate(['/habitaciones-tipos']);
            return;
          }
          this.form.patchValue({
            nombre: tipo.nombre,
            aforoMaximo: tipo.aforoMaximo,
            descripcion: tipo.descripcion ?? '',
            // Si llega como string (BigDecimal serializado), conviértelo
            precioPorNoche: typeof (tipo as any).precioPorNoche === 'string'
              ? Number((tipo as any).precioPorNoche)
              : (tipo as any).precioPorNoche,
            activa: !!tipo.activa,
          });
        },
        error: () => {
          // Si el id no existe o hubo error, volvemos a la lista
          this.router.navigate(['/habitaciones-tipos']);
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

    this.saving = true;
    const value = this.form.getRawValue();

    const done = () => {
      this.saving = false;
      this.router.navigate(['/habitaciones-tipos']);
    };
    const fail = (err: unknown) => {
      console.error('Error guardando tipo de habitación', err);
      this.saving = false;
      alert('Ocurrió un error guardando. Revisa la consola para más detalles.');
    };

    if (this.isEdit && this.id) {
      // update(id, patch) -> el servicio combina y hace PUT + recarga
      this.service.update(this.id, value).subscribe({ next: done, error: fail });
    } else {
      // create(data) -> POST + recarga
      this.service.create(value).subscribe({ next: done, error: fail });
    }
  }
}
