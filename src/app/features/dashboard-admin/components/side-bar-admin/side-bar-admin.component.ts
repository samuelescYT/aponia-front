import { Component, inject } from '@angular/core';
import { leftSidebarService } from '../../../../core/admin/left-sideBar.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-bar-admin',
  imports: [RouterLink],
  templateUrl: './side-bar-admin.component.html',
  styleUrl: './side-bar-admin.component.scss'
})
export class SideBarAdminComponent {
  sideBar = inject(leftSidebarService)

  toggle() {
    this.sideBar.toggle()
  }


}
