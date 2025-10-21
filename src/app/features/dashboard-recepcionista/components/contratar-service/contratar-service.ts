import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservaServicioService, HabitacionConCliente, ReservaServicio } from '../../../../core/services/contrato-servicio/contrato-servicio.service';
import { tap, catchError } from 'rxjs/operators'; 
import { of } from 'rxjs';
import { Observable } from 'rxjs';


interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  lugar: string;
  precioPorPersona: number;
  duracionMinutos: number;
  capacidadMaxima: number;
  imagenUrl: string;
}

@Component({
  selector: 'app-contratar-servicio',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contratar-service.html',
  styleUrl: './contratar-service.scss'
})
export class ContratarService implements OnInit {
  private fb = inject(FormBuilder);
  private reservaServicioService = inject(ReservaServicioService);
  
  // Señales para manejo de estado
  buscandoHabitacion = signal(false);
  habitacionEncontrada = signal<HabitacionConCliente | null>(null);
  servicios = signal<Servicio[]>([]);
  cargandoServicios = signal(false);
  contratando = signal(false);
  errorBusqueda = signal<string | null>(null);
  
  // Formularios
  busquedaForm: FormGroup;
  contratoForm: FormGroup;
  
  constructor() {
    // Formulario para buscar habitación
    this.busquedaForm = this.fb.group({
      numeroHabitacion: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
    
    // Formulario para contratar servicio
    this.contratoForm = this.fb.group({
      servicioId: ['', Validators.required],
      cantidadPersonas: [1, [Validators.required, Validators.min(1)]],
      fecha: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.cargarServicios();
  }

  buscarHabitacion() {
    if (this.busquedaForm.invalid) return;
    
    this.buscandoHabitacion.set(true);
    this.errorBusqueda.set(null);
    this.habitacionEncontrada.set(null);
    
    const numeroHabitacion = this.busquedaForm.value.numeroHabitacion;
    
    console.log('🔍 Buscando habitación con:', numeroHabitacion);
    
    // ✅ LLAMAR AL MÉTODO DEL SERVICIO (no implementarlo aquí)
    this.reservaServicioService.buscarHabitacionConCliente(numeroHabitacion).subscribe({
      next: (habitacion) => {
        console.log('✅ Respuesta completa del servicio:', habitacion);
        this.validarYEstablecerHabitacion(habitacion);
        this.buscandoHabitacion.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error en la búsqueda:', error);
        this.manejarErrorBusqueda(error);
        this.buscandoHabitacion.set(false);
      }
    });
  }

  // En contratar-service.ts - modifica el método validarYEstablecerHabitacion
private validarYEstablecerHabitacion(habitacion: HabitacionConCliente) {
  console.log('📋 Validando habitación:', habitacion);
  
  // ✅ Solo aceptar si hay datos REALES del backend
  if (!habitacion.reservaActual) {
    console.log('⚠️ Habitación sin reserva activa en el sistema');
    this.errorBusqueda.set('La habitación no tiene una reserva activa asignada en el sistema');
    return;
  }

  // Verificación de seguridad
  const reservaActual = habitacion.reservaActual;
  if (!reservaActual.cliente) {
    console.error('❌ Error: Reserva sin datos de cliente');
    this.errorBusqueda.set('La reserva no tiene información del cliente');
    return;
  }

  console.log('🎯 Habitación válida encontrada:', {
    numero: habitacion.numeroHabitacion,
    cliente: reservaActual.cliente.nombreCompleto,
    reservaId: reservaActual.id
  });

  this.habitacionEncontrada.set(habitacion);
  this.errorBusqueda.set(null);
}

private generarReservaSimulada(numeroHabitacion: string): any {
  return {
    id: `res_sim_${numeroHabitacion}`,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'CONFIRMADA',
    cliente: {
      id: 'cli_sim',
      nombreCompleto: 'Cliente Simulado',
      email: 'cliente@simulado.com',
      telefono: '3000000000',
      documento: '9999999999'
    }
  };
}


  private manejarErrorBusqueda(error: any) {
  console.error('❌ Error detallado:', error);

  if (error.status === 404) {
    this.errorBusqueda.set('No se encontró la habitación');
  } else if (error.status === 400) {
    this.errorBusqueda.set('Número de habitación inválido');
  } else {
    this.errorBusqueda.set('Error al buscar la habitación. Verifique el número e intente nuevamente');
  }
}
  
  // Cargar servicios disponibles
  cargarServicios() {
    this.cargandoServicios.set(true);
    
    // TODO: Cuando tengas el ServicioService, usa esto:
    // this.servicioService.obtenerActivos().subscribe({
    //   next: (servicios) => {
    //     this.servicios.set(servicios);
    //     this.cargandoServicios.set(false);
    //   },
    //   error: (error) => {
    //     console.error('Error al cargar servicios:', error);
    //     this.cargandoServicios.set(false);
    //   }
    // });
    
    // TEMPORAL: Datos mock (eliminar cuando tengas el servicio real)
    setTimeout(() => {
      const serviciosMock: Servicio[] = [
        {
          id: '1',
          nombre: 'Spa y Masajes',
          descripcion: 'Relájate con nuestros tratamientos de spa premium',
          lugar: 'Piso 3 - Zona Wellness',
          precioPorPersona: 150000,
          duracionMinutos: 60,
          capacidadMaxima: 2,
          imagenUrl: 'assets/img/spa.jpg'
        },
        {
          id: '2',
          nombre: 'Restaurante Gourmet',
          descripcion: 'Cena de 3 tiempos con maridaje de vinos',
          lugar: 'Piso 1 - Restaurante Principal',
          precioPorPersona: 120000,
          duracionMinutos: 120,
          capacidadMaxima: 4,
          imagenUrl: 'assets/img/restaurant.jpg'
        },
        {
          id: '3',
          nombre: 'Tour Ciudad',
          descripcion: 'Recorrido guiado por los principales atractivos',
          lugar: 'Salida desde lobby',
          precioPorPersona: 80000,
          duracionMinutos: 180,
          capacidadMaxima: 10,
          imagenUrl: 'assets/img/tour.jpg'
        }
      ];
      
      this.servicios.set(serviciosMock);
      this.cargandoServicios.set(false);
    }, 500);
  }
  
  // Obtener servicio seleccionado
  getServicioSeleccionado(): Servicio | undefined {
    const servicioId = this.contratoForm.value.servicioId;
    return this.servicios().find(s => s.id === servicioId);
  }
  
  // Calcular total
  calcularTotal(): number {
    const servicio = this.getServicioSeleccionado();
    const cantidadPersonas = this.contratoForm.value.cantidadPersonas || 1;
    return servicio ? servicio.precioPorPersona * cantidadPersonas : 0;
  }
  
  // Contratar servicio usando el servicio real
  contratarServicio() {
    if (this.contratoForm.invalid || !this.habitacionEncontrada()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    const servicio = this.getServicioSeleccionado();
    const habitacion = this.habitacionEncontrada();
    
    if (!servicio || !habitacion) {
      alert('Por favor seleccione un servicio');
      return;
    }

    // Verificar que la habitación tenga una reserva activa
    if (!habitacion.reservaActual) {
      alert('La habitación no tiene una reserva activa');
      return;
    }
    
    // Validar capacidad
    const cantidadPersonas = this.contratoForm.value.cantidadPersonas;
    if (servicio.capacidadMaxima && cantidadPersonas > servicio.capacidadMaxima) {
      alert(`La capacidad máxima del servicio es ${servicio.capacidadMaxima} personas`);
      return;
    }

    // Validar fecha del servicio
    const fechaServicio = new Date(this.contratoForm.value.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaServicio < hoy) {
      alert('La fecha del servicio no puede ser anterior a hoy');
      return;
    }

    // Validar que la fecha del servicio esté dentro del rango de la reserva
    const fechaInicioReserva = new Date(habitacion.reservaActual.fechaInicio);
    const fechaFinReserva = new Date(habitacion.reservaActual.fechaFin);
    
    if (fechaServicio < fechaInicioReserva || fechaServicio > fechaFinReserva) {
      alert(`La fecha del servicio debe estar entre ${fechaInicioReserva.toLocaleDateString()} y ${fechaFinReserva.toLocaleDateString()}`);
      return;
    }
    
    const confirmacion = confirm(
      `¿Confirmar contratación del servicio "${servicio.nombre}" para ${habitacion.reservaActual.cliente.nombreCompleto}?\n\n` +
      `Total: $${this.calcularTotal().toLocaleString('es-CO')}`
    );
    
    if (!confirmacion) return;
    
    this.contratando.set(true);

    // Preparar los datos según la interfaz del servicio
    // Preparar los datos según la interfaz del servicio
const reservaServicioData: ReservaServicio = {
  reserva: {
    id: habitacion.reservaActual.id
  },
  servicio: {
    id: this.contratoForm.value.servicioId
  },
  fecha: this.formatDate(this.contratoForm.value.fecha),
  cantidadPersonas: this.contratoForm.value.cantidadPersonas,
  observaciones: this.contratoForm.value.observaciones,
  subtotal: this.calcularTotal(),
  estado: 'CONFIRMADA' 
};

    const reservaId = habitacion.reservaActual.id;
    const servicioId = this.contratoForm.value.servicioId;
    
    this.reservaServicioService.crear(reservaServicioData, reservaId, servicioId).subscribe({
      next: () => {
        alert('¡Servicio contratado exitosamente!\nEl cargo se agregó a la cuenta del cliente.');
        this.limpiarFormularios();
      },
      error: (error: any) => {
        console.error('Error al contratar servicio:', error);
        const mensaje = error.error?.message || 'Error al contratar el servicio. Por favor intente nuevamente.';
        alert(`Error: ${mensaje}`);
        this.contratando.set(false);
      }
    });
  }

  // Formatear fecha a YYYY-MM-DD
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private limpiarFormularios() {
    this.contratoForm.reset({ cantidadPersonas: 1 });
    this.busquedaForm.reset();
    this.habitacionEncontrada.set(null);
    this.errorBusqueda.set(null);
    this.contratando.set(false);
  }
  
  // Cancelar y limpiar
  cancelar() {
    this.limpiarFormularios();
  }

  // Getter para información de la reserva
get informacionReserva() {
  const habitacion = this.habitacionEncontrada();
  const reservaActual = habitacion?.reservaActual as any;
  
  return {
    fechaInicio: reservaActual?.fechaInicio,
    fechaFin: reservaActual?.fechaFin,
    estado: reservaActual?.estado || 'ACTIVA' // Valor por defecto
  };
}

// También actualiza el getter del cliente para ser más seguro
get clienteActual() {
  const habitacion = this.habitacionEncontrada();
  const reservaActual = habitacion?.reservaActual as any;
  return reservaActual?.cliente;
}

// Getter para información de la habitación
get informacionHabitacion() {
  const habitacion = this.habitacionEncontrada();
  return {
    numero: habitacion?.numeroHabitacion,
    tipo: habitacion?.tipoHabitacion?.nombre,
    estado: habitacion?.activa ? 'Activa' : 'Inactiva'
  };
}
}