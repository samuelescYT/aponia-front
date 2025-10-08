import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rooms-grid',
  standalone: true,
  templateUrl: './rooms-grid.html',
  imports: [RouterLink],
})
export class RoomsGridComponent {}
