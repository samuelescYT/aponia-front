import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';

@Component({
  selector: 'app-habitacion-tipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tipos-form.component.html',
})
export class HabitacionTipoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HabitacionTipoService);

  isEdit = false;
  id: string | null = null;

  loading = false;
  saving = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    aforoMaximo: this.fb.nonNullable.control<number>(1, [Validators.required, Validators.min(1)]),
    descripcion: this.fb.nonNullable.control<string>(''),
    precioPorNoche: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    activa: this.fb.nonNullable.control<boolean>(true),
    imagenUrl: this.fb.nonNullable.control<string>(''),
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loading = true;
      this.service.getById(this.id).subscribe({
        next: (tipo) => {
          this.form.patchValue({
            nombre: tipo.nombre,
            aforoMaximo: tipo.aforoMaximo,
            descripcion: tipo.descripcion ?? '',
            precioPorNoche: Number(tipo.precioPorNoche),
            activa: !!tipo.activa,
            imagenUrl: tipo.imagenes?.length ? tipo.imagenes[0].url : '',
          });
        },
        error: (err) => {
          console.error('Error obteniendo tipo', err);
          this.router.navigate(['/dashboard-admin/habitaciones-tipos']);
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

    const habitacionTipo = {
      nombre: value.nombre.trim(),
      descripcion: value.descripcion?.trim() || '',
      aforoMaximo: value.aforoMaximo,
      precioPorNoche: value.precioPorNoche,
      activa: value.activa,
      imagenes: value.imagenUrl
        ? [{ url: value.imagenUrl.trim() }]
        : [],
    };

    const done = () => {
      this.saving = false;
      this.router.navigate(['/dashboard-admin/habitaciones-tipos']);
    };
    const fail = (err: unknown) => {
      console.error('Error guardando tipo de habitación', err);
      this.saving = false;
      alert('Ocurrió un error guardando. Revisa la consola para más detalles.');
    };

    if (this.isEdit && this.id) {
      this.service
        .update(this.id, { id: this.id, ...habitacionTipo })
        .subscribe({ next: done, error: fail });
    } else {
      this.service.create(habitacionTipo).subscribe({ next: done, error: fail });
    }
  }
}
