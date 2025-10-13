import { AuthService } from './../../../../core/auth/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-screen text-slate-800 select-none' },
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly error = signal<string | null>(null);
  readonly canSubmit = computed(() => this.form.valid);

  async onSubmit(): Promise<void> {
    const { email, password } = this.form.getRawValue();
    const ok = await this.auth.login(email, password);
    if (ok) {
      if(this.auth.role() === 'CLIENTE') {
        this.router.navigateByUrl('/dashboard');
      }

      if(this.auth.role() === 'ADMIN') {
       this.router.navigateByUrl('/dashboard-admin');
      }

      if(this.auth.role() === 'RECEPCIONISTA') {
        console.log("redirigir a panel de recepcionista");
      }
      return;
    }
    this.error.set('Credenciales inválidas');
  }
}
