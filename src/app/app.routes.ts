import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page';
import { HabitacionTiposListComponent } from './features/habitaciones-tipos/pages/tipos-list/tipos-list.component';
import { HabitacionTipoFormComponent } from './features/habitaciones-tipos/pages/tipos-form/tipos-form.component';
import { HabitacionesListComponent } from './features/habitaciones/pages/habitaciones-list/habitaciones-list.component';
import { HabitacionesFormComponent } from './features/habitaciones/pages/habitaciones-form/habitaciones-form.component';
import { LoginPageComponent } from './features/auth/pages/login/login.component';
import { RegisterPageComponent } from './features/auth/pages/register/register.component';
import { ServiciosFormComponent } from './features/servicios/pages/servicios-form/servicios-form.component';
import { ServiciosListComponent } from './features/servicios/pages/servicios-list/servicios-list.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { RegisterAdminComponent } from './features/auth/pages/register-admin/register-admin.component';
import { DashboardAdminComponent } from './features/dashboard-admin/pages/dashboard-admin/dashboard-admin.component';
import { HomeAdminComponent } from './features/dashboard-admin/components/home-admin/home-admin.component';
import { UsuariosListComponent } from './features/usuarios/pages/usuarios-list/usuarios-list.component';
import { UsuariosFormComponent } from './features/usuarios/pages/usuarios-form/usuarios-form.component';
import { ReservasListComponent } from './features/dashboard/pages/reservas-list/reservas-list.component';
import { ReservasFormComponent } from './features/dashboard/pages/reservas-form/reservas-form.component';
import { ClienteHomeComponent } from './features/dashboard/pages/cliente-home/cliente-home.component';
import { HabitacionesClienteListComponent } from './features/dashboard/pages/habitaciones-list/habitaciones-list.component';
import { HomeRecepcionista } from './features/dashboard-recepcionista/components/home-recepcionista/home-recepcionista';
import { ContratarService } from './features/dashboard-recepcionista/components/contratar-service/contratar-service';
import { DashboardRecepcionista } from './features/dashboard-recepcionista/dashboard-recepcionista';
import { PerfilComponent } from './features/dashboard/components/perfil/perfil';
import { GestionReservasComponent  } from './features/dashboard-recepcionista/components/gestion-reservas/gestion-reservas.component';
import { EditarReservaComponent } from './features/dashboard/pages/editar-reserva/editar-reserva.component';



export const routes: Routes = [
  { path: '', component: LandingPageComponent, title: 'Aponia – Hotel & Experiencias' },
  { path: 'login', component: LoginPageComponent, title: 'Iniciar sesión – Aponia' },
  { path: 'register', component: RegisterPageComponent, title: 'Crear cuenta – Aponia' },
  { path: 'register-admin', component: RegisterAdminComponent, title: 'Registrar admin – Aponia' },

  // Dashboard del cliente - CORREGIDO
  {
    path: 'dashboard', 
    component: DashboardComponent, 
    title: 'Dashboard – Aponia',
    children: [
      { path: '', component: ClienteHomeComponent },
      { path: 'reservas', component: ReservasListComponent },
      { path: 'reservas/editar/:id', component: EditarReservaComponent }, // ← MOVIDA AQUÍ
      { path: 'crear-reserva', component: ReservasFormComponent },
      { path: 'habitaciones', component: HabitacionesClienteListComponent },
      { path: 'perfil', component: PerfilComponent }
      // ← QUITA el dashboard anidado que está aquí
    ]
  },

  {
    path: 'dashboard-admin',
    component: DashboardAdminComponent,
    title: 'Dashboard admin – Aponia',
    children: [
      {path: '', component: HomeAdminComponent},
      { path: 'habitaciones-tipos', component: HabitacionTiposListComponent },
      { path: 'habitaciones-tipos/nuevo', component: HabitacionTipoFormComponent },
      { path: 'habitaciones-tipos/:id/editar', component: HabitacionTipoFormComponent },
      { path: 'habitaciones', component: HabitacionesListComponent },
      { path: 'habitaciones/nuevo', component: HabitacionesFormComponent },
      { path: 'habitaciones/:id/editar', component: HabitacionesFormComponent },
      { path: 'servicios', component: ServiciosListComponent },
      { path: 'servicios/nuevo', component: ServiciosFormComponent },
      { path: 'servicios/:id/editar', component: ServiciosFormComponent },
      { path: 'usuarios', component: UsuariosListComponent },
      { path: 'usuarios/nuevo', component: UsuariosFormComponent },
      { path: 'usuarios/:id/editar', component: UsuariosFormComponent },
      // { path: 'disponibilidad', component: DisponibilidadListComponent },
      // { path: 'disponibilidad/nueva', component: DisponibilidadFormComponent},
      // { path: 'disponibilidad/:id/editar', component: DisponibilidadFormComponent},
    ]
  },

  //Dashboard del admin
  // { path: 'habitaciones-tipos', component: HabitacionTiposListComponent, title: 'Tipos de habitación – Aponia' },
  // { path: 'habitaciones-tipos/nuevo', component: HabitacionTipoFormComponent, title: 'Nuevo tipo – Aponia' },
  // { path: 'habitaciones-tipos/:id/editar', component: HabitacionTipoFormComponent, title: 'Editar tipo – Aponia' },
  // { path: 'habitaciones', component: HabitacionesListComponent, title: 'Habitaciones – Aponia' },
  // { path: 'habitaciones/nueva', component: HabitacionesFormComponent, title: 'Nueva habitación – Aponia' },
  // { path: 'habitaciones/:id/editar', component: HabitacionesFormComponent, title: 'Editar habitación – Aponia' },
  // { path: 'servicios', component: ServiciosListComponent, title: 'Servicios – Aponia' },
  // { path: 'servicios/nuevo', component: ServiciosFormComponent, title: 'Nuevo servicio – Aponia' },
  // { path: 'servicios/:id/editar', component: ServiciosFormComponent, title: 'Editar servicio – Aponia' },
  // { path: 'disponibilidades', component: DisponibilidadListComponent, title: 'Disponibilidades – Aponia' },
  // { path: 'disponibilidades/nueva', component: DisponibilidadFormComponent, title: 'Nueva disponibilidad – Aponia' },
  // { path: 'disponibilidades/:id/editar', component: DisponibilidadFormComponent, title: 'Editar disponibilidad – Aponia' },
  
  {
  path: 'dashboard-recepcionista',
  component: DashboardRecepcionista,
  title: 'Dashboard recepcionista – Aponia',
  children: [
    {
      path: '',
      component: HomeRecepcionista
    },
    {
      path: 'contratar-servicio',
      component: ContratarService
    },
    { path: 'gestion-reservas', component: GestionReservasComponent }
  ]
}
];
