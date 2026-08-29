import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  ventas;

  constructor(private dataService: DataService) {
    this.ventas = this.dataService.ventas;
  }

  private ultimos7Dias(): Date[] {
    const dias: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dias.push(d);
    }
    return dias;
  }

  ventasSemana = computed(() => {
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    return this.ventas()
      .filter(v => v.fecha >= hace7dias)
      .reduce((sum, v) => sum + v.total, 0);
  });

  // Nota: la ganancia real necesita el precio de compra de cada producto (vendrá del backend).
  // Por ahora se estima con un margen aproximado del 30% sobre el total vendido.
  gananciaEstimada = computed(() => this.ventasSemana() * 0.3);

  ticketPromedio = computed(() => {
    const cantidad = this.ventas().length;
    if (cantidad === 0) return 0;
    const total = this.ventas().reduce((sum, v) => sum + v.total, 0);
    return total / cantidad;
  });

  ventasPorDia = computed(() => {
    const dias = this.ultimos7Dias();
    const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const datos = dias.map(dia => {
      const total = this.ventas()
        .filter(v => v.fecha.toDateString() === dia.toDateString())
        .reduce((sum, v) => sum + v.total, 0);
      return { dia: nombres[dia.getDay()], total };
    });

    const max = Math.max(...datos.map(d => d.total), 1);
    return datos.map(d => ({ ...d, porcentaje: (d.total / max) * 100 }));
  });

  productosMasVendidos = computed(() => {
    const acumulado = new Map<string, { unidades: number; ingresos: number }>();

    for (const venta of this.ventas()) {
      for (const item of venta.items) {
        const actual = acumulado.get(item.nombre) ?? { unidades: 0, ingresos: 0 };
        actual.unidades += item.cantidad;
        actual.ingresos += item.cantidad * item.precio;
        acumulado.set(item.nombre, actual);
      }
    }

    return Array.from(acumulado.entries())
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 8);
  });
}
