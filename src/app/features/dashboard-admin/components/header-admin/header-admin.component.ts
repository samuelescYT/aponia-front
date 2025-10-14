import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { leftSidebarService } from '../../../../core/services/left-sideBar.service';

@Component({
  selector: 'app-header-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss',
  host: {class: 'sticky top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 select-none'}
})
export class HeaderAdminComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sideBar = inject(leftSidebarService)


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
    await this.router.navigateByUrl('/');
  }
}
