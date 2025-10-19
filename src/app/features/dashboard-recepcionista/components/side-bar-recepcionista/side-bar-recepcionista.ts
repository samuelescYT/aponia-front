import { Component, inject } from '@angular/core';
import { leftSidebarService } from '../../../../core/services/left-sideBar.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar-receptionist',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar-recepcionista.html',
  styleUrl: './side-bar-recepcionista.scss'
})
export class SideBarRecepcionista {
  sideBar = inject(leftSidebarService);
  
  toggle() {
    this.sideBar.toggle();
  }
}