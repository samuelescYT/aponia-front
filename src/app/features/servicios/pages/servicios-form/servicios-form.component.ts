import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicioService } from '../../../../core/servicios/servicio.service';
import { ServicioApiService } from '../../../../core/servicios/servicio-api.service';
import { Servicio } from '../../../../shared/models/servicio.model';

@Component({
  selector: 'app-servicios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './servicios-form.component.html',
})
export class ServiciosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private service = inject(ServicioService);
  private api = inject(ServicioApiService);

  isEdit = false;
  id: string | null = null;

  loading = false;
  saving = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: this.fb.nonNullable.control<string>(''),
    precio: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
    activo: this.fb.nonNullable.control<boolean>(true),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.id = id;

    if (!this.isEdit) {
      this.form.reset({
        nombre: '',
        descripcion: '',
        precio: 0,
        activo: true,
      });
      return;
    }

    if (id) {
      this.loading = true;
      this.api.getById(id).subscribe({
        next: (servicio) => {
          if (!servicio) {
            this.router.navigate(['/servicios']);
            return;
          }
          this.form.patchValue({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion ?? '',
            precio: typeof (servicio as any).precio === 'string'
              ? Number((servicio as any).precio)
              : (servicio as any).precio
          });
        },
        error: () => {
          this.router.navigate(['/servicios']);
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
  const raw = this.form.getRawValue();

  // Construye el payload con la forma que exige el modelo Servicio (Omit<Servicio,'id'>)
  const payload: Omit<Servicio, 'id'> = {
    nombre: raw.nombre,
    descripcion: raw.descripcion ?? null,
    // Si tu formulario no tiene "lugar", ponemos un valor por defecto; idealmente agrega este campo al form
    lugar: (raw as any).lugar ?? 'General',
    // Mapea el campo "precio" del form a "precioPorPersona" del modelo
    precioPorPersona: Number(raw.precio ?? 0),
    // Si no tienes duración en el form, pones un default (ideal: agregar campo al form)
    duracionMinutos: Number((raw as any).duracionMinutos ?? 60),
    capacidadMaxima: (raw as any).capacidadMaxima != null ? Number((raw as any).capacidadMaxima) : null,
    // campos opcionales que el backend espera; si no los manejas ahora, inicialízalos vacíos
    disponibilidades: [],
    imagenes: [],
    reservasServicios: []
  };

  const done = () => {
    this.saving = false;
    this.router.navigate(['/servicios']);
  };
  const fail = (err: unknown) => {
    console.error('Error guardando servicio', err);
    this.saving = false;
    alert('Ocurrió un error guardando. Revisa la consola para más detalles.');
  };

  if (this.isEdit && this.id) {
    // Asumo que tu service.update acepta (id, payload) o similar; si acepta (payload) ajusta la llamada.
    this.service.update(this.id, payload).subscribe({ next: done, error: fail });
  } else {
    this.service.create(payload).subscribe({ next: done, error: fail });
  }
}
}
