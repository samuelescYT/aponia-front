import { AuthService } from './../../../../core/auth/auth.service';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-cliente',
  imports: [CommonModule, RouterLink],
  templateUrl: './header-cliente.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sticky top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 select-none' },
})
export class HeaderClienteComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Estado local para el menú desplegable
  menuOpen = signal(false);

  // Datos del usuario actual
  user = computed(() => this.auth.user());
  initial = computed(() => this.user()?.nombreCompleto?.charAt(0)?.toUpperCase() ?? this.user()?.email?.charAt(0)?.toUpperCase() ?? '?');

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
