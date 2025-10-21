import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  private http = inject(HttpClient); // ← INYECTAR HttpClient
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
      hora: ['', Validators.required],
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
// Cuando se encuentra una habitación, obtener el precio base de la reserva
private validarYEstablecerHabitacion(habitacion: HabitacionConCliente) {
  console.log('📋 Validando habitación:', habitacion);
  
  if (!habitacion.reservaActual) {
    console.log('⚠️ Habitación sin reserva activa');
    this.errorBusqueda.set('La habitación no tiene una reserva activa asignada');
    return;
  }

  // Obtener los datos de la reserva usando la información que ya tenemos
  this.obtenerDatosReserva(habitacion);

  console.log('🎯 Habitación válida encontrada:', {
    numero: habitacion.numeroHabitacion,
    cliente: habitacion.reservaActual.cliente.nombreCompleto,
    reservaId: habitacion.reservaActual.id
  });

  this.habitacionEncontrada.set(habitacion);
  this.errorBusqueda.set(null);
}

private obtenerDatosReserva(habitacion: HabitacionConCliente) {
  // Usar los datos que ya tenemos de la habitación
  const reservaActual = habitacion.reservaActual;
  
  if (reservaActual) {
    // Si tenemos fechas en reservaActual, calcular con eso
    const noches = this.calcularNoches(reservaActual.fechaInicio, reservaActual.fechaFin);
    
    // TEMPORAL: Usar un precio por noche fijo o calcularlo
    // En una implementación real, esto vendría del backend
    const precioPorNoche = this.estimarPrecioPorNoche(habitacion.tipoHabitacion.nombre);
    
    const precioBase = noches * precioPorNoche;
    this.precioBaseReserva.set(precioBase);
    this.nochesReserva.set(noches);
    this.precioPorNoche.set(precioPorNoche);
    this.actualizarTotalFinal();
    
    console.log('💰 Precio base estimado:', {
      tipoHabitacion: habitacion.tipoHabitacion.nombre,
      noches: noches,
      precioPorNoche: precioPorNoche,
      totalBase: precioBase
    });
  } else {
    // Valores por defecto
    this.precioBaseReserva.set(450000);
    this.nochesReserva.set(3);
    this.precioPorNoche.set(150000);
    this.actualizarTotalFinal();
  }
}

private estimarPrecioPorNoche(tipoHabitacion: string): number {
  // Precios estimados por tipo de habitación
  const precios: { [key: string]: number } = {
    'Normal': 120000,
    'Normallll': 120000,
    'VIP': 250000,
    'Suite': 350000,
    'Presidencial': 500000
  };
  
  return precios[tipoHabitacion] || 150000;
}



private actualizarTotalFinal() {
  this.totalFinal.set(this.calcularTotalFinal());
}
  
  // Cargar servicios disponibles
cargarServicios() {
  this.cargandoServicios.set(true);
  
  // ✅ Cargar servicios reales del endpoint que SÍ existe
  this.http.get<any[]>('http://localhost:8083/api/servicios').subscribe({
    next: (servicios) => {
      console.log('✅ Servicios reales cargados:', servicios);
      
      // Mapear la respuesta del backend a nuestra interfaz
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
  
  // Obtener servicio seleccionado
  getServicioSeleccionado(): Servicio | undefined {
    const servicioId = this.contratoForm.value.servicioId;
    return this.servicios().find(s => s.id === servicioId);
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

  // ✅ PASO 4: Validaciones antes de enviar
const cantidadPersonas = Number(this.contratoForm.value.cantidadPersonas) || 1;
  // Validar que sea un número positivo
  if (cantidadPersonas <= 0 || isNaN(cantidadPersonas)) {
    alert('La cantidad de personas debe ser un número positivo');
    return;
  }

  // Validar capacidad máxima del servicio
  if (servicio.capacidadMaxima && cantidadPersonas > servicio.capacidadMaxima) {
    alert(`La capacidad máxima del servicio es ${servicio.capacidadMaxima} personas`);
    return;
  }

  // Verificar que la habitación tenga una reserva activa
  if (!habitacion.reservaActual) {
    alert('La habitación no tiene una reserva activa');
    return;
  }

  const confirmacion = confirm(
    `¿Confirmar contratación del servicio "${servicio.nombre}" para ${habitacion.reservaActual.cliente.nombreCompleto}?\n\n` +
    `Precio del servicio: $${this.calcularPrecioServicio().toLocaleString('es-CO')}\n` +
    `Total final: $${this.totalFinal().toLocaleString('es-CO')}`
  );
  
  if (!confirmacion) return;
  
  this.contratando.set(true);

  // Preparar los datos según la interfaz del servicio
  const reservaServicioData: ReservaServicio = {
  reserva: {
    id: habitacion.reservaActual.id
  },
  servicio: {
    id: this.contratoForm.value.servicioId
  },
  fecha: this.formatDate(this.contratoForm.value.fecha),
  horaInicio: this.formatTime(this.contratoForm.value.hora),
  numeroPersonas: cantidadPersonas,
  precioPorPersona: servicio.precioPorPersona, 
  totalServicio: this.calcularPrecioServicio(), 
  observaciones: this.contratoForm.value.observaciones
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
      const mensaje = error.error?.error || 'Error al contratar el servicio. Por favor intente nuevamente.';
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

// Método para formatear hora
private formatTime(timeString: string): string {
  if (!timeString) return '';
  
  // Si ya tiene segundos, devolver tal cual
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      return timeString + ':00'; // Agregar segundos si faltan
    }
  }
  return timeString;
}

// En contratar-service.ts
precioBaseReserva = signal<number>(0);
totalFinal = signal<number>(0);
nochesReserva = signal<number>(0);
precioPorNoche = signal<number>(0);

// Calcular número de noches (similar a tu otro componente)
calcularNoches(entrada: string, salida: string): number {
  if (!entrada || !salida) return 0;
  
  const fechaEntrada = new Date(entrada);
  const fechaSalida = new Date(salida);
  const diffTime = Math.abs(fechaSalida.getTime() - fechaEntrada.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calcular precio base de la reserva
calcularPrecioBaseReserva(reserva: any): number {
  const estancia = reserva.estancias?.[0];
  if (!estancia?.precioPorNoche) return 0;
  
  const noches = this.calcularNoches(estancia.entrada, estancia.salida);
  this.nochesReserva.set(noches);
  this.precioPorNoche.set(estancia.precioPorNoche);
  
  return estancia.precioPorNoche * noches;
}

// Calcular solo el precio del servicio
calcularPrecioServicio(): number {
  const servicio = this.getServicioSeleccionado();
  const cantidadPersonas = this.contratoForm.value.cantidadPersonas || 1;
  return servicio ? servicio.precioPorPersona * cantidadPersonas : 0;
}

// Calcular total final (reserva + servicio)
calcularTotalFinal(): number {
  const precioServicio = this.calcularPrecioServicio();
  return this.precioBaseReserva() + precioServicio;
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