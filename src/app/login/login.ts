import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  cargando = signal(false);

  constructor(private router: Router, private http: HttpClient) {}

  togglePassword() {
    this.mostrarContrasena.update(v => !v);
  }

  iniciarSesion() {
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.error.set('Ingresa tu usuario y contraseña.');
      return;
    }

    this.error.set('');
    this.cargando.set(true);

    this.http.post<any>('http://localhost:3000/api/auth/login', {
      nombre: this.usuario,
      contrasena: this.contrasena,
    }).subscribe({
      next: (respuesta) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        this.cargando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'No se pudo iniciar sesión.');
      }
    });
  }
}
