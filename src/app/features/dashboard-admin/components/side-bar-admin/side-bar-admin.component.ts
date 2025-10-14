import { Component, inject } from '@angular/core';
import { leftSidebarService } from '../../../../core/services/left-sideBar.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar-admin',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar-admin.component.html',
  styleUrl: './side-bar-admin.component.scss'
})
export class SideBarAdminComponent {
  sideBar = inject(leftSidebarService)

  toggle() {
    this.sideBar.toggle()
  }


}
