import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-ingresos-egresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingresos-egresos.html',
  styleUrl: './ingresos-egresos.css'
})
export class IngresosEgresos {
  filtro = signal<'Todos' | 'Ingresos' | 'Egresos'>('Todos');
  modalAbierto = signal(false);

  categorias = ['Ventas', 'Compra a proveedor', 'Pago de servicios', 'Sueldos', 'Otros'];
  filtros: ('Todos' | 'Ingresos' | 'Egresos')[] = ['Todos', 'Ingresos', 'Egresos'];

  nuevoMovimiento = {
    concepto: '',
    categoria: 'Compra a proveedor',
    tipo: 'Egreso' as 'Ingreso' | 'Egreso',
    monto: 0,
  };

  movimientos;

  constructor(private dataService: DataService) {
    this.movimientos = this.dataService.movimientos;
  }

  movimientosFiltrados = computed(() => {
    const f = this.filtro();
    return this.movimientos().filter(m => {
      if (f === 'Todos') return true;
      if (f === 'Ingresos') return m.tipo === 'Ingreso';
      return m.tipo === 'Egreso';
    });
  });

  private esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  ingresosHoy = computed(() =>
    this.movimientos()
      .filter(m => m.tipo === 'Ingreso' && this.esHoy(m.fecha))
      .reduce((sum, m) => sum + m.monto, 0)
  );

  egresosHoy = computed(() =>
    this.movimientos()
      .filter(m => m.tipo === 'Egreso' && this.esHoy(m.fecha))
      .reduce((sum, m) => sum + m.monto, 0)
  );

  saldoNeto = computed(() => this.ingresosHoy() - this.egresosHoy());

  setFiltro(f: 'Todos' | 'Ingresos' | 'Egresos') {
    this.filtro.set(f);
  }

  abrirModal() {
    this.nuevoMovimiento = { concepto: '', categoria: 'Compra a proveedor', tipo: 'Egreso', monto: 0 };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarMovimiento() {
    if (!this.nuevoMovimiento.concepto.trim() || this.nuevoMovimiento.monto <= 0) return;

    this.dataService.registrarMovimiento({
      concepto: this.nuevoMovimiento.concepto,
      categoria: this.nuevoMovimiento.categoria,
      tipo: this.nuevoMovimiento.tipo,
      monto: this.nuevoMovimiento.monto,
      registradoPor: 'Bianca',
    });

    this.cerrarModal();
  }
}
