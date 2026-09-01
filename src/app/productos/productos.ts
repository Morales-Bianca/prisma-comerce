import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id?: number;
  nombre: string;
  codigo_barras: string;
  categoria_id: number | null;
  categoria_nombre?: string;
  unidad: string;
  precio_venta: number;
  precio_compra: number;
  stock: number;
  stock_minimo: number;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  filtroActivo = signal('Todos');
  busqueda = signal('');
  ordenCategoria = signal(false);
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  idEnEdicion: number | null = null;
  cargando = signal(false);
  error = signal('');

  modalMasivoAbierto = signal(false);
  textoMasivo = '';
  resultadoMasivo = signal<{ creados: number; errores: string[] } | null>(null);
  errorMasivo = signal('');

  categorias = signal<Categoria[]>([]);
  productos = signal<Producto[]>([]);

  unidades = ['Unidad', 'Kg', 'Litro', 'Paquete'];

  nuevoProducto: Producto = this.productoVacio();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.http.get<Categoria[]>(`${API_URL}/categorias`).subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error cargando categorías', err),
    });
  }

  cargarProductos() {
    this.cargando.set(true);
    this.http.get<Producto[]>(`${API_URL}/productos`).subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.cargando.set(false);
      },
    });
  }

  filtros = ['Todos', 'Stock bajo'];

  productosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    const texto = this.busqueda().toLowerCase();

    let lista = this.productos().filter(p => {
      const coincideTexto = p.nombre.toLowerCase().includes(texto) ||
        (p.codigo_barras ?? '').includes(texto);
      if (!coincideTexto) return false;
      if (filtro === 'Todos') return true;
      return p.stock <= p.stock_minimo;
    });

    if (this.ordenCategoria()) {
      lista = [...lista].sort((a, b) =>
        (a.categoria_nombre ?? '').localeCompare(b.categoria_nombre ?? '')
      );
    }

    return lista;
  });

  toggleOrdenCategoria() {
    this.ordenCategoria.update(v => !v);
  }

  private productoVacio(): Producto {
    return {
      nombre: '', codigo_barras: '', categoria_id: null, unidad: 'Unidad',
      precio_venta: 0, precio_compra: 0, stock: 0, stock_minimo: 0,
    };
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
    return p.stock <= p.stock_minimo;
  }

  abrirModalAgregar() {
    this.nuevoProducto = this.productoVacio();
    this.modoEdicion.set(false);
    this.error.set('');
    this.modalAbierto.set(true);
  }

  abrirModalEditar(p: Producto) {
    this.nuevoProducto = { ...p };
    this.idEnEdicion = p.id ?? null;
    this.modoEdicion.set(true);
    this.error.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarProducto() {
    if (!this.nuevoProducto.nombre.trim()) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    this.error.set('');

    if (this.modoEdicion() && this.idEnEdicion != null) {
      this.http.put(`${API_URL}/productos/${this.idEnEdicion}`, this.nuevoProducto).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (err) => this.error.set(err.error?.error || 'No se pudo editar el producto.'),
      });
    } else {
      this.http.post(`${API_URL}/productos`, this.nuevoProducto).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (err) => this.error.set(err.error?.error || 'No se pudo crear el producto.'),
      });
    }
  }

  eliminarProducto(p: Producto) {
    if (!p.id) return;
    if (!confirm(`¿Seguro que quieres eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.http.delete(`${API_URL}/productos/${p.id}`).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => alert(err.error?.error || 'No se pudo eliminar el producto.'),
    });
  }

  abrirModalMasivo() {
    this.textoMasivo = '';
    this.resultadoMasivo.set(null);
    this.errorMasivo.set('');
    this.modalMasivoAbierto.set(true);
  }

  cerrarModalMasivo() {
    this.modalMasivoAbierto.set(false);
  }

  cargarMasivo() {
    const lineas = this.textoMasivo.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lineas.length === 0) {
      this.errorMasivo.set('Pega al menos una línea con datos.');
      return;
    }

    const productosNuevos = lineas.map(linea => {
      const partes = linea.split(',').map(p => p.trim());
      const [nombre, codigo_barras, nombreCategoria, unidad, precio_venta, precio_compra, stock, stock_minimo] = partes;

      const categoria = this.categorias().find(
        c => c.nombre.toLowerCase() === (nombreCategoria ?? '').toLowerCase()
      );

      return {
        nombre,
        codigo_barras,
        categoria_id: categoria ? categoria.id : null,
        unidad: unidad || 'Unidad',
        precio_venta: parseFloat(precio_venta),
        precio_compra: parseFloat(precio_compra),
        stock: parseInt(stock) || 0,
        stock_minimo: parseInt(stock_minimo) || 0,
      };
    });

    this.errorMasivo.set('');

    this.http.post<{ creados: number; errores: string[] }>(`${API_URL}/productos/bulk`, {
      productos: productosNuevos,
    }).subscribe({
      next: (respuesta) => {
        this.resultadoMasivo.set(respuesta);
        this.cargarProductos();
      },
      error: (err) => this.errorMasivo.set(err.error?.error || 'No se pudo procesar la carga.'),
    });
  }
}
