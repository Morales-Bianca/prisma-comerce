import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion {
  guardadoOk = signal(false);

  negocio = {
    nombre: 'Mercado Central',
    direccion: '',
    telefono: '',
    nit: '',
  };

  preferencias = {
    moneda: 'Bs (Bolivianos)',
    alertaStockBajo: 5,
    emitirFacturaPorDefecto: false,
  };

  monedas = ['Bs (Bolivianos)', 'USD (Dólares)'];

  guardar() {
    // Por ahora se guarda solo en memoria (sin backend todavía).
    this.guardadoOk.set(true);
    setTimeout(() => this.guardadoOk.set(false), 2500);
  }
}
