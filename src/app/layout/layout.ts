import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  navItems = [
    { path: 'dashboard', label: 'Home', icon: '' },
    { path: 'usuarios', label: 'Usuarios', icon: '' },
    { path: 'productos', label: 'Productos', icon: '' },
  ];
}
