import { Component, inject } from '@angular/core';
import { HeaderClienteComponent } from '../../components/header-cliente.component/header-cliente.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard.component',
  imports: [HeaderClienteComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  auth = inject(AuthService)
  router = inject(Router)

  async ngOnInit() {
    if (!this.auth.loggedIn()) {
      await this.router.navigateByUrl('/');
    }
  }
}
