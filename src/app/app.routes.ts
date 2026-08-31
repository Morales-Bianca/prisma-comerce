import { Routes } from '@angular/router';
import { soloAdminGuard } from './rol.guard';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'ventas', loadComponent: () => import('./ventas/ventas').then(m => m.Ventas) },
      { path: 'entradas-inventario', loadComponent: () => import('./entradas-inventario/entradas-inventario').then(m => m.EntradasInventario) },
      { path: 'productos', canActivate: [soloAdminGuard], loadComponent: () => import('./productos/productos').then(m => m.Productos) },
      { path: 'facturas', canActivate: [soloAdminGuard], loadComponent: () => import('./facturas/facturas').then(m => m.Facturas) },
      { path: 'ingresos-egresos', loadComponent: () => import('./ingresos-egresos/ingresos-egresos').then(m => m.IngresosEgresos) },
      { path: 'usuarios', canActivate: [soloAdminGuard], loadComponent: () => import('./usuarios/usuarios').then(m => m.Usuarios) },
      { path: 'reportes', canActivate: [soloAdminGuard], loadComponent: () => import('./reportes/reportes').then(m => m.Reportes) },
      { path: 'configuracion', canActivate: [soloAdminGuard], loadComponent: () => import('./configuracion/configuracion').then(m => m.Configuracion) },
    ]
  }
];
