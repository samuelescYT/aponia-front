// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-register-admin',
//   imports: [],
//   templateUrl: './register-admin.component.html',
//   styleUrl: './register-admin.component.scss'
// })
// export class RegisterAdminComponent {

// }


import { AuthService } from './../../../../core/auth/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-admin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-screen text-slate-800 select-none' },
  styleUrl: './register-admin.component.scss'
})
export class RegisterAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    nombreCompleto: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['', Validators.required],
  });

  readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    const { nombreCompleto, email, telefono, password } = this.form.getRawValue();
    const ok = await this.auth.registerAdmin(nombreCompleto, email, telefono, password);
    if (ok) {
      this.router.navigateByUrl('/dashboard-admin');
      return;
    }
    this.error.set('No se pudo registrar. Intenta de nuevo.');
  }
}
