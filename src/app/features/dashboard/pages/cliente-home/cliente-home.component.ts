import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ServiciosService } from '../../../../core/services/servicios/servicios.service';
import { Servicio } from '../../../../shared/models/servicio.model';

@Component({
  selector: 'app-cliente-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cliente-home.component.html',
})
export class ClienteHomeComponent implements OnInit {
 auth = inject(AuthService);
  private readonly serviciosService = inject(ServiciosService);

  user = this.auth.user();
  servicios = signal<Servicio[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.serviciosService.listAll().subscribe({
      next: (data) => {
        this.servicios.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
