import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  @ViewChild('fila') fila!: ElementRef<HTMLDivElement>;

  accesos = [
    { path: 'productos', icon: '', title: 'Productos' },
    { path: 'ventas', icon: '', title: 'Ventas', highlight: true },
    { path: 'facturas', icon: '', title: 'Facturas' },
    { path: 'ingresos-egresos', icon: '', title: 'Ingresos' },
    { path: 'usuarios', icon: '', title: 'Usuarios' },
    { path: 'reportes', icon: '', title: 'Reportes' },
    { path: 'configuracion', icon: '', title: 'Configuración' },
  ];

  mover(direccion: number) {
    const el = this.fila.nativeElement;
    const anchoTarjeta = el.querySelector('.modulo')?.clientWidth ?? 150;
    el.scrollBy({ left: direccion * (anchoTarjeta + 14), behavior: 'smooth' });
  }
}
