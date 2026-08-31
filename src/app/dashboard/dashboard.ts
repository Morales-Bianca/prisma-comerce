import { Component, OnInit, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { title } from 'node:process';

interface Acceso {
  path: string;
  icon: string;
  title: string;
  highlight?: boolean;
  soloAdmin?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  @ViewChild('fila') fila!: ElementRef<HTMLDivElement>;

  rol = signal<string>('Vendedor');

  todosLosAccesos: Acceso[] = [
    { path: 'ventas', icon: '', title: 'Ventas', highlight: true },
    { path: 'entradas-inventario', icon: '', title: 'Entradas' },
    { path: 'productos', icon: '', title: 'Productos', soloAdmin: true },
    { path: 'facturas', icon: '', title: 'Facturas', soloAdmin: true },
    { path: 'ingresos-egresos', icon: '', title: 'Ingresos' },
    { path: 'usuarios', icon: '', title: 'Usuarios', soloAdmin: true },
    { path: 'reportes', icon: '', title: 'Reportes', soloAdmin: true },
    { path: 'configuracion', icon: '', title: 'Configuración', soloAdmin: true },
  ];

  accesos = computed(() =>
    this.rol() === 'Administrador'
      ? this.todosLosAccesos
      : this.todosLosAccesos.filter(a => !a.soloAdmin)
  );

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.rol.set(JSON.parse(usuarioGuardado).rol);
    }
  }

  mover(direccion: number) {
    const el = this.fila.nativeElement;
    const anchoTarjeta = el.querySelector('.modulo')?.clientWidth ?? 150;
    el.scrollBy({ left: direccion * (anchoTarjeta + 14), behavior: 'smooth' });
  }
}
