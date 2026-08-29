import { Injectable, signal } from '@angular/core';

export interface ItemVenta {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface VentaRegistrada {
  id: number;
  fecha: Date;
  cliente: string;
  documento: string;
  items: ItemVenta[];
  total: number;
  metodoPago: string;
  conFactura: boolean;
}

export interface Factura {
  id: number;
  numero: string;
  ventaId: number;
  fecha: Date;
  cliente: string;
  documento: string;
  total: number;
}

export interface Movimiento {
  id: number;
  fecha: Date;
  concepto: string;
  categoria: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
  registradoPor: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private contadorVenta = 1;
  private contadorFactura = 1;
  private contadorMovimiento = 1;

  ventas = signal<VentaRegistrada[]>([]);
  facturas = signal<Factura[]>([]);
  movimientos = signal<Movimiento[]>([]);

  registrarVenta(datos: {
    cliente: string;
    documento: string;
    items: ItemVenta[];
    total: number;
    metodoPago: string;
    conFactura: boolean;
  }): { venta: VentaRegistrada; factura: Factura | null } {
    const venta: VentaRegistrada = {
      id: this.contadorVenta++,
      fecha: new Date(),
      ...datos,
    };

    this.ventas.update(lista => [venta, ...lista]);

    this.registrarMovimiento({
      concepto: `Venta #${venta.id}`,
      categoria: 'Ventas',
      tipo: 'Ingreso',
      monto: venta.total,
      registradoPor: 'Sistema',
    });

    let factura: Factura | null = null;

    if (datos.conFactura) {
      const numero = `F-${String(this.contadorFactura).padStart(4, '0')}`;
      this.contadorFactura++;

      factura = {
        id: venta.id,
        numero,
        ventaId: venta.id,
        fecha: venta.fecha,
        cliente: datos.cliente || 'Cliente sin nombre',
        documento: datos.documento,
        total: datos.total,
      };

      this.facturas.update(lista => [factura!, ...lista]);
    }

    return { venta, factura };
  }

  registrarMovimiento(datos: {
    concepto: string;
    categoria: string;
    tipo: 'Ingreso' | 'Egreso';
    monto: number;
    registradoPor: string;
  }): Movimiento {
    const movimiento: Movimiento = {
      id: this.contadorMovimiento++,
      fecha: new Date(),
      ...datos,
    };

    this.movimientos.update(lista => [movimiento, ...lista]);
    return movimiento;
  }
}
