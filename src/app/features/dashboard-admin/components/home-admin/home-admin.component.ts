import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-home-admin.component',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.scss'
})
export class HomeAdminComponent {
  auth = inject(AuthService)
}
