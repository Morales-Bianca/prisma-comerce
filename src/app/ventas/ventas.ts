import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, Factura, ItemVenta } from '../data.service';
import { CommonModule } from '@angular/common';
interface ProductoVenta {
  nombre: string;
  proveedor: string;
  codigo: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
    imports: [FormsModule, CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas {
  busquedaCodigo = signal('');
  busquedaNombre = signal('');

  constructor(private dataService: DataService) {}
  clienteNombre = '';
  clienteDocumento = '';
  metodoPago = signal<'Efectivo' | 'QR' | 'Tarjeta'>('Efectivo');
  emitirFactura = false;
  facturaGenerada = signal<{ factura: Factura; items: ItemVenta[] } | null>(null);

  productos = signal<ProductoVenta[]>([
    { nombre: 'Coca-Cola 2L', proveedor: 'Embol', codigo: '7791234560012', precio: 12.50, cantidad: 0 },
    { nombre: 'Pan de molde Fortaleza', proveedor: 'Fortaleza', codigo: '7791234560029', precio: 10.00, cantidad: 0 },
    { nombre: 'Leche Pil entera 1L', proveedor: 'Pil Andina', codigo: '7791234560036', precio: 9.50, cantidad: 0 },
    { nombre: 'Aceite Fino 900ml', proveedor: 'Fino', codigo: '7791234560043', precio: 15.00, cantidad: 0 },
    { nombre: 'Arroz Ceibo 1kg', proveedor: 'Ceibo', codigo: '7791234560050', precio: 8.00, cantidad: 0 },
  ]);

  productosFiltrados = computed(() => {
    const cod = this.busquedaCodigo().toLowerCase();
    const nom = this.busquedaNombre().toLowerCase();
    return this.productos().filter(p =>
      p.codigo.toLowerCase().includes(cod) && p.nombre.toLowerCase().includes(nom)
    );
  });

  itemsEnCarrito = computed(() => this.productos().filter(p => p.cantidad > 0));

  total = computed(() =>
    this.itemsEnCarrito().reduce((sum, p) => sum + p.precio * p.cantidad, 0)
  );

  sumar(p: ProductoVenta) {
    this.productos.update(lista =>
      lista.map(x => x.codigo === p.codigo ? { ...x, cantidad: x.cantidad + 1 } : x)
    );
  }

  restar(p: ProductoVenta) {
    this.productos.update(lista =>
      lista.map(x => x.codigo === p.codigo ? { ...x, cantidad: Math.max(0, x.cantidad - 1) } : x)
    );
  }

  setMetodoPago(m: 'Efectivo' | 'QR' | 'Tarjeta') {
    this.metodoPago.set(m);
  }

  cobrar() {
  if (this.itemsEnCarrito().length === 0) return;

  const items = this.itemsEnCarrito().map(p => ({
    nombre: p.nombre,
    cantidad: p.cantidad,
    precio: p.precio,
  }));

  const resultado = this.dataService.registrarVenta({
    cliente: this.clienteNombre,
    documento: this.clienteDocumento,
    items,
    total: this.total(),
    metodoPago: this.metodoPago(),
    conFactura: this.emitirFactura,
  });

  this.productos.update(lista => lista.map(p => ({ ...p, cantidad: 0 })));
  this.clienteNombre = '';
  this.clienteDocumento = '';
  this.emitirFactura = false;

  if (resultado.factura) {
    this.facturaGenerada.set({ factura: resultado.factura, items });
  } else {
    alert(`Venta cobrada y guardada en el historial. Total: Bs ${resultado.venta.total.toFixed(2)}`);
  }
}

cerrarFactura() {
  this.facturaGenerada.set(null);
}
imprimir() {
  window.print();
}
}
