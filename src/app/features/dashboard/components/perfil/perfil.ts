import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { UsuariosService } from '../../../../core/services/usuarios/usuario.service';

interface ClientePerfil {
  nombreCompleto: string;
  telefono: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  // Señales de estado
  loading = signal(true);
  guardando = signal(false);
  modoEdicion = signal(false);
  usuario = signal<any>(null);

  // Formulario
  perfilForm: FormGroup;

  constructor() {
    this.perfilForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s-()]+$/)]]
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
  const user = this.auth.user();
  if (!user) {
    console.error('No hay usuario autenticado');
    this.loading.set(false);
    return;
  }

  console.log('🔍 Buscando usuario con ID:', user.id);

  this.usuariosService.getById(user.id).subscribe({
    next: (usuario: any) => {
      console.log('👤 Usuario completo recibido:', usuario);

      this.usuario.set(usuario);

      // ✅ Como no hay clientePerfil, usamos directamente las propiedades base
      const nombre = usuario.nombreCompleto || 'No especificado';
      const telefono = usuario.telefono || 'No especificado';

      this.perfilForm.patchValue({
        nombreCompleto: nombre,
        telefono: telefono
      });

      console.log('📝 Formulario cargado:', this.perfilForm.value);

      this.loading.set(false);
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('❌ Error al cargar usuario:', error);
      this.loading.set(false);
    }
  });
}

  activarEdicion() {
    this.modoEdicion.set(true);
  }

  cancelarEdicion() {
    this.modoEdicion.set(false);
    const usuario = this.usuario();
    if (usuario?.clientePerfil) {
      this.perfilForm.patchValue({
        nombreCompleto: usuario.clientePerfil.nombreCompleto,
        telefono: usuario.clientePerfil.telefono
      });
    }
  }

  guardarCambios() {
  if (this.perfilForm.invalid) {
    this.perfilForm.markAllAsTouched();
    return;
  }

  const user = this.auth.user();
  if (!user) return;

  this.guardando.set(true);

  const body: ClientePerfil = {
    nombreCompleto: this.perfilForm.value.nombreCompleto,
    telefono: this.perfilForm.value.telefono
  };

  this.usuariosService.upsertClientePerfil(user.id, body).subscribe({
    next: (perfilActualizado) => {
      console.log('✅ Perfil actualizado:', perfilActualizado);
      
      // 🔧 Actualizar usuario en la señal (sin clientePerfil)
      this.usuario.update(u => ({
        ...u,
        nombreCompleto: perfilActualizado.nombreCompleto,
        telefono: perfilActualizado.telefono
      }));

      // 🔧 Actualizar también el usuario global en AuthService
      this.auth.user.update(u => 
        u ? { ...u, nombreCompleto: perfilActualizado.nombreCompleto, telefono: perfilActualizado.telefono } : null
      );

      this.modoEdicion.set(false);
      this.guardando.set(false);
      alert('✅ Perfil actualizado correctamente');
      
      // 🔄 Forzar refresco visual (por si acaso)
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error al guardar:', error);
      alert('❌ Error al actualizar el perfil. Intente nuevamente.');
      this.guardando.set(false);
    }
  });
}



  // Helpers para validación
  get nombreInvalido() {
    const control = this.perfilForm.get('nombreCompleto');
    return control?.invalid && (control?.dirty || control?.touched);
  }

  get telefonoInvalido() {
    const control = this.perfilForm.get('telefono');
    return control?.invalid && (control?.dirty || control?.touched);
  }
}