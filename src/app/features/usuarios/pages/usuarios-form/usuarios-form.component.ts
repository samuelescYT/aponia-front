// src/app/features/usuarios/containers/usuarios-form/usuarios-form.component.ts
import { UsuariosService } from './../../../../core/services/usuarios/usuario.service';
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, of } from 'rxjs';

type Rol = 'ADMIN' | 'CLIENTE' | 'STAFF' | 'RECEPCIONISTA';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuarios-form.component.html',
})
export class UsuariosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(UsuariosService);

  isEdit = false;
  id: string | null = null;
  saving = false;
  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],                                         // en edición, opcional
    rol: <Rol>'CLIENTE',

    // 👇 SIEMPRE visibles (cualquiera sea el rol)
    nombreCompleto: ['', [Validators.maxLength(150)]],
    telefono: [''],

    // 👇 Extras de empleado (visibles para STAFF/RECEPCIONISTA/ADMIN)
    cargo: [''],
    salario: <number | null>null,
    fechaContratacion: [''], // YYYY-MM-DD
  });

  // Para mostrar los campos extra de empleado
  showEmpleadoExtras = computed(() => {
    const r = this.form.get('rol')?.value as Rol;
    return r === 'STAFF' || r === 'RECEPCIONISTA' || r === 'ADMIN';
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loading = true;
      this.service.getById(this.id).subscribe({
        next: (u: any) => {
          // UsuarioDTO esperado (ejemplo):
          // { id, email, rol, nombreCompleto, telefono, cargo, salario, fechaContratacion }
          this.form.patchValue({
            email: u.email ?? '',
            password: '',
            rol: (u.rol ?? 'CLIENTE') as Rol,
            nombreCompleto: u.nombreCompleto ?? '',
            telefono: u.telefono ?? '',
            cargo: u.cargo ?? '',
            salario: u.salario ?? null,
            fechaContratacion: u.fechaContratacion ?? '',
          });
        },
        error: (e) => console.error('Error obteniendo usuario', e),
        complete: () => (this.loading = false),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const rol = v.rol as Rol;

    // --- Payload base (para /add y /update) ---
    const base: any = {
      email: v.email,
      password: v.password, // si está vacío en update, backend lo ignora (bien)
      rol,
    };

    // --- CREATE ---
    if (!this.isEdit) {
      // En create, el backend SÍ acepta perfiles anidados dentro del request
      if (rol === 'CLIENTE') {
        base.clientePerfil = {
          nombreCompleto: v.nombreCompleto?.trim() || '',
          telefono: v.telefono?.trim() || '',
        };
      } else {
        base.empleadoPerfil = {
          nombreCompleto: v.nombreCompleto?.trim() || '',
          telefono: v.telefono?.trim() || '',
          cargo: v.cargo?.trim() || rol,
          salario: v.salario ?? 0,
          fechaContratacion: v.fechaContratacion || new Date().toISOString().split('T')[0],
        };
      }

      this.saving = true;
      this.service.create(base).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard-admin/usuarios']);
        },
        error: (err) => {
          console.error('Error creando usuario', err);
          this.saving = false;
          alert('No se pudo crear el usuario.');
        },
      });
      return;
    }

    // --- UPDATE (email/rol/password) + upsert de perfil ---
    if (this.isEdit && this.id) {
      this.saving = true;

      this.service.update(this.id, base).pipe(
        switchMap(() => {
          if (rol === 'CLIENTE') {
            return this.service.upsertClientePerfil(this.id!, {
              nombreCompleto: v.nombreCompleto?.trim() || '',
              telefono: v.telefono?.trim() || '',
            });
          } else {
            return this.service.upsertEmpleadoPerfil(this.id!, {
              nombreCompleto: v.nombreCompleto?.trim() || '',
              telefono: v.telefono?.trim() || '',
              cargo: v.cargo?.trim() || rol,
              salario: v.salario ?? 0,
              fechaContratacion: v.fechaContratacion || new Date().toISOString().split('T')[0],
            });
          }
        })
      ).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard-admin/usuarios']);
        },
        error: (err) => {
          console.error('Error actualizando usuario/perfil', err);
          this.saving = false;
          alert('No se pudo actualizar el usuario.');
        },
      });
    }
  }
}
