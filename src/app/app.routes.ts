import { Routes } from '@angular/router';
import { soloAdminGuard } from './rol.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'ventas', loadComponent: () => import('./ventas/ventas').then(m => m.Ventas) },
      { path: 'entradas-inventario', loadComponent: () => import('./entradas-inventario/entradas-inventario').then(m => m.EntradasInventario) },
      { path: 'productos', canActivate: [soloAdminGuard], loadComponent: () => import('./productos/productos').then(m => m.Productos) },
      { path: 'facturas', canActivate: [soloAdminGuard], loadComponent: () => import('./facturas/facturas').then(m => m.Facturas) },
      { path: 'ingresos-egresos', canActivate: [soloAdminGuard], loadComponent: () => import('./ingresos-egresos/ingresos-egresos').then(m => m.IngresosEgresos) },
      { path: 'usuarios', canActivate: [soloAdminGuard], loadComponent: () => import('./usuarios/usuarios').then(m => m.Usuarios) },
      { path: 'reportes', canActivate: [soloAdminGuard], loadComponent: () => import('./reportes/reportes').then(m => m.Reportes) },
      { path: 'configuracion', canActivate: [soloAdminGuard], loadComponent: () => import('./configuracion/configuracion').then(m => m.Configuracion) },
    ]
  }
];
