import { HabitacionTipoService } from './../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ReservasApiService } from './../../../../core/services/reservas/reserva-api.service';
import { HabitacionTipo } from './../../../../shared/models/habitacion-tipo.model';
import { AuthService } from './../../../../core/auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-reservas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservas-form.component.html',
})
export class ReservasFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reservasApi = inject(ReservasApiService);
  private readonly habitacionTipoService = inject(HabitacionTipoService);
  private readonly auth = inject(AuthService);

  tipos = signal<HabitacionTipo[]>([]);
  loading = signal(false);
  success = signal(false);

  form = this.fb.group({
    tipoHabitacionId: ['', Validators.required],
    entrada: ['', Validators.required],
    salida: ['', Validators.required],
    numeroHuespedes: [1, [Validators.required, Validators.min(1)]],
    notas: [''],
  });

  // Computed: tipo seleccionado
  selectedTipo = computed(() =>
    this.tipos().find(t => t.id === this.form.get('tipoHabitacionId')?.value)
  );

  ngOnInit() {
    // Cargar tipos activos
    this.habitacionTipoService.listActivos().pipe(take(1)).subscribe({
      next: (data) => this.tipos.set(data),
    });

    // Cuando cambia el tipo de habitación, revalida número de huéspedes
    this.form.get('tipoHabitacionId')?.valueChanges.subscribe(() => {
      const tipo = this.selectedTipo();
      if (tipo) {
        const max = tipo.aforoMaximo;
        this.form
          .get('numeroHuespedes')
          ?.setValidators([Validators.required, Validators.min(1), Validators.max(max)]);
        this.form.get('numeroHuespedes')?.updateValueAndValidity();
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const user = this.auth.user();
    if (!user) return;

    this.loading.set(true);
    this.success.set(false);

    this.reservasApi.crearReservaCliente(user.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.form.reset({ numeroHuespedes: 1 });
      },
      error: () => this.loading.set(false),
    });
  }
}
