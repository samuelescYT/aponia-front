import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderRecepcionista } from './components/header-recepcionista/header-recepcionista';
import { SideBarRecepcionista } from './components/side-bar-recepcionista/side-bar-recepcionista';

@Component({
  selector: 'app-dashboard-receptionista',
  imports: [
    RouterOutlet,
    HeaderRecepcionista,
    SideBarRecepcionista
  ],
  templateUrl: './dashboard-recepcionista.html',
  styleUrl: './dashboard-recepcionista.scss'
})
export class DashboardRecepcionista {
}