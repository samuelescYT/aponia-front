import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicioDisponibilidadService } from '../../../../core/servicios-disponibilidad/servicio-disponibilidad.service';
import { ServicioDisponibilidadApiService } from '../../../../core/servicios-disponibilidad/servicio-disponibilidad-api.service';

@Component({
  selector: 'app-disponibilidad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './disponibilidad-form.component.html',
})
export class DisponibilidadFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ServicioDisponibilidadService);
  private api = inject(ServicioDisponibilidadApiService);

  isEdit = false;
  id: string | null = null;
  loading = false;
  saving = false;

  form = this.fb.nonNullable.group({
    servicioId: ['', Validators.required],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
    capacidadDisponible: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.id = id;

    if (this.isEdit && id) {
      this.loading = true;
      this.api.getById(id).subscribe({
        next: (d) => this.form.patchValue(d),
        error: () => this.router.navigate(['/disponibilidades']),
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
    const data = this.form.getRawValue();

    const done = () => {
      this.saving = false;
      this.router.navigate(['/disponibilidades']);
    };

    const fail = (err: unknown) => {
      console.error('Error guardando disponibilidad', err);
      this.saving = false;
      alert('Error al guardar. Revisa la consola.');
    };

    if (this.isEdit && this.id) {
  const dataWithId: ServicioDisponibilidad = { id: this.id, ...data };
  this.service.update(this.id, dataWithId).subscribe({ next: done, error: fail });
} else {
  const newData: ServicioDisponibilidad = { id: '', ...data };
  this.service.create(newData).subscribe({ next: done, error: fail });
}

  }
}
