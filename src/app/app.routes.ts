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
import { DisponibilidadListComponent } from './features/servicios-disponibilidad/pages/disponibilidad-list/disponibilidad-list.component';
import { DisponibilidadFormComponent } from './features/servicios-disponibilidad/pages/disponibilidad-form/disponibilidad-form.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent, title: 'Aponia – Hotel & Experiencias' },
  { path: 'habitaciones-tipos', component: HabitacionTiposListComponent, title: 'Tipos de habitación – Aponia' },
  { path: 'habitaciones-tipos/nuevo', component: HabitacionTipoFormComponent, title: 'Nuevo tipo – Aponia' },
  { path: 'habitaciones-tipos/:id/editar', component: HabitacionTipoFormComponent, title: 'Editar tipo – Aponia' },
  { path: 'habitaciones', component: HabitacionesListComponent, title: 'Habitaciones – Aponia' },
  { path: 'habitaciones/nueva', component: HabitacionesFormComponent, title: 'Nueva habitación – Aponia' },
  { path: 'habitaciones/:id/editar', component: HabitacionesFormComponent, title: 'Editar habitación – Aponia' },
  // {
  //   path: 'login',
  //   loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginPageComponent),
  // },
  // {
  //   path: 'register',
  //   loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterPageComponent),
  // },
  { path: 'login', component: LoginPageComponent, title: 'Iniciar sesión – Aponia' },
  { path: 'register', component: RegisterPageComponent, title: 'Crear cuenta – Aponia' },
  { path: 'servicios', component: ServiciosListComponent, title: 'Servicios – Aponia' },
  { path: 'servicios/nuevo', component: ServiciosFormComponent, title: 'Nuevo servicio – Aponia' },
  { path: 'servicios/:id/editar', component: ServiciosFormComponent, title: 'Editar servicio – Aponia' },
  { path: 'disponibilidades', component: DisponibilidadListComponent, title: 'Disponibilidades – Aponia'},
  { path: 'disponibilidades/nueva', component: DisponibilidadFormComponent, title: 'Nueva disponibilidad – Aponia' },
  { path: 'disponibilidades/:id/editar', component: DisponibilidadFormComponent, title: 'Editar disponibilidad – Aponia' },
];
