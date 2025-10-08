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
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-screen text-slate-800 select-none' },
})
export class RegisterPageComponent {
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
    const ok = await this.auth.register(nombreCompleto, email, telefono, password);
    if (ok) {
      this.router.navigateByUrl('/');
      return;
    }
    this.error.set('No se pudo registrar. Intenta de nuevo.');
  }
}
