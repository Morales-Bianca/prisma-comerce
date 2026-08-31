import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Usuario {
  id: number;
  nombre: string;
  rol: 'Administrador' | 'Vendedor';
  activo: boolean;
}

interface PermisoFila {
  seccion: string;
  vendedor: boolean;
  administrador: boolean;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  idEnEdicion: number | null = null;
  cargando = signal(false);
  error = signal('');

  usuarios = signal<Usuario[]>([]);

  permisos: PermisoFila[] = [
    { seccion: 'Ventas', vendedor: true, administrador: true },
    { seccion: 'Productos y stock', vendedor: false, administrador: true },
    { seccion: 'Entradas de Inventario', vendedor: true, administrador: true },
    { seccion: 'Facturas', vendedor: false, administrador: true },
    { seccion: 'Ingresos y egresos', vendedor: true, administrador: true },
    { seccion: 'Usuarios', vendedor: false, administrador: true },
    { seccion: 'Reportes', vendedor: false, administrador: true },
  ];

  nuevoUsuario = { nombre: '', rol: 'Vendedor' as 'Administrador' | 'Vendedor', contrasena: '', activo: true };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.http.get<Usuario[]>(`${API_URL}/usuarios`).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.cargando.set(false);
      },
    });
  }

  usuariosActivos() {
    return this.usuarios().filter(u => u.activo).length;
  }

  abrirModalAgregar() {
    this.nuevoUsuario = { nombre: '', rol: 'Vendedor', contrasena: '', activo: true };
    this.modoEdicion.set(false);
    this.error.set('');
    this.modalAbierto.set(true);
  }

  abrirModalEditar(u: Usuario) {
    this.nuevoUsuario = { nombre: u.nombre, rol: u.rol, contrasena: '', activo: u.activo };
    this.idEnEdicion = u.id;
    this.modoEdicion.set(true);
    this.error.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.nombre.trim()) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    if (!this.modoEdicion() && !this.nuevoUsuario.contrasena.trim()) {
      this.error.set('La contraseña es obligatoria para un usuario nuevo.');
      return;
    }

    this.error.set('');

    if (this.modoEdicion() && this.idEnEdicion != null) {
      this.http.put(`${API_URL}/usuarios/${this.idEnEdicion}`, this.nuevoUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => this.error.set(err.error?.error || 'No se pudo editar el usuario.'),
      });
    } else {
      this.http.post(`${API_URL}/usuarios`, this.nuevoUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => this.error.set(err.error?.error || 'No se pudo crear el usuario.'),
      });
    }
  }

  toggleActivo(u: Usuario) {
    this.http.put(`${API_URL}/usuarios/${u.id}`, { nombre: u.nombre, rol: u.rol, activo: !u.activo }).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => console.error('Error cambiando estado', err),
    });
  }
}
