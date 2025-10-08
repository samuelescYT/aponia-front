import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page';
import { HabitacionTiposListComponent } from './features/habitaciones-tipos/pages/tipos-list/tipos-list.component';
import { HabitacionTipoFormComponent } from './features/habitaciones-tipos/pages/tipos-form/tipos-form.component';
import { LoginPageComponent } from './features/auth/pages/login/login.component';
import { RegisterPageComponent } from './features/auth/pages/register/register.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent, title: 'Aponia – Hotel & Experiencias' },
  { path: 'habitaciones-tipos', component: HabitacionTiposListComponent, title: 'Tipos de habitación – Aponia' },
  { path: 'habitaciones-tipos/nuevo', component: HabitacionTipoFormComponent, title: 'Nuevo tipo – Aponia' },
  { path: 'habitaciones-tipos/:id/editar', component: HabitacionTipoFormComponent, title: 'Editar tipo – Aponia' },
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
];
