import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario = '';
  contrasena = '';
  recordarme = false;
  mostrarContrasena = signal(false);
  error = signal('');

  constructor(private router: Router) {}

  togglePassword() {
    this.mostrarContrasena.update(v => !v);
  }

  iniciarSesion() {
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.error.set('Ingresa tu usuario y contraseña.');
      return;
    }

    // TODO (backend): reemplazar esto por la llamada real de autenticación,
    // por ejemplo: this.authService.login(this.usuario, this.contrasena)
    // y navegar solo si la respuesta es exitosa.

    this.error.set('');
    this.router.navigate(['/dashboard']);
  }
}
