import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const usuarioGuardado = localStorage.getItem('usuario');

  if (usuarioGuardado) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
