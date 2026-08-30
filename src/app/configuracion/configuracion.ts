import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ConfiguracionData {
  id: number;
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  nit: string;
  moneda: string;
  alerta_stock_bajo: number;
  emitir_factura_default: boolean;
}

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion implements OnInit {
  guardadoOk = signal(false);
  cargando = signal(false);
  error = signal('');

  monedas = ['Bs (Bolivianos)', 'USD (Dólares)'];

    config: ConfiguracionData = {
    id: 0,
    nombre_negocio: '',
    direccion: '',
    telefono: '',
    nit: '',
    moneda: 'Bs (Bolivianos)',
    alerta_stock_bajo: 5,
    emitir_factura_default: false,
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarConfiguracion();
  }

  cargarConfiguracion() {
    this.cargando.set(true);
        this.http.get<ConfiguracionData>(`${API_URL}/configuracion`).subscribe({
      next: (data) => {
        this.config = data;
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando configuración', err);
        this.cargando.set(false);
      },
    });
  }

  guardar() {
    this.error.set('');
    this.http.put(`${API_URL}/configuracion/${this.config.id}`, this.config).subscribe({
      next: () => {
        this.guardadoOk.set(true);
        setTimeout(() => this.guardadoOk.set(false), 2500);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'No se pudo guardar la configuración.');
      }
    });
  }
}
