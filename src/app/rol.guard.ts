import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const soloAdminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const usuarioGuardado = localStorage.getItem('usuario');
  const rol = usuarioGuardado ? JSON.parse(usuarioGuardado).rol : null;

  if (rol === 'Administrador') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
