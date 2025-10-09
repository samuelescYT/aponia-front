import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionesService } from '../../../../core/services/habitaciones/habitaciones.service';
import { HabitacionesApiService } from '../../../../core/services/habitaciones/habitaciones-api.service';
import { Habitacion } from '../../../../shared/models/habitacion.model';

@Component({
  selector: 'app-habitacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './habitaciones-form.component.html',
})
export class HabitacionesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HabitacionesService);
  private api = inject(HabitacionesApiService);

  isEdit = false;
  id: string | null = null;

  loading = false;
  saving = false;

  // ✅ Form tipado
  form = this.fb.nonNullable.group({
    numero: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(1)]),
    activa: this.fb.nonNullable.control<boolean>(true),
    tipoId: this.fb.nonNullable.control<string>('', [Validators.required]),
  });

  // ✅ Guarda el tipo actual en modo edición
  tipoActualId: string = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.id = id;

    if (!this.isEdit) return;

    this.loading = true;
    this.api.getById(id!).subscribe({
      next: (h) => {
        if (!h) {
          this.router.navigate(['/habitaciones']);
          return;
        }

        // ✅ Guarda el tipo actual y rellena el formulario
        this.tipoActualId = h.tipo?.id ?? '';
        this.form.patchValue({
          numero: Number(h.numero),
          activa: h.activa,
          tipoId: h.tipo?.id ?? '',
        });
      },
      error: (err) => {
        console.error('Error cargando habitación', err);
        this.router.navigate(['/habitaciones']);
      },
      complete: () => (this.loading = false),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue();

    // ✅ Cuerpo JSON sin tipoId (el backend lo recibe como query param)
    const habitacion: Omit<Habitacion, 'tipoId'> = {
      id: this.id ?? '',
      numero: Number(value.numero),
      activa: value.activa,
    };

    // ✅ Determinar tipoId (nuevo o existente)
    const tipoId = value.tipoId || this.tipoActualId;

    // Si sigue vacío, no podemos guardar (nullable = false en backend)
    if (!tipoId) {
      alert('Debes seleccionar un tipo de habitación antes de guardar.');
      this.saving = false;
      return;
    }

    const done = () => {
      this.saving = false;
      this.router.navigate(['/habitaciones']);
    };
    const fail = (err: unknown) => {
      console.error('Error guardando habitación', err);
      this.saving = false;
      alert('Ocurrió un error guardando la habitación.');
    };

    if (this.isEdit && this.id) {
      this.service.actualizar(habitacion as Habitacion, tipoId).subscribe({ next: done, error: fail });
    } else {
      this.service.crear(habitacion as Habitacion, tipoId).subscribe({ next: done, error: fail });
    }
  }
}
