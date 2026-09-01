import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';



interface ProductoVenta {
  id: number;
  nombre: string;
  categoria_nombre?: string;
  codigo_barras: string;
  precio_venta: number;
  stock: number;
  cantidad: number;
}

interface Factura {
  numero: string;
  fecha: string;
  total: number;
  cliente: string;
  documento: string;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-ventas',
  standalone: true,
    imports: [FormsModule, CommonModule, BarcodeScanner],

  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  busquedaCodigo = signal('');
  scannerAbierto = signal(false);
  busquedaNombre = signal('');

  clienteNombre = '';
  clienteDocumento = '';
  metodoPago = signal<'Efectivo' | 'QR' | 'Tarjeta'>('Efectivo');
  emitirFactura = false;
  enviando = signal(false);
  error = signal('');

  productos = signal<ProductoVenta[]>([]);
  facturaGenerada = signal<{ factura: Factura; items: { nombre: string; cantidad: number; precio: number }[] } | null>(null);

  usuarioId: number;

  constructor(private http: HttpClient) {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuarioId = usuarioGuardado ? JSON.parse(usuarioGuardado).id : null;
  }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get<any[]>(`${API_URL}/productos`).subscribe({
      next: (data) => {
        this.productos.set(data.map(p => ({ ...p, cantidad: 0 })));
      },
      error: (err) => console.error('Error cargando productos', err),
    });
  }

  productosFiltrados = computed(() => {
    const cod = this.busquedaCodigo().toLowerCase();
    const nom = this.busquedaNombre().toLowerCase();
    return this.productos().filter(p =>
      (p.codigo_barras ?? '').toLowerCase().includes(cod) &&
      p.nombre.toLowerCase().includes(nom)
    );
  });

  itemsEnCarrito = computed(() => this.productos().filter(p => p.cantidad > 0));

  total = computed(() =>
    this.itemsEnCarrito().reduce((sum, p) => sum + p.precio_venta * p.cantidad, 0)
  );

  sumar(p: ProductoVenta) {
    if (p.cantidad >= p.stock) return;
    this.productos.update(lista =>
      lista.map(x => x.id === p.id ? { ...x, cantidad: x.cantidad + 1 } : x)
    );
  }

  restar(p: ProductoVenta) {
    this.productos.update(lista =>
      lista.map(x => x.id === p.id ? { ...x, cantidad: Math.max(0, x.cantidad - 1) } : x)
    );
  }
    abrirScanner() {
    this.scannerAbierto.set(true);
  }

  onCodigoEscaneado(codigo: string) {
    this.busquedaCodigo.set(codigo);
    this.scannerAbierto.set(false);
  }

  setMetodoPago(m: 'Efectivo' | 'QR' | 'Tarjeta') {
    this.metodoPago.set(m);
  }

  cobrar() {
    if (this.itemsEnCarrito().length === 0) return;

    this.error.set('');
    this.enviando.set(true);

    const items = this.itemsEnCarrito().map(p => ({
      producto_id: p.id,
      cantidad: p.cantidad,
      precio_unitario: p.precio_venta,
    }));

    this.http.post<any>(`${API_URL}/ventas`, {
      usuario_id: this.usuarioId,
      cliente_nombre: this.clienteNombre,
      cliente_documento: this.clienteDocumento,
      metodo_pago: this.metodoPago(),
      con_factura: this.emitirFactura,
      items,
    }).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);

        const itemsParaTicket = this.itemsEnCarrito().map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio_venta,
        }));

         if (respuesta.factura) {
          this.facturaGenerada.set({
            factura: {
              ...respuesta.factura,
              total: respuesta.venta.total,
              cliente: this.clienteNombre || 'Cliente sin nombre',
              documento: this.clienteDocumento,
            },
            items: itemsParaTicket,
          });
        } else {
          alert(`Venta cobrada y guardada en el historial. Total: Bs ${respuesta.venta.total}`);
        }

        this.clienteNombre = '';
        this.clienteDocumento = '';
        this.emitirFactura = false;
        this.cargarProductos(); // recarga productos para reflejar el nuevo stock
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err.error?.error || 'No se pudo procesar la venta.');
      }
    });
  }

  cerrarFactura() {
    this.facturaGenerada.set(null);
  }

  imprimir() {
    window.print();
  }
}
