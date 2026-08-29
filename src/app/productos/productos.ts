import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Producto {
  nombre: string;
  codigo: string;
  categoria: string;
  unidad: string;
  precio: number;
  precioCompra: number;
  stock: number;
  stockMinimo: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos {
  filtroActivo = signal('Todos');
  busqueda = signal('');
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  codigoEnEdicion = '';

  filtros = ['Todos', 'Abarrotes', 'Bebidas', 'Lácteos', 'Stock bajo'];
  categorias = ['Abarrotes', 'Bebidas', 'Lácteos', 'Limpieza', 'Otros'];
  unidades = ['Unidad', 'Kg', 'Litro', 'Paquete'];

  nuevoProducto: Producto = this.productoVacio();

  productos = signal<Producto[]>([
    { nombre: 'Coca-Cola 2L', codigo: '7791234560012', categoria: 'Bebidas', unidad: 'Unidad', precio: 12.50, precioCompra: 9.00, stock: 34, stockMinimo: 10 },
    { nombre: 'Pan de molde Fortaleza', codigo: '7791234560029', categoria: 'Abarrotes', unidad: 'Unidad', precio: 10.00, precioCompra: 7.00, stock: 8, stockMinimo: 10 },
    { nombre: 'Leche Pil entera 1L', codigo: '7791234560036', categoria: 'Lácteos', unidad: 'Litro', precio: 9.50, precioCompra: 7.00, stock: 3, stockMinimo: 5 },
    { nombre: 'Aceite Fino 900ml', codigo: '7791234560043', categoria: 'Abarrotes', unidad: 'Unidad', precio: 15.00, precioCompra: 11.00, stock: 2, stockMinimo: 5 },
    { nombre: 'Arroz Ceibo 1kg', codigo: '7791234560050', categoria: 'Abarrotes', unidad: 'Kg', precio: 8.00, precioCompra: 6.00, stock: 22, stockMinimo: 10 },
    { nombre: 'Fideo Iris 400g', codigo: '7791234560067', categoria: 'Abarrotes', unidad: 'Unidad', precio: 5.50, precioCompra: 4.00, stock: 0, stockMinimo: 5 },
  ]);

  productosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    const texto = this.busqueda().toLowerCase();

    return this.productos().filter(p => {
      const coincideTexto = p.nombre.toLowerCase().includes(texto) || p.codigo.includes(texto);
      if (!coincideTexto) return false;
      if (filtro === 'Todos') return true;
      if (filtro === 'Stock bajo') return p.stock <= p.stockMinimo;
      return p.categoria === filtro;
    });
  });

  private productoVacio(): Producto {
    return { nombre: '', codigo: '', categoria: 'Abarrotes', unidad: 'Unidad', precio: 0, precioCompra: 0, stock: 0, stockMinimo: 0 };
  }

  setFiltro(f: string) {
    this.filtroActivo.set(f);
  }

  onBuscar(event: Event) {
    const input = event.target as HTMLInputElement;
    this.busqueda.set(input.value);
  }

  stockLabel(p: Producto): string {
    return p.stock === 0 ? '0 (agotado)' : p.stock.toString();
  }

  esStockBajo(p: Producto): boolean {
    return p.stock <= p.stockMinimo;
  }

  abrirModalAgregar() {
    this.nuevoProducto = this.productoVacio();
    this.modoEdicion.set(false);
    this.modalAbierto.set(true);
  }

  abrirModalEditar(p: Producto) {
    this.nuevoProducto = { ...p };
    this.codigoEnEdicion = p.codigo;
    this.modoEdicion.set(true);
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarProducto() {
    if (!this.nuevoProducto.nombre.trim()) return;

    if (this.modoEdicion()) {
      this.productos.update(lista =>
        lista.map(p => p.codigo === this.codigoEnEdicion ? { ...this.nuevoProducto } : p)
      );
    } else {
      this.productos.update(lista => [...lista, { ...this.nuevoProducto }]);
    }
    this.cerrarModal();
  }
}
