import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private http = inject(HttpClient);
  private reservaServicioService = inject(ReservaServicioService);
  
  // Señales para manejo de estado
  buscandoHabitacion = signal(false);
  habitacionesEncontrada = signal<HabitacionConCliente | null>(null);
  habitacionEncontrada = signal<HabitacionConCliente | null>(null);
  servicios = signal<Servicio[]>([]);
  cargandoServicios = signal(false);
  contratando = signal(false);
  errorBusqueda = signal<string | null>(null);
  reservaSeleccionada = signal<any>(null);
  mostrarSelectorReservas = signal(false);
  
  // Señales para precios
  precioBaseReserva = signal<number>(0);
  totalFinal = signal<number>(0);
  nochesReserva = signal<number>(0);
  precioPorNoche = signal<number>(0);
  
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
      hora: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.cargarServicios();
    
    // ✅ ESCUCHAR cambios en el formulario para actualizar totales automáticamente
    this.contratoForm.valueChanges.subscribe(() => {
      this.actualizarTotalFinal();
    });
  }

  buscarHabitacion() {
    if (this.busquedaForm.invalid) return;
    
    this.buscandoHabitacion.set(true);
    this.errorBusqueda.set(null);
    this.habitacionEncontrada.set(null);
    
    const numeroHabitacion = this.busquedaForm.value.numeroHabitacion;
    
    console.log('🔍 Buscando habitación con:', numeroHabitacion);
    
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

  private validarYEstablecerHabitacion(habitacion: HabitacionConCliente) {
  console.log('📋 Validando habitación:', habitacion);
  
  // Siempre establecer la habitación encontrada
  this.habitacionEncontrada.set(habitacion);
  
  // Si hay múltiples reservas, mostrar selector (NO mostrar la card todavía)
  if (habitacion.reservas && habitacion.reservas.length > 1) {
    console.log('🔢 Múltiples reservas encontradas:', habitacion.reservas.length);
    this.mostrarSelectorReservas.set(true);
    this.reservaSeleccionada.set(null); // Limpiar reserva seleccionada
    return;
  }
  
  // Si solo hay una reserva, seleccionarla automáticamente
  if (habitacion.reservas && habitacion.reservas.length === 1) {
    this.seleccionarReserva(habitacion.reservas[0]);
    this.mostrarSelectorReservas.set(false);
  } else {
    this.errorBusqueda.set('La habitación no tiene reservas activas');
    this.habitacionEncontrada.set(null);
  }
}

seleccionarReserva(reserva: any) {
  this.reservaSeleccionada.set(reserva);
  this.obtenerDatosReserva(reserva);
  this.mostrarSelectorReservas.set(false);
  
  console.log('🎯 Reserva seleccionada:', reserva);
}

private obtenerDatosReserva(reservaSeleccionada: any) {    

    if (reservaSeleccionada) {
    const noches = this.calcularNoches(reservaSeleccionada.fechaInicio, reservaSeleccionada.fechaFin);
    const precioPorNoche = this.estimarPrecioPorNoche(this.habitacionEncontrada()?.tipoHabitacion?.nombre || '');      
    const precioBase = noches * precioPorNoche;
      
      this.precioBaseReserva.set(precioBase);
      this.nochesReserva.set(noches);
      this.precioPorNoche.set(precioPorNoche);
      this.actualizarTotalFinal(); // ✅ Actualizar el total
      
      console.log('💰 Precio base estimado:', {
        tipoHabitacion: this.habitacionEncontrada()?.tipoHabitacion?.nombre,
        noches: noches,
        precioPorNoche: precioPorNoche,
        totalBase: precioBase
      });
    } else {
      // Valores por defecto
      this.precioBaseReserva.set(450000);
      this.nochesReserva.set(3);
      this.precioPorNoche.set(150000);
      this.actualizarTotalFinal(); // ✅ Actualizar el total
    }
  }

  private estimarPrecioPorNoche(tipoHabitacion: string): number {
    const precios: { [key: string]: number } = {
      'Normal': 120000,
      'Normallll': 120000,
      'VIP': 250000,
      'Suite': 350000,
      'Presidencial': 500000
    };
    
    return precios[tipoHabitacion] || 150000;
  }

  // ✅ MÉTODO ACTUALIZADO - Ahora se llama automáticamente
  actualizarTotalFinal() {
    const precioServicio = this.calcularPrecioServicio();
    const total = this.precioBaseReserva() + precioServicio;
    this.totalFinal.set(total);
    
    console.log('🔄 Total actualizado:', {
      precioBase: this.precioBaseReserva(),
      precioServicio: precioServicio,
      total: total
    });
  }
  
  cargarServicios() {
    this.cargandoServicios.set(true);
    
    this.http.get<any[]>('http://localhost:8083/api/servicios').subscribe({
      next: (servicios) => {
        console.log('✅ Servicios reales cargados:', servicios);
        
        const serviciosMapeados: Servicio[] = servicios.map(servicio => ({
          id: servicio.id,
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          lugar: servicio.lugar,
          precioPorPersona: servicio.precioPorPersona,
          duracionMinutos: servicio.duracionMinutos,
          capacidadMaxima: servicio.capacidadMaxima,
          imagenUrl: servicio.imagenes && servicio.imagenes.length > 0 ? servicio.imagenes[0] : 'assets/img/default-service.jpg'
        }));
        
        this.servicios.set(serviciosMapeados);
        this.cargandoServicios.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar servicios:', error);
        this.cargandoServicios.set(false);
      }
    });
  }
  
  getServicioSeleccionado(): Servicio | undefined {
    const servicioId = this.contratoForm.value.servicioId;
    return this.servicios().find(s => s.id === servicioId);
  }
  
  contratarServicio() {
    console.log('🔍 DEBUG - reservaSeleccionada:', this.reservaSeleccionada());
    console.log('🔍 DEBUG - id de la reserva:', this.reservaSeleccionada()?.id);

    if (this.contratoForm.invalid || !this.reservaSeleccionada()) {
    alert('Por favor seleccione una reserva');
    return;
  }
    
    const servicio = this.getServicioSeleccionado();
    const reservaSeleccionada = this.reservaSeleccionada();   

    if (!servicio) {
      alert('Por favor seleccione un servicio');
      return;
    }

    // VERIFICAR que el ID esté disponible
  const reservaId = reservaSeleccionada.id;
  console.log('🔍 DEBUG - reservaId a enviar:', reservaId);
  
  if (!reservaId) {
    alert('Error: No se pudo obtener el ID de la reserva');
    return;
  }

    const cantidadPersonas = Number(this.contratoForm.value.cantidadPersonas) || 1;
    
    if (cantidadPersonas <= 0 || isNaN(cantidadPersonas)) {
      alert('La cantidad de personas debe ser un número positivo');
      return;
    }

    if (servicio.capacidadMaxima && cantidadPersonas > servicio.capacidadMaxima) {
      alert(`La capacidad máxima del servicio es ${servicio.capacidadMaxima} personas`);
      return;
    }

    if (!reservaSeleccionada) {
        alert('No hay una reserva seleccionada');
      return;
    }

    const confirmacion = confirm(
      `¿Confirmar contratación del servicio "${servicio.nombre}" para ${reservaSeleccionada.cliente.nombreCompleto}?\n\n` +
      `Precio del servicio: $${this.calcularPrecioServicio().toLocaleString('es-CO')}\n` +
      `Precio estadía: $${this.precioBaseReserva().toLocaleString('es-CO')}\n` +
      `Total final: $${this.totalFinal().toLocaleString('es-CO')}`
    );
    
    if (!confirmacion) return;
    
    this.contratando.set(true);

    const reservaServicioData: ReservaServicio = {
      reserva: {
        id: reservaSeleccionada.reservaId
      },
      servicio: {
        id: reservaId  
      },
      fecha: this.formatDate(this.contratoForm.value.fecha),
      horaInicio: this.formatTime(this.contratoForm.value.hora),
      numeroPersonas: cantidadPersonas,
      precioPorPersona: servicio.precioPorPersona, 
      totalServicio: this.calcularPrecioServicio(), 
      observaciones: this.contratoForm.value.observaciones
    };

    console.log('🔍 DEBUG - Llamando servicio con:', {
    reservaId: reservaId,
    servicioId: this.contratoForm.value.servicioId,
    data: reservaServicioData
  });

    // ✅ CORREGIDO: Pasar los tres argumentos requeridos
  // SOLUCIÓN: Usar HttpClient directamente
const params = new HttpParams()
  .set('reservaId', reservaId)
  .set('servicioId', this.contratoForm.value.servicioId);

this.http.post<void>(
  'http://localhost:8083/api/reservas-servicios/add',
  reservaServicioData,
  { params }
).subscribe({
  next: () => {
    alert('¡Servicio contratado exitosamente!\nEl cargo se agregó a la cuenta del cliente.');
    this.limpiarFormularios();
  },
  error: (error: any) => {
    console.error('Error al contratar servicio:', error);
    const mensaje = error.error?.error || 'Error al contratar el servicio. Por favor intente nuevamente.';
    alert(`Error: ${mensaje}`);
    this.contratando.set(false);
  }
});
}

  // Métodos de cálculo
  calcularNoches(entrada: string, salida: string): number {
    if (!entrada || !salida) return 0;
    
    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);
    const diffTime = Math.abs(fechaSalida.getTime() - fechaEntrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calcularPrecioServicio(): number {
    const servicio = this.getServicioSeleccionado();
    const cantidadPersonas = this.contratoForm.value.cantidadPersonas || 1;
    return servicio ? servicio.precioPorPersona * cantidadPersonas : 0;
  }

  // Resto de métodos auxiliares
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTime(timeString: string): string {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length === 2) {
        return timeString + ':00';
      }
    }
    return timeString;
  }

  private limpiarFormularios() {
    this.contratoForm.reset({ cantidadPersonas: 1 });
    this.busquedaForm.reset();
    this.habitacionEncontrada.set(null);
    this.errorBusqueda.set(null);
    this.contratando.set(false);
    this.precioBaseReserva.set(0);
    this.totalFinal.set(0);
    this.nochesReserva.set(0);
    this.precioPorNoche.set(0);
  }
  
  cancelar() {
    this.limpiarFormularios();
  }

  // Getters para el template
  get informacionReserva() {
    const habitacion = this.habitacionEncontrada();
    const reservas = habitacion?.reservas as any;
    
    return {
      fechaInicio: reservas?.fechaInicio,
      fechaFin: reservas?.fechaFin,
      estado: reservas?.estado || 'ACTIVA'
    };
  }

  get clienteActual() {
    const habitacion = this.habitacionEncontrada();
    const reservas = habitacion?.reservas as any;
    return reservas?.cliente;
  }

  get informacionHabitacion() {
    const habitacion = this.habitacionEncontrada();
    return {
      numero: habitacion?.numeroHabitacion,
      tipo: habitacion?.tipoHabitacion?.nombre,
      estado: habitacion?.activa ? 'Activa' : 'Inactiva'
    };
  }

  private manejarErrorBusqueda(error: any) {
    console.error('❌ Error detallado:', error);

    if (error.status === 404) {
      this.errorBusqueda.set('No se encontró la habitación');
    } else if (error.status === 400) {
      this.errorBusqueda.set('Número de habitación inválido');
    } else if (error.status === 500) {
      this.errorBusqueda.set('Error del servidor. Por favor intente más tarde');
    } else {
      this.errorBusqueda.set('Error al buscar la habitación. Verifique el número e intente nuevamente');
    }
  }
}