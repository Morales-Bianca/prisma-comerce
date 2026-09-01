import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  templateUrl: './barcode-scanner.html',
  styleUrl: './barcode-scanner.css'
})
export class BarcodeScanner implements OnInit, OnDestroy {
  @Output() codigoDetectado = new EventEmitter<string>();
  @Output() cerrar = new EventEmitter<void>();

  error = '';
  private scanner: Html5Qrcode | null = null;
  private readonly elementId = 'barcode-reader';

  ngOnInit() {
    setTimeout(() => this.iniciarCamara(), 100);
  }

  private async iniciarCamara() {
    try {
      this.scanner = new Html5Qrcode(this.elementId);

      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (codigo) => this.onCodigoLeido(codigo),
        () => {}
      );
    } catch (err) {
      console.error(err);
      this.error = 'No se pudo acceder a la cámara. Revisa los permisos del navegador.';
    }
  }

  private onCodigoLeido(codigo: string) {
    this.codigoDetectado.emit(codigo);
    this.detener();
  }

  cerrarManual() {
    this.detener();
    this.cerrar.emit();
  }

  private async detener() {
    if (this.scanner) {
      try {
        await this.scanner.stop();
        this.scanner.clear();
      } catch (err) {
        // la cámara ya pudo haberse detenido, no pasa nada
      }
      this.scanner = null;
    }
  }

  ngOnDestroy() {
    this.detener();
  }
}
