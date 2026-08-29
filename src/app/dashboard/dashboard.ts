
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopHeader } from '../top-header/top-header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TopHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  accesos = [
    { path: 'productos', icon: '📦', title: 'Productos' },
    { path: 'ventas', icon: '🛒', title: 'Ventas', highlight: true },
    { path: 'facturas', icon: '📄', title: 'Facturas' },
    { path: 'ingresos-egresos', icon: '⬆️', title: 'Ingresos y Egresos' },
    { path: 'usuarios', icon: '👥', title: 'Usuarios' },
    { path: 'reportes', icon: '📊', title: 'Reportes' },
    { path: 'configuracion', icon: '⚙️', title: 'Configuración' },
  ];
}
