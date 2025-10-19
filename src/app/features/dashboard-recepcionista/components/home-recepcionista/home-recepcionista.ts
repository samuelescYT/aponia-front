import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-recepcionista',
  imports: [RouterLink],
  templateUrl: './home-recepcionista.html',
  styleUrl: './home-recepcionista.scss'
})
export class HomeRecepcionista {
  auth = inject(AuthService);
}