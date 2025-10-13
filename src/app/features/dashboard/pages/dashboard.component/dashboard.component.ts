import { Component } from '@angular/core';
import { HeaderClienteComponent } from '../../components/header-cliente.component/header-cliente.component';

@Component({
  selector: 'app-dashboard.component',
  imports: [HeaderClienteComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
