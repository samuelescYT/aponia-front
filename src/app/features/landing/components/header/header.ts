import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  imports: [RouterLink]
})
export class HeaderComponent {
  open = signal(false);
  toggle() { this.open.update(v => !v); }
}
