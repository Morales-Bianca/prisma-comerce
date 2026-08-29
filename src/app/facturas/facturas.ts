import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Factura, ItemVenta, VentaRegistrada } from '../data.service';


@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css'
})
export class Facturas {
  filtro = signal<'Todas' | 'Con factura' | 'Sin factura'>('Todas');
  facturaVer = signal<{ factura: Factura; items: ItemVenta[] } | null>(null);
  filtros: ('Todas' | 'Con factura' | 'Sin factura')[] = ['Todas', 'Con factura', 'Sin factura'];

    ventas;

  constructor(private dataService: DataService) {
    this.ventas = this.dataService.ventas;
  }
  ventasFiltradas = computed(() => {
    const f = this.filtro();
    return this.ventas().filter(v => {
      if (f === 'Todas') return true;
      if (f === 'Con factura') return v.conFactura;
      return !v.conFactura;
    });
  });

  setFiltro(f: 'Todas' | 'Con factura' | 'Sin factura') {
    this.filtro.set(f);
  }

  buscarFactura(venta: VentaRegistrada): Factura | undefined {
    return this.dataService.facturas().find(f => f.ventaId === venta.id);
  }

  verFactura(venta: VentaRegistrada) {
    const factura = this.buscarFactura(venta);
    if (!factura) return;
    this.facturaVer.set({ factura, items: venta.items });
  }

  cerrarFactura() {
    this.facturaVer.set(null);
  }

  imprimir() {
    window.print();
  }
}
