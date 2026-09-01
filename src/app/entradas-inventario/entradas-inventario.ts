import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Producto {
  id: number;
  nombre: string;
  stock: number;
}

interface Entrada {
  id: number;
  producto_nombre: string;
  cantidad: number;
  origen: string;
  registrado_por: string;
  fecha: string;
}

interface Salida {
  id: number;
  producto_nombre: string;
  cantidad: number;
  motivo: string;
  registrado_por: string;
  fecha: string;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-entradas-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entradas-inventario.html',
  styleUrl: './entradas-inventario.css'
})
export class EntradasInventario implements OnInit {
  productos = signal<Producto[]>([]);
  entradas = signal<Entrada[]>([]);
  salidas = signal<Salida[]>([]);
  cargando = signal(false);
  error = signal('');
  exito = signal(false);
  errorSalida = signal('');
  exitoSalida = signal(false);

  motivosSalida = ['Merma', 'Producto dañado', 'Corrección de inventario', 'Otro'];

  usuarioId: number;

  nuevaEntrada = {
    producto_id: null as number | null,
    cantidad: 0,
    origen: '',
  };

  nuevaSalida = {
    producto_id: null as number | null,
    cantidad: 0,
    motivo: 'Merma',
  };

  constructor(private http: HttpClient) {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuarioId = usuarioGuardado ? JSON.parse(usuarioGuardado).id : null;
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarEntradas();
    this.cargarSalidas();
  }

  cargarProductos() {
    this.http.get<Producto[]>(`${API_URL}/productos`).subscribe({
      next: (data) => this.productos.set(data),
      error: (err) => console.error('Error cargando productos', err),
    });
  }

  cargarEntradas() {
    this.cargando.set(true);
    this.http.get<Entrada[]>(`${API_URL}/entradas`).subscribe({
      next: (data) => {
        this.entradas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando entradas', err);
        this.cargando.set(false);
      },
    });
  }

  cargarSalidas() {
    this.http.get<Salida[]>(`${API_URL}/salidas`).subscribe({
      next: (data) => this.salidas.set(data),
      error: (err) => console.error('Error cargando salidas', err),
    });
  }

  registrarEntrada() {
    if (!this.nuevaEntrada.producto_id || this.nuevaEntrada.cantidad <= 0 || !this.nuevaEntrada.origen.trim()) {
      this.error.set('Selecciona un producto, una cantidad válida y el origen.');
      return;
    }

    this.error.set('');

    this.http.post(`${API_URL}/entradas`, {
      ...this.nuevaEntrada,
      usuario_id: this.usuarioId,
    }).subscribe({
      next: () => {
        this.nuevaEntrada = { producto_id: null, cantidad: 0, origen: '' };
        this.exito.set(true);
        setTimeout(() => this.exito.set(false), 2500);
        this.cargarProductos();
        this.cargarEntradas();
      },
      error: (err) => this.error.set(err.error?.error || 'No se pudo registrar la entrada.'),
    });
  }

  registrarSalida() {
    if (!this.nuevaSalida.producto_id || this.nuevaSalida.cantidad <= 0 || !this.nuevaSalida.motivo) {
      this.errorSalida.set('Selecciona un producto, una cantidad válida y el motivo.');
      return;
    }

    this.errorSalida.set('');

    this.http.post(`${API_URL}/salidas`, {
      ...this.nuevaSalida,
      usuario_id: this.usuarioId,
    }).subscribe({
      next: () => {
        this.nuevaSalida = { producto_id: null, cantidad: 0, motivo: 'Merma' };
        this.exitoSalida.set(true);
        setTimeout(() => this.exitoSalida.set(false), 2500);
        this.cargarProductos();
        this.cargarSalidas();
      },
      error: (err) => this.errorSalida.set(err.error?.error || 'No se pudo registrar la salida.'),
    });
  }
}
