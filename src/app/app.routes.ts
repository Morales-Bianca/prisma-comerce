import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'productos', loadComponent: () => import('./productos/productos').then(m => m.Productos) },
      { path: 'ventas', loadComponent: () => import('./ventas/ventas').then(m => m.Ventas) },
      { path: 'facturas', loadComponent: () => import('./facturas/facturas').then(m => m.Facturas) },
      { path: 'ingresos-egresos', loadComponent: () => import('./ingresos-egresos/ingresos-egresos').then(m => m.IngresosEgresos) },
      { path: 'usuarios', loadComponent: () => import('./usuarios/usuarios').then(m => m.Usuarios) },
      { path: 'reportes', loadComponent: () => import('./reportes/reportes').then(m => m.Reportes) },
      { path: 'configuracion', loadComponent: () => import('./configuracion/configuracion').then(m => m.Configuracion) },
    ]
  }
];
