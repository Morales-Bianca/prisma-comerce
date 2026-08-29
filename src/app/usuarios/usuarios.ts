import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  nombre: string;
  rol: 'Administrador' | 'Vendedor';
  ultimoAcceso: string;
  activo: boolean;
}

interface PermisoFila {
  seccion: string;
  vendedor: boolean;
  administrador: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios {
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  nombreEnEdicion = '';

  usuarios = signal<Usuario[]>([
    { nombre: 'Bianca', rol: 'Administrador', ultimoAcceso: 'Ahora', activo: true },
    { nombre: 'Ana Torres', rol: 'Vendedor', ultimoAcceso: 'Hace 20 min', activo: true },
  ]);

  permisos: PermisoFila[] = [
    { seccion: 'Ventas', vendedor: true, administrador: true },
    { seccion: 'Productos y stock', vendedor: false, administrador: true },
    { seccion: 'Facturas', vendedor: false, administrador: true },
    { seccion: 'Ingresos y egresos', vendedor: false, administrador: true },
    { seccion: 'Usuarios', vendedor: false, administrador: true },
    { seccion: 'Reportes', vendedor: false, administrador: true },
  ];

  nuevoUsuario = { nombre: '', rol: 'Vendedor' as 'Administrador' | 'Vendedor' };

  usuariosActivos() {
    return this.usuarios().filter(u => u.activo).length;
  }

  abrirModalAgregar() {
    this.nuevoUsuario = { nombre: '', rol: 'Vendedor' };
    this.modoEdicion.set(false);
    this.modalAbierto.set(true);
  }

  abrirModalEditar(u: Usuario) {
    this.nuevoUsuario = { nombre: u.nombre, rol: u.rol };
    this.nombreEnEdicion = u.nombre;
    this.modoEdicion.set(true);
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.nombre.trim()) return;

    if (this.modoEdicion()) {
      this.usuarios.update(lista =>
        lista.map(u => u.nombre === this.nombreEnEdicion
          ? { ...u, nombre: this.nuevoUsuario.nombre, rol: this.nuevoUsuario.rol }
          : u
        )
      );
    } else {
      this.usuarios.update(lista => [
        ...lista,
        { nombre: this.nuevoUsuario.nombre, rol: this.nuevoUsuario.rol, ultimoAcceso: 'Nunca', activo: true },
      ]);
    }

    this.cerrarModal();
  }

  toggleActivo(u: Usuario) {
    this.usuarios.update(lista =>
      lista.map(x => x.nombre === u.nombre ? { ...x, activo: !x.activo } : x)
    );
  }
}
