import { Component, inject } from '@angular/core';
import { HeaderAdminComponent } from '../../components/header-admin/header-admin.component';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { leftSidebarService } from '../../../../core/services/left-sideBar.service';
import { SideBarAdminComponent } from "../../components/side-bar-admin/side-bar-admin.component";
@Component({
  selector: 'app-dashboard-admin',
  imports: [HeaderAdminComponent, RouterOutlet, SideBarAdminComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent {
  sideBar = inject(leftSidebarService)


}
