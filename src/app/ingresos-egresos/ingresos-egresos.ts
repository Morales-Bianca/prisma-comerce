import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Movimiento {
  id: number;
  fecha: string;
  concepto: string;
  categoria: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: string;
  registrado_por: string;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-ingresos-egresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingresos-egresos.html',
  styleUrl: './ingresos-egresos.css'
})
export class IngresosEgresos implements OnInit {
  filtro = signal<'Todos' | 'Ingresos' | 'Egresos'>('Todos');
  filtros: ('Todos' | 'Ingresos' | 'Egresos')[] = ['Todos', 'Ingresos', 'Egresos'];
  modalAbierto = signal(false);
  cargando = signal(false);
  error = signal('');

  categorias = ['Compra a proveedor', 'Pago de servicios', 'Sueldos', 'Otros'];

  nuevoMovimiento = {
    concepto: '',
    categoria: 'Compra a proveedor',
    tipo: 'Egreso' as 'Ingreso' | 'Egreso',
    monto: 0,
  };

  movimientos = signal<Movimiento[]>([]);
  esAdmin = signal(false);
  usuarioId: number;

  constructor(private http: HttpClient) {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuarioId = usuarioGuardado ? JSON.parse(usuarioGuardado).id : null;
  }

    ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.esAdmin.set(JSON.parse(usuarioGuardado).rol === 'Administrador');
    }
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    this.cargando.set(true);
    this.http.get<Movimiento[]>(`${API_URL}/movimientos`).subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando movimientos', err);
        this.cargando.set(false);
      },
    });
  }

  movimientosFiltrados = computed(() => {
    const f = this.filtro();
    return this.movimientos().filter(m => {
      if (f === 'Todos') return true;
      if (f === 'Ingresos') return m.tipo === 'Ingreso';
      return m.tipo === 'Egreso';
    });
  });

  private esHoy(fechaStr: string): boolean {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  ingresosHoy = computed(() =>
    this.movimientos()
      .filter(m => m.tipo === 'Ingreso' && this.esHoy(m.fecha))
      .reduce((sum, m) => sum + Number(m.monto), 0)
  );

  egresosHoy = computed(() =>
    this.movimientos()
      .filter(m => m.tipo === 'Egreso' && this.esHoy(m.fecha))
      .reduce((sum, m) => sum + Number(m.monto), 0)
  );

  saldoNeto = computed(() => this.ingresosHoy() - this.egresosHoy());

  setFiltro(f: 'Todos' | 'Ingresos' | 'Egresos') {
    this.filtro.set(f);
  }

  abrirModal() {
    this.nuevoMovimiento = { concepto: '', categoria: 'Compra a proveedor', tipo: 'Egreso', monto: 0 };
    this.error.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarMovimiento() {
    if (!this.nuevoMovimiento.concepto.trim() || this.nuevoMovimiento.monto <= 0) {
      this.error.set('Completa el concepto y un monto válido.');
      return;
    }

    this.http.post(`${API_URL}/movimientos`, {
      ...this.nuevoMovimiento,
      usuario_id: this.usuarioId,
    }).subscribe({
      next: () => {
        this.cargarMovimientos();
        this.cerrarModal();
      },
      error: (err) => this.error.set(err.error?.error || 'No se pudo registrar el movimiento.'),
    });
  }
}
