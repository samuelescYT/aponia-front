import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos.service';

@Component({
  selector: 'app-habitacion-tipo-form',
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

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    aforoMaximo: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    descripcion: this.fb.nonNullable.control(''),
    precioPorNoche: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    activa: this.fb.nonNullable.control(true),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.id = id;

    if (this.isEdit && id) {
      const tipo = this.service.getById(id);
      if (!tipo) {
        this.router.navigate(['/habitaciones-tipos']);
        return;
      }
      this.form.patchValue({
        nombre: tipo.nombre,
        aforoMaximo: tipo.aforoMaximo,
        descripcion: tipo.descripcion ?? '',
        precioPorNoche: tipo.precioPorNoche,
        activa: tipo.activa,
      });
    } else {
      this.form.reset({
        nombre: '',
        aforoMaximo: 1,
        descripcion: '',
        precioPorNoche: 0,
        activa: true,
      });
    }
  }

  onSubmit() {
  if (this.form.invalid) return;

  const value = this.form.getRawValue(); // tipos sin null
  if (this.isEdit && this.id) {
    this.service.update(this.id, value);
  } else {
    this.service.create(value);
  }
  this.router.navigate(['/habitaciones-tipos']);
}

}
