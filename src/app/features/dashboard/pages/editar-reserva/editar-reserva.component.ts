import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ReservasApiService } from '../../../../core/services/reservas/reserva-api.service';
import { HabitacionTipoService } from '../../../../core/services/habitaciones-tipos/habitaciones-tipos.service';
import { HabitacionTipo } from '../../../../shared/models/habitacion-tipo.model';

interface TipoHabitacion {
  id: string;
  nombre: string;
  precioMinimo: number;
  capacidadMaxima: number;
}

@Component({
  selector: 'app-editar-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-reserva.component.html',
  styleUrl: './editar-reserva.component.scss'
})
export class EditarReservaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private reservasApi = inject(ReservasApiService);
  private habitacionTipoService = inject(HabitacionTipoService);

  // Señales
  loading = signal(true);
  guardando = signal(false);
  reserva = signal<any>(null);
  tiposHabitacion = signal<TipoHabitacion[]>([]);
  
  // Formulario
  reservaForm: FormGroup;
  reservaId: string = '';

  constructor() {
    this.reservaForm = this.fb.group({
      tipoHabitacionId: ['', Validators.required],
      entrada: ['', Validators.required],
      salida: ['', Validators.required],
      numeroHuespedes: [1, [Validators.required, Validators.min(1)]],
      notas: ['']
    });
  }

  ngOnInit() {
    this.reservaId = this.route.snapshot.params['id'];
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar tipos de habitación disponibles
    this.cargarTiposHabitacion();
  }

  cargarTiposHabitacion() {
  this.habitacionTipoService.listActivos().subscribe({
    next: (tipos: HabitacionTipo[]) => {
      // Mapear HabitacionTipo a TipoHabitacion para el formulario
      const tiposMapeados: TipoHabitacion[] = tipos.map(tipo => ({
        id: tipo.id,
        nombre: tipo.nombre,
        precioMinimo: tipo.precioPorNoche, // Cambiado de precioBase a precioPorNoche
        capacidadMaxima: tipo.aforoMaximo  // Cambiado de capacidadMaxima a aforoMaximo
      }));
      
      this.tiposHabitacion.set(tiposMapeados);
      
      // Una vez cargados los tipos, cargar la reserva
      this.cargarReserva();
    },
    error: (error) => {
      console.error('Error al cargar tipos de habitación:', error);
      alert('Error al cargar los tipos de habitación');
      this.loading.set(false);
    }
  });
}

  cargarReserva() {
    this.reservasApi.getReservasByCliente(this.auth.user()!.id).subscribe({
      next: (reservas) => {
        const reservaActual = reservas.find(r => r.id === this.reservaId);
        
        if (!reservaActual) {
          alert('Reserva no encontrada');
          this.router.navigate(['/dashboard/reservas']);
          return;
        }

        if (reservaActual.estado !== 'CONFIRMADA') {
          alert('Solo se pueden editar reservas confirmadas');
          this.router.navigate(['/dashboard/reservas']);
          return;
        }

        this.reserva.set(reservaActual);

        // Cargar datos en el formulario
        const estancia = reservaActual.estancias?.[0];
        if (estancia) {
          this.reservaForm.patchValue({
            tipoHabitacionId: estancia.tipoHabitacion?.id || '',
            entrada: this.formatearFecha(estancia.entrada),
            salida: this.formatearFecha(estancia.salida),
            numeroHuespedes: estancia.numeroHuespedes,
            notas: reservaActual.notas || ''
          });
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reserva:', error);
        alert('Error al cargar la reserva');
        this.router.navigate(['/dashboard/reservas']);
      }
    });
  }

  // Helper para formatear fechas para el input date
  private formatearFecha(fecha: string | Date): string {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  guardarCambios() {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const user = this.auth.user();
    if (!user) return;

    this.guardando.set(true);

    const request = {
      tipoHabitacionId: this.reservaForm.value.tipoHabitacionId,
      entrada: this.reservaForm.value.entrada,
      salida: this.reservaForm.value.salida,
      numeroHuespedes: this.reservaForm.value.numeroHuespedes,
      notas: this.reservaForm.value.notas || ''
    };

    this.reservasApi.actualizarReserva(user.id, this.reservaId, request).subscribe({
      next: () => {
        alert('✅ Reserva actualizada correctamente');
        this.router.navigate(['/dashboard/reservas']);
      },
      error: (error) => {
        console.error('Error:', error);
        const mensaje = error.error?.error || 'Error al actualizar la reserva';
        alert(`❌ ${mensaje}`);
        this.guardando.set(false);
      }
    });
  }

  cancelar() {
    if (confirm('¿Descartar los cambios?')) {
      this.router.navigate(['/dashboard/reservas']);
    }
  }

  // Calcular número de noches
  calcularNoches(): number {
    const entrada = this.reservaForm.value.entrada;
    const salida = this.reservaForm.value.salida;
    
    if (!entrada || !salida) return 0;
    
    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);
    const diffTime = Math.abs(fechaSalida.getTime() - fechaEntrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calcular total estimado
  calcularTotal(): number {
    const tipoHabitacionId = this.reservaForm.value.tipoHabitacionId;
    if (!tipoHabitacionId) return 0;

    const tipoSeleccionado = this.tiposHabitacion().find(tipo => tipo.id === tipoHabitacionId);
    if (!tipoSeleccionado) return 0;

    const noches = this.calcularNoches();
    return tipoSeleccionado.precioMinimo * noches;
  }

  // Método adicional para mostrar el nombre del tipo de habitación actual
  getTipoHabitacionActual(): string {
    const tipoHabitacionId = this.reservaForm.value.tipoHabitacionId;
    const tipo = this.tiposHabitacion().find(t => t.id === tipoHabitacionId);
    return tipo ? tipo.nombre : 'No seleccionado';
  }
}