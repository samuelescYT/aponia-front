import { UsuariosService } from './../../../../core/services/usuarios/usuario.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../../../shared/models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios-list.component.html',
})
export class UsuariosListComponent implements OnInit {
  private service = inject(UsuariosService);
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.listAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.loading.set(false);
      },
    });
  }

  onDelete(id: string) {
    if (confirm('¿Eliminar este usuario y su perfil asociado?')) {
      this.service.delete(id).subscribe({
        next: () => this.load(),
        error: (err) => console.error('Error eliminando usuario', err),
      });
    }
  }
}
