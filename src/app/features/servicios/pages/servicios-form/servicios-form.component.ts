import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiciosService } from '../../../../core/services/servicios/servicios.service';
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
  private service = inject(ServiciosService);

  isEdit = false;
  id: string | null = null;

  loading = false;
  saving = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: [''],
    lugar: ['', [Validators.required]],
    precioPorPersona: [0, [Validators.required, Validators.min(0)]],
    duracionMinutos: [30, [Validators.required, Validators.min(1)]],
    capacidadMaxima: [null as number | null],
    imagenUrl: [''], // ✅ nuevo campo
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loading = true;
      this.service.getById(this.id).subscribe({
        next: (servicio) => {
          this.form.patchValue({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion ?? '',
            lugar: servicio.lugar,
            precioPorPersona: servicio.precioPorPersona,
            duracionMinutos: servicio.duracionMinutos,
            capacidadMaxima: servicio.capacidadMaxima,
            imagenUrl: servicio.imagenesUrls?.[0] ?? '', // ✅ carga la imagen existente
          });
        },
        error: (err) => {
          console.error('Error obteniendo servicio', err);
          this.router.navigate(['/dashboard-admin/servicios']);
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

    const servicio: Omit<Servicio, 'id'> = {
      nombre: value.nombre.trim(),
      descripcion: value.descripcion?.trim() || '',
      lugar: value.lugar.trim(),
      precioPorPersona: value.precioPorPersona,
      duracionMinutos: value.duracionMinutos,
      capacidadMaxima: value.capacidadMaxima,
      imagenesUrls: value.imagenUrl ? [value.imagenUrl.trim()] : [], // ✅ se envía correctamente
    };

    const done = () => {
      this.saving = false;
      this.router.navigate(['/dashboard-admin/servicios']);
    };
    const fail = (err: unknown) => {
      console.error('Error guardando servicio', err);
      this.saving = false;
      alert('Ocurrió un error guardando.');
    };

    this.saving = true;

    if (this.isEdit && this.id) {
      this.service.update(this.id, { id: this.id, ...servicio }).subscribe({ next: done, error: fail });
    } else {
      this.service.create(servicio).subscribe({ next: done, error: fail });
    }
  }
}
