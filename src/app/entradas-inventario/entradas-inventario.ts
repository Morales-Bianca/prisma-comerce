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
  cargando = signal(false);
  error = signal('');
  exito = signal(false);

  usuarioId: number;

  nuevaEntrada = {
    producto_id: null as number | null,
    cantidad: 0,
    origen: '',
  };

  constructor(private http: HttpClient) {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuarioId = usuarioGuardado ? JSON.parse(usuarioGuardado).id : null;
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarEntradas();
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
}
