import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface ItemVenta {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

interface Factura {
  id: number;
  numero: string;
  fecha: string;
  documento?: string;
}

interface VentaConFactura {
  id: number;
  fecha: string;
  cliente_nombre: string;
  cliente_documento: string;
  metodo_pago: string;
  total: string;
  con_factura: boolean;
  items: ItemVenta[];
  factura: Factura | null;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css'
})
export class Facturas implements OnInit {
  filtro = signal<'Todas' | 'Con factura' | 'Sin factura'>('Todas');
  filtros: ('Todas' | 'Con factura' | 'Sin factura')[] = ['Todas', 'Con factura', 'Sin factura'];
  facturaVer = signal<{ venta: VentaConFactura } | null>(null);
  cargando = signal(false);

  ventas = signal<VentaConFactura[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVentas();
  }

  cargarVentas() {
    this.cargando.set(true);
    this.http.get<VentaConFactura[]>(`${API_URL}/ventas`).subscribe({
      next: (data) => {
        this.ventas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando ventas', err);
        this.cargando.set(false);
      },
    });
  }

  ventasFiltradas = computed(() => {
    const f = this.filtro();
    return this.ventas().filter(v => {
      if (f === 'Todas') return true;
      if (f === 'Con factura') return v.con_factura;
      return !v.con_factura;
    });
  });

  setFiltro(f: 'Todas' | 'Con factura' | 'Sin factura') {
    this.filtro.set(f);
  }

    verFactura(venta: VentaConFactura) {
    this.facturaVer.set({ venta });
  }

  cerrarFactura() {
    this.facturaVer.set(null);
  }

      eliminarVenta(venta: VentaConFactura) {
    const confirmacion = confirm(
      `¿Seguro que quieres eliminar esta venta por completo (Bs ${venta.total})? Esto revierte el stock y no se puede deshacer.`
    );
    if (!confirmacion) return;

    this.http.delete(`${API_URL}/ventas/${venta.id}`).subscribe({
      next: () => this.cargarVentas(),
      error: (err) => alert(err.error?.error || 'No se pudo eliminar la venta.'),
    });


  }

  imprimir() {
    window.print();
  }
}
